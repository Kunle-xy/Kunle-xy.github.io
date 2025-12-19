---
layout: page
title: GravelRoad Iowa - Pavement Distress Analysis System
description: Full-stack web application for automated rut detection and infrastructure monitoring using GeoTIFF analysis
img: assets/img/gravel_road_cover.jpg
importance: 2
category: work
github: https://github.com/Kunle-xy/Gravel_Road_Monitoring_WebAPP
---

## Overview

I developed **GravelRoad Iowa**, a comprehensive full-stack web application designed for automated pavement distress analysis. This system enables infrastructure engineers and researchers to upload high-resolution Digital Elevation Model (DEM) files, visualize them on an interactive map, and run sophisticated rut detection algorithms—all through an intuitive browser interface.

The platform addresses a critical need in Iowa's transportation infrastructure: **systematically monitoring and analyzing the condition of over 69,000 miles of gravel roads**. Traditional manual inspection methods are time-consuming and subjective. My solution automates the process using geospatial analysis, providing quantitative measurements of road surface distress with severity classifications.

---

## System Architecture

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

### 3. Automated Rut Detection Algorithm

The core analysis engine implements a **cross-sectional profiling algorithm**:

```python
# Simplified rut detection logic
def analyze_ruts_in_polygon(elevation_data, metadata, polygon, dy_freq, dx):
    """
    Analyze ruts by sampling perpendicular cross-sections
    
    Parameters:
    - dy_freq: Sampling frequency per 100 pixels
    - dx: Expected rutting width in meters
    - gaussian_sigma: Smoothing parameter
    - neighbor_eval: Enable neighbor comparison
    """
    # Extract transects perpendicular to road centerline
    # Apply Gaussian smoothing to reduce noise
    # Detect local minima indicating rut depressions
    # Classify severity: Low (<25mm), Medium (25-50mm), High (>50mm)
```

**Key Algorithm Parameters:**
- **Sampling Frequency**: Controls density of cross-sectional analysis
- **Rutting Width (dx)**: Expected width of rut depressions in meters
- **Gaussian Smoothing**: Noise reduction with configurable sigma
- **Neighbor Evaluation**: Compare depths across adjacent transects

### 4. Result Generation

Analysis outputs include:
- **Interactive HTML plots** (Plotly) showing detected ruts with severity coloring
- **PDF reports** (WeasyPrint) for documentation and sharing
- **JSON results** with quantitative statistics
- **Screenshot capture** of the analysis region for reports

---

## Technical Deep Dive

### Cloud-Optimized GeoTIFF (COG) Conversion

Traditional GeoTIFF files require downloading the entire file to read any portion. COGs enable **HTTP range requests**, allowing the system to fetch only the tiles needed for the current viewport:

```python
def _to_cog(src_path: str, dst_path: str) -> None:
    """Convert TIFF to Cloud-Optimized GeoTIFF with overviews"""
    cmd = [
        "gdal_translate",
        "-of", "COG",
        "-co", "COMPRESS=DEFLATE",
        "-co", "PREDICTOR=2",
        "-co", "BLOCKSIZE=512",
        "-co", "OVERVIEWS=IGNORE_EXISTING",
        src_path, dst_path
    ]
    subprocess.run(cmd, check=True)
    
    # Build overviews for faster zoomed-out rendering
    subprocess.run([
        "gdaladdo", "-r", "average",
        "--config", "COMPRESS_OVERVIEW", "DEFLATE",
        dst_path, "2", "4", "8", "16", "32", "64"
    ])
```

### CRS Transformation Pipeline

GeoTIFFs may arrive in various coordinate reference systems. The system automatically transforms coordinates:

```python
from pyproj import Transformer
from shapely.ops import transform

def transform_polygon_to_tiff_crs(polygon_geojson, tiff_crs):
    """Transform user-drawn polygon to match TIFF coordinate system"""
    transformer = Transformer.from_crs("EPSG:4326", tiff_crs, always_xy=True)
    return transform(transformer.transform, shape(polygon_geojson))
```

### Celery Task Routing

Different tasks have different resource requirements. I implemented queue-based routing:

```python
celery_app.conf.update(
    task_routes={
        "app.workers.tile_worker.generate_tiles_task": {"queue": "tiles"},
        "app.workers.rut_worker.analyze_ruts_task": {"queue": "celery"},
    }
)
```

This allows scaling tile generation workers independently from analysis workers.

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

## Deployment Architecture

The production system runs on an **Iowa State University server**:

```
┌─────────────────────────────────────────────────────────┐
│                    Ubuntu Server                         │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │   Nginx     │  │   FastAPI   │  │   Next.js       │ │
│  │  (Reverse   │──│   :8000     │  │   :3000         │ │
│  │   Proxy)    │  └─────────────┘  └─────────────────┘ │
│  └─────────────┘                                        │
│           │                                             │
│  ┌────────┴────────┐                                   │
│  │     Redis       │                                   │
│  │   (Broker)      │                                   │
│  └────────┬────────┘                                   │
│           │                                             │
│  ┌────────┴─────────────────────────┐                  │
│  │         Celery Workers           │                  │
│  │  ┌─────────────┐ ┌─────────────┐│                  │
│  │  │ Tile Worker │ │ Rut Worker  ││                  │
│  │  │ (queue:tiles)│ │(queue:celery││                  │
│  │  └─────────────┘ └─────────────┘│                  │
│  └──────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
              ┌─────────────────┐
              │    AWS Cloud    │
              │  ┌───────────┐  │
              │  │    S3     │  │
              │  │ (Storage) │  │
              │  └─────┬─────┘  │
              │        │        │
              │  ┌─────▼─────┐  │
              │  │CloudFront │  │
              │  │  (CDN)    │  │
              │  └───────────┘  │
              └─────────────────┘
```

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

The GravelRoad Iowa system has been successfully deployed and is actively used for:

1. **Research Applications**: Analyzing DEM data collected from drone surveys over Iowa gravel roads
2. **Quantitative Assessment**: Providing objective measurements of rut depth and severity
3. **Temporal Analysis**: Comparing road conditions over time to assess deterioration rates
4. **Decision Support**: Helping prioritize maintenance based on severity classifications

### Sample Analysis Output

The rut detection algorithm produces detailed statistics:
- **Total ruts detected** in the analysis region
- **Severity breakdown**: Low, Medium, High severity counts
- **Total affected area** in square feet
- **Interactive visualization** with rut locations highlighted

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
