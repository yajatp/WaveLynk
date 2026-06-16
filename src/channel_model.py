"""
channel_model.py — MIMO channel simulator for WaveLynk experiments.

Implements:
- Rayleigh flat-fading channel with Jake's Doppler spectrum
- Time-varying MIMO channel matrix generation
- Multipath channel model matching the paper's h(t) = Σ aₙ·exp(j2πfₙt)
"""

import numpy as np
from dataclasses import dataclass

# Physical constants
C = 3e8  # speed of light (m/s)


@dataclass
class ChannelConfig:
    """Configuration for a MIMO channel simulation.

    Parameters
    ----------
    Nr : int
        Number of receive antennas.
    Nt : int
        Number of transmit antennas.
    N_paths : int
        Number of multipath scattering components.
    carrier_freq_hz : float
        Carrier frequency in Hz (default: 6 GHz for Wi-Fi 7).
    velocity_mps : float
        Relative velocity between TX and RX in m/s.
    snr_db : float
        Signal-to-noise ratio in dB.
    seed : int
        Random seed for reproducibility.
    """
    Nr: int = 4              # number of receive antennas
    Nt: int = 4              # number of transmit antennas
    N_paths: int = 8         # number of multipath components
    carrier_freq_hz: float = 6e9    # Wi-Fi 7 6 GHz band
    velocity_mps: float = 1.5       # walking speed (m/s)
    snr_db: float = 20.0            # signal-to-noise ratio in dB
    seed: int = 42


def generate_channel_matrix(
    config: ChannelConfig, t: float, rng: np.random.Generator,
    path_gains: np.ndarray = None,
    path_aoa: np.ndarray = None,
) -> np.ndarray:
    """
    Generate a time-varying MIMO channel matrix at time t.

    Uses Jake's model with uniformly distributed angles of arrival:
        h_{ij}(t) = (1/√N) · Σ_n  a_n · exp(j·2π·f_n·t)

    where f_n = fD·cos(θ_n) is the Doppler shift for the n-th path,
    and a_n are i.i.d. complex Gaussian gains (Rayleigh fading).

    Parameters
    ----------
    config : ChannelConfig
        Simulation configuration.
    t : float
        Current time in seconds.
    rng : np.random.Generator
        NumPy random generator (for reproducibility).
    path_gains : np.ndarray, optional
        Pre-generated complex path gains of shape (Nr, Nt, N_paths).
        If None, generated fresh (useful for first call; re-use for
        temporal correlation).
    path_aoa : np.ndarray, optional
        Pre-generated angles of arrival of shape (N_paths,) in radians.

    Returns
    -------
    np.ndarray
        Complex MIMO channel matrix H of shape (Nr, Nt).

    Notes
    -----
    The path gains are drawn once per channel realization and held constant;
    the time-varying phase rotation exp(j·2π·fₙ·t) produces the Doppler
    fading across snapshots.
    """
    fD = config.velocity_mps * config.carrier_freq_hz / C  # max Doppler freq

    # Generate path parameters if not provided
    if path_aoa is None:
        path_aoa = rng.uniform(0, 2 * np.pi, config.N_paths)
    if path_gains is None:
        # Complex Gaussian gains: CN(0, 1/N_paths) per (rx, tx, path)
        path_gains = (
            rng.standard_normal((config.Nr, config.Nt, config.N_paths))
            + 1j * rng.standard_normal((config.Nr, config.Nt, config.N_paths))
        ) / np.sqrt(2 * config.N_paths)

    # Doppler frequencies for each path
    doppler_shifts = fD * np.cos(path_aoa)  # shape (N_paths,)

    # Time-varying phase rotation
    phase = np.exp(1j * 2 * np.pi * doppler_shifts * t)  # shape (N_paths,)

    # Sum across paths: H(t) = Σ_n a_n · exp(j·2π·f_n·t)
    H = np.sum(path_gains * phase[np.newaxis, np.newaxis, :], axis=2)

    return H


def simulate_channel_sequence(
    config: ChannelConfig,
    duration_s: float,
    dt_s: float,
) -> tuple[np.ndarray, np.ndarray]:
    """
    Simulate a time-varying MIMO channel over a duration.

    Generates a sequence of channel matrices with temporally correlated
    fading according to Jake's model.

    Parameters
    ----------
    config : ChannelConfig
        Simulation configuration.
    duration_s : float
        Total simulation duration in seconds.
    dt_s : float
        Time step between channel snapshots in seconds.

    Returns
    -------
    times : np.ndarray
        Time axis in seconds, shape (T,).
    H_sequence : np.ndarray
        Channel matrices at each timestep, shape (T, Nr, Nt).

    Examples
    --------
    >>> cfg = ChannelConfig(Nr=2, Nt=2, velocity_mps=1.5, seed=0)
    >>> times, H_seq = simulate_channel_sequence(cfg, 0.01, 0.001)
    >>> H_seq.shape
    (10, 2, 2)
    """
    rng = np.random.default_rng(config.seed)
    times = np.arange(0, duration_s, dt_s)
    T = len(times)

    # Pre-generate path parameters (held constant across time for correlation)
    path_aoa = rng.uniform(0, 2 * np.pi, config.N_paths)
    path_gains = (
        rng.standard_normal((config.Nr, config.Nt, config.N_paths))
        + 1j * rng.standard_normal((config.Nr, config.Nt, config.N_paths))
    ) / np.sqrt(2 * config.N_paths)

    H_sequence = np.zeros((T, config.Nr, config.Nt), dtype=complex)

    for i, t in enumerate(times):
        H_sequence[i] = generate_channel_matrix(
            config, t, rng, path_gains=path_gains, path_aoa=path_aoa
        )

    return times, H_sequence


def add_csi_error(
    H_true: np.ndarray,
    snr_db: float,
    delay_samples: int,
    H_sequence: np.ndarray,
    current_idx: int = None,
) -> np.ndarray:
    """
    Return an aged + noisy CSI estimate.

    Simulates the effect of feedback delay and estimation error on CSI
    accuracy. The returned matrix is a delayed version of the true channel
    with additive Gaussian estimation noise.

    Parameters
    ----------
    H_true : np.ndarray
        Ground truth channel matrix at current time, shape (Nr, Nt).
    snr_db : float
        Pilot SNR in dB (controls estimation noise power).
    delay_samples : int
        Number of timesteps of feedback delay.
    H_sequence : np.ndarray
        Full channel history, shape (T, Nr, Nt).
    current_idx : int, optional
        Index of H_true in H_sequence. If None, defaults to the last
        valid index that allows the delay.

    Returns
    -------
    np.ndarray
        Noisy, aged CSI estimate, shape (Nr, Nt).

    Notes
    -----
    The estimation error model is:
        Ĥ = H(t - delay) + N
    where N ~ CN(0, σ²I) and σ² = 10^(-SNR_dB/10) · ‖H‖²_F / (Nr·Nt).
    """
    if current_idx is None:
        current_idx = len(H_sequence) - 1

    # Get the delayed channel matrix
    delayed_idx = max(0, current_idx - delay_samples)
    H_delayed = H_sequence[delayed_idx].copy()

    # Add estimation noise scaled to pilot SNR
    noise_power_linear = 10 ** (-snr_db / 10)
    signal_scale = np.linalg.norm(H_delayed, 'fro') / np.sqrt(
        H_delayed.shape[0] * H_delayed.shape[1]
    )
    noise = signal_scale * np.sqrt(noise_power_linear / 2) * (
        np.random.randn(*H_delayed.shape)
        + 1j * np.random.randn(*H_delayed.shape)
    )

    return H_delayed + noise
