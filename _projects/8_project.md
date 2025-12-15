---
layout: page
title: Retrieval Augmented Generation (RAG)
description: Streamlined document analysis and comprehension using vector databases
img: assets/img/11.jpg
importance: 8
category: work
github: https://github.com/Kunle-xy/justRAGit
---

## Overview

**justRAGit** transforms document interaction through a streamlined approach to analyze, vectorize, and comprehend files using Weaviate vector database, Langchain, and Streamlit. This project enables semantic search and intelligent question-answering over PDF documents by combining vector embeddings with Large Language Models.

---

## Key Features

**PDF Processing & Chunking**
- Upload and extract text from PDF documents
- Break documents into manageable segments for efficient processing

**Vector Storage with Weaviate**
- Store document chunks in Weaviate vector database
- Generate embeddings for semantic search capabilities

**Semantic Search & Retrieval**
- Query documents using natural language
- Retrieve top 5 most relevant passages ranked by semantic similarity

**LLM Integration**
- Powered by GPT-3.5-turbo for document comprehension
- Generate contextual answers based on retrieved content

---

## How It Works

1. **Index**: Upload PDF documents and extract text content
2. **Vectorize**: Generate embeddings for document chunks
3. **Store**: Save embeddings in Weaviate vector database
4. **Query**: Ask questions in natural language
5. **Retrieve**: Find semantically relevant passages
6. **Answer**: Generate responses using LLM with retrieved context

---

## Usage

### Command Line Interface
```bash
python src/main.py --pdf_file="path/to/document.pdf"
```

### Graphical User Interface
```bash
streamlit run gui.py
```

---

## Demo Videos

Watch the project demonstrations:

**First Milestone Demo:**
<div class="mt-3">
    <iframe width="560" height="315" src="https://www.youtube.com/embed/JyvfjnMqRW4" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
</div>

**Second Milestone Demo:**
<div class="mt-3">
    <iframe width="560" height="315" src="https://www.youtube.com/embed/HD_PS3HMkCk" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
</div>

---

## Technology Stack

- **Vector Database**: Weaviate
- **Framework**: Langchain
- **UI**: Streamlit
- **LLM**: OpenAI GPT-3.5-turbo
- **Language**: Python

---

## Explore the Code

**[View Full Project on GitHub](https://github.com/Kunle-xy/justRAGit)**

Clone the repository and try it yourself:
```bash
git clone https://github.com/Kunle-xy/justRAGit.git
cd justRAGit
# Follow installation instructions in the README
```

---

## Technical Skills Demonstrated

- Retrieval Augmented Generation (RAG) architecture
- Vector database design and implementation
- Semantic search and embedding generation
- LLM integration and prompt engineering
- Full-stack application development with Streamlit
- Python programming and software architecture
