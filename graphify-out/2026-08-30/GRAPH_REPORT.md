# Graph Report - .  (2026-08-30)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 88 nodes · 105 edges · 20 communities (8 shown, 12 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.88)
- Token cost: 782 input · 46 output

## Graph Freshness
- Built from commit: `4e6db295`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Channel Coherence Metrics
- Beamforming and Precoding
- Adaptive Beamforming Controller
- MIMO Channel Simulation
- WaveLynk System
- Latency and Loss Figure
- SwitchingConfig
- WaveLynk Research Paper
- vercel.json
- Impact Car Visual
- Coherence Cliff
- Conditioned Coherence Index (CCI)
- Hardware Throughput Data
- Monte Carlo Results
- CIN Distribution Chart
- Neha - Team Member Photo
- Sahil - Team Member Photo
- Team Placeholder Avatars
- Yajat - Team Member Photo

## God Nodes (most connected - your core abstractions)
1. `compute_cci()` - 10 edges
2. `WaveLynkController` - 8 edges
3. `WaveLynk System` - 7 edges
4. `zf_precoder()` - 6 edges
5. `mrt_precoder()` - 6 edges
6. `generate_channel_matrix()` - 5 edges
7. `simulate_channel_sequence()` - 5 edges
8. `doppler_frequency()` - 4 edges
9. `coherence_time()` - 4 edges
10. `condition_number()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `Latency and Loss Figure` --semantically_similar_to--> `Hardware Packet Loss Data`  [INFERRED] [semantically similar]
  site/images/fig_latency_loss.png → data/hardware/packet_loss.csv
- `Latency vs Time Figure` --semantically_similar_to--> `Hardware Latency Data`  [INFERRED] [semantically similar]
  site/images/fig_latency_time.png → data/hardware/latency_ms.csv
- `WaveLynk README` --references--> `WaveLynk Research Paper`  [EXTRACTED]
  README.md → paper/WaveLynk_Paper.pdf
- `WaveLynk Logo` --references--> `WaveLynk System`  [INFERRED]
  site/images/logo.png → site/paper/WaveLynk_Paper.pdf
- `Packet Loss vs Received Signal Power Chart` --references--> `WaveLynk System`  [EXTRACTED]
  site/images/fig_loss.png → site/paper/WaveLynk_Paper.pdf

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **WaveLynk Performance Evaluation** — site_images_fig_loss, site_images_fig_ping, site_images_latency_comparison, site_images_risk_threshold_sweep [EXTRACTED 0.95]

## Communities (20 total, 12 thin omitted)

### Community 0 - "Channel Coherence Metrics"
Cohesion: 0.18
Nodes (16): channel_autocorrelation(), coherence_time(), compute_cci(), condition_number(), doppler_frequency(), ndarray, cci.py — Conditioned Coherence Index (CCI) implementation. The CCI is defined…, Compute the condition number of a MIMO channel matrix. κ(H) = σ_max(H) /… (+8 more)

### Community 1 - "Beamforming and Precoding"
Cohesion: 0.21
Nodes (12): compute_sinr(), mrt_precoder(), normalize_precoder(), precoding_error(), ndarray, beamforming.py — Zero-Forcing and MRT precoder implementations. ZF precoder:…, Compute per-user SINR for a given channel and precoder. SINR_k = |h_k^H w_k|² /…, Compute Zero-Forcing precoding matrix. W_ZF = H^H · (H · H^H)^{-1} Minimizes… (+4 more)

### Community 2 - "Adaptive Beamforming Controller"
Cohesion: 0.17
Nodes (9): ndarray, Select optimal precoder for current channel conditions. Computes CCI from the…, Record a switch event and update current mode., Reset controller state for a new simulation run., Return a summary of controller performance. Returns ------- dict Dictionary…, Record of a single beamforming mode switch. Parameters ---------- time_s :…, Adaptive beamforming controller implementing CCI-based predictive switching.…, SwitchEvent (+1 more)

### Community 3 - "MIMO Channel Simulation"
Cohesion: 0.27
Nodes (10): add_csi_error(), ChannelConfig, generate_channel_matrix(), ndarray, channel_model.py — MIMO channel simulator for WaveLynk experiments. Implements:…, Simulate a time-varying MIMO channel over a duration. Generates a sequence of…, Return an aged + noisy CSI estimate. Simulates the effect of feedback delay and…, Configuration for a MIMO channel simulation. Parameters ---------- Nr : int… (+2 more)

### Community 4 - "WaveLynk System"
Cohesion: 0.25
Nodes (8): Packet Loss vs Received Signal Power Chart, Ping Latency vs Received Signal Power Chart, Latency Comparison: WaveLynk (Predictive) vs ZF (Reactive), WaveLynk Logo, Outage Map: Wireless Signal Testing (CSI Age vs Doppler Shift), Risk Threshold Sweep for Wireless Performance Optimization, WaveLynk Paper, WaveLynk System

### Community 5 - "Latency and Loss Figure"
Cohesion: 0.40
Nodes (5): Hardware Latency Data, Hardware Packet Loss Data, Latency and Loss Figure, Latency vs Time Figure, WaveLynk Web Demo

### Community 6 - "SwitchingConfig"
Cohesion: 0.50
Nodes (3): Configuration for the WaveLynk adaptive switching controller. Parameters…, Initialize the WaveLynk adaptive controller. Parameters ---------- config :…, SwitchingConfig

## Knowledge Gaps
- **22 isolated node(s):** `outputDirectory`, `WaveLynk README`, `WaveLynk Research Paper`, `Hardware Packet Loss Data`, `Hardware Latency Data` (+17 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `WaveLynkController` connect `Adaptive Beamforming Controller` to `Channel Coherence Metrics`, `SwitchingConfig`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **Why does `compute_cci()` connect `Channel Coherence Metrics` to `Adaptive Beamforming Controller`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Why does `zf_precoder()` connect `Beamforming and Precoding` to `Channel Coherence Metrics`, `Adaptive Beamforming Controller`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `WaveLynk System` (e.g. with `WaveLynk Logo` and `WaveLynk Paper`) actually correct?**
  _`WaveLynk System` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `outputDirectory`, `WaveLynk README`, `WaveLynk Research Paper` to the rest of the system?**
  _22 weakly-connected nodes found - possible documentation gaps or missing edges._