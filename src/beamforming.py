"""
beamforming.py — Zero-Forcing and MRT precoder implementations.

ZF precoder:  W_ZF  = H^H · (H · H^H)^{-1}   [pseudo-inverse]
MRT precoder: W_MRT = H^H                       [conjugate transpose]
"""

import numpy as np


def zf_precoder(H: np.ndarray) -> np.ndarray:
    """
    Compute Zero-Forcing precoding matrix.

    W_ZF = H^H · (H · H^H)^{-1}

    Minimizes multi-user interference by inverting the channel.
    Unstable when H is ill-conditioned (κ(H) is large).

    Parameters
    ----------
    H : np.ndarray
        MIMO channel matrix, shape (Nr, Nt).

    Returns
    -------
    np.ndarray
        ZF precoding matrix, shape (Nt, Nr).

    Examples
    --------
    >>> H = np.array([[1+0j, 0], [0, 1+0j]])
    >>> W = zf_precoder(H)
    >>> np.allclose(H @ W, np.eye(2))
    True
    """
    H_H = H.conj().T
    return H_H @ np.linalg.pinv(H @ H_H)


def mrt_precoder(H: np.ndarray) -> np.ndarray:
    """
    Compute Maximum Ratio Transmission precoding matrix.

    W_MRT = H^H

    Maximizes received signal power. Robust to ill-conditioning
    but does not suppress inter-user interference.

    Parameters
    ----------
    H : np.ndarray
        MIMO channel matrix, shape (Nr, Nt).

    Returns
    -------
    np.ndarray
        MRT precoding matrix, shape (Nt, Nr).

    Examples
    --------
    >>> H = np.array([[1+1j, 2+0j], [0+1j, 1-1j]])
    >>> W = mrt_precoder(H)
    >>> np.allclose(W, H.conj().T)
    True
    """
    return H.conj().T


def precoding_error(W_true: np.ndarray, W_estimated: np.ndarray) -> float:
    """
    Compute normalized precoding perturbation error.

    ‖ΔW‖ / ‖W‖

    This measures how much the estimated precoder deviates from the
    ground-truth precoder due to CSI aging and estimation noise.

    Parameters
    ----------
    W_true : np.ndarray
        Precoder computed from ground-truth channel.
    W_estimated : np.ndarray
        Precoder computed from noisy/aged CSI estimate.

    Returns
    -------
    float
        Relative precoding error (dimensionless).

    Examples
    --------
    >>> W = np.eye(4, dtype=complex)
    >>> precoding_error(W, W)
    0.0
    """
    delta_W = W_true - W_estimated
    return np.linalg.norm(delta_W, 'fro') / (np.linalg.norm(W_true, 'fro') + 1e-12)


def compute_sinr(
    H: np.ndarray,
    W: np.ndarray,
    noise_power: float,
    user_idx: int = 0,
) -> float:
    """
    Compute per-user SINR for a given channel and precoder.

    SINR_k = |h_k^H w_k|² / (Σ_{j≠k} |h_k^H w_j|² + σ²)

    Parameters
    ----------
    H : np.ndarray
        Channel matrix, shape (Nr, Nt).
    W : np.ndarray
        Precoding matrix, shape (Nt, Nr).
    noise_power : float
        Noise power (linear).
    user_idx : int
        Index of the user to compute SINR for.

    Returns
    -------
    float
        SINR in linear scale.

    Examples
    --------
    >>> H = np.eye(2, dtype=complex)
    >>> W = np.eye(2, dtype=complex)
    >>> compute_sinr(H, W, 0.01, user_idx=0)  # high SINR
    100.0
    """
    HW = H @ W
    signal_power = abs(HW[user_idx, user_idx]) ** 2
    interference = sum(
        abs(HW[user_idx, k]) ** 2
        for k in range(HW.shape[1])
        if k != user_idx
    )
    return signal_power / (interference + noise_power + 1e-12)


def normalize_precoder(W: np.ndarray, total_power: float = 1.0) -> np.ndarray:
    """
    Normalize precoding matrix to a given total transmit power.

    Parameters
    ----------
    W : np.ndarray
        Precoding matrix, shape (Nt, Nr).
    total_power : float
        Desired total transmit power (default 1.0).

    Returns
    -------
    np.ndarray
        Power-normalized precoding matrix.
    """
    norm = np.linalg.norm(W, 'fro')
    if norm < 1e-12:
        return W
    return W * np.sqrt(total_power) / norm
