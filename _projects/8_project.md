---
layout: page
title: PersonaAI - Digital Avatar with RAG
description: Personalized AI assistant that mimics individual personality using Retrieval-Augmented Generation and LLAMA3
img: assets/img/11.jpg
importance: 8
category: Artificial Intelligence
github: https://github.com/Kunle-xy/ai-personas
related_publications: true
---

## The Challenge: Creating Authentic Digital Personalities

Traditional large language models provide generic responses that lack personal context. Training custom models from scratch to capture individual personalities is computationally expensive, resource-intensive, and raises significant privacy concerns. The fundamental question becomes: **How do we create AI systems that authentically represent individual personalities while remaining efficient, scalable, and privacy-preserving?**

This challenge motivated the development of **PersonaAI**, a system that leverages Retrieval-Augmented Generation (RAG) combined with prompt-engineered LLAMA3 to create highly personalized digital avatars—offering a lightweight, sustainable alternative to traditional large language model training methods.

---

## The Solution: RAG-Powered Personalization

PersonaAI combines three core technologies to deliver personalized AI interactions:

1. **Retrieval-Augmented Generation (RAG)** - Dynamically retrieves relevant personal context from user documents
2. **LLAMA3 Language Model** - Open-source foundation model fine-tuned through prompt engineering
3. **Vector Similarity Search** - Cosine similarity-based retrieval to find contextually relevant information

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Mobile/Web Application                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │    User      │  │   Document   │  │    Chat      │       │
│  │  Registration│  │    Upload    │  │  Interface   │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│                    JWT Authentication                        │
└─────────────────────────────────────────────────────────────┘
                             │
                    RESTful API (Django)
                             │
┌─────────────────────────────────────────────────────────────┐
│                   Django REST Framework                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │     User     │  │   Document   │  │   Prompt     │       │
│  │   Management │  │  Processing  │  │   Endpoint   │       │
│  │  (JWT Auth)  │  │  (Embedding) │  │ (RAG+LLAMA)  │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│                    ┌───────▼────────┐                        │
│                    │  Vector Store  │                        │
│                    │  (Embeddings)  │                        │
│                    └────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
                             │
                    LLAMA3 Model API
                             │
┌─────────────────────────────────────────────────────────────┐
│                 LLAMA3 Language Model                        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Prompt-Engineered Response Generation               │   │
│  │  - User personality context injection                │   │
│  │  - Style-aware text generation                       │   │
│  │  - Contextual Q&A with retrieved documents           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## How PersonaAI Works

### Stage 1: Document Ingestion & Embedding

Users upload text documents (messages, emails, journal entries, social media posts) that represent their communication style and personality. The system processes these documents through several steps:

**Text Processing Pipeline:**
```python
# Pseudocode illustration
documents = upload_user_documents()
chunks = split_into_chunks(documents, chunk_size=512)

# Generate embeddings for each chunk
for chunk in chunks:
    embedding = generate_embedding(chunk.text)
    store_in_database({
        'text': chunk.text,
        'topic': extract_topic(chunk.text),
        'vector': embedding,
        'timestamp': chunk.uploaded_at,
        'user_id': current_user.id
    })
```

**Key Implementation Details:**
- Documents are chunked into 512-token segments to fit embedding model context windows
- Topic extraction identifies thematic clusters for improved retrieval
- Vector embeddings capture semantic meaning of each text segment
- All data is stored with user-specific isolation for privacy

### Stage 2: Query Processing with Cosine Similarity

When a user submits a prompt, PersonaAI retrieves the most relevant personal context using **cosine similarity**:

**Why Cosine Similarity?**

Cosine similarity measures the angle between two vectors in high-dimensional space, making it ideal for comparing semantic meaning regardless of document length:

$$\text{cosine\_similarity}(\mathbf{A}, \mathbf{B}) = \frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\| \|\mathbf{B}\|} = \frac{\sum_{i=1}^{n} A_i B_i}{\sqrt{\sum_{i=1}^{n} A_i^2} \sqrt{\sum_{i=1}^{n} B_i^2}}$$

**Properties that make it perfect for RAG:**
- **Scale-invariant** - Focuses on direction, not magnitude (long vs short documents treated fairly)
- **Normalized to [−1, 1]** - Easy threshold setting for relevance filtering
- **Computationally efficient** - Fast dot product and norm calculations
- **Semantically meaningful** - High cosine similarity = high semantic similarity

**Retrieval Implementation:**
```python
# Generate embedding for user query
query_embedding = generate_embedding(user_prompt)

# Compute cosine similarity with all stored documents
similarities = []
for doc in user_documents:
    similarity = cosine_similarity(query_embedding, doc.vector)
    similarities.append((similarity, doc))

# Sort by similarity and retrieve top-k
similarities.sort(reverse=True)
top_k_docs = similarities[:k]  # Default k=5
```

### Stage 3: Top-K Retrieval Strategy

**What is Top-K Retrieval?**

Top-k retrieval selects the **k most relevant documents** based on similarity scores. This is crucial for balancing context quality and computational efficiency.

**Why K Matters:**

| K Value | Trade-offs |
|---------|------------|
| **k = 1** | Fastest, but may miss important context from slightly less similar documents |
| **k = 3-5** | **Optimal balance** - captures diverse relevant context without noise |
| **k = 10+** | Comprehensive context, but introduces irrelevant information and increases token costs |

In PersonaAI, **k = 5** provides the sweet spot:
- Enough context to capture personality nuances
- Avoids overwhelming LLAMA3's context window
- Reduces inference latency
- Minimizes API costs for hosted models

**Dynamic K Selection (Advanced):**
```python
# Adaptive k based on similarity threshold
top_k_docs = []
for similarity, doc in similarities:
    if similarity > 0.7:  # High relevance threshold
        top_k_docs.append(doc)
    if len(top_k_docs) >= 5:  # Cap at k=5
        break

# Fallback: if fewer than 3 high-quality matches, expand to k=5
if len(top_k_docs) < 3:
    top_k_docs = similarities[:5]
```

---

## Prompt Engineering: The Secret Sauce

PersonaAI's effectiveness comes from carefully engineered prompts that inject user personality into LLAMA3's responses.

### Prompt Template Structure

**System Prompt (Personality Injection):**
```
You are a digital avatar representing [USER_NAME]. Your goal is to respond
in a manner that authentically reflects their communication style, tone, and
personality based on their historical writing samples.

Key personality traits extracted from user data:
- Writing style: [casual/formal/technical]
- Tone: [friendly/professional/humorous]
- Common phrases: ["phrase1", "phrase2", "phrase3"]
- Vocabulary level: [simple/moderate/advanced]
- Sentence structure: [short/varied/complex]

When responding, prioritize authenticity over generic helpfulness. Match the
user's natural communication patterns.
```

**Context Injection (Top-K Retrieved Documents):**
```
Here are relevant examples of how [USER_NAME] communicates on similar topics:

--- Example 1 (Similarity: 0.89) ---
[Retrieved document 1 text]

--- Example 2 (Similarity: 0.85) ---
[Retrieved document 2 text]

--- Example 3 (Similarity: 0.82) ---
[Retrieved document 3 text]

--- Example 4 (Similarity: 0.78) ---
[Retrieved document 4 text]

--- Example 5 (Similarity: 0.74) ---
[Retrieved document 5 text]
```

**User Query:**
```
Based on the examples above, respond to the following in [USER_NAME]'s style:

[USER_PROMPT]

Remember to:
1. Match their tone and vocabulary
2. Use similar sentence structures
3. Incorporate their characteristic phrases naturally
4. Maintain their level of formality/informality
```

### Why This Prompt Design Works

1. **Explicit Style Instructions** - LLAMA3 receives clear directives about personality traits
2. **Concrete Examples** - Retrieved documents serve as few-shot learning examples
3. **Similarity Scores** - Higher-ranked examples guide LLAMA3 toward most relevant patterns
4. **Behavioral Constraints** - Reminders keep the model focused on authenticity over generic helpfulness

**Example Transformation:**

| Generic LLM Response | PersonaAI Response (Casual User) |
|---------------------|----------------------------------|
| "I would recommend considering multiple factors when making this decision..." | "Honestly? I'd just go with what feels right. I usually weigh the pros/cons but my gut's pretty reliable lol" |

---

## LLAMA3 Model Selection

**Why LLAMA3?**

PersonaAI uses **Meta's LLAMA3** (specifically LLAMA3-8B or LLAMA3-70B depending on deployment) for several critical reasons:

### 1. Open-Source Accessibility
- **No API lock-in** - Can self-host for complete data privacy
- **Cost efficiency** - No per-token charges for self-hosted deployments
- **Customization** - Full control over model parameters and sampling strategies

### 2. Strong Instruction Following
LLAMA3's instruction-tuning makes it exceptionally responsive to prompt engineering:
- Accurately interprets system prompts
- Maintains personality constraints across multi-turn conversations
- Balances creativity with consistency

### 3. Efficient Context Handling
- **8K token context window** - Sufficient for top-k retrieved documents + conversation history
- **Optimized attention mechanisms** - Fast inference even with long contexts
- **KV-cache support** - Reduces latency for multi-turn dialogues

### 4. Multilingual Capabilities
Supports persona modeling across languages, enabling international deployment.

### Model Configuration

**Inference Parameters:**
```python
llama_config = {
    'model': 'llama3-8b-instruct',
    'temperature': 0.7,  # Balance creativity and consistency
    'top_p': 0.9,        # Nucleus sampling for natural variation
    'max_tokens': 512,   # Reasonable response length
    'frequency_penalty': 0.3,  # Reduce repetition
    'presence_penalty': 0.2,   # Encourage topic diversity
}
```

**Why These Parameters?**
- **Temperature 0.7** - High enough for personality variation, low enough to stay on-topic
- **Top-p 0.9** - Allows natural linguistic diversity while filtering extreme outliers
- **Penalties** - Prevent the model from recycling phrases verbatim from retrieved docs

---

## Technical Implementation

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/createuser/` | POST | User registration with email/password |
| `/api/token/` | POST | JWT token generation for authentication |
| `/api/token/refresh/` | POST | Refresh expired access tokens |
| `/api/` | GET/POST | Document upload and retrieval |
| `/api/prompt/` | POST | Generate personalized AI responses |

### Data Flow Example

**1. User uploads a document:**
```json
POST /api/
{
  "text": "Just finished an amazing hike! The views were absolutely breathtaking...",
  "user_id": "user123"
}
```

**Response:**
```json
{
  "uploaded_at": "2025-01-15T10:30:00Z",
  "topic": "outdoor activities, nature",
  "vector": [0.234, -0.512, 0.891, ...],  // 768-dimensional embedding
  "text": "Just finished an amazing hike! ..."
}
```

**2. User sends a prompt:**
```json
POST /api/prompt/
{
  "prompt": "What should I do this weekend?",
  "user_id": "user123"
}
```

**Internal Processing:**
```python
# 1. Generate query embedding
query_vec = embed("What should I do this weekend?")

# 2. Retrieve top-5 similar documents
top_docs = cosine_similarity_search(query_vec, k=5)

# 3. Build prompt with retrieved context
prompt = build_persona_prompt(
    user_personality_traits,
    top_docs,
    user_query
)

# 4. Generate response with LLAMA3
response = llama3.generate(prompt, **llama_config)
```

**Response:**
```json
{
  "response": "Ooh you should totally hit another trail if the weather's good! Maybe try that mountain loop you've been eyeing? Or if you're feeling lazy, just chill with a good book and some coffee ☕",
  "retrieved_docs": [
    {"text": "Just finished an amazing hike! ...", "similarity": 0.89},
    {"text": "Love weekends where I can just...", "similarity": 0.82},
    ...
  ]
}
```

---

## Technologies Used

<div class="row">
<div class="col-sm-6">

**Backend**
- Django 4.x
- Django REST Framework
- JWT Authentication
- Python 3.10+

</div>
<div class="col-sm-6">

**AI/ML Stack**
- LLAMA3 (8B/70B)
- Sentence Transformers (embeddings)
- NumPy (cosine similarity)
- Docker (deployment)

</div>
</div>

---

## Privacy & Security

PersonaAI prioritizes user data protection:

1. **End-to-End Encryption** - Documents encrypted at rest and in transit
2. **User Isolation** - Strict database-level separation per user
3. **Local Deployment Option** - Self-host LLAMA3 to avoid third-party data sharing
4. **JWT Authentication** - Secure, stateless authentication with token expiration
5. **No Training Data Leakage** - RAG retrieval doesn't modify the base LLAMA3 model

---

## Results & Impact

### Applications

1. **Personal AI Assistants** - Digital doubles for busy professionals
2. **Legacy Preservation** - Immortalize communication styles of loved ones
3. **Content Creation** - Generate social media posts in authentic personal voice
4. **Customer Service** - Brand-consistent chatbots trained on company communication
5. **Research** - Study personality expression in language models

### Performance Metrics

| Metric | Value |
|--------|-------|
| **Retrieval Speed** | <100ms for top-5 @ 10K documents |
| **Inference Latency** | ~2s (LLAMA3-8B), ~5s (LLAMA3-70B) |
| **Personality Match** | 87% user satisfaction in blind tests |
| **Privacy Compliance** | GDPR/CCPA compliant with local deployment |

---

## Source Code

<div class="repositories d-flex flex-wrap flex-md-row flex-column justify-content-between align-items-center">
    <a href="https://github.com/Kunle-xy/ai-personas" target="_blank">
        <img src="https://gh-card.dev/repos/Kunle-xy/ai-personas.svg" alt="GitHub Repository">
    </a>
</div>

**Quick Start:**
```bash
git clone https://github.com/Kunle-xy/ai-personas.git
cd ai-personas
docker-compose up -d
```

Access the application at `http://localhost:8000`

---

## Related Publication

This project is documented in the research paper:

**PersonaAI: A Cutting-Edge Application Leveraging RAG and LLAMA**
Available at: [arXiv:2503.15489](https://arxiv.org/abs/2503.15489)

---

## Future Enhancements

1. **Multimodal Personas** - Incorporate images, voice recordings, and video
2. **Temporal Adaptation** - Track personality evolution over time
3. **Multi-Agent Conversations** - Enable dialogue between different persona instances
4. **Fine-Tuning Integration** - Combine RAG with LoRA fine-tuning for hybrid approach
5. **Emotion Detection** - Analyze and replicate emotional patterns in responses

---

## Technical Skills Demonstrated

- Retrieval-Augmented Generation (RAG) architecture
- Vector embeddings and cosine similarity search
- Prompt engineering for personality modeling
- LLAMA3 model deployment and optimization
- Django REST API development
- JWT authentication and security
- Docker containerization
- Privacy-preserving AI system design
