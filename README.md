# 🎬 Zhoosh — Next-Gen AI Cinema & Music Discovery Platform

<div align="center">

![Pillai University Logo](frontend/public/pillai_logo.png)

### **Pillai University • Pillai College of Engineering (PCE)**
**Batch A2 • Academic Capstone Project (2025–2026)**

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/Frontend-React_18-61DAFB.svg?style=flat&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6.svg?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Motion-Framer_Motion-FF0055.svg?style=flat&logo=framer)](https://www.framer.com/motion/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

*A unified AI-driven platform that bridges cinematic storytelling with acoustic discovery through dual-vector recommendation algorithms, conversational intelligence, and an interactive split-screen interface.*

[Explore Features](#-key-features) • [Architecture](#-system-architecture) • [ML Engine](#-ai--recommendation-mechanics) • [API Specs](#-api-endpoints) • [Team Roster](#-developer-team-batch-a2) • [Presentation & Report](#-documentation--presentation-deck)

</div>

---

## 👥 Developer Team (Batch A2)

Developed by the 11-member engineering cohort from **Pillai University (Batch A2)**:

| No. | Developer Name | Focus Area |
|:---:|:---|:---|
| **01** | **Advaith Nair** | System Architecture & Recommender Engine |
| **02** | **Rituja Patil** | Machine Learning & Content-Based Filtering |
| **03** | **Arya Parab** | Conversational AI Discovery Agent |
| **04** | **Sanika Palande** | Backend Framework & RESTful APIs |
| **05** | **Shruti Naik** | Data Preprocessing & Feature Engineering |
| **06** | **Arathi Nair** | External API Connectors & Webhooks |
| **07** | **Anjali Nambiar** | Cold-Start Vector Strategy & Persistence |
| **08** | **Ankitha Nair** | Frontend Core Architecture & State Management |
| **09** | **Sharanya Nair** | Interactive UI/UX & Motion Physics |
| **10** | **Jayesh Patil** | Design System & Responsive Layout |
| **11** | **Aryan Seethesh** | Audio Player Integration & Testing Suite |

---

## ✨ Key Features

### 🎥 1. Unified Cinema & Audio Discovery
- **Split-Screen Interactive Stage**: Fluid draggable curtain slider powered by Framer Motion allowing instantaneous toggling between cinema and music modes.
- **Cross-Domain Recommendations**: Discovers films and connects them directly with matching soundtrack albums and emotional acoustic profiles.
- **Rich Media Cards**: High-definition movie posters, backdrop showcases, and 30-second audio track streams with playback controls.

### 🤖 2. Conversational AI Discovery Agent
- **Natural Language Query Parsing**: Understands compound mood prompts (e.g., *"give me a melancholic 90s neo-noir film with low-tempo jazz"*).
- **Multi-Turn Context Memory**: Retains conversation history across dialogue turns for intelligent iterative refinement.
- **Explainable AI**: Displays transparency scores explaining *why* a particular movie or track was recommended.
- **Resilient Fallback**: Operates with live LLMs (Groq / Gemini / OpenAI) and provides zero-downtime offline heuristic fallback.

### 🧭 3. 5×5 Cold-Start Onboarding Wizard
- **Interactive Preference Seeding**: Requires the user to pick exactly **5 distinct genres** and **5 distinct languages** during onboarding.
- **Instant Vector Projection**: Eliminates the classic collaborative filtering cold-start barrier without needing prior viewing history.
- **Dynamic Re-weighting**: Re-ranks candidate sets in real-time as users interact, like, or preview content.

### 🎵 4. Persistent Audio Player & Library
- **Floating Player Bar**: Global audio bar with play/pause, volume control, track progress, and real-time waveform visualization.
- **"My Zhoosh" Library**: Centralized bookmarks for saved movies, favorite tracks, and personalized mixed playlists.

---

## 🏗️ System Architecture

```
                  ┌─────────────────────────────────────────────────────────┐
                  │                 CLIENT TIER (React 18)                  │
                  │  TypeScript + Vite + Tailwind CSS + Framer Motion       │
                  │  • Split-Screen Curtain Slider (Cinema / Music)         │
                  │  • Onboarding Wizard (5 Genres × 5 Languages Seed)      │
                  │  • Floating Audio Player Bar + Waveform Animation       │
                  │  • Conversational Agent Drawer Interface                │
                  │  • Zustand Global State Store                           │
                  └────────────────────────────┬────────────────────────────┘
                                               │ REST (JSON) / CORS
                                               ▼
                  ┌─────────────────────────────────────────────────────────┐
                  │                 API SERVICE (FastAPI)                   │
                  │  Python 3.10+ / Asynchronous Uvicorn Server             │
                  │  • /api/movies/recommend  • /api/music/recommend       │
                  │  • /api/agent/chat        • /api/search                 │
                  │  • Pydantic Payload Validation                          │
                  │  • Local Enriched Fallback Mock Service (Zero Downtime) │
                  └──────────────┬──────────────────────────┬───────────────┘
                                 │                          │
                 ┌───────────────▼───────────┐  ┌───────────▼───────────────┐
                 │    RECOMMENDER ENGINE     │  │   CONVERSATIONAL AGENT    │
                 │ • Scikit-Learn TF-IDF     │  │ • LLM Routing (Groq/Gemini│
                 │ • Cosine Similarity Engine│  │ • Structured Filter Parser│
                 │ • 7-D Acoustic Normalizer │  │ • Context Memory Buffer   │
                 └───────────────┬───────────┘  └───────────┬───────────────┘
                                 │                          │
                                 ▼                          ▼
                  ┌─────────────────────────────────────────────────────────┐
                  │                    DATA INTEGRATIONS                    │
                  │ • TMDB 5,000+ Movies Dataset & Live TMDB v3 API         │
                  │ • Spotify Top Tracks Dataset & 30s Audio Previews       │
                  └─────────────────────────────────────────────────────────┘
```

---

## 🧠 AI & Recommendation Mechanics

### 1. Metadata Vectorization (TF-IDF)
Constructs composite feature strings from movie metadata:
$$\text{Metadata Soup} = \text{Director} \circ \text{Top 3 Cast} \circ \text{Genres} \circ \text{Plot Keywords} \circ \text{Overview}$$

TF-IDF converts textual tokens into a sparse vector space, removing stop-words and emphasizing discriminative tokens:
$$\text{TF-IDF}(t, d, D) = \text{TF}(t, d) \times \log\left(\frac{1 + |D|}{1 + |\{d \in D : t \in d\}|}\right) + 1$$

### 2. Pairwise Cosine Similarity
Calculates the angular distance between vectors to identify nearest neighbors:
$$\text{Similarity}(\vec{u}, \vec{v}) = \frac{\vec{u} \cdot \vec{v}}{\|\vec{u}\| \|\vec{v}\|}$$

### 3. 7D Acoustic Profile Normalization
Music tracks are mapped in a normalized acoustic space spanning:
$$\vec{A} = [\text{Valence}, \text{Energy}, \text{Danceability}, \text{Acousticness}, \text{Tempo}, \text{Loudness}, \text{Speechiness}]$$
The engine maps movie mood vectors into acoustic clusters to produce coherent cross-domain pairings.

---

## 🛠️ Technology Stack

| Layer | Technology | Key Purpose |
|:---|:---|:---|
| **Frontend Framework** | React 18 + TypeScript | Component reusability, type safety, modular design |
| **Build & Tooling** | Vite | Ultra-fast HMR and optimized production bundling |
| **Styling & Theme** | Tailwind CSS | Glassmorphism design tokens, obsidian dark palette (`#0B0B13`) |
| **Animations & Motion**| Framer Motion | Smooth curtain transitions, micro-interactions, modal physics |
| **State Management** | Zustand | Global lightweight state (active view, audio, user preferences) |
| **Backend Server** | Python 3.10+ & FastAPI | Asynchronous ASGI request handling, fast I/O concurrency |
| **ML & Data Processing**| Scikit-learn, Pandas, NumPy| TF-IDF matrix generation, cosine distance, feature scaling |
| **External APIs** | TMDB API & Spotify Web API | Real-time movie posters, trailers, and 30-second audio previews |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/health` | Service health check and recommender model readiness status |
| `GET` | `/api/movies` | Retrieve paginated catalog of movies |
| `GET` | `/api/movies/recommend` | Get personalized movie recommendations based on user vector |
| `GET` | `/api/movies/recommend/{id}` | Get top-N similar movies based on content similarity |
| `GET` | `/api/music` | Retrieve paginated catalog of music tracks |
| `GET` | `/api/music/recommend` | Get acoustic-matched music recommendations |
| `GET` | `/api/music/recommend/{id}` | Get top-N acoustically similar tracks |
| `POST` | `/api/agent/chat` | Conversational AI discovery agent endpoint (context memory enabled) |
| `GET` | `/api/search?q={query}` | Global cross-domain search across cinema and music |
| `POST` | `/api/preferences` | Submit user's 5-Genre & 5-Language cold-start seed vector |
| `POST` | `/api/like` | Bookmark/like a movie or music track |

---

## 📊 Documentation & Presentation Deck

The project documentation and presentation materials are located in the [`docs/`](docs/) directory:

- 📑 **Comprehensive Project Report & Presentation Guide**: [`docs/PROJECT_REPORT_AND_PPT.md`](docs/PROJECT_REPORT_AND_PPT.md)
  - Mathematical derivations, algorithm explanations, and architecture deep-dives.
  - **Slide-by-slide speaker notes** for team presentation delivery.
- 📽️ **16:9 Widescreen PowerPoint Presentation**: [`docs/Zhoosh_AI_Platform_Presentation.pptx`](docs/Zhoosh_AI_Platform_Presentation.pptx)
  - 14 executive-grade slides styled with the Pillai University crest and dark glassmorphic design.
- ⚙️ **Deck Generation Script**: [`docs/generate_ppt.py`](docs/generate_ppt.py)
  - Python script to programmatically regenerate or customize the presentation deck.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.10 or higher
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/CodeWizardAn/Zhoosh.git
cd Zhoosh
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

### 3. Backend Setup
```bash
cd ../backend
pip install -r requirements.txt
python run.py
```
*Backend API runs on `http://localhost:8005` (Docs available at `http://localhost:8005/docs`)*

---

## 📄 Academic Clearance & Attribution

This project is an academic submission for:
- **Institution**: Pillai University (Pillai College of Engineering - PCE)
- **Batch**: Batch A2
- **Academic Year**: 2025–2026
- **Repository**: [CodeWizardAn/Zhoosh](https://github.com/CodeWizardAn/Zhoosh)

*Developed with ❤️ by the 11-Member Pillai University Batch A2 Engineering Cohort.*
