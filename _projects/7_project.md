---
layout: page
title: "Handling Messy Iowa Paved Road Big Data"
description: Data quality control and segmentation for infrastructure datasets
img: assets/img/12.jpg
importance: 7
category: infrastructure
github: https://github.com/Kunle-xy/ipat-segmentation-APP
---

## The Problem: Messy Pavement Data Across Years

State Departments of Transportation collect pavement condition data annually to monitor road health and plan maintenance. The Iowa DOT maintains extensive databases tracking metrics like the **International Roughness Index (IRI)**, surface type, pavement width, and distress indicators across thousands of miles of roadway. However, a critical challenge emerges when attempting to use this data for predictive analytics: **pavement sections are inconsistent across different years**.

### Why This Matters

Consider a single route surveyed over multiple years:

| Year | Route Segment | FROM_MEASURE | TO_MEASURE | IRI |
|------|---------------|--------------|------------|-----|
| 2020 | US-30 | 0.0 | 2.5 | 85 |
| 2021 | US-30 | 0.3 | 2.8 | 92 |
| 2022 | US-30 | 0.0 | 2.3 | 98 |

The same physical roadway is measured with **different start/end points each year**. This inconsistency creates several problems:

1. **No Direct Temporal Comparison** - You can't track how a specific road segment deteriorates over time if the segment boundaries keep changing
2. **ML Model Failure** - Machine learning models require consistent feature spaces; shifting segment definitions break the fundamental assumption that observations represent the same entity
3. **Prediction Impossibility** - How do you predict 2023 IRI values when you don't know which 2022 segment corresponds to which 2023 segment?
4. **Data Quality Issues** - Null values, coordinate errors, and measurement range anomalies compound the problem

### Real-World Impact

Without standardized segmentation, infrastructure agencies face:
- **Inaccurate deterioration modeling** - Can't distinguish true pavement degradation from measurement artifacts
- **Wasted maintenance budgets** - Poor predictions lead to reactive rather than proactive maintenance
- **Safety risks** - Inability to forecast critical distress prevents timely intervention

---

## The Solution: Dynamic Temporal Segmentation

I developed **IPAT Segmentation Analysis**, a full-stack web application that solves this problem through intelligent temporal alignment and dynamic segmentation. The system standardizes pavement sections across multiple years by:

1. **Finding Temporal Overlap** - Identifies the measurement range that exists consistently across all available years for each route
2. **Creating Uniform Segments** - Divides this overlap into configurable segments (10-100) with fixed boundaries
3. **Assigning Distress Records** - Maps each year's raw measurements to the nearest standardized segment
4. **Validating Completeness** - Ensures every segment has data for all years (no missing gaps)

### The Result

<div class="row justify-content-sm-center">
    <div class="col-sm-10 mt-3 mt-md-0">
        {% include figure.liquid path="assets/img/segmentation.png" title="Pavement Segmentation Process" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption">
    Visual representation of the temporal segmentation process showing how inconsistent pavement sections across years are standardized into uniform segments.
</div>

After processing, the same route example becomes:

| Route | Segment | FROM_MEASURE | TO_MEASURE | IRI_2020 | IRI_2021 | IRI_2022 |
|-------|---------|--------------|------------|----------|----------|----------|
| US-30 | 1 | 0.3 | 0.73 | 84 | 91 | 97 |
| US-30 | 2 | 0.73 | 1.16 | 86 | 92 | 99 |
| US-30 | 3 | 1.16 | 1.59 | 85 | 93 | 98 |
| US-30 | 4 | 1.59 | 2.02 | 87 | 94 | 100 |
| US-30 | 5 | 2.02 | 2.3 | 88 | 95 | 101 |

Now each segment has:
- **Fixed geographic boundaries** that don't change across years
- **Complete temporal coverage** - IRI values for every year
- **ML-ready format** - Consistent feature space for time-series forecasting
- **Traceable deterioration patterns** - Clear year-over-year progression

---

## System Architecture

The application employs a **two-tier cloud-native architecture** optimized for big data processing:

```
┌─────────────────────────────────────────────────────────────┐
│                    FastAPI Backend (Python)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Upload     │  │  Segmentation │  │   Results    │       │
│  │   Endpoint   │  │   Processor   │  │   Endpoint   │       │
│  │  (POST)      │  │   (POST)      │  │   (GET)      │       │
│  └──────┬───────┘  └──────┬────────┘  └──────┬───────┘       │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│                    ┌───────▼────────┐                        │
│                    │  BigQuery      │                        │
│                    │  Client SDK    │                        │
│                    └────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                             │
                    BigQuery SQL API
                             │
┌─────────────────────────────────────────────────────────────┐
│               Google Cloud BigQuery (Data Layer)             │
│                                                              │
│  County-Specific Datasets:                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ipat_[COUNTY_NAME]                                  │   │
│  │  ├── raw_distress_2020                               │   │
│  │  ├── raw_distress_2021                               │   │
│  │  ├── raw_distress_2022                               │   │
│  │  ├── all_years (UNION view)                          │   │
│  │  ├── valid_routes (consecutive year filter)          │   │
│  │  ├── distress_segmented (segment assignment)         │   │
│  │  ├── distress_segmented_complete (completeness)      │   │
│  │  └── distress_final (pivoted output)                 │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Data Processing Pipeline

The segmentation engine executes entirely within BigQuery using SQL-based transformations:

**Stage 1: Upload & Ingestion**
- Users upload Excel files via multipart form data
- Backend extracts year from filename (e.g., `pavement_2021.xlsx` → 2021)
- Pandas validates schema and corrects anomalies (swaps FROM/TO if inverted)
- Data streams directly to `raw_distress_[YEAR]` table via BytesIO

**Stage 2: Temporal Alignment**
```sql
-- Identify routes with consecutive year coverage
CREATE TABLE valid_routes AS
SELECT ROUTE_NAME,
       MIN(FROM_MEASURE) as overlap_start,
       MAX(TO_MEASURE) as overlap_end
FROM all_years
WHERE ROUTE_NAME IN (
  SELECT ROUTE_NAME
  FROM all_years
  GROUP BY ROUTE_NAME
  HAVING COUNT(DISTINCT YEAR) >= 2
)
GROUP BY ROUTE_NAME;
```

**Stage 3: Dynamic Segmentation**
```sql
-- Generate N uniform segments per route
CREATE TABLE distress_segmented AS
SELECT
  ROUTE_NAME,
  YEAR,
  FLOOR((FROM_MEASURE - overlap_start) / segment_width) + 1 AS segment_id,
  AVG(IRI) as segment_iri,
  AVG(BEGIN_GLAT) as segment_lat,
  AVG(BEGIN_GLON) as segment_lon
FROM raw_distress
JOIN valid_routes USING (ROUTE_NAME)
GROUP BY ROUTE_NAME, YEAR, segment_id;
```

**Stage 4: Completeness Validation**
```sql
-- Retain only segments with all years present
CREATE TABLE distress_segmented_complete AS
SELECT *
FROM distress_segmented
WHERE (ROUTE_NAME, segment_id) IN (
  SELECT ROUTE_NAME, segment_id
  FROM distress_segmented
  GROUP BY ROUTE_NAME, segment_id
  HAVING COUNT(DISTINCT YEAR) = (SELECT COUNT(DISTINCT YEAR) FROM all_years)
);
```

**Stage 5: Pivot Transformation**
```sql
-- Generate final output with IRI as year columns
CREATE TABLE distress_final AS
SELECT
  ROUTE_NAME,
  segment_id,
  FROM_MEASURE,
  TO_MEASURE,
  MAX(IF(YEAR = 2020, IRI, NULL)) as IRI_2020,
  MAX(IF(YEAR = 2021, IRI, NULL)) as IRI_2021,
  MAX(IF(YEAR = 2022, IRI, NULL)) as IRI_2022
FROM distress_segmented_complete
GROUP BY ROUTE_NAME, segment_id, FROM_MEASURE, TO_MEASURE;
```

### Key Architectural Patterns

**1. Multi-Tenant Isolation**
Each county's data resides in separate BigQuery datasets (`ipat_story`, `ipat_polk`, etc.), enabling:
- Parallel processing without conflicts
- County-specific access control
- Independent data lifecycle management

**2. Vectorized Data Processing**
Pandas operations execute column-wise transformations across entire DataFrames:
```python
# Convert types vectorized (not row-by-row)
df['IRI'] = pd.to_numeric(df['IRI'], errors='coerce')

# Swap measures where inverted (vectorized boolean indexing)
mask = df['FROM_MEASURE'] > df['TO_MEASURE']
df.loc[mask, ['FROM_MEASURE', 'TO_MEASURE']] = \
    df.loc[mask, ['TO_MEASURE', 'FROM_MEASURE']].values
```

**3. Streaming I/O**
Direct memory streaming avoids disk writes:
```python
buffer = BytesIO()
df.to_parquet(buffer)
buffer.seek(0)
client.load_table_from_file(buffer, table_ref)
```

**4. Consistency Validation**
Multi-year coordinate/measure validation ensures data quality:
```python
std_lat = df.groupby('segment_id')['lat'].std()
std_lon = df.groupby('segment_id')['lon'].std()
std_from = df.groupby('segment_id')['FROM_MEASURE'].std()

# Filter segments with stable locations
valid_segments = (std_lat < 0.0001) & (std_lon < 0.0001) & (std_from < 0.01)
```

---

## Technologies Used

<div class="row">
<div class="col-sm-6">

**Backend**
- FastAPI (Python 3.11)
- Pandas (vectorized ops)
- Google Cloud SDK
- Uvicorn ASGI

</div>
<div class="col-sm-6">

**Data & Infrastructure**
- Google BigQuery
- Terraform (IaC)
- Docker
- Cloud Run

</div>
</div>

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/upload` | Upload Excel file with auto-year detection |
| `POST` | `/process?num_segments=20` | Execute segmentation pipeline |
| `GET` | `/results?limit=1000&offset=0` | Paginated results retrieval |
| `GET` | `/counties` | List available county datasets |
| `GET` | `/tables` | Enumerate BigQuery tables by county |
| `DELETE` | `/clear` | Remove county dataset entirely |
| `GET` | `/health` | Verify BigQuery connectivity |

---

## Impact & Applications

### Research Applications
- **Pavement Deterioration Modeling** - Time-series forecasting with LSTM/ARIMA models
- **Maintenance Optimization** - Predict when routes will exceed IRI thresholds
- **Climate Impact Studies** - Correlate freeze-thaw cycles with accelerated degradation

### Operational Benefits
1. **Cost Savings** - Proactive maintenance scheduling reduces emergency repairs
2. **Budget Justification** - Data-driven evidence for infrastructure funding requests
3. **Performance Tracking** - Quantify pavement lifespan improvements from new materials

### Technical Contributions
- **Temporal alignment algorithm** applicable to any time-series infrastructure dataset
- **County-based multi-tenant architecture** pattern for state DOT systems
- **BigQuery-native processing** demonstrating serverless data engineering

---

## Future Enhancements

1. **Automated Anomaly Detection** - Flag routes with suspicious year-over-year IRI jumps
2. **Machine Learning Integration** - Built-in deterioration forecasting models
3. **GIS Visualization** - Interactive map showing segmented routes with color-coded IRI trends
4. **Real-Time Streaming** - Process data as it arrives from survey vehicles
5. **Multi-State Support** - Extend beyond Iowa to other state DOT datasets

---

## Source Code

<div class="repositories d-flex flex-wrap flex-md-row flex-column justify-content-between align-items-center">
    <a href="https://github.com/Kunle-xy/ipat-segmentation-APP" target="_blank">
        <img src="https://gh-card.dev/repos/Kunle-xy/ipat-segmentation-APP.svg" alt="GitHub Repository">
    </a>
</div>

---

## Technical Skills Demonstrated

- Backend API development with FastAPI
- Big data processing with Google BigQuery
- Infrastructure as Code (Terraform)
- Data quality control and ETL pipelines
- Temporal data alignment algorithms
- Cloud-native architecture design
- Multi-tenant system isolation
- RESTful API design
- Vectorized data processing with Pandas
