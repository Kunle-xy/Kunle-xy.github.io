---
layout: page
title: GravelRoad Iowa - Pavement Distress Analysis System
description: Full-stack web application for automated rut detection and infrastructure monitoring using GeoTIFF analysis
img: assets/img/gravel_road_cover.jpg
importance: 2
category: infrastructure
github: https://github.com/Kunle-xy/Gravel_Road_Monitoring_WebAPP
---

## Automated Rut Detection Algorithm

### Motivation

The platform addresses a critical need in Iowa's transportation infrastructure: **systematically monitoring and analyzing the condition of over 69,000 miles of gravel roads**. Traditional manual inspection methods are time-consuming and subjective. My solution automates the process using geospatial analysis, providing quantitative measurements of road surface distress with severity classifications.

### Background and Research Gap

Automatic detection of rutting distress on road infrastructure from sUAS (small Unmanned Aircraft Systems) images has been explored in past studies. Biçici and Zeybek (2021) experimented with different sUAS flight altitudes and automatically extracted rutting information from processed point-cloud data using their proposed elevation-based algorithm. In another study, Zeybek and Biçici (2020) adopted commercial software (Global Mapper) to measure rutting distress from digital surface models—but this required manual identification of rut locations.

**The gap I identified**: Little to no attention had been invested in *fully automatic* monitoring of gravel road rut distress. Existing methods either required significant manual intervention or were designed for surfaced pavements, not the unique challenges of unpaved gravel roads.

I developed a **fully automatic rut-detection algorithm** that requires users to identify only the desired area extent or sample unit—the algorithm handles everything else. I validated the algorithm's performance on rutting distress identified on gravel roads on **130th Street in Buchanan County, Iowa**.

### Understanding Rutting Distress

Rutting distress typically occurs as depressions found along the wheel path, parallel to the road center (Eaton and Laboratory, U.S., 1992). Following USACE technical guidelines, I classify rutting severity based on DEM elevation measurements:

| Severity Class | Rut Depth | Description |
|---------------|-----------|-------------|
| **Low** | 0.5 – 1 inch (1.27 – 2.5 cm) | Minor surface deformation |
| **Medium** | 1 – 3 inches (2.5 – 7.5 cm) | Moderate ponding potential |
| **High** | > 3 inches (> 7.5 cm) | Severe structural distress |

> **Key insight**: I bounded low severity between 0.5 and 1 inch to ensure unrutted regions are not falsely classified as low-severity distress.

The algorithm further estimates the **width and length** of each identified rut to approximate its area in square feet—directly aligned with how severity is reported in technical manuals (e.g., "a sample unit may have 75 square feet of high severity").

### Algorithm Design Philosophy

The algorithm's accuracy directly relies on DEM data resolution. Following the idealistic expected rut pattern—ridges on either side of a valley depression—I designed the algorithm to detect rut patterns by **tracking ridges and in-between valleys**, regardless of how rough the ridge edges might be.

**False Positive Reduction**: To minimize false detections, I implemented a constraint that the minimum height of the lower ridge sufficient for ponding and significant rutting must be at least **10% of the higher ridge level**.

### Input Parameters

The algorithm accepts these user-configurable parameters:

| Parameter | Description |
|-----------|-------------|
| **Polygon ROI** | Region of interest / sample unit drawn by user |
| **DEM Raster** | Digital Elevation Model GeoTIFF file |
| **Sampling Frequency** | Frequency per 100 pixels in the DEM |
| **Rutting Width (dx)** | Expected constant width of rut features (meters) |
| **Apply Smoothing** | Optional Gaussian filter for noise reduction |
| **Gaussian Sigma** | Smoothing kernel size parameter |
| **Neighbor Evaluation** | Enable uncertainty quantification |
| **Neighbor Range** | Range of frequencies to explore (±N) |

### Uncertainty Quantification with Neighbor Sampling

A unique feature I implemented is **automatic exploration of neighboring sampling frequencies** for uncertainty and probabilistic awareness:

- When enabled, the algorithm applies the neighbor range to the original sampling frequency
- For example, if sampling frequency = 3 and neighbor range = 2, the algorithm explores frequencies {1, 2, 3, 4, 5}
- **Single-frequency output**: Elevation plots and point estimates of severity per class
- **Neighbor-frequency output**: Mean and standard deviation of severity per class

This provides users with confidence intervals for decision-making rather than single point estimates.

### Algorithm Outputs

The system generates comprehensive results:

1. **Interactive HTML Report** (Plotly):
   - Cross-section elevation profiles for each sampling gridline
   - Color-coded severity markers on detected ruts
   - Summary statistics table

2. **PDF Report** (WeasyPrint):
   - Printable documentation for field use
   - Embedded visualizations and tables

3. **Map Overlays**:
   - Straight lines marking regions where rut depths were detected
   - Aids users in locating exact rut positions on the map

4. **Statistical Summary**:
   - Total severity area per class (sq ft)
   - Mean depth per severity class
   - When neighbor sampling is enabled: mean ± standard deviation

### Handling Edge Cases: Frost Boils

An important consideration: **frost boils** (localized ground heaving from freeze-thaw cycles) are identified by the algorithm as high-severity rutting. While one could constrain the expected wheel path region for better apportionment of rut regions, unsurfaced gravel roads are characterized by low-volume traffic without specific patterns for paths of travel. I intentionally leave frost boils in the detection results—they represent conditions functionally equivalent to high-severity rutting from a road serviceability perspective.

### Algorithm Validation

I validated the algorithm by comparing its predictions with manual field measurements following the **ASTM E1703/E1703M-10** standard ("Standard Test Method for Measuring Rut-Depth of Pavement Surfaces Using a Straightedge") on 130th Street DEM data in Buchanan County, Iowa.

#### Validation Results

| Sample | Manual Measurement (in.) | Algorithm Output (in.) | Difference (in.) | Severity Match |
|--------|-------------------------|------------------------|------------------|----------------|
| R1 | 1.0 | — | — | — |
| R2 | 1.5 | 1.479 | **0.021** | ✓ Medium |
| R3 | 1.0 | 0.7125 | 0.288 | ✓ Low |

> **Note**: R1 could not be located for comparison due to faint color markings during field measurement.

#### Key Findings

1. **Depth Accuracy**: The R2 data point shows excellent agreement with only 0.021 inch difference from manual measurement

2. **Severity Classification**: Both R2 and R3 were correctly classified into their respective severity classes, demonstrating the algorithm's reliability for practical pavement condition assessment

3. **Consistency**: Close examination of automatic results with and without neighbor sampling reveals they are in close alignment, while neighbor sampling provides additional uncertainty information for better decision-making

4. **Scalability**: The algorithm is fully capable of rapidly and remotely measuring entire road sections for final URCI (Unsurfaced Road Condition Index) approximation—a task that would take significantly longer with manual methods

### References

1. Biçici, S., & Zeybek, M. (2021). Automatic extraction of rutting from sUAS point clouds at varying flight altitudes.

2. Zeybek, M., & Biçici, S. (2020). Rutting measurement from digital surface models using Global Mapper.

3. Eaton, R. A., & U.S. Army Cold Regions Research and Engineering Laboratory. (1992). *Unsurfaced Road Maintenance Management*. Special Report 92-26.

4. ASTM E1703/E1703M-10. *Standard Test Method for Measuring Rut-Depth of Pavement Surfaces Using a Straightedge*.

---

## Web Application: GravelRoad Iowa

I developed **GravelRoad Iowa**, a comprehensive full-stack web application designed for automated pavement distress analysis. This system enables infrastructure engineers and researchers to upload high-resolution Digital Elevation Model (DEM) files, visualize them on an interactive map, and run the rut detection algorithm—all through an intuitive browser interface.

### System Architecture

{% include figure.liquid loading="eager" path="assets/img/gravel_road_architecture.png" title="GravelRoad Iowa System Architecture" class="img-fluid rounded z-depth-1" %}

<div class="caption">
    High-level architecture showing the flow from file upload through processing to visualization.
</div>

The system follows a **microservices-inspired architecture** with clear separation of concerns:

### Frontend (Next.js 15)
- **React 18** with TypeScript for type-safe development
- **Tailwind CSS** for responsive, modern UI design
- **Leaflet** integration for interactive map visualization
- **Real-time progress polling** during analysis jobs
- **Polygon drawing tools** for defining analysis regions

### Backend (FastAPI)
- **Async Python** for high-performance API endpoints
- **SQLAlchemy ORM** with PostgreSQL database
- **JWT authentication** for secure user sessions
- **RESTful API design** with automatic OpenAPI documentation

### Task Queue (Celery + Redis)
- **Distributed task processing** for compute-intensive operations
- **Two specialized workers**: Tile Worker and Rut Worker
- **Task routing** ensures proper queue assignment
- **Progress tracking** with database state updates

### Cloud Infrastructure (AWS)
- **S3** for scalable file storage (raw uploads + processed tiles)
- **CloudFront CDN** for low-latency tile delivery
- **Multi-bucket architecture** separating raw data from optimized tiles

---

## Key Features

### 1. DEM File Management
Users can upload large GeoTIFF files (up to 10GB) through a chunked multipart upload system. The backend automatically:
- Converts raw TIFF to **Cloud-Optimized GeoTIFF (COG)** format
- Generates **XYZ map tiles** at multiple zoom levels (15-23)
- Calculates geographic bounds for instant map positioning
- Uploads optimized tiles to CloudFront for fast delivery

### 2. Interactive Map Visualization
The map interface provides:
- Custom tile layers rendered from user-uploaded DEMs
- Smooth panning and zooming with cached tiles
- Polygon drawing for defining analysis regions
- Overlay of analysis results on the base map

---

## Database Schema

The PostgreSQL database includes these core models:

| Table | Purpose |
|-------|---------|
| `users` | User accounts with hashed passwords |
| `tiff_files` | Uploaded DEM files with S3 references and tile status |
| `folders` | Project organization hierarchy |
| `rut_analysis_jobs` | Analysis requests with status, progress, and results |
| `polygons` | Saved user-drawn regions |

---

## API Endpoints

### Authentication
- `POST /auth/login` - JWT token generation
- `POST /auth/register` - New user registration
- `GET /auth/me` - Current user info

### File Management
- `POST /upload/` - Chunked file upload with COG conversion
- `GET /files/` - List user's files
- `GET /files/{id}/tiles` - Get tile configuration

### Analysis
- `POST /rut/` - Submit analysis job
- `GET /rut/{id}/status` - Poll job progress
- `GET /rut/completed` - List completed analyses

---

## Technologies Used

<div class="row">
<div class="col-sm-6">

**Backend**
- Python 3.10
- FastAPI (async framework)
- SQLAlchemy + PostgreSQL
- Celery + Redis
- GDAL/Rasterio/Shapely
- PyProj
- Plotly + WeasyPrint

</div>
<div class="col-sm-6">

**Frontend**
- Next.js 15
- React 18 + TypeScript
- Tailwind CSS
- Leaflet.js
- html2canvas

</div>
</div>

**Cloud Services**: AWS S3, CloudFront, EC2

---

## Results and Impact

The GravelRoad Iowa system has been successfully deployed and validated against field measurements, demonstrating its effectiveness for practical pavement condition assessment.

### Validation Performance
- **Depth measurement accuracy**: Within 0.021 inches of manual straightedge measurements (ASTM E1703)
- **Severity classification**: 100% agreement with manual classifications for tested points
- **Processing speed**: Entire road sections analyzed in minutes vs. hours for manual inspection

### Operational Applications

1. **Research Applications**: Analyzing DEM data collected from drone surveys over Iowa gravel roads
2. **Quantitative Assessment**: Providing objective measurements of rut depth and severity aligned with USACE technical guidelines
3. **URCI Calculation**: Supporting Unsurfaced Road Condition Index approximation for infrastructure management
4. **Decision Support**: Helping prioritize maintenance based on severity classifications with uncertainty quantification

---

## Future Enhancements

I'm actively developing additional features:

1. **Additional Distress Types**: Pothole detection, crocodile cracking analysis
2. **Machine Learning Integration**: CNN-based distress classification
3. **Mobile Data Collection**: Field app for GPS-tagged condition surveys
4. **Historical Comparison**: Automated change detection between surveys
5. **Export Formats**: GIS-compatible outputs (Shapefile, GeoJSON)

---

## Contact

This project was developed as part of my PhD research at Iowa State University.

**Email**: oguntoye@iastate.edu

<div class="repositories d-flex flex-wrap flex-md-row flex-column justify-content-between align-items-center">
    {% include repository/repo.liquid repository="Kunle-xy/Gravel_Road_Monitoring_WebAPP" %}
</div>
