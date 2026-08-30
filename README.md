# WaveLynk: Predictive Beamforming Switching for Wi-Fi 7 and 6G Systems

[![Version: Final External Release v1.0.0](https://img.shields.io/badge/Version-v1.0.0_(Final_External_Release)-007acc.svg)](https://github.com/yajatp/WaveLynk/releases/tag/v1.0.0)
[![Python 3.9+](https://img.shields.io/badge/Python-3.9+-3776AB?logo=python&logoColor=white)](https://python.org)
[![Live Demo](https://img.shields.io/badge/Live_Demo-wavelynk.us-6366f1)](https://wavelynk.us)
[![Code License: MIT](https://img.shields.io/badge/Code_License-MIT-green.svg)](LICENSE)
[![Paper: IEEE Format](https://img.shields.io/badge/Paper-IEEE_Format-0077B5)](paper/WaveLynk_Paper.pdf)
[![Status: Complete](https://img.shields.io/badge/Status-Final_Release-22c55e)](https://github.com/yajatp/WaveLynk)

> **Official Final External Version (v1.0.0)**  
> This repository contains the finalized research code, simulation notebooks, hardware testbed dataset, and publication materials for the accepted IEEE conference paper:  
> *“Predicting Beamforming Instability in Wi-Fi 7 and 6G Systems Using a Conditioned Coherence Framework”* (2025/2026).

---

## Overview

High-frequency wireless systems — including Wi-Fi 7 (6 GHz), mmWave 5G, and emerging 6G — rely on Multi-User MIMO (MU-MIMO) beamforming to serve multiple users simultaneously. The dominant precoding strategy, **Zero-Forcing (ZF)**, works by inverting the channel matrix to cancel inter-user interference. This works remarkably well when the Channel State Information (CSI) is fresh and accurate.

The problem is that it fails *suddenly*. Unlike legacy systems that degrade gradually, these high-frequency systems experience a sharp, nonlinear collapse in throughput and reliability when CSI becomes stale — a phenomenon known as the **Coherence Cliff**. A user simply walking across a room at 1.5 m/s can push the system past this boundary, causing packet loss to spike and latency to explode.

WaveLynk introduces the **Conditioned Coherence Index (CCI)**, a unified analytical metric that predicts when a MIMO channel is approaching the Coherence Cliff. When CCI crosses a derived threshold ($\gamma = 0.6$), WaveLynk proactively switches from ZF to the more robust Maximum Ratio Transmission (MRT) precoding — preserving connectivity and preventing outages.

---

## The Conditioned Coherence Index (CCI)

The CCI combines four physically meaningful instability factors into a single predictive metric:

$$\text{CCI}(t) = \kappa(\mathbf{H}) \cdot \left|J_0(2\pi f_D \tau)\right| \cdot \frac{\text{SINR}(t)}{\text{SINR}(t) + \alpha} \cdot e^{-\beta \frac{\tau}{T_c}}$$

| Term | Name | What It Captures |
|------|------|-----------------|
| $\kappa(\mathbf{H})$ | Channel condition number | Spatial instability — how much ZF amplifies channel estimation errors |
| $\|J_0(2\pi f_D \tau)\|$ | Doppler decorrelation | Temporal channel variation due to user mobility (Bessel function order 0) |
| $\frac{\text{SINR}}{\text{SINR} + \alpha}$ | Signal quality weight | Normalized signal-to-interference measure ($\alpha$ sensitivity parameter) |
| $e^{-\beta \tau / T_c}$ | CSI aging decay | Channel estimate staleness relative to coherence time $T_c$ |

### Switching Rule

$$W_{\text{opt}} = \begin{cases} W_{\text{ZF}} & \text{if } \text{CCI}(t) < \gamma \\ W_{\text{MRT}} & \text{if } \text{CCI}(t) \geq \gamma \end{cases}$$

The threshold **$\gamma = 0.6$** is derived analytically: substituting a typical feedback delay $\tau \approx 0.3 \cdot T_c$ into the Bessel function gives $J_0(0.8) \approx 0.7$, and the normalized correlation product drops below 0.6 at this operating point — marking the onset of ZF instability.

---

## Key Results

| Metric | Always-ZF | Always-MRT | WaveLynk (Adaptive) | Improvement |
|--------|-----------|------------|---------------------|-------------|
| Outage Rate | High under mobility | Moderate | **Near-zero** | **↓ 41%** |
| Peak Latency | Spikes past cliff | High base | **Stable & Low** | **↓ 32%** |
| Packet Loss | Catastrophic collapse | Moderate | **Controlled** | **Prevented** |
| Validated Trials | — | — | **100 Trials** | — |

*Empirical testbed data from 100 trials on a 6 GHz Wi-Fi 7 router. See [`notebooks/03_monte_carlo.ipynb`](notebooks/03_monte_carlo.ipynb) and [`notebooks/04_hardware_validation.ipynb`](notebooks/04_hardware_validation.ipynb) for full results.*

---

## Repository Structure

```
WaveLynk/
│
├── README.md                          ← Main project documentation
├── LICENSE                            ← Dual MIT Code License & IEEE Paper Copyright
├── requirements.txt                   ← Python dependencies
├── vercel.json                        ← Web deployment configuration
│
├── src/                               ← Core Python package
│   ├── __init__.py                    ← Package init, exposes top-level API
│   ├── cci.py                         ← CCI formulation & Doppler/coherence functions
│   ├── beamforming.py                 ← Zero-Forcing (ZF) and MRT precoders
│   ├── channel_model.py               ← Jake's fading Rayleigh MIMO simulator
│   └── switching.py                   ← WaveLynk adaptive controller with hysteresis
│
├── notebooks/                         ← Jupyter research notebooks
│   ├── 01_cci_derivation.ipynb        ← CCI mathematical derivation & γ=0.6 threshold
│   ├── 02_simulation_figures.ipynb    ← 3D surfaces & stability analysis figures
│   ├── 03_monte_carlo.ipynb           ← 100-trial Monte Carlo robustness sweep
│   └── 04_hardware_validation.ipynb   ← Testbed measurements vs. theoretical bounds
│
├── paper/                             ← Research publication materials
│   ├── README.md                      ← Paper abstract, citation & copyright notice
│   ├── WaveLynk_Paper.pdf             ← Complete IEEE format research paper
│   └── WaveLynk_Manuscript.docx       ← Source manuscript document
│
├── poster/                            ← Conference presentation materials
│   ├── README.md                      ← Poster summary & visual outline
│   └── .gitkeep
│
├── data/                              ← Experimental & simulation datasets
│   ├── README.md                      ← Data dictionary & measurement protocol
│   ├── hardware/                      ← Wi-Fi 7 testbed trial measurements
│   └── simulation/                    ← Monte Carlo generated CSVs
│
├── site/                              ← Interactive web application & live demo
│   ├── index.html                     ← Responsive SPA (Science, Demos, Evidence, Team)
│   ├── styles.css                     ← Custom styling & responsive layouts
│   ├── main.js                        ← Interactive simulation engine & visualizer
│   └── images/                        ← Author photos, system figures & diagrams
│
└── assets/                            ← Presentation assets & rendered notebook figures
```

---

## Getting Started

### Prerequisites

- Python 3.9+
- pip

### Install Dependencies

```bash
git clone https://github.com/yajatp/WaveLynk.git
cd WaveLynk
pip install -r requirements.txt
```

### Run the Research Notebooks

```bash
cd notebooks
jupyter notebook
```

Follow the notebooks in numerical order:
1. `01_cci_derivation.ipynb`: Step-by-step mathematical derivation of the CCI equation and the $\gamma = 0.6$ threshold.
2. `02_simulation_figures.ipynb`: Reproduces 3D stability surfaces and multi-panel performance figures.
3. `03_monte_carlo.ipynb`: 100-run Monte Carlo sweep evaluating outage probability under stochastic channels.
4. `04_hardware_validation.ipynb`: Validates theoretical bounds against physical 6 GHz testbed data.

### Run the Interactive Web Demo

```bash
cd site
python3 -m http.server 8000
# Open http://localhost:8000 in your browser
```

---

## Hardware Testbed

Experimental validation was conducted on a physical Wi-Fi 6/7 testbed:

- **Router:** Netgear Nighthawk Wi-Fi 6/7 router operating on the 6 GHz band
- **Server:** Laptop running `iperf3` in server mode
- **Clients:** 2 laptops running `iperf3` client streams stressing the MU-MIMO downlink
- **Monitors:** 2 mobile devices logging RSSI, throughput, and ping latency
- **Protocol:** 100 randomized trials comparing WaveLynk vs. always-ZF vs. always-MRT
- **Key Metric Findings:** WaveLynk prevented the catastrophic throughput collapse observed in always-ZF during mobility, achieving the robustness of MRT while maintaining the high peak capacity of ZF in static states.

---

## Paper & Citation

> **Paper Title:** Predicting Beamforming Instability in Wi-Fi 7 and 6G Systems Using a Conditioned Coherence Framework  
> **Authors:** Neha Abin, Sahil Shah, Yajat Parmar (Allen High School, Allen, TX)  
> **Conference:** IEEE Conference Proceedings, 2025/2026.

📄 **[Read the Full Paper PDF](paper/WaveLynk_Paper.pdf)**

### IEEE Citation Format
```text
N. Abin, S. Shah, and Y. Parmar, "Predicting Beamforming Instability in Wi-Fi 7 and 6G Systems Using a Conditioned Coherence Framework," in IEEE Conference Proceedings, 2025/2026.
```

### BibTeX
```bibtex
@inproceedings{abin2025wavelynk,
  author    = {Abin, Neha and Shah, Sahil and Parmar, Yajat},
  title     = {Predicting Beamforming Instability in Wi-Fi 7 and 6G Systems Using a Conditioned Coherence Framework},
  booktitle = {IEEE Conference Proceedings},
  year      = {2025},
  month     = {October},
  note      = {WaveLynk Project}
}
```

---

## Authors

| Name | Role | Focus Areas |
|------|------|-------------|
| **Neha Abin** | Co-author | Theoretical framework, CCI derivation, and fading channel simulation |
| **Sahil Shah** | Co-author | Wi-Fi 7 hardware testbed design, validation protocol, and data collection |
| **Yajat Parmar** | Co-author | Adaptive switching controller implementation, notebook pipeline, and interactive demo site |

**Affiliation:** Allen High School, Allen, TX

---

## License & Copyright

- **Software, Notebooks & Code:** Released under the [MIT License](LICENSE). Free for academic, educational, and commercial reuse with attribution.
- **Research Paper & Publication Materials:**  
  > **© 2025–2026 IEEE.** Personal use of this material is permitted. Permission from IEEE must be obtained for all other uses, in any current or future media, including reprinting/republishing this material for advertising or promotional purposes, creating new collective works, for resale or redistribution to servers or lists, or reuse of any copyrighted component of this work in other works.

---

## References

1. D. Tse and P. Viswanath, *Fundamentals of Wireless Communication*, Cambridge University Press, 2005.
2. W.C. Jakes, *Microwave Mobile Communications*, Wiley-IEEE Press, 1994.
3. T.L. Marzetta, "Noncooperative Cellular Wireless with Unlimited Numbers of Base Station Antennas," *IEEE Trans. Wireless Commun.*, vol. 9, no. 11, 2010.
4. T.S. Rappaport et al., "Millimeter Wave Mobile Communications for 5G Cellular," *IEEE Access*, vol. 1, 2013.
5. IEEE 802.11be (Wi-Fi 7), "Extremely High Throughput (EHT)," IEEE Standards Association, 2024.

