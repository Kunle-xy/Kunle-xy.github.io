---
layout: page
title: Underground Utility Mapping
description: AI-Powered Probabilistic Framework for Automated Subsurface Infrastructure Detection Using Fuzzy Logic and Computer Vision
img: assets/img/utility_map.jpg
importance: 10
category: research
related_publications: false
---

## Overview

Accidental strikes of underground utilities during construction and excavation activities remain a critical safety and economic concern. This project presents a novel **probabilistic framework** that fuses AI-generated utility maps with existing as-built records to create confidence-aware underground infrastructure maps. The approach addresses the fundamental challenges of data interpretation costs, large-scale mapping, and the inherent inaccuracies in utility records.

<div class="row justify-content-sm-center">
    <div class="col-sm-10 mt-3 mt-md-0">
        {% include figure.liquid path="assets/img/utility_mapping_workflow.png" title="AI-Generated Utility Mapping Framework" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    Framework for probabilistic underground utility mapping using AI-generated initial maps and data fusion.
</div>

---

## Motivation & Background

### The Problem

Underground utility infrastructure represents a hidden and critical component of modern society. However:

- **Utility as-built plans are notoriously inaccurate** and often become outdated as infrastructure changes
- **Accidental utility strikes** cause serious injuries, fatalities, and substantial economic losses
- **Traditional investigation methods** (GPR, electromagnetic surveys) are expensive and labor-intensive
- **The One-Call system** often yields incomplete information, excluding service lines and out-of-service utilities

### Our Solution

This research introduces a **probabilistic data fusion framework** that:

1. **Automatically generates initial utility maps** by detecting aboveground appurtenances (manholes, meters, valve covers) and applying hierarchical inference rules
2. **Fuses AI-generated maps with as-built records** to create probabilistic utility maps with confidence bands
3. **Identifies low-confidence zones** for targeted ground-truth investigations
4. **Dynamically updates** as new information becomes available

---

## Methodology

### AI-Generated Utility Map Creation

The framework employs **fuzzy logic approximate reasoning** to infer underground utility locations from visual observations of aboveground features:

<div class="row">
    <div class="col-sm-6">
        <h4>Utility Classes</h4>
        <ul>
            <li>Water</li>
            <li>Electric</li>
            <li>Sanitary</li>
            <li>Stormwater</li>
            <li>Gas</li>
            <li>Telecom</li>
        </ul>
    </div>
    <div class="col-sm-6">
        <h4>Detected Appurtenances</h4>
        <ul>
            <li>Gas Meters, Water Meters</li>
            <li>Valve Covers, Fire Hydrants</li>
            <li>Storm Traps/Outfalls, Cleanouts</li>
            <li>Electric Meters, Transformers</li>
            <li>Control Boxes, Manholes</li>
            <li>Pedestals, Light Poles</li>
        </ul>
    </div>
</div>

### Hierarchical Connection Rules

Utility connections are inferred using deterministic logic rules organized by:

| Rule Category | Description |
|:-------------|:------------|
| **Proximity Rules** | Connect close appurtenances of similar utility class |
| **Roadway Right-of-Way** | Establish utility connection orientation |
| **Downstream Endpoints** | Determine service line direction from main utility |

### Probabilistic Data Fusion

The fusion process combines multiple data sources using probability distributions:

$$P(utility|x,y) = \sum_{i=1}^{n} w_i \cdot N(\mu_i, \sigma_i^2)$$

Where:
- $$w_i$$ = weight assigned to data source $$i$$ (expertise, recency, accuracy)
- $$\mu_i$$ = utility location from source $$i$$
- $$\sigma_i$$ = standard deviation reflecting confidence level

### Confidence Factors

| Factor | Impact on Confidence |
|:-------|:--------------------|
| **Data Source Age** | Older sources → Lower weight |
| **Ground-Truth Data** | Excavation/GPR verified → High weight |
| **As-Built vs As-Planned** | As-built more reliable |
| **Sensor Limitations** | GPR/EM interference → Higher uncertainty |
| **Construction Variance** | Non-compliance → Increased σ |

---

## Web Application: U-Map

A **Django-based web application** was developed to operationalize the framework, enabling users to interactively map and manage underground utilities.

### Key Features

<div class="row">
    <div class="col-sm-4 mt-3 mt-md-0">
        <div class="card h-100">
            <div class="card-body">
                <h5 class="card-title">🗺️ Interactive Mapping</h5>
                <p class="card-text">Google Maps integration with region-of-interest selection and asset placement on satellite imagery</p>
            </div>
        </div>
    </div>
    <div class="col-sm-4 mt-3 mt-md-0">
        <div class="card h-100">
            <div class="card-body">
                <h5 class="card-title">📍 Asset Detection</h5>
                <p class="card-text">Mark and catalog aboveground appurtenances with utility class classification</p>
            </div>
        </div>
    </div>
    <div class="col-sm-4 mt-3 mt-md-0">
        <div class="card h-100">
            <div class="card-body">
                <h5 class="card-title">🤖 AI Map Generation</h5>
                <p class="card-text">Apply hierarchical rules to automatically generate utility connection maps</p>
            </div>
        </div>
    </div>
</div>

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Templates)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Home    │  │  Index   │  │  Asset   │  │   Map    │    │
│  │  Page    │  │  (ROI)   │  │   Form   │  │  Display │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Django Backend (Views)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Auth    │  │ Database │  │  Delete  │  │ Generate │    │
│  │  Views   │  │  CRUD    │  │  Assets  │  │  AI Map  │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Models                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Database   │  │    Class     │  │     Rank     │      │
│  │  (Assets)    │  │  (Utility)   │  │   (Rules)    │      │
│  │ - field      │  │ - field      │  │ - field FK   │      │
│  │ - asset      │  │              │  │ - rank       │      │
│  │ - latitude   │  │              │  │ - asset_1    │      │
│  │ - longitude  │  │              │  │ - asset_2    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Technologies

<div class="row">
    <div class="col-sm-4">
        <h5>Backend</h5>
        <ul>
            <li>Django 3.1</li>
            <li>Python 3.x</li>
            <li>SQLite Database</li>
        </ul>
    </div>
    <div class="col-sm-4">
        <h5>Frontend</h5>
        <ul>
            <li>Tailwind CSS</li>
            <li>Leaflet.js / Google Maps API</li>
            <li>JavaScript</li>
        </ul>
    </div>
    <div class="col-sm-4">
        <h5>Mapping</h5>
        <ul>
            <li>Google Maps JavaScript API</li>
            <li>Mapbox Integration</li>
            <li>Custom Icon Assets</li>
        </ul>
    </div>
</div>

---

## Demonstration Video

Watch the presentation explaining the web application workflow and system architecture:

<div class="row justify-content-sm-center">
    <div class="col-sm-10 mt-3 mt-md-0">
        <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
            <iframe 
                src="https://www.youtube.com/embed/gYqRX-hTcEA" 
                title="Underground Utility Mapping Web Application Flowchart"
                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>
        </div>
    </div>
</div>
<div class="caption">
    Video presentation of the U-Map web application flowchart and system architecture.
</div>

---

## Case Study: Ames, Iowa

The framework was validated using field data from **Iowa State University's Research Park**:

- Site selected for low traffic volume and availability of utility as-built maps
- As-built map contained water, storm sewer, and sanitary utilities
- AI-generated map created from manually surveyed aboveground appurtenances

### Results

The probabilistic fusion revealed:

1. **High-confidence zones** where AI-generated and as-built maps aligned
2. **Low-confidence areas** requiring targeted GPR investigation
3. **Significant cost savings** by focusing detailed investigations on uncertain regions

---

## Impact & Applications

| Application | Benefit |
|:------------|:--------|
| **Construction Safety** | Reduce accidental utility strikes during excavation |
| **Infrastructure Planning** | Rapid preliminary utility mapping for large projects |
| **Asset Management** | Dynamic updating of utility records |
| **Cost Reduction** | Focus expensive investigations on low-confidence zones |

---

## Publication

This research was published in **Sensors** (MDPI):

> Oguntoye, K.S., Laflamme, S., Sturgill, R., Martinez, D.A.S., Eisenmann, D.J., & Kimber, A. (2024). **Probabilistic Method to Fuse Artificial Intelligence-Generated Underground Utility Mapping**. *Sensors*, 24(11), 3559. [https://doi.org/10.3390/s24113559](https://doi.org/10.3390/s24113559)

**Funding:** Iowa Energy Center under Grant #21-IEC-006

---

## Source Code

<div class="repositories d-flex flex-wrap flex-md-row flex-column justify-content-between align-items-center">
    <a href="https://github.com/Kunle-xy/iec_project" target="_blank">
        <img src="https://gh-card.dev/repos/Kunle-xy/iec_project.svg" alt="GitHub Repository">
    </a>
</div>

---

## Future Work

- **Automated appurtenance detection** using computer vision (YOLO, CNN)
- **Drone-based data collection** for rapid surveying
- **3D probabilistic mapping** including utility depth estimation
- **Cross-utility correlation** integration
- **Machine learning weight optimization** from historical data

---

## Contact

For questions about this research or collaboration opportunities:
- **Email:** [kunle@iastate.edu](mailto:kunle@iastate.edu)
- **GitHub:** [Kunle-xy](https://github.com/Kunle-xy)
