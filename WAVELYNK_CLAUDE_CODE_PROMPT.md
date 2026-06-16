# WaveLynk — Full Repository Overhaul: Claude Code Instructions

## Context & Background

You are working on **WaveLynk**, a research project by Yajat Parmar, Neha Abin, and Sahil Shah
(Allen High School, Allen TX). The project was originally a science fair submission and has since
been written up as an IEEE-format research paper titled:

> *"Predicting Beamforming Instability in Wi-Fi 7 and 6G Systems Using a Conditioned Coherence Framework"*

The existing GitHub repo (`yajatp/WaveLynk`) currently contains only:
- `index.html` — a 2,964-line single-file demo/product site (keep this, it becomes `site/index.html`)
- `README.txt` — minimal run instructions
- `assets/` — image assets for the demo site

**Goal:** Transform this into a legitimate, professionally structured open-source research repository
that accurately represents the work done — including the theoretical framework, Python implementation,
simulation notebooks, hardware data, and a proper README — so it is defensible and impressive to
university CS/DS admissions readers and research lab PIs.

---

## The Research (You Must Understand This to Write Good Code)

### Core Problem
High-frequency wireless systems (Wi-Fi 7, mmWave, 6G) use MIMO beamforming. The dominant
strategy, Zero-Forcing (ZF), requires accurate Channel State Information (CSI). Under mobility,
CSI becomes stale rapidly. Unlike legacy systems that degrade gradually, these systems hit a
sudden **Coherence Cliff** — an abrupt collapse in throughput and reliability.

### The Novel Contribution: Conditioned Coherence Index (CCI)
The paper introduces CCI as a unified predictive metric combining four instability factors:

```
CCI(t) = κ(H) · |J₀(2π·fD·τ)| · [SINR(t) / (SINR(t) + α)] · exp(-β·τ/Tc)
```

Where:
- `κ(H)` = condition number of the MIMO channel matrix H (spatial instability amplifier)
- `J₀(2π·fD·τ)` = Bessel function of the first kind, order 0 (Doppler temporal decorrelation)
- `fD = v·fc/c` = Doppler frequency (v=velocity, fc=carrier freq, c=speed of light)
- `Tc ≈ 0.423/fD` = channel coherence time
- `SINR(t)/(SINR(t) + α)` = normalized signal quality term (α = signal sensitivity coefficient)
- `exp(-β·τ/Tc)` = CSI aging decay term (β = aging decay rate, τ = feedback delay)

### Switching Rule
```
W_opt = W_ZF   if CCI(t) < γ     (stable, use Zero-Forcing)
W_opt = W_MRT  if CCI(t) ≥ γ     (unstable, switch to MRT)
```
Threshold `γ = 0.6` is derived analytically: substituting τ ≈ 0.3·Tc into J₀ gives
J₀(0.8) ≈ 0.7, and the normalized correlation term drops below 0.6 at this point,
marking the onset of the instability regime.

### Beamforming Modes
- **ZF (Zero-Forcing):** `W_ZF = H^H · (H · H^H)^{-1}` — inverts channel, suppresses
  interference, but amplifies noise when H is ill-conditioned
- **MRT (Maximum Ratio Transmission):** `W_MRT = H^H` — maximizes received signal power,
  robust to ill-conditioning but doesn't cancel interference

### Channel Model
- Time-varying multipath: `h(t) = Σ aₙ · exp(j·2π·fₙ·t)`
- Rayleigh fading with Jake's Doppler spectrum
- MIMO system: `y = H·W·s + n`
- Matrix sensitivity bound: `‖ΔW‖/‖W‖ ≤ κ(H) · ‖ΔH‖/‖H‖`
- Channel autocorrelation: `ρ(τ) = J₀(2π·fD·τ)`

### Hardware Validation (Testbed)
- Netgear Nighthawk Wi-Fi 6/7 router
- 3 laptops running iperf3 (1 server, 2 clients) stressing MU-MIMO link
- 2 smartphones measuring live throughput
- Measurements: packet loss %, ping latency (ms), RSSI, throughput (Mbps)
- 100 trials comparing WaveLynk vs always-ZF vs always-MRT
- Result: WaveLynk prevented collapse and preserved throughput

### MATLAB Simulations (to be ported to Python)
The paper includes 3 figures:
1. CCI surface plot vs. velocity and delay (3D surface, color = CCI magnitude)
2. 3D scatter: channel correlation vs. velocity vs. CCI with threshold plane at γ=0.6
3. Two-panel: CCI vs. mobility (top) + Perturbation Error on log scale for ZF/MRT/Adaptive (bottom)

---

## Target Repository Structure

Reorganize the repo to match this layout exactly:

```
WaveLynk/
│
├── README.md                          ← Primary project landing page (see spec below)
│
├── paper/
│   └── WaveLynk_Paper.pdf            ← [PLACEHOLDER — user will add]
│
├── poster/
│   └── WaveLynk_Poster.pdf           ← [PLACEHOLDER — user will add]
│
├── src/
│   ├── __init__.py
│   ├── cci.py                         ← CCI formula implementation
│   ├── channel_model.py               ← Rayleigh/Jake's fading channel simulator
│   ├── beamforming.py                 ← ZF and MRT precoder implementations
│   └── switching.py                   ← WaveLynk adaptive controller
│
├── notebooks/
│   ├── 01_cci_derivation.ipynb        ← Walk through CCI math, plot J₀, Tc curves
│   ├── 02_simulation_figures.ipynb    ← Reproduce all 3 paper figures in Python/matplotlib
│   ├── 03_monte_carlo.ipynb           ← 100-trial robustness sweep, outage rate comparison
│   └── 04_hardware_validation.ipynb   ← Load real CSVs, compare to theory
│
├── data/
│   ├── README.md                      ← Describes what data files are and how they were collected
│   ├── hardware/
│   │   ├── packet_loss.csv            ← [PLACEHOLDER — user will add real hardware data]
│   │   ├── latency_ms.csv             ← [PLACEHOLDER — user will add real hardware data]
│   │   └── throughput_mbps.csv        ← [PLACEHOLDER — user will add real hardware data]
│   └── simulation/
│       └── monte_carlo_results.csv    ← Generated by notebook 03
│
├── site/
│   └── index.html                     ← Existing demo site (moved here, unchanged)
│
├── assets/                            ← Existing assets folder (moved/kept)
│
├── requirements.txt                   ← Python dependencies
├── .gitignore
└── LICENSE                            ← MIT License
```

---

## Detailed File Specifications

---

### `README.md` — Research Landing Page

This is the most important file. Write it as a research project landing page, not a code README.
It must render beautifully on GitHub. Use GitHub-flavored Markdown with math blocks (```math).

**Structure and required content:**

```markdown
# WaveLynk: Predictive Beamforming Switching for Wi-Fi 7 and 6G Systems

[badges row: Python 3.9+, License MIT, Status: Active, IEEE Format Paper]

> **Turning the Coherence Cliff from a failure mode into a predictable, preventable event.**

[one-line description of what the project is]

---

## Overview

[2-3 paragraph explanation of the problem — why 6G beamforming fails abruptly,
what the Coherence Cliff is, and what WaveLynk does about it. Write for a technical
reader who is not a wireless comms expert. Clear, direct, no fluff.]

---

## The Conditioned Coherence Index (CCI)

[Explain the CCI in prose, then show the formula in a math block:]

$$\text{CCI}(t) = \kappa(\mathbf{H}) \cdot \left|J_0(2\pi f_D \tau)\right| \cdot \frac{\text{SINR}(t)}{\text{SINR}(t) + \alpha} \cdot e^{-\beta \frac{\tau}{T_c}}$$

[Table with each term, its name, and what it captures — 4 rows for κ(H), J₀ term, SINR term, exp term]

[Explain the switching rule:]

$$W_{\text{opt}} = \begin{cases} W_{\text{ZF}} & \text{if } \text{CCI}(t) < \gamma \\ W_{\text{MRT}} & \text{if } \text{CCI}(t) \geq \gamma \end{cases}$$

[Explain γ = 0.6 derivation briefly]

---

## Key Results

[3-column summary: metric name / ZF result / WaveLynk result]
[e.g., Outage Rate, Peak Latency, Packet Loss — use placeholders if hardware data not yet final]

---

## Repository Structure

[Tree diagram of the repo with one-line description of each file]

---

## Getting Started

### Prerequisites
[Python 3.9+, pip install -r requirements.txt]

### Run the Simulations
[Step by step: clone repo, install deps, launch jupyter, which notebook to run first]

### Run the Demo Site
[Existing instructions: python -m http.server 8000 from site/]

---

## Hardware Testbed

[Description of physical setup: Nighthawk router, iperf3, 3 laptops, 2 smartphones,
Wi-Fi 6/7 6GHz band. 100 trials. What was measured and how.]

---

## Paper

[Citation block in IEEE format. Link to paper/WaveLynk_Paper.pdf]

---

## Authors

[Neha Abin, Sahil Shah, Yajat Parmar — Allen High School, Allen TX]

---

## License

MIT

---

## References

[Top 5 most important references from paper: Tse & Viswanath, Jakes, Marzetta, Rappaport, IEEE 802.11be]
```

---

### `src/cci.py`

Implement the full CCI formula and related utilities. Every function must have a complete
NumPy-style docstring with Parameters, Returns, and a usage example.

```python
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
```

---

### `src/channel_model.py`

Implement a Rayleigh fading MIMO channel simulator using Jake's model.

```python
"""
channel_model.py — MIMO channel simulator for WaveLynk experiments.

Implements:
- Rayleigh flat-fading channel with Jake's Doppler spectrum
- Time-varying MIMO channel matrix generation
- Multipath channel model matching the paper's h(t) = Σ aₙ·exp(j2πfₙt)
"""

import numpy as np
from dataclasses import dataclass


@dataclass
class ChannelConfig:
    """Configuration for a MIMO channel simulation."""
    Nr: int = 4              # number of receive antennas
    Nt: int = 4              # number of transmit antennas
    N_paths: int = 8         # number of multipath components
    carrier_freq_hz: float = 6e9    # Wi-Fi 7 6 GHz band
    velocity_mps: float = 1.5       # walking speed (m/s)
    snr_db: float = 20.0            # signal-to-noise ratio in dB
    seed: int = 42


def generate_channel_matrix(config: ChannelConfig, t: float, rng: np.random.Generator) -> np.ndarray:
    """
    Generate a time-varying MIMO channel matrix at time t.

    h(t) = Σ aₙ · exp(j·2π·fₙ·t)  [applied per matrix entry]

    Parameters
    ----------
    config : ChannelConfig
    t : float
        Current time in seconds.
    rng : np.random.Generator
        NumPy random generator (for reproducibility).

    Returns
    -------
    np.ndarray
        Complex MIMO channel matrix H of shape (Nr, Nt).
    """
    ...  # implement Jake's model: random AoA, Doppler shifts, complex gains


def simulate_channel_sequence(
    config: ChannelConfig,
    duration_s: float,
    dt_s: float,
) -> tuple[np.ndarray, np.ndarray]:
    """
    Simulate a time-varying MIMO channel over a duration.

    Returns
    -------
    times : np.ndarray
        Time axis in seconds.
    H_sequence : np.ndarray
        Channel matrices at each timestep, shape (T, Nr, Nt).
    """
    ...


def add_csi_error(H_true: np.ndarray, snr_db: float, delay_samples: int, H_sequence: np.ndarray) -> np.ndarray:
    """
    Return an aged + noisy CSI estimate.

    Simulates the effect of feedback delay and estimation error on CSI accuracy.

    Parameters
    ----------
    H_true : np.ndarray
        Ground truth channel matrix at current time.
    snr_db : float
        Pilot SNR in dB.
    delay_samples : int
        Number of timesteps of feedback delay.
    H_sequence : np.ndarray
        Full channel history (to pull the delayed estimate from).

    Returns
    -------
    np.ndarray
        Noisy, aged CSI estimate.
    """
    ...
```

---

### `src/beamforming.py`

Implement ZF and MRT precoders and their performance metrics.

```python
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
    """
    return H.conj().T


def precoding_error(W_true: np.ndarray, W_estimated: np.ndarray) -> float:
    """
    Compute normalized precoding perturbation error.

    ‖ΔW‖ / ‖W‖

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
    """
    delta_W = W_true - W_estimated
    return np.linalg.norm(delta_W, 'fro') / (np.linalg.norm(W_true, 'fro') + 1e-12)


def compute_sinr(H: np.ndarray, W: np.ndarray, noise_power: float, user_idx: int = 0) -> float:
    """
    Compute per-user SINR for a given channel and precoder.

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
    """
    HW = H @ W
    signal_power = abs(HW[user_idx, user_idx]) ** 2
    interference = sum(abs(HW[user_idx, k]) ** 2 for k in range(HW.shape[1]) if k != user_idx)
    return signal_power / (interference + noise_power + 1e-12)
```

---

### `src/switching.py`

Implement the WaveLynk adaptive controller that uses CCI to make switching decisions.

```python
"""
switching.py — WaveLynk adaptive beamforming controller.

Implements the predictive switching mechanism described in Section V of the paper.
"""

import numpy as np
from dataclasses import dataclass, field
from .cci import compute_cci, should_switch_to_mrt, DEFAULT_GAMMA
from .beamforming import zf_precoder, mrt_precoder


@dataclass
class SwitchingConfig:
    gamma: float = DEFAULT_GAMMA
    alpha: float = 1.0
    beta: float = 1.0
    hysteresis: float = 0.05    # avoid rapid toggling near threshold
    carrier_freq_hz: float = 6e9


@dataclass
class SwitchEvent:
    time_s: float
    from_mode: str
    to_mode: str
    cci_value: float


class WaveLynkController:
    """
    Adaptive beamforming controller implementing CCI-based predictive switching.

    Usage
    -----
    controller = WaveLynkController(config)
    W, mode = controller.select_precoder(H_csi, velocity, tau, sinr_db)
    """

    def __init__(self, config: SwitchingConfig):
        self.config = config
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

        Returns
        -------
        W : np.ndarray
            Selected precoding matrix.
        mode : str
            "ZF" or "MRT"
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
        self.switch_events.append(SwitchEvent(self._t, from_mode, to_mode, cci))
        self.current_mode = to_mode

    def summary(self) -> dict:
        """Return a summary of controller performance."""
        return {
            "total_switches": len(self.switch_events),
            "time_in_zf_pct": self.mode_history.count("ZF") / len(self.mode_history) * 100,
            "time_in_mrt_pct": self.mode_history.count("MRT") / len(self.mode_history) * 100,
            "mean_cci": float(np.mean(self.cci_history)),
            "max_cci": float(np.max(self.cci_history)),
            "switch_events": self.switch_events,
        }
```

---

### `notebooks/01_cci_derivation.ipynb`

Structure this notebook with these cells (write as a proper Jupyter notebook):

**Cell 1 — Markdown header:** Title, authors, abstract (what this notebook shows)

**Cell 2 — Imports:** numpy, scipy.special.j0, matplotlib, sys path setup, import from src

**Cell 3 — Plot 1: Doppler Frequency vs. Velocity**
- x-axis: velocity 0–50 m/s
- Multiple lines for fc = 2.4GHz (Wi-Fi 5), 6GHz (Wi-Fi 7), 28GHz (mmWave), 100GHz (6G)
- Label coherence time on right y-axis
- Title: "Doppler Frequency and Coherence Time vs. User Velocity"
- Annotate: walking (1.5 m/s), cycling (5 m/s), vehicle (30 m/s)

**Cell 4 — Markdown:** Explain J₀ (Bessel function) as the correlation model

**Cell 5 — Plot 2: Channel Autocorrelation ρ(τ) = J₀(2π·fD·τ)**
- x-axis: normalized delay τ/Tc from 0 to 2
- Multiple lines for different velocities
- Mark the τ = 0.3Tc point where ρ ≈ 0.7
- Mark the threshold where correlation falls below 0.6
- Show this is where γ = 0.6 comes from

**Cell 6 — Markdown:** Derive γ = 0.6 step by step with LaTeX math

**Cell 7 — Plot 3: CCI components breakdown**
- Show all 4 CCI terms separately as a function of velocity
- Then show the composite CCI
- Horizontal line at γ = 0.6
- Shade the region above threshold red ("Instability Zone")

**Cell 8 — Plot 4: Matrix Conditioning**
- Simulate random MIMO matrices 4×4 at different SNRs
- Plot condition number κ(H) distribution as velocity increases
- Show how poor conditioning amplifies precoding error

**Cell 9 — Conclusion markdown cell**

All plots: use matplotlib with a clean dark or academic style. Figure size (10, 5) or (12, 6).
Consistent color scheme: blue = stable/ZF, orange = threshold, red = unstable/MRT, green = WaveLynk.
All axes labeled with units. All figures have titles. Use plt.tight_layout(). Save each figure
to `../assets/notebooks/fig_XX_name.png`.

---

### `notebooks/02_simulation_figures.ipynb`

**Goal:** Reproduce all 3 figures from the paper in Python/matplotlib.

**Figure 1 — CCI Surface (replicates paper Fig. 1):**
- Use `ax.plot_surface()` from mpl_toolkits.mplot3d
- x-axis: CSI delay τ from 0 to 10 ms
- y-axis: user velocity from 0 to 50 m/s
- z-axis: CCI value
- Color map: 'viridis' (blue=low/stable → yellow=high/unstable)
- Use a fixed random 4×4 channel matrix with condition number set parametrically
  (vary κ from 1 to 20 across the sweep)
- Title: "Conditioned Coherence Index vs. Velocity and Delay"

**Figure 2 — 3D Scatter with Threshold Plane (replicates paper Fig. 2):**
- x-axis: user velocity (m/s)
- y-axis: channel correlation ρ
- z-axis: CCI value
- Color: CCI magnitude (same colormap)
- Semi-transparent plane at z = 0.6 (alpha=0.3, color='red')
- Label "Switching Threshold γ = 0.6" on the plane
- Generate 500 random simulation points across velocity/delay parameter space

**Figure 3 — Two-Panel Stability Analysis (replicates paper Fig. 3):**
- Simulate channel over velocity sweep 0–45 m/s
- Top panel: CCI vs. velocity
  - Line: CCI metric
  - Dashed horizontal line at γ = 0.6 labeled "Stability Threshold"
  - Shade region above threshold
- Bottom panel: Perturbation Error ‖ΔW‖/‖W‖ vs. velocity on log scale (yscale='log')
  - Three lines: "Pure ZF (Catastrophic Failure)", "Pure MRT (Robust Baseline)", "Proposed Adaptive Switching"
  - ZF error should explode exponentially past γ threshold
  - MRT error stays roughly flat
  - WaveLynk stays near MRT level after switch point
- Twin x-axis, shared x range, matching velocity axis

---

### `notebooks/03_monte_carlo.ipynb`

**Goal:** 100-trial robustness sweep comparing WaveLynk vs always-ZF vs always-MRT.

Structure:
1. Define simulation parameters (carrier freq, velocity range, SNR range, matrix size)
2. For each trial (n=100): randomize velocity, SNR, channel seed, delay
3. Run three strategies: always-ZF, always-MRT, WaveLynk controller
4. Record: outage rate (when SINR drops below threshold), mean SINR, peak latency proxy, # switches
5. Plot:
   - Box plots: SINR distribution across 100 trials for each strategy
   - Bar chart: outage rate (%) for ZF vs MRT vs WaveLynk
   - Line: per-trial outage rate sorted ascending (shows WaveLynk tail risk)
6. Save results to `../data/simulation/monte_carlo_results.csv`
7. Print summary table to output

---

### `notebooks/04_hardware_validation.ipynb`

**Goal:** Load real hardware measurement CSVs and compare to theoretical predictions.

**IMPORTANT:** This notebook must handle the case where hardware data files don't exist yet.
Add a check at the top: if files missing, print a clear message and show what format they should be in,
then use synthetic placeholder data to demonstrate the analysis pipeline.

Expected CSV formats:

`data/hardware/packet_loss.csv`:
```
trial, signal_strength_dbm, mode, packet_loss_pct
1, -45, ZF, 2.1
1, -45, MRT, 1.8
...
```

`data/hardware/latency_ms.csv`:
```
trial, signal_strength_dbm, mode, latency_p50_ms, latency_p95_ms, latency_p99_ms
...
```

`data/hardware/throughput_mbps.csv`:
```
trial, signal_strength_dbm, mode, throughput_mbps
...
```

Plots to generate:
1. Packet loss % vs. signal strength: ZF vs MRT vs WaveLynk (replicates poster figure)
2. Latency CDF for each strategy
3. Throughput vs. signal strength box plots
4. Overlay: theoretical CCI threshold vs. measured collapse point

---

### `data/README.md`

Describe the data directory structure. Explain:
- What `hardware/` contains and how it was collected (testbed description)
- What `simulation/` contains and which notebook generated it
- Column descriptions for each CSV
- Note that hardware data comes from the Netgear Nighthawk Wi-Fi 6/7 testbed
  described in the paper

---

### `requirements.txt`

```
numpy>=1.24.0
scipy>=1.10.0
matplotlib>=3.7.0
jupyter>=1.0.0
pandas>=2.0.0
notebook>=7.0.0
ipykernel>=6.0.0
```

---

### `.gitignore`

```
__pycache__/
*.pyc
*.pyo
.ipynb_checkpoints/
*.egg-info/
dist/
build/
.env
*.DS_Store
data/hardware/*.csv     # hardware CSVs added separately by user
```

Wait — **do NOT ignore hardware CSVs** once the user adds them. Remove the hardware line
from .gitignore after you create it, or make it a comment explaining user should add data.

Actually: do NOT gitignore the hardware data folder at all. Leave data/ fully tracked.

---

### `LICENSE`

MIT License. Authors: Neha Abin, Sahil Shah, Yajat Parmar. Year: 2025.

---

## Site Updates (`site/index.html`)

Move the existing `index.html` to `site/index.html`. Then make the following targeted
changes to the existing file — do NOT rewrite the entire site:

1. **Update the Results section** — find the hardcoded demo result numbers and add a note:
   `"Simulation values shown. See /notebooks/03_monte_carlo.ipynb for full results."`

2. **Add a nav link** to the paper: in the existing `<nav>` links section, add:
   `<a href="../paper/WaveLynk_Paper.pdf">Paper</a>`
   and `<a href="https://github.com/yajatp/WaveLynk">GitHub</a>` if not already present.

3. **Update the README.txt reference** in the demo instructions to reflect new path: `site/`

4. **Do not change any existing styling, layout, simulation logic, or demo functionality.**

---

## GitHub Repository Metadata (do these manually / note for user)

After all files are in place, tell the user to:
1. Go to repo Settings → add Description: "Predictive beamforming switching for Wi-Fi 7 and 6G using the Conditioned Coherence Index (CCI)"
2. Add topics: `6g`, `mimo`, `beamforming`, `wireless-communications`, `csi`, `python`, `jupyter`, `research`, `wifi7`, `machine-learning`
3. Enable GitHub Pages: Settings → Pages → Deploy from `main` branch, `/site` folder
4. Pin this repo on your GitHub profile

---

## Implementation Order

Do these in this exact order to avoid dependency issues:

1. Create directory structure (all empty folders with `.gitkeep`)
2. Write `requirements.txt`, `.gitignore`, `LICENSE`
3. Write `src/__init__.py`, then `src/cci.py` (no dependencies)
4. Write `src/channel_model.py` (depends on cci concepts but not cci.py)
5. Write `src/beamforming.py` (independent)
6. Write `src/switching.py` (depends on cci.py and beamforming.py)
7. Write `data/README.md`
8. Write `notebooks/01_cci_derivation.ipynb`
9. Write `notebooks/02_simulation_figures.ipynb`
10. Write `notebooks/03_monte_carlo.ipynb`
11. Write `notebooks/04_hardware_validation.ipynb`
12. Move `index.html` → `site/index.html`, apply site edits
13. Write `README.md` (last, so you can reference all files accurately)

---

## Quality Standards

- Every Python function: complete docstring with Parameters, Returns, Notes, Examples where helpful
- Every notebook: markdown cells explaining the "why" before each code cell, not just code dumps
- All plots: labeled axes with units, titles, legends, consistent color scheme
- README math blocks: use GitHub-flavored `$$...$$` syntax (renders on GitHub)
- No placeholder "TODO" comments left in delivered code — either implement it or raise NotImplementedError with a clear message
- All `...` in the spec above should be fully implemented — these are intentional placeholders for you to fill with real code
- Commit message convention for user reference: `feat: add CCI implementation`, `feat: add simulation notebooks`, etc.

---

## What NOT to Do

- Do NOT delete or replace `site/index.html` content — only move it and make the 3 targeted edits above
- Do NOT use any external APIs, web scraping, or network calls in the notebooks — all data is local
- Do NOT add any ML/AI model — the CCI is an analytical formula, not a learned model
- Do NOT add a `setup.py` or make this a pip package — keep it simple
- Do NOT add tests — out of scope for now
- Do NOT rename WaveLynk or change any branding

---

*End of specification. Begin with Step 1 of the Implementation Order.*
