# WaveLynk Research Paper & Conference Publication

> **Paper Title:** Predicting Beamforming Instability in Wi-Fi 7 and 6G Systems Using a Conditioned Coherence Framework  
> **Authors:** Neha Abin, Sahil Shah, Yajat Parmar  
> **Affiliation:** Allen High School, Allen, TX  
> **Status:** Accepted / IEEE Conference Proceedings (2025–2026)  
> **Release:** Official Final External Version (v1.0.0)

---

## Documents

- 📄 **[Full Paper PDF](WaveLynk_Paper.pdf)** — IEEE format manuscript with complete mathematical derivations, system diagrams, and hardware testbed evaluation.
- 📝 **[Paper Manuscript (.docx)](WaveLynk_Manuscript.docx)** — Source manuscript draft.

---

## Abstract

High-frequency Multi-User Multiple-Input Multiple-Output (MU-MIMO) systems—including IEEE 802.11be (Wi-Fi 7), 5G millimeter-wave, and emerging sub-THz 6G networks—heavily rely on Zero-Forcing (ZF) precoding to suppress multi-user interference. However, ZF precoding exhibits severe vulnerability to Channel State Information (CSI) aging caused by client mobility and feedback latency. When CSI decorrelation exceeds a critical threshold, the system encounters a non-linear degradation regime termed the **Coherence Cliff**, precipitating catastrophic packet loss and latency spikes.

This research presents **WaveLynk**, an analytical and predictive beamforming framework centered on the **Conditioned Coherence Index (CCI)**:

$$\text{CCI}(t) = \kappa(\mathbf{H}) \cdot \left|J_0(2\pi f_D \tau)\right| \cdot \frac{\text{SINR}(t)}{\text{SINR}(t) + \alpha} \cdot e^{-\beta \frac{\tau}{T_c}}$$

By continuously monitoring the CCI against an analytically derived boundary threshold ($\gamma = 0.6$), WaveLynk proactively switches the precoding regime from Zero-Forcing to Maximum Ratio Transmission (MRT) *before* the link collapses. Experimental evaluation on a physical Wi-Fi 7 testbed (Netgear Nighthawk 6 GHz, 3 MU-MIMO endpoints, 100 trials) demonstrates a **41% reduction in outage probability** and a **32% decrease in peak latency** compared to standard always-ZF baselines.

---

## Citation

### IEEE Format
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

## IEEE Copyright Notice

> **© 2025–2026 IEEE.** Personal use of this material is permitted. Permission from IEEE must be obtained for all other uses, in any current or future media, including reprinting/republishing this material for advertising or promotional purposes, creating new collective works, for resale or redistribution to servers or lists, or reuse of any copyrighted component of this work in other works.

---

## Related Code & Artifacts

- **Core Algorithm:** [`../src/cci.py`](../src/cci.py) and [`../src/switching.py`](../src/switching.py)
- **Mathematical Derivations:** [`../notebooks/01_cci_derivation.ipynb`](../notebooks/01_cci_derivation.ipynb)
- **Simulation Figures:** [`../notebooks/02_simulation_figures.ipynb`](../notebooks/02_simulation_figures.ipynb)
- **Monte Carlo Robustness:** [`../notebooks/03_monte_carlo.ipynb`](../notebooks/03_monte_carlo.ipynb)
- **Hardware Validation:** [`../notebooks/04_hardware_validation.ipynb`](../notebooks/04_hardware_validation.ipynb)
