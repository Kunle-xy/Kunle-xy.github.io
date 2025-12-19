---
layout: page
title: PersonaAI - Digital Avatar with RAG
description: Personalized AI assistant that mimics individual personality using Retrieval-Augmented Generation and Llama 2 70B
img: assets/img/11.jpg
importance: 8
category: Artificial Intelligence
github: https://github.com/Kunle-xy/ai-personas
related_publications: true
---

## The Challenge: Creating Authentic Digital Personalities

Traditional large language models provide generic responses that lack personal context. Training custom models from scratch to capture individual personalities is computationally expensive, resource-intensive, and raises significant privacy concerns. The fundamental question becomes: **How do we create AI systems that authentically represent individual personalities while remaining efficient, scalable, and privacy-preserving?**

This challenge motivated the development of **PersonaAI**, a system that leverages Retrieval-Augmented Generation (RAG) combined with prompt-engineered Llama 2 70B to create highly personalized digital avatars—offering a lightweight, sustainable alternative to traditional large language model training methods.

---

## The Solution: RAG-Powered Personalization

PersonaAI combines three core technologies to deliver personalized AI interactions:

1. **Retrieval-Augmented Generation (RAG)** - Dynamically retrieves relevant personal context from user documents
2. **Llama 2 70B Language Model** - Open-source foundation model deployed via Replicate API with dual-template prompt engineering
3. **Vector Similarity Search** - Cosine similarity-based retrieval (top-2) to find contextually relevant information

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
top_k_docs = similarities[:k]  # Default k=2
```

### Stage 3: Top-K Retrieval Strategy

**What is Top-K Retrieval?**

Top-k retrieval selects the **k most relevant documents** based on similarity scores. This is crucial for balancing context quality and computational efficiency.

**Why K Matters:**

| K Value | Trade-offs |
|---------|------------|
| **k = 1** | Fastest, but may miss important context from slightly less similar documents |
| **k = 2** | **Optimal balance** - Minimal noise while capturing primary context |
| **k = 3-5** | More comprehensive context, but risks introducing less relevant information |
| **k = 10+** | Too much noise, increases token costs and inference latency significantly |

In PersonaAI, **k = 2** provides the sweet spot:
- Focuses on the most relevant context without noise
- Minimizes token usage for faster inference
- Keeps prompts concise and focused
- Reduces computational overhead for similarity search
- Works well with Llama 2's context window

**Implementation:**
```python
# Calculate cosine similarity for all documents
similarities = []
for doc in user_documents:
    # Dot product normalized by magnitudes
    similarity = np.dot(query_embedding, doc.vector) / (
        np.linalg.norm(query_embedding) * np.linalg.norm(doc.vector)
    )
    similarities.append((similarity, doc))

# Sort and retrieve top-2
similarities.sort(reverse=True)
top_2_docs = similarities[:2]

# Use top-2 as context for prompt
context = "\n\n".join([doc.text for _, doc in top_2_docs])
```

---

## Prompt Engineering: The Secret Sauce

PersonaAI's effectiveness comes from carefully engineered prompts that adapt based on whether user documents are available. The implementation uses **two distinct prompt templates** to handle different scenarios.

### System Prompt (Global Instruction)

All interactions begin with this system-level instruction sent to Llama 2:

```
You are a helpful and truthful assistant, answer only if you know the answer.
If you do not know the answer, truthfully say 'I do not know'.
```

This establishes the model's core behavior: **honesty over hallucination**.

### Prompt Template 1: Empty Database (Cold Start)

When a user has **not yet uploaded any documents**, PersonaAI uses this template:

```python
prompt_template = """
Respond to the QUESTION below:
- If the QUESTION is a general greeting or an inquiry about personal welfare
  (e.g., "How are you?" or "Good day"), reply in a friendly and jovial manner.
  These responses should be warm and engaging.

- If the QUESTION is too specific and lacks the necessary context or details
  for a comprehensive answer, kindly request that the user provide more specific
  details or context to enable a more accurate response.

- If the QUESTION can be answered with general knowledge and the answer is known,
  provide a generalized, honest, and harmless answer.

- If you are unable to answer the QUESTION due to a lack of information, either
  from the context provided or within general knowledge parameters, clearly state
  "I DO NOT KNOW".

QUESTION:
{question}

ANSWER:
"""
```

**Key Design Principles:**
1. **Graceful Greeting Handling** - Responds warmly to casual interactions without requiring context
2. **Clarification Requests** - Proactively asks for more details when questions are vague
3. **General Knowledge Fallback** - Leverages Llama 2's base knowledge when appropriate
4. **Explicit Uncertainty** - Forces the model to admit ignorance rather than fabricate answers

### Prompt Template 2: With Context (RAG Mode)

When the user **has uploaded documents**, the top-2 retrieved documents are injected as context:

```python
prompt_template = """
Respond to the QUESTION below:
- If the QUESTION is a general greeting or an inquiry about welfare
  (e.g., "How are you?" or "Good day"), reply in a friendly and jovial manner.
  Do not include the CONTEXT in your response.

- If the QUESTION requires specific information from the CONTEXT (provided below)
  and the answer can be determined from the CONTEXT, provide that answer.

- If the QUESTION pertains to general knowledge or topics not covered in the
  CONTEXT, such as current events or public information, and if this information
  is readily available to the model, provide an informed response using general
  knowledge.

- If the answer cannot be determined from the CONTEXT, is not within the general
  knowledge capabilities of the model, or requires updated information that the
  model cannot access, explicitly state the limitations and respond with
  "I DO NOT KNOW".

CONTEXT:
{context}

QUESTION:
{question}

ANSWER:
"""
```

**Key Design Principles:**
1. **Context-First Answering** - Prioritizes user-specific documents over general knowledge
2. **Greeting Isolation** - Explicitly prevents context injection for casual conversation
3. **Hybrid Knowledge** - Allows general knowledge when context doesn't cover the topic
4. **Boundary Awareness** - Model understands when to use context vs. when to fall back

### How Context is Injected

The `{context}` placeholder is populated with the **top-2 retrieved documents**:

```python
# Retrieve top-2 most similar documents
top_2_docs = cosine_similarity_search(query_embedding, k=2)

# Format context as concatenated text
context = "\n\n".join([
    f"Document {i+1}:\n{doc.text}"
    for i, (similarity, doc) in enumerate(top_2_docs)
])

# Inject into prompt template
final_prompt = prompt_template.format(
    context=context,
    question=user_question
)
```

### Why This Two-Template Approach Works

| Scenario | Template Used | Rationale |
|----------|---------------|-----------|
| **New User (no docs)** | Empty Database Template | Provides helpful responses while encouraging document uploads |
| **Established User** | Context Template | Leverages personal documents for authentic, personalized responses |
| **Greeting/Small Talk** | Both (special handling) | Maintains natural conversation flow without forcing context |

**Example Interaction Flow:**

**Scenario 1: Empty Database**
```
User: "What's my favorite food?"
System: Uses Template 1
Model: "I do not have specific information about your preferences. Could you
       share some details about your favorite foods so I can learn more about you?"
```

**Scenario 2: With Context**
```
Context (from top-2 docs):
- "Just had the best Thai curry ever! Spicy food is life 🌶️"
- "Can't decide between pizza and tacos for dinner. Both are amazing!"

User: "What's my favorite food?"
System: Uses Template 2
Model: "Based on what you've shared, you love spicy food—especially Thai curry!
       You also really enjoy pizza and tacos. Seems like you appreciate bold,
       flavorful dishes!"
```

### Behavioral Constraints

The prompts enforce critical constraints:

1. **No Hallucination** - "I DO NOT KNOW" requirement prevents fabrication
2. **Contextual Awareness** - Model knows when to use vs. ignore retrieved documents
3. **Tone Preservation** - "Friendly and jovial" for greetings maintains personability
4. **Explicit Clarification** - Requests more details instead of guessing

This dual-template architecture allows PersonaAI to provide value **immediately** (even without documents) while becoming **increasingly personalized** as users upload more content.

---

## Llama 2 70B Model Selection

**Why Llama 2 70B?**

PersonaAI uses **Meta's Llama 2 70B** via the Replicate API for several critical reasons:

### 1. Large Parameter Count for Nuanced Understanding
- **70 billion parameters** provide sophisticated language understanding
- Captures subtle personality nuances in user documents
- Better context integration compared to smaller models
- Strong performance on instruction-following tasks

### 2. Open-Source with Commercial License
- **Free for commercial use** (unlike GPT models with per-token charges)
- Transparent model architecture and training approach
- Community-driven improvements and optimizations
- Can self-host for complete data privacy if needed

### 3. Optimized for Instruction Following
Llama 2's instruction-tuning makes it exceptionally responsive to structured prompts:
- Accurately interprets conditional logic in prompts (if-then clauses)
- Maintains behavioral constraints (e.g., "I DO NOT KNOW" requirement)
- Balances creativity with consistency
- Handles multi-paragraph context effectively

### 4. Efficient Context Handling
- **4K token context window** - Sufficient for top-2 retrieved documents + conversation history
- Optimized attention mechanisms for long-context tasks
- Fast inference via Replicate's optimized infrastructure

### Model Configuration

**Inference Parameters (via Replicate API):**
```python
llama_config = {
    'model': 'meta/llama-2-70b-chat',
    'system_prompt': 'You are a helpful and truthful assistant...',
    'temperature': 0.05,        # Very low for deterministic, factual responses
    'top_p': 1,                 # No nucleus sampling (use full distribution)
    'max_tokens': 800,          # Generous response length
    'repetition_penalty': 1,    # No explicit repetition penalty
}
```

**Why These Parameters?**

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| **Temperature 0.05** | Very low | Prioritizes factual, consistent responses over creativity; reduces hallucination risk |
| **Top-p 1** | Full distribution | No truncation; all tokens considered for sampling |
| **Max Tokens 800** | Long responses | Allows detailed, comprehensive answers |
| **Repetition Penalty 1** | Neutral | No artificial penalty; lets natural language flow guide repetition |

**Why Temperature 0.05?**

The extremely low temperature is a **deliberate design choice** for PersonaAI:

1. **Factual Consistency** - When answering from context, the model should extract information accurately, not creatively rephrase
2. **Reduces Hallucination** - Lower temperature means higher probability tokens are heavily favored (more deterministic)
3. **Respects "I DO NOT KNOW"** - Makes the model more likely to admit uncertainty rather than fabricate answers
4. **Predictable Behavior** - Users expect consistent responses when asking the same question multiple times

**Trade-off:** Lower creativity in language generation, but this is acceptable since PersonaAI prioritizes **authenticity** (reflecting user documents) over **novelty**.

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

# 2. Retrieve top-2 similar documents via cosine similarity
top_2_docs = cosine_similarity_search(query_vec, k=2)

# 3. Format context from top-2 documents
context = "\n\n".join([doc.text for _, doc in top_2_docs])

# 4. Select appropriate prompt template
if user_has_documents:
    prompt = context_template.format(context=context, question=user_query)
else:
    prompt = empty_template.format(question=user_query)

# 5. Generate response with Llama 2 70B via Replicate
response = replicate.run(
    "meta/llama-2-70b-chat",
    input={
        "system_prompt": "You are a helpful and truthful assistant...",
        "prompt": prompt,
        "temperature": 0.05,
        "top_p": 1,
        "max_tokens": 800,
        "repetition_penalty": 1
    }
)
```

**Response:**
```json
{
  "response": "Based on your recent activities, you should definitely go for another hike if the weather permits! You mentioned loving outdoor adventures and finding them rejuvenating. Alternatively, if you prefer something more relaxed, you could enjoy a good book with your favorite coffee blend—you've mentioned both as weekend favorites.",
  "retrieved_docs": [
    {"text": "Just finished an amazing hike! ...", "similarity": 0.89},
    {"text": "Love weekends where I can just...", "similarity": 0.82}
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
- Llama 2 70B (via Replicate API)
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
3. **Local Deployment Option** - Self-host Llama 2 to avoid third-party data sharing
4. **JWT Authentication** - Secure, stateless authentication with token expiration
5. **No Training Data Leakage** - RAG retrieval doesn't modify the base Llama 2 model; only context injection at inference time

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
| **Retrieval Speed** | <50ms for top-2 @ 10K documents |
| **Inference Latency** | ~3-5s (Llama 2 70B via Replicate) |
| **Context Efficiency** | Top-2 retrieval minimizes token usage |
| **Privacy Compliance** | GDPR/CCPA compliant with local deployment option |

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
- Dual-template prompt engineering with conditional logic
- Llama 2 70B deployment via Replicate API
- Django REST API development
- JWT authentication and security
- Docker containerization
- Privacy-preserving AI system design
- Top-k retrieval optimization (k=2 strategy)
