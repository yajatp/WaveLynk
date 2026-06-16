"""
switching.py — WaveLynk adaptive beamforming controller.

Implements the predictive switching mechanism described in Section V of the paper.
The controller uses the Conditioned Coherence Index (CCI) to proactively switch
between ZF and MRT precoding before the Coherence Cliff causes catastrophic failure.
"""

import numpy as np
from dataclasses import dataclass, field
from .cci import compute_cci, should_switch_to_mrt, DEFAULT_GAMMA
from .beamforming import zf_precoder, mrt_precoder


@dataclass
class SwitchingConfig:
    """Configuration for the WaveLynk adaptive switching controller.

    Parameters
    ----------
    gamma : float
        CCI threshold for switching from ZF to MRT.
    alpha : float
        Signal sensitivity coefficient for CCI computation.
    beta : float
        Aging decay rate for CCI computation.
    hysteresis : float
        Hysteresis band to prevent rapid toggling near the threshold.
        Switch ZF→MRT at gamma; switch back MRT→ZF at gamma - hysteresis.
    carrier_freq_hz : float
        Carrier frequency in Hz.
    """
    gamma: float = DEFAULT_GAMMA
    alpha: float = 1.0
    beta: float = 1.0
    hysteresis: float = 0.05    # avoid rapid toggling near threshold
    carrier_freq_hz: float = 6e9


@dataclass
class SwitchEvent:
    """Record of a single beamforming mode switch.

    Parameters
    ----------
    time_s : float
        Simulation time at which the switch occurred.
    from_mode : str
        Previous beamforming mode ("ZF" or "MRT").
    to_mode : str
        New beamforming mode ("ZF" or "MRT").
    cci_value : float
        CCI value that triggered the switch.
    """
    time_s: float
    from_mode: str
    to_mode: str
    cci_value: float


class WaveLynkController:
    """
    Adaptive beamforming controller implementing CCI-based predictive switching.

    The controller monitors the Conditioned Coherence Index (CCI) and
    proactively switches between Zero-Forcing (ZF) and Maximum Ratio
    Transmission (MRT) precoding to avoid the Coherence Cliff.

    Usage
    -----
    >>> config = SwitchingConfig(gamma=0.6, carrier_freq_hz=6e9)
    >>> controller = WaveLynkController(config)
    >>> W, mode, cci = controller.select_precoder(H_csi, velocity=1.5, tau=0.005, sinr_db=20)
    """

    def __init__(self, config: SwitchingConfig = None):
        """
        Initialize the WaveLynk adaptive controller.

        Parameters
        ----------
        config : SwitchingConfig, optional
            Controller configuration. Uses defaults if not provided.
        """
        self.config = config or SwitchingConfig()
        self.current_mode = "ZF"
        self.cci_history: list[float] = []
        self.mode_history: list[str] = []
        self.switch_events: list[SwitchEvent] = []
        self._t = 0.0

    def select_precoder(
        self,
        H_csi: np.ndarray,
        velocity_mps: float,
        tau: float,
        sinr_db: float,
        dt: float = 0.001,
    ) -> tuple[np.ndarray, str, float]:
        """
        Select optimal precoder for current channel conditions.

        Computes CCI from the current channel estimate and velocity,
        applies the switching rule with hysteresis, and returns the
        appropriate precoding matrix.

        Parameters
        ----------
        H_csi : np.ndarray
            Current CSI estimate (possibly aged/noisy), shape (Nr, Nt).
        velocity_mps : float
            Current user velocity in m/s.
        tau : float
            CSI feedback delay in seconds.
        sinr_db : float
            Current SINR estimate in dB.
        dt : float
            Simulation timestep in seconds (for internal bookkeeping).

        Returns
        -------
        W : np.ndarray
            Selected precoding matrix, shape (Nt, Nr).
        mode : str
            Current beamforming mode: "ZF" or "MRT".
        cci : float
            Current CCI value.
        """
        cci = compute_cci(
            H=H_csi,
            velocity_mps=velocity_mps,
            carrier_freq_hz=self.config.carrier_freq_hz,
            tau=tau,
            sinr_db=sinr_db,
            alpha=self.config.alpha,
            beta=self.config.beta,
        )

        # Switching logic with hysteresis
        if self.current_mode == "ZF" and cci >= self.config.gamma:
            self._trigger_switch("ZF", "MRT", cci)
        elif self.current_mode == "MRT" and cci < (self.config.gamma - self.config.hysteresis):
            self._trigger_switch("MRT", "ZF", cci)

        W = zf_precoder(H_csi) if self.current_mode == "ZF" else mrt_precoder(H_csi)

        self.cci_history.append(cci)
        self.mode_history.append(self.current_mode)
        self._t += dt

        return W, self.current_mode, cci

    def _trigger_switch(self, from_mode: str, to_mode: str, cci: float):
        """Record a switch event and update current mode."""
        self.switch_events.append(SwitchEvent(self._t, from_mode, to_mode, cci))
        self.current_mode = to_mode

    def reset(self):
        """Reset controller state for a new simulation run."""
        self.current_mode = "ZF"
        self.cci_history = []
        self.mode_history = []
        self.switch_events = []
        self._t = 0.0

    def summary(self) -> dict:
        """
        Return a summary of controller performance.

        Returns
        -------
        dict
            Dictionary containing:
            - total_switches: Number of mode switches
            - time_in_zf_pct: Percentage of time spent in ZF mode
            - time_in_mrt_pct: Percentage of time spent in MRT mode
            - mean_cci: Average CCI across the simulation
            - max_cci: Peak CCI value
            - switch_events: List of SwitchEvent records
        """
        if not self.mode_history:
            return {
                "total_switches": 0,
                "time_in_zf_pct": 0.0,
                "time_in_mrt_pct": 0.0,
                "mean_cci": 0.0,
                "max_cci": 0.0,
                "switch_events": [],
            }
        return {
            "total_switches": len(self.switch_events),
            "time_in_zf_pct": self.mode_history.count("ZF") / len(self.mode_history) * 100,
            "time_in_mrt_pct": self.mode_history.count("MRT") / len(self.mode_history) * 100,
            "mean_cci": float(np.mean(self.cci_history)),
            "max_cci": float(np.max(self.cci_history)),
            "switch_events": self.switch_events,
        }
