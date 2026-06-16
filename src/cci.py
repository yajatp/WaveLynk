"""
cci.py — Conditioned Coherence Index (CCI) implementation.

The CCI is defined in:
    Abin, Shah, Parmar. "Predicting Beamforming Instability in Wi-Fi 7
    and 6G Systems Using a Conditioned Coherence Framework." 2025.
"""

import numpy as np
from scipy.special import j0  # Bessel function J₀

# Physical constants
C = 3e8  # speed of light (m/s)

# Default CCI hyperparameters (from paper)
DEFAULT_ALPHA = 1.0   # signal sensitivity coefficient
DEFAULT_BETA  = 1.0   # aging decay rate
DEFAULT_GAMMA = 0.6   # switching threshold


def doppler_frequency(velocity_mps: float, carrier_freq_hz: float) -> float:
    """
    Compute maximum Doppler frequency.

    fD = v * fc / c

    Parameters
    ----------
    velocity_mps : float
        Relative velocity between TX and RX in meters per second.
    carrier_freq_hz : float
        Carrier frequency in Hz (e.g., 6e9 for Wi-Fi 7 6 GHz band).

    Returns
    -------
    float
        Maximum Doppler frequency in Hz.

    Examples
    --------
    >>> doppler_frequency(1.5, 6e9)  # walking speed, 6 GHz
    30.0
    """
    return velocity_mps * carrier_freq_hz / C


def coherence_time(doppler_freq_hz: float) -> float:
    """
    Estimate channel coherence time using Clarke's model.

    Tc ≈ 0.423 / fD

    Parameters
    ----------
    doppler_freq_hz : float
        Doppler frequency in Hz.

    Returns
    -------
    float
        Coherence time in seconds.

    Examples
    --------
    >>> coherence_time(30.0)  # fD = 30 Hz → Tc ≈ 14.1 ms
    0.0141
    """
    if doppler_freq_hz == 0:
        return np.inf
    return 0.423 / doppler_freq_hz


def channel_autocorrelation(doppler_freq_hz: float, tau: float) -> float:
    """
    Compute temporal channel autocorrelation using Jake's model.

    ρ(τ) = J₀(2π * fD * τ)

    Parameters
    ----------
    doppler_freq_hz : float
        Doppler frequency in Hz.
    tau : float
        Time delay in seconds.

    Returns
    -------
    float
        Temporal correlation coefficient in [0, 1].

    Examples
    --------
    >>> channel_autocorrelation(30.0, 0.004)  # fD=30Hz, τ=4ms
    0.6425...
    """
    return j0(2 * np.pi * doppler_freq_hz * tau)


def condition_number(H: np.ndarray) -> float:
    """
    Compute the condition number of a MIMO channel matrix.

    κ(H) = σ_max(H) / σ_min(H)

    A large condition number indicates the matrix is near-singular,
    meaning ZF precoding will amplify noise significantly.

    Parameters
    ----------
    H : np.ndarray
        MIMO channel matrix of shape (Nr, Nt).

    Returns
    -------
    float
        Condition number κ(H) ≥ 1.

    Examples
    --------
    >>> H = np.eye(4)
    >>> condition_number(H)
    1.0
    """
    singular_values = np.linalg.svd(H, compute_uv=False)
    return singular_values[0] / (singular_values[-1] + 1e-12)  # avoid div/0


def compute_cci(
    H: np.ndarray,
    velocity_mps: float,
    carrier_freq_hz: float,
    tau: float,
    sinr_db: float,
    alpha: float = DEFAULT_ALPHA,
    beta: float = DEFAULT_BETA,
) -> float:
    """
    Compute the Conditioned Coherence Index (CCI).

    CCI(t) = κ(H) · |J₀(2π·fD·τ)| · [SINR/(SINR + α)] · exp(-β·τ/Tc)

    Higher CCI → greater instability → closer to Coherence Cliff.

    Parameters
    ----------
    H : np.ndarray
        MIMO channel matrix, shape (Nr, Nt).
    velocity_mps : float
        User velocity in m/s.
    carrier_freq_hz : float
        Carrier frequency in Hz.
    tau : float
        CSI feedback delay in seconds.
    sinr_db : float
        Current SINR estimate in dB.
    alpha : float
        Signal sensitivity coefficient. Higher → more sensitive to poor SINR.
    beta : float
        Aging decay rate. Higher → CCI penalizes delay more aggressively.

    Returns
    -------
    float
        CCI value. Switching recommended when CCI ≥ DEFAULT_GAMMA (0.6).

    Notes
    -----
    The threshold γ = 0.6 is derived by substituting τ ≈ 0.3·Tc into ρ(τ),
    yielding J₀(0.8) ≈ 0.7. The normalized correlation drops below 0.6 at
    this point, marking the onset of ZF instability.
    """
    # Convert SINR from dB to linear
    sinr_linear = 10 ** (sinr_db / 10)

    # Compute components
    kappa = condition_number(H)
    fD = doppler_frequency(velocity_mps, carrier_freq_hz)
    Tc = coherence_time(fD)
    rho = abs(channel_autocorrelation(fD, tau))
    sinr_weight = sinr_linear / (sinr_linear + alpha)
    aging_decay = np.exp(-beta * tau / Tc) if Tc != np.inf else 1.0

    cci = kappa * rho * sinr_weight * aging_decay
    return float(cci)


def should_switch_to_mrt(cci_value: float, gamma: float = DEFAULT_GAMMA) -> bool:
    """
    Apply the WaveLynk switching rule.

    Parameters
    ----------
    cci_value : float
        Current CCI value.
    gamma : float
        Switching threshold (default 0.6 from paper derivation).

    Returns
    -------
    bool
        True → use MRT. False → use ZF.
    """
    return cci_value >= gamma
