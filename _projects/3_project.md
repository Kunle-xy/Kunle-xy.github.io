---
layout: page
title: Hidden Markov Model - Market Regime Trading
description: Decoding financial markets with probabilistic state machines
img: assets/img/HMM_project.png
importance: 3
category: ai
github: https://github.com/Kunle-xy/OguntoyeProjects/tree/main/Hidden%20Markov%20Model/HMM_Multi
---

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/HMM_project.png" title="HMM Market Regime Detection" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    Multivariate Hidden Markov Model for market regime detection and systematic trading.
</div>

## The Problem: Markets Don't Move Randomly

Financial markets don't just fluctuate—they exhibit **regime-switching behavior**. Bull markets surge with steady confidence and low volatility. Bear markets collapse with fear-driven spikes and violent drawdowns. The challenge? These regimes are invisible. We cannot simply observe whether we're in a "bull" or "bear" state. All we see are daily returns, prices, and volatility measures. The regime remains hidden.

This is where I turned to **Hidden Markov Models (HMMs)**—a probabilistic framework that treats market regimes as latent states we must infer from observable data. I built this system to decode the unobservable, to predict not just *what* the market is doing, but *what state* it's in.

---

## Beyond Simple Returns: My Multivariate Approach

The conventional approach uses returns alone—a single feature fed into a univariate Gaussian HMM. It works, but it's leaving information on the table. I extended this framework by incorporating **wavelet energy** as a second feature, creating a multivariate observation model:

$$\mathbf{o}_t = \begin{bmatrix} r_t \\ E_t \end{bmatrix}$$

Where:
- $$r_t$$ is the adjusted daily return
- $$E_t$$ is the wavelet energy capturing frequency-domain activity

This dual-feature approach allows my HMM to learn the **covariance structure** between returns and market activity. Bull markets? Positive returns with low energy (calm uptrends). Bear markets? Negative returns with high energy (volatile declines).

---

## The Mathematical Engine

At the core of my implementation lies the complete HMM machinery. I didn't just use a library—I understood and implemented the fundamental algorithms:

### The Three Problems I Solved

| Problem | What I Computed | Algorithm |
|---------|-----------------|-----------|
| **Evaluation** | $$P(O \mid \lambda)$$ — Likelihood of observations | Forward Algorithm |
| **Decoding** | $$Q^* = \arg\max P(Q \mid O, \lambda)$$ — Most likely state sequence | Viterbi Algorithm |
| **Learning** | $$\lambda^* = \arg\max P(O \mid \lambda)$$ — Optimal model parameters | Baum-Welch (EM) |

### The Transition Matrix

My model learns a 2×2 transition matrix that captures regime persistence:

$$A = \begin{bmatrix} P(\text{BULL} \to \text{BULL}) & P(\text{BULL} \to \text{BEAR}) \\ P(\text{BEAR} \to \text{BULL}) & P(\text{BEAR} \to \text{BEAR}) \end{bmatrix}$$

The diagonal elements reveal how "sticky" each regime is—markets don't flip randomly between states.

### Gaussian Emissions

Each state emits observations from a multivariate Gaussian:

$$b_i(\mathbf{o}_t) = \mathcal{N}(\mathbf{o}_t; \boldsymbol{\mu}_i, \boldsymbol{\Sigma}_i)$$

The learned means and covariances for each state provide a probabilistic fingerprint of bull and bear markets.

---

## Wavelet Transform: Seeing the Frequency Domain

Why wavelets? Because market activity isn't just about magnitude—it's about *when* and *at what frequency* patterns occur. I implemented the **Continuous Wavelet Transform** using the Complex Morlet wavelet:

$$\psi(t) = \frac{1}{\sqrt{\pi f_b}} \exp(2\pi i f_c t) \exp\left(-\frac{t^2}{f_b}\right)$$

The wavelet energy at each time step quantifies signal activity:

$$E_t = |W_t|^2$$

I engineered this as a rolling window feature—extracting the right-edge coefficient to avoid any lookahead bias. The result? A clean, forward-looking measure of market turbulence.

---

## The Trading Strategy

Knowledge without action is worthless. I translated my regime detection into a systematic trading strategy with clear rules:

### Regime-Aware Decision Matrix

| Current Regime | Signal | Position | Action |
|---------------|--------|----------|--------|
| **BULL** | BUY | Flat | ✅ ENTER LONG |
| **BULL** | SELL | Long | ✅ EXIT |
| **BEAR** | BUY | Flat | ❌ BLOCKED |
| **BEAR** | SELL | Long | ✅ EXIT (graceful) |

The key insight: **block new entries in bear regimes**, but allow graceful exits to avoid forced liquidation whipsaws.

---

## Results: Testing Against the Financial Crisis

I trained my model on SPY data from 2000-2007, then tested it on the crucible of 2008—the global financial crisis. The ultimate stress test.

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/backtest_plot.png" title="Backtest Performance" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    HMM Strategy (blue) vs Buy-and-Hold (orange) during the 2008 financial crisis. The shaded regions show detected market regimes.
</div>

### What the Chart Shows:
- **Blue Line**: My HMM strategy's portfolio value
- **Orange Line**: Passive buy-and-hold benchmark
- **Shaded Regions**: Detected bull (green) vs bear (red) regimes
- **Markers**: Entry and exit points based on regime changes

The strategy correctly identified the regime shift and reduced exposure during the worst of the crisis.

---

## State Analysis: What My Model Learned

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/state_stats.png" title="HMM State Statistics" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    Statistical characteristics of the learned hidden states—showing return distributions, state frequencies, and transition probabilities.
</div>

### Learned State Characteristics:

| State | Mean Return | Volatility | Interpretation |
|-------|------------|------------|----------------|
| **State 0 (BULL)** | Positive $$\mu_r^+$$ | Lower $$\sigma$$ | Calm uptrend |
| **State 1 (BEAR)** | Negative $$\mu_r^-$$ | Higher $$\sigma$$ | Volatile decline |

The model autonomously discovered the classic bull/bear dichotomy without any labeled training data.

---

## Technical Implementation

I built this entire system in Python, implementing:

- **Forward Algorithm** — $$O(N^2T)$$ dynamic programming for likelihood computation
- **Backward Algorithm** — Complementary pass for state occupancy probabilities  
- **Viterbi Decoding** — Maximum likelihood state sequence extraction
- **Baum-Welch (EM)** — Iterative parameter estimation until convergence
- **Wavelet Feature Extraction** — Rolling CWT with Complex Morlet kernel
- **Walk-Forward Backtesting** — Strict train/test separation to avoid lookahead bias

### Project Structure:

```
HMM_Multi/
├── 1_download_data.py    # Fetch SPY historical data
├── 3_train_hmm.py        # Train HMM with Baum-Welch
├── 4_backtest.py         # Regime-aware backtesting
├── 5_visualize.py        # Generate analysis plots
├── config.py             # Centralized parameters
├── wavelet_features.py   # CWT feature extraction
└── run_pipeline.py       # End-to-end execution
```

---

## Explore the Full Implementation

This project demonstrates my understanding of:
- **Probabilistic graphical models** and latent variable inference
- **Time-frequency analysis** via wavelet transforms
- **Systematic trading** with risk-managed position sizing
- **Scientific Python stack** (NumPy, pandas, hmmlearn, PyWavelets)
- **Quantitative finance** concepts (regime detection, backtesting, alpha generation)

Dive into the complete codebase with detailed mathematical documentation:

**[View Full Project on GitHub](https://github.com/Kunle-xy/OguntoyeProjects/tree/main/Hidden%20Markov%20Model/HMM_Multi)**

### Quick Start:
```bash
git clone https://github.com/Kunle-xy/OguntoyeProjects.git
cd "Hidden Markov Model/HMM_Multi"
pip install -r requirements.txt
python run_pipeline.py
```

The README includes comprehensive coverage of:
- Complete mathematical derivations for all HMM algorithms
- Wavelet transform theory and implementation details
- State-observation diagrams and architecture visualizations
- Configuration reference for customizing parameters
- Strategy execution pipeline with risk management

---

## Technical Skills Demonstrated

- Hidden Markov Models and Expectation-Maximization
- Wavelet transforms for time-frequency feature extraction
- Gaussian mixture modeling and multivariate statistics
- Quantitative backtesting with walk-forward methodology
- Python scientific computing (NumPy, pandas, hmmlearn, PyWavelets)
- Financial time series analysis and regime detection
- Risk management and systematic trading strategies
