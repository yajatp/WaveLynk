"""
WaveLynk — Predictive Beamforming Switching for Wi-Fi 7 and 6G Systems.

This package implements the Conditioned Coherence Index (CCI) framework
described in:

    Abin, Shah, Parmar. "Predicting Beamforming Instability in Wi-Fi 7
    and 6G Systems Using a Conditioned Coherence Framework." 2025.
"""

from .cci import compute_cci, should_switch_to_mrt, doppler_frequency, coherence_time
from .beamforming import zf_precoder, mrt_precoder
from .switching import WaveLynkController, SwitchingConfig

__version__ = "1.0.0"
__authors__ = ["Neha Abin", "Sahil Shah", "Yajat Parmar"]
