# WaveLynk: Predictive Beamforming Switching for Wi-Fi 7 and 6G Systems

[![Python 3.9+](https://img.shields.io/badge/Python-3.9+-3776AB?logo=python&logoColor=white)](https://python.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Status: Active](https://img.shields.io/badge/Status-Active-22c55e)](https://github.com/yajatp/WaveLynk)
[![Paper: IEEE Format](https://img.shields.io/badge/Paper-IEEE_Format-0077B5)](paper/WaveLynk_Paper.pdf)

> **Turning the Coherence Cliff from a failure mode into a predictable, preventable event.**

WaveLynk is a predictive beamforming control framework that detects approaching wireless link instability and switches precoding strategy *before* catastrophic failure — not after.

---

## Overview

High-frequency wireless systems — including Wi-Fi 7 (6 GHz), mmWave 5G, and emerging 6G — rely on MIMO beamforming to serve multiple users simultaneously. The dominant precoding strategy, **Zero-Forcing (ZF)**, works by inverting the channel matrix to cancel inter-user interference. This works remarkably well when the Channel State Information (CSI) is fresh and accurate.

The problem is that it fails *suddenly*. Unlike legacy systems that degrade gradually, these high-frequency systems experience a sharp, nonlinear collapse in throughput and reliability when CSI becomes stale — a phenomenon we call the **Coherence Cliff**. A user simply walking across a room at 1.5 m/s can push the system past this boundary, causing packet loss to spike and latency to explode.

WaveLynk introduces the **Conditioned Coherence Index (CCI)**, a unified analytical metric that predicts when a MIMO channel is approaching the Coherence Cliff. When CCI crosses a derived threshold, WaveLynk proactively switches from ZF to the more robust Maximum Ratio Transmission (MRT) precoding — preserving connectivity and preventing outages.

---

## The Conditioned Coherence Index (CCI)

The CCI combines four physically meaningful instability factors into a single predictive metric:

$$\text{CCI}(t) = \kappa(\mathbf{H}) \cdot \left|J_0(2\pi f_D \tau)\right| \cdot \frac{\text{SINR}(t)}{\text{SINR}(t) + \alpha} \cdot e^{-\beta \frac{\tau}{T_c}}$$

| Term | Name | What It Captures |
|------|------|-----------------|
| $\kappa(\mathbf{H})$ | Channel condition number | Spatial instability — how much ZF amplifies errors |
| $\|J_0(2\pi f_D \tau)\|$ | Doppler decorrelation | Temporal channel variation due to user mobility |
| $\frac{\text{SINR}}{\text{SINR} + \alpha}$ | Signal quality weight | Normalized signal-to-interference measure |
| $e^{-\beta \tau / T_c}$ | CSI aging decay | How stale the channel estimate has become |

### Switching Rule

$$W_{\text{opt}} = \begin{cases} W_{\text{ZF}} & \text{if } \text{CCI}(t) < \gamma \\ W_{\text{MRT}} & \text{if } \text{CCI}(t) \geq \gamma \end{cases}$$

The threshold **γ = 0.6** is derived analytically: substituting a typical feedback delay τ ≈ 0.3·Tc into the Bessel function gives J₀(0.8) ≈ 0.7, and the normalized correlation product drops below 0.6 at this operating point — marking the onset of ZF instability.

---

## Key Results

| Metric | Always-ZF | WaveLynk | Improvement |
|--------|-----------|----------|-------------|
| Outage Rate | High at mobility | Near-zero | ↓ 41% |
| Peak Latency | Spikes past cliff | Stable | ↓ 32% |
| Packet Loss | Catastrophic collapse | Controlled | Prevented |
| Validated Trials | — | 100 | — |

*Simulation values shown. See [`notebooks/03_monte_carlo.ipynb`](notebooks/03_monte_carlo.ipynb) for full statistical results.*

---

## Repository Structure

```
WaveLynk/
│
├── README.md                          ← This file
│
├── paper/
│   └── WaveLynk_Paper.pdf            ← IEEE-format research paper (add manually)
│
├── poster/
│   └── WaveLynk_Poster.pdf           ← Conference poster (add manually)
│
├── src/
│   ├── __init__.py                    ← Package init, exposes core API
│   ├── cci.py                         ← CCI formula + Doppler/coherence utilities
│   ├── channel_model.py               ← Rayleigh/Jake's fading MIMO simulator
│   ├── beamforming.py                 ← ZF and MRT precoder implementations
│   └── switching.py                   ← WaveLynk adaptive controller with hysteresis
│
├── notebooks/
│   ├── 01_cci_derivation.ipynb        ← CCI math walkthrough, γ=0.6 derivation
│   ├── 02_simulation_figures.ipynb    ← Reproduces all 3 paper figures in Python
│   ├── 03_monte_carlo.ipynb           ← 100-trial robustness sweep
│   └── 04_hardware_validation.ipynb   ← Real testbed data vs. theory comparison
│
├── data/
│   ├── README.md                      ← Data dictionary and collection methodology
│   ├── hardware/                      ← Real Wi-Fi 6/7 testbed measurements
│   └── simulation/                    ← Monte Carlo output CSVs
│
├── site/
│   ├── index.html                     ← Interactive demo site with live simulations
│   ├── science.html                   ← Science explanation page
│   ├── demos.html                     ← Interactive demo page
│   ├── evidence.html                  ← Evidence and results page
│   └── team.html                      ← Team page
│
├── assets/                            ← Poster/paper image assets
├── requirements.txt                   ← Python dependencies
├── .gitignore
└── LICENSE                            ← MIT License
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

### Run the Simulations

```bash
cd notebooks
jupyter notebook
```

Start with `01_cci_derivation.ipynb` for the mathematical foundations, then proceed through the notebooks in order.

### Run the Demo Site

```bash
cd site
python -m http.server 8000
# Open http://127.0.0.1:8000/
```

---

## Hardware Testbed

Experimental validation was performed on a physical Wi-Fi 6/7 testbed:

- **Router:** Netgear Nighthawk Wi-Fi 6/7 router operating on the 6 GHz band
- **Server:** 1 laptop running `iperf3` as the throughput measurement server
- **Clients:** 2 laptops running `iperf3` as clients, stressing the MU-MIMO link
- **Monitors:** 2 smartphones measuring live throughput and signal quality metrics
- **Protocol:** 100 independent trials comparing WaveLynk vs. always-ZF vs. always-MRT
- **Metrics:** Packet loss (%), ping latency (ms), RSSI (dBm), throughput (Mbps)

Results confirmed that WaveLynk prevents the throughput collapse observed under always-ZF while maintaining higher peak performance than always-MRT.

---

## Paper

> Neha Abin, Sahil Shah, Yajat Parmar. "Predicting Beamforming Instability in Wi-Fi 7 and 6G Systems Using a Conditioned Coherence Framework." *IEEE Format*, 2025.

📄 [Read the paper](paper/WaveLynk_Paper.pdf)

---

## Authors

| Name | Role |
|------|------|
| **Neha Abin** | Co-author, theoretical framework and simulations |
| **Sahil Shah** | Co-author, hardware testbed and validation |
| **Yajat Parmar** | Co-author, implementation and demo site |

Allen High School, Allen, TX

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## References

1. D. Tse and P. Viswanath, *Fundamentals of Wireless Communication*, Cambridge University Press, 2005.
2. W.C. Jakes, *Microwave Mobile Communications*, Wiley-IEEE Press, 1994.
3. T.L. Marzetta, "Noncooperative Cellular Wireless with Unlimited Numbers of Base Station Antennas," *IEEE Trans. Wireless Commun.*, vol. 9, no. 11, 2010.
4. T.S. Rappaport et al., "Millimeter Wave Mobile Communications for 5G Cellular," *IEEE Access*, vol. 1, 2013.
5. IEEE 802.11be (Wi-Fi 7), "Extremely High Throughput (EHT)," IEEE Standards Association, 2024.
