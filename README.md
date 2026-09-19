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
[![Scikit-Learn](https://img.shields.io/badge/ML-Scikit--Learn-F7931E.svg?style=flat&logo=scikit-learn)](https://scikit-learn.org/)
[![Live Demo](https://img.shields.io/badge/Live_Demo-zhoosh--eight.vercel.app-E50914.svg?style=for-the-badge&logo=vercel)](https://zhoosh-eight.vercel.app)

*An end-to-end AI-powered cross-domain discovery engine bridging cinematic storytelling with acoustic discovery through dual-vector recommendation algorithms, real-time natural language conversational intelligence, and an interactive split-screen interface.*

🚀 **Live Deployment**: [https://zhoosh-eight.vercel.app](https://zhoosh-eight.vercel.app)

---

[Developer Team](#-developer-team-batch-a2) • [System Overview](#-system-overview) • [Key Features](#-key-features) • [System Architecture](#-system-architecture) • [ML Algorithms in Detail](#-machine-learning-algorithms-in-detail) • [How the AI Agent Works](#-how-the-ai-conversational-agent-works) • [Technology Stack](#-technology-stack) • [API Reference](#-api-reference) • [Getting Started](#-getting-started) • [Directory Structure](#-project-directory-structure)

</div>

---

## 👥 Developer Team (Batch A2)

Developed by the **Pillai University (Batch A2)** engineering cohort:

<div align="center">

| | | |
|:---:|:---:|:---:|
| **Advaith Nair** | **Anjali Nambiar** | **Ankitha Nair** |
| **Arathi Nair** | **Arya Parab** | **Aryan Seethesh** |
| **Jayesh Patil** | **Rituja Patil** | **Sanika Palande** |
| **Sharanya Nair** | **Shruti Naik** | |

</div>

---

## 🌟 System Overview

Traditional digital entertainment platforms operate in computational and algorithmic silos: video streaming services (e.g., Netflix, Prime Video) maintain isolated movie preference vectors, while music streaming services (e.g., Spotify, Apple Music) curate isolated acoustic listening profiles. Users captivated by the mood, era, or aesthetic of a film must manually search for matching soundtracks across external apps. Furthermore, traditional collaborative filtering algorithms suffer from the **cold-start problem**, requiring extensive initial user behavior before delivering relevant recommendations.

**Zhoosh** resolves these challenges by uniting cinema and music into a single, cohesive discovery ecosystem:
- **Dual-Vector Recommender Engine**: Simultaneously models high-dimensional textual metadata (director, cast, genres, plot overview) and 10-dimensional acoustic feature spaces (energy, valence, danceability, tempo, etc.).
- **Conversational AI Agent ("Nova")**: A context-aware, dataset-grounded dialogue system providing explainable recommendations, dynamic pagination ("more"), mood-based filtering, and real-time Server-Sent Events (SSE) streaming.
- **Interactive Split-Screen Curtain**: A draggable, physics-based viewport divider that allows instant toggling between Cinema and Music modes without reloading state.
- **5×5 Cold-Start Seed Protocol**: Eliminates cold-start churn by mathematically projecting user selections (5 genres × 5 languages) into preference vectors on first launch.

---

## ✨ Key Features

### 🎥 1. Interactive Split-Screen Stage
- **Draggable Viewport Curtain**: Powered by Framer Motion physics, allowing users to effortlessly slide between cinematic exploration and music streaming.
- **Rich Media Cards**: 4K posters, verified TMDB backdrops, trailers, runtime details, critical ratings, and 30-second high-fidelity audio streams.
- **Context Preservation**: Changing modes preserves active query states, playback positions, and recommendation sets.

### 🤖 2. Conversational AI Discovery Companion ("Nova")
- **Natural Language Parsing**: Understands compound emotional prompts (e.g., *"give me a melancholic 90s neo-noir thriller with low-tempo jazz"*).
- **Multi-Turn Contextual Memory**: Remembers active genres, artists, and directors across dialogue turns, enabling seamless iterative narrowing and pagination via simple prompts like *"more"*.
- **Explainable AI (XAI)**: Generates human-readable rationale strings alongside compatibility match percentages for every recommended title or song.
- **Domain Guardrails**: Enforces domain isolation based on active mode (Cinema vs. Music), steering users smoothly between modes when cross-domain queries occur.

### 🧭 3. 5×5 Cold-Start Onboarding Wizard
- **Preference Vector Seeding**: Prompts users to select **5 distinct genres** and **5 distinct languages** on first arrival.
- **Instant Latent Projection**: Overcomes the cold-start barrier instantly without requiring historical view counts or collaborative ratings.
- **Dynamic Re-weighting**: Adapts recommendations in real time as users like, bookmark, or preview items.

### 🎵 4. Persistent Audio Player & "My Zhoosh" Library
- **Global Floating Player**: Uninterrupted audio playback with track scrubbers, volume controls, and an animated frequency waveform.
- **Unified Bookmarks**: Bookmark favorite films and tracks into a unified personal library with persistent local and cloud state.

---

## 🏗️ System Architecture

```
                  ┌─────────────────────────────────────────────────────────┐
                  │                 CLIENT TIER (React 18)                  │
                  │  TypeScript + Vite + Tailwind CSS + Framer Motion       │
                  │  • Draggable Split-Screen Curtain (Cinema ⮀ Music)      │
                  │  • 5×5 Cold-Start Preference Wizard (Genres & Languages)│
                  │  • Persistent Floating Audio Player & Waveform Visualizer│
                  │  • Conversational Agent Drawer (SSE Word-by-Word Stream)│
                  │  • Zustand Reactive Global State Store                  │
                  └────────────────────────────┬────────────────────────────┘
                                               │ REST (JSON) & SSE Streams
                                               ▼
                  ┌─────────────────────────────────────────────────────────┐
                  │                 API SERVICE (FastAPI)                   │
                  │  Python 3.10+ / Asynchronous Uvicorn Server             │
                  │  • /api/movies/recommend  • /api/music/recommend       │
                  │  • /api/agent/chat (SSE)  • /api/search                 │
                  │  • Pydantic Schema Validation & Exception Handling      │
                  │  • Zero-Downtime Fallback Architecture                  │
                  └──────────────┬──────────────────────────┬───────────────┘
                                 │                          │
                 ┌───────────────▼───────────┐  ┌───────────▼───────────────┐
                 │    RECOMMENDER ENGINE     │  │   CONVERSATIONAL AGENT    │
                 │ • Scikit-Learn TF-IDF     │  │ • Multi-Turn Memory Buffer│
                 │ • Weighted Metadata Soup  │  │ • Regex & NLP Intent Parser│
                 │ • Cosine Similarity Metric│  │ • Entity Extractor        │
                 │ • Bayesian Vote Damping   │  │ • SSE Event Producer      │
                 │ • 10-D Acoustic Normalizer│  │ • Dataset-Grounded Guard  │
                 └───────────────┬───────────┘  └───────────┬───────────────┘
                                 │                          │
                                 ▼                          ▼
                  ┌─────────────────────────────────────────────────────────┐
                  │                    DATA INTEGRATIONS                    │
                  │ • TMDB 5,000+ Movies Dataset & Live TMDB v3 API         │
                  │ • Spotify Top Tracks Dataset (Acoustic Metrics & Audio) │
                  └─────────────────────────────────────────────────────────┘
```

---

## 🧠 Machine Learning Algorithms in Detail

Zhoosh employs an ensemble of content-based filtering, high-dimensional vector spaces, acoustic feature scaling, and Bayesian-inspired popularity damping to compute high-accuracy recommendation sets.

```
                    ┌────────────────────────────────────────┐
                    │ Raw TMDB Metadata & Spotify Features   │
                    └───────────────────┬────────────────────┘
                                        │
             ┌──────────────────────────┴──────────────────────────┐
             ▼                                                     ▼
┌───────────────────────────────┐             ┌───────────────────────────────┐
│     CINEMA VECTORIZATION      │             │      ACOUSTIC EMBEDDING       │
│  • Weighted Metadata Soup     │             │  • 10 Spotify Audio Features  │
│  • TfidfVectorizer (10k Dim)  │             │  • MinMaxScaler Normalization │
│  • Sparse TF-IDF Matrix       │             │  • Dense Feature Matrix       │
└──────────────┬────────────────┘             └───────────────┬───────────────┘
               │                                              │
               ▼                                              ▼
┌───────────────────────────────┐             ┌───────────────────────────────┐
│   PAIRWISE COSINE DISTANCE    │             │   ACOUSTIC COSINE DISTANCE    │
│  Sim(u, v) = (u · v)/(|u||v|) │             │  Sim(a, b) = (a · b)/(|a||b|) │
└──────────────┬────────────────┘             └───────────────┬───────────────┘
               │                                              │
               ▼                                              ▼
┌───────────────────────────────┐             ┌───────────────────────────────┐
│  BAYESIAN POPULARITY DAMPING  │             │   MOOD & ACOUSTIC FILTERING   │
│  Score = 0.72·Sim + 0.28·Boost│             │  Valence, Energy, Acousticness│
└──────────────┬────────────────┘             └───────────────┬───────────────┘
               │                                              │
               └──────────────────────┬───────────────────────┘
                                      ▼
                        ┌───────────────────────────┐
                        │   Calibrated Top-N Recs   │
                        │   + Match Percentage (%)  │
                        │   + Explainable Rationale │
                        └───────────────────────────┘
```

---

### 1. Content-Based Multi-Attribute "Metadata Soup"
Rather than relying solely on plot synopsis or genre labels in isolation, the engine synthesizes an information-dense textual representation for each movie $i$. To reflect the disproportionate influence of director style, genre identity, and title keywords on human preference, attributes are weighted via token replication:

$$\text{Soup}_i = 2 \cdot (\text{Title}_i) + 3 \cdot (\text{Genres}_i) + 2 \cdot (\text{Director}_i) + \text{Cast}_i + \text{Language}_i + \text{Overview}_i$$

- **Title ($\times 2$)**: Reinforces franchise, sequel, and thematic naming patterns.
- **Genres ($\times 3$)**: Highest weight multiplier ensures genre alignment remains dominant.
- **Director ($\times 2$)**: Preserves auteur aesthetics (e.g., Christopher Nolan, Quentin Tarantino, Denis Villeneuve).
- **Cast, Language, Overview ($\times 1$)**: Supplies narrative context, supporting cast co-occurrences, and linguistic alignment.

---

### 2. Term Frequency-Inverse Document Frequency (TF-IDF) Vectorization
The composite metadata corpus is transformed into a high-dimensional vector space using `TfidfVectorizer` from `scikit-learn`:

$$\text{TF}(t, d) = \frac{f_{t, d}}{\sum_{t' \in d} f_{t', d}}$$

$$\text{IDF}(t, D) = \log\left(\frac{1 + |D|}{1 + |\{d \in D : t \in d\}|}\right) + 1$$

$$\text{TF-IDF}(t, d, D) = \text{TF}(t, d) \times \text{IDF}(t, D)$$

**Vector Space Configuration:**
- **Vocabulary Dimension**: $10,000$ most informative feature terms (`max_features=10000`).
- **Stop-Words Elimination**: Standard English stop-words are pruned to suppress non-discriminative lexical noise.
- **Sublinear TF Scaling**: Dampens the impact of repetitive tokens within lengthy plot synopses.
- **L2 Normalization**: All row vectors in the resulting document-term matrix are normalized: $\|\vec{v}\|_2 = 1$.

---

### 3. Pairwise Cosine Similarity
To evaluate the semantic closeness between a target movie vector $\vec{u}$ and every candidate movie vector $\vec{v}$ in the corpus, the engine calculates the cosine of the angle between them:

$$\text{Cosine Similarity}(\vec{u}, \vec{v}) = \frac{\vec{u} \cdot \vec{v}}{\|\vec{u}\|_2 \, \|\vec{v}\|_2} = \frac{\sum_{k=1}^{n} u_k v_k}{\sqrt{\sum_{k=1}^{n} u_k^2} \, \sqrt{\sum_{k=1}^{n} v_k^2}}$$

Because all TF-IDF vectors are unit-normalized ($L_2 = 1$), this reduces computationally to an ultra-fast dot product:

$$\text{Cosine Similarity}(\vec{u}, \vec{v}) = \vec{u} \cdot \vec{v}$$

---

### 4. Bayesian-Inspired Logarithmic Popularity Damping
Pure cosine similarity on metadata can surface obscure shorts, documentaries, or low-quality indie entries that happen to share rare keywords with an acclaimed blockbuster. To balance relevance with consensus quality, Zhoosh blends cosine similarity with a logarithmic vote-count boost:

$$\text{Vote Boost} = \text{clip}\left(\frac{\log(1 + \text{Vote Count})}{11.5}, \, 0.0, \, 1.0\right)$$

$$\text{Composite Score} = 0.72 \times \text{Cosine Similarity} + 0.28 \times \text{Vote Boost}$$

This ensures that:
- Highly relevant titles with strong critical/audience consensus rise to the top.
- Niche titles with minimal reviews are prevented from eclipsing established cinematic benchmarks.
- Cloned titles and behind-the-scenes shorts sharing identical names are systematically pruned via title prefix filtering.

---

### 5. 10-Dimensional Acoustic Feature Space (Spotify Architecture)
Music recommendation operates across a 10-dimensional acoustic feature vector space based on Spotify audio analysis standards:

$$\vec{A} = [\text{danceability}, \, \text{energy}, \, \text{loudness}, \, \text{speechiness}, \, \text{acousticness}, \, \text{instrumentalness}, \, \text{liveness}, \, \text{valence}, \, \text{tempo}, \, \text{popularity}]$$

| Metric | Range | Description |
|:---|:---:|:---|
| **Danceability** | $[0.0, 1.0]$ | How suitable a track is for dancing based on tempo, rhythm stability, and beat strength |
| **Energy** | $[0.0, 1.0]$ | Perceptual measure of intensity, activity, dynamic range, and timbre |
| **Loudness** | $[-60, 0]\text{ dB}$ | Overall loudness in decibels averaged across the entire track |
| **Speechiness** | $[0.0, 1.0]$ | Detects the presence of spoken words vs. sung vocals |
| **Acousticness** | $[0.0, 1.0]$ | Confidence metric assessing whether the track is acoustic |
| **Instrumentalness**| $[0.0, 1.0]$ | Predicts whether a track contains no vocals ($>0.5$ represents instrumental) |
| **Liveness** | $[0.0, 1.0]$ | Detects presence of an audience / live performance atmosphere |
| **Valence** | $[0.0, 1.0]$ | Musical positiveness: high valence sounds joyful/euphoric; low valence sounds sad/depressed |
| **Tempo** | $[0, 250]\text{ BPM}$| Overall estimated tempo in beats per minute |
| **Popularity** | $[0, 100]$ | Normalized metric reflecting Spotify global playback velocity |

---

### 6. Acoustic Normalization & Distance Calculation
Because features span radically different scales (e.g., Loudness in negative dB vs. Tempo in BPM vs. Valence in $[0, 1]$), the matrix is normalized using `MinMaxScaler`:

$$x_{\text{scaled}} = \frac{x - x_{\min}}{x_{\max} - x_{\min}}$$

When recommending tracks similar to a target song $T$, the engine computes cosine similarity over the normalized acoustic matrix:

$$\text{Acoustic Match}(\vec{A}_T, \vec{A}_C) = \frac{\vec{A}_T \cdot \vec{A}_C}{\|\vec{A}_T\|_2 \|\vec{A}_C\|_2}$$

---

### 7. Mood-Based Acoustic Clustering & Heuristic Filtering
For situational and emotional recommendations, the engine applies multi-variable acoustic threshold filters:
- **Romantic & Soulful**: $\text{Acousticness} \ge 0.35$ or $\text{Genre} = \text{'Romantic'}$, ranked by popularity and harmonic warmth.
- **Sad & Melancholic**: $\text{Valence} \le 0.35$, prioritizing low-tempo, emotionally evocative acoustic ballads.
- **High-Energy & Workout**: $\text{Danceability} \ge 0.70$ or $\text{Energy} \ge 0.75$.
- **Chill & Lo-Fi**: Low speechiness, moderate tempo ($70–95\text{ BPM}$), and elevated acousticness.

---

### 8. The 5×5 Cold-Start Preference Seeding Protocol
Traditional collaborative filtering systems fail when a new user arrives because no historical interaction matrix exists. Zhoosh bypasses this limitation with an onboarding wizard:
1. The user selects **5 distinct movie genres** and **5 distinct languages**.
2. A synthetic preference vector $\vec{P}_{\text{user}}$ is synthesized:
   $$\vec{P}_{\text{user}} = \sum_{g \in \text{Genres}} w_g \vec{V}_g + \sum_{l \in \text{Languages}} w_l \vec{V}_l$$
3. Candidate films matching the user's selected languages are sorted by quality rank:
   $$\text{Rank} = 0.6 \times \text{Vote Average} + 0.4 \times \log(1 + \text{Vote Count})$$
4. As the user interacts with cards (likes, preview clicks, playback), the preference vector dynamically updates with exponential smoothing.

---

## 🤖 How the AI Conversational Agent Works

The Conversational AI Discovery Agent, named **Nova**, serves as an intelligent guide embedded within Zhoosh. It is designed to understand natural language queries, extract nuanced user preferences, navigate the recommendation catalog, and deliver real-time streaming answers.

```
                    User Message via /api/agent/chat (SSE)
                                      │
                                      ▼
              ┌───────────────────────────────────────────────┐
              │          Context & History Extraction         │
              │  • Conversation History (Past User/Agent)     │
              │  • Active Mode ('movies' vs 'music')          │
              │  • Liked Titles & Saved Profile Memory        │
              │  • Seen Titles (De-duplication Buffer)        │
              └───────────────────────┬───────────────────────┘
                                      │
                                      ▼
              ┌───────────────────────────────────────────────┐
              │           Intent & Entity Parsing             │
              │  • Quoted & Substring Title Matching          │
              │  • 20+ Movie Genres & 10+ Music Genres        │
              │  • Artist / Singer / Composer Detection       │
              │  • Actor / Director Name Detection            │
              │  • Mood & Situational Scenario Matcher        │
              │  • Language / Regional Identifier             │
              │  • Pagination ("more") Detection              │
              └───────────────────────┬───────────────────────┘
                                      │
             ┌────────────────────────┴────────────────────────┐
             ▼                                                 ▼
┌───────────────────────────────┐             ┌───────────────────────────────┐
│          CINEMA MODE          │             │          MUSIC MODE           │
│  • Enforces Cinema Isolation  │             │  • Enforces Music Isolation   │
│  • Recommends Filmography,    │             │  • Recommends Discography,    │
│    Director Works, Themes     │             │    Acoustic Vibes, Playlists  │
│  • Prompts switch if music    │             │  • Prompts switch if cinema   │
│    is requested               │             │    is requested               │
└──────────────┬────────────────┘             └───────────────┬───────────────┘
               │                                              │
               └──────────────────────┬───────────────────────┘
                                      │
                                      ▼
              ┌───────────────────────────────────────────────┐
              │         Catalog-Grounded Response Gen         │
              │  • Query Engine Database (Zero Hallucination) │
              │  • Calibrate Match Score (e.g. 98% Resonance) │
              │  • Build Contextual Rationale Explanation     │
              │  • Attach Interactive Media Payloads          │
              └───────────────────────┬───────────────────────┘
                                      │
                                      ▼
              ┌───────────────────────────────────────────────┐
              │         Server-Sent Events (SSE) Stream       │
              │  • Event: {"type": "movies", "movies": [...]} │
              │  • Event: {"type": "songs", "songs": [...]}   │
              │  • Token: Word-by-word streaming (18-25ms)    │
              │  • Event: {"type": "done"}                    │
              └───────────────────────────────────────────────┘
```

---

### 1. Request Lifecycle & Payload Structure
When a user types into the Nova drawer, the frontend issues a `POST /api/agent/chat` request:
```json
{
  "user_id": "u-101",
  "agent_name": "Nova",
  "message": "suggest some mind-bending sci-fi movies like Inception",
  "mode": "movies",
  "history": [
    {"role": "user", "content": "hello"},
    {"role": "agent", "content": "Hello! I am Nova..."}
  ],
  "liked_titles": ["Interstellar", "The Matrix"],
  "memory": {
    "preferredGenres": ["Science Fiction", "Thriller"],
    "favoriteEntities": ["Christopher Nolan"]
  }
}
```

---

### 2. Multi-Turn Context Memory Buffer
The agent analyzes dialogue history in reverse order via `extract_context_from_history`:
- **`active_genre` / `active_music_genre`**: Identifies ongoing genre discussions so follow-up inquiries (e.g., *"give me 90s ones"*) inherit previous constraints.
- **`active_artist` / `active_director`**: Tracks creators discussed in earlier turns.
- **`seen_titles` Buffer**: Parses bolded titles (`**Title**`) from prior agent outputs to guarantee that subsequent queries never re-recommend already viewed titles.
- **`more_count` Pagination Counter**: Tracks consecutive "more" requests to advance catalog offsets:
  $$\text{Offset} = (\text{more\_count} + 1) \times 6$$

---

### 3. NLP Intent & Multi-Layer Entity Extraction
Nova deploys specialized regex engines and substring matchers across the catalog:

1. **Title Matching**:
   - Checks explicitly quoted strings (`"Inception"`).
   - Evaluates word-boundary regex patterns against the top 3,000 TMDB titles sorted by popularity to accurately catch titles embedded in natural prose.
2. **Genre Recognition**:
   - 20+ movie genres mapped via word boundaries (e.g., `sci-fi`, `science fiction`, `psychological thriller`, `dark comedy`).
   - 10+ music genres (e.g., `lo-fi`, `hip-hop`, `rock`, `electronic`, `indie`, `acoustic`).
3. **Personnel & Discography Resolution**:
   - Searches 500+ director and actor names across movie metadata.
   - Searches artist, band, and composer names across Spotify metadata (e.g., Arijit Singh, The Weeknd, Coldplay, Kendrick Lamar, Hans Zimmer).
4. **Situational & Mood Scenarios**:
   - **Wanderlust & Travel**: Queries referencing *"road trip"*, *"journey"*, *"driving"*, or *"vacation"* return uplifting, travel-themed anthems.
   - **College Days & Nostalgia**: Queries referencing *"hostel"*, *"campus life"*, or *"missing friends"* return friendship classics and campus anthems.
   - **High-Adrenaline / Gym**: Queries referencing *"hype"*, *"workout"*, or *"Kendrick"* return high-BPM, aggressive rap and rock.
   - **Heartbreak & Comfort**: Queries referencing *"feeling down"*, *"crying"*, or *"heartbroken"* return low-valence, soothing ballads.
5. **Language & Cultural Detection**:
   - Recognizes Bollywood/Hindi (`arijit`, `pritam`, `rahman`, `bollywood`), Punjabi (`diljit`, `ap dhillon`), Anime, Korean, and Global pop.

---

### 4. Domain Isolation & Guardrails
To maintain user clarity across the split-screen paradigm:
- **In Cinema Mode**: If the user asks for songs, the agent politely explains that the session is currently in Cinema Mode and guides them to use the top-bar toggle to switch to Music Mode, without polluting the movie view with songs.
- **In Music Mode**: If the user asks for films or director filmographies, the agent directs them to switch back to Cinema Mode.

---

### 5. Dataset-Grounded Rationale Generation (Zero Hallucinations)
Unlike raw generative LLMs that frequently invent non-existent movies, fake release dates, or hallucinated streaming links, Nova binds all suggestions directly to verified rows in the TMDB and Spotify datasets. 

Every recommendation includes an **Agent Rationale** explaining *why* it was selected:
- *"Shares Thriller motifs, storytelling pacing, and audience resonance with 'Inception'."*
- *"Directed by Christopher Nolan · Signature visual mastery and thematic depth."*
- *"Harmonic & acoustic similarity with 'Starboy' (96% audio feature match on acousticness, tempo, and valence)."*

---

### 6. Word-by-Word SSE Streaming
Nova streams its thoughts and recommendations via Server-Sent Events (`text/event-stream`):
1. **Metadata Event**: First dispatches the structured movie or music card list so the client UI renders interactive cards immediately:
   ```
   data: {"type": "movies", "movies": [...]}
   ```
2. **Intent Event**: Dispatches the classified intent:
   ```
   data: {"type": "intent", "intent": "grounded_response"}
   ```
3. **Token Stream**: Words are streamed with an asynchronous sleep interval ($18–25\text{ ms}$):
   ```
   data: {"type": "token", "content": "Here "}
   data: {"type": "token", "content": "are "}
   data: {"type": "token", "content": "the "}
   ...
   data: {"type": "done", "intent": "done"}
   ```
This provides an ultra-responsive, typing-like experience without blocking UI interactions.

---

## 🛠️ Technology Stack

| Layer | Technology | Key Capabilities & Rationale |
|:---|:---|:---|
| **Frontend Framework** | React 18 + TypeScript | Component reusability, strict compile-time type safety, predictable rendering |
| **Tooling & Bundler** | Vite | Sub-second Hot Module Replacement (HMR) and optimized rollup production bundles |
| **Design & Styling** | Tailwind CSS | Curated dark obsidian palette (`#0B0B13`), glassmorphic panels, zero runtime CSS overhead |
| **Motion & Physics** | Framer Motion | Physics-based draggable split curtain, modal animations, audio waveform visualizer |
| **State Management** | Zustand | Ultra-lightweight reactive global store (active mode, audio player state, bookmarks) |
| **Backend Framework** | FastAPI (Python 3.10+) | Asynchronous ASGI request handling, native SSE streaming support, Pydantic validation |
| **Data & ML Libraries** | Scikit-learn, Pandas, NumPy | TF-IDF sparse matrix computation, pairwise cosine similarity, MinMaxScaler |
| **External Integrations**| TMDB API & Spotify API | High-resolution poster art, verified trailers, and 30-second lossless audio previews |
| **Deployment** | Vercel (Frontend) | Edge deployment with automatic CI/CD and CDN asset distribution |

---

## 🔌 API Reference

### Health & Recommender Status
```http
GET /api/health
```
Returns system status, active database counts, and model readiness.

---

### Movie Recommendations by ID
```http
GET /api/movies/recommend/{id}?limit=8
```
Returns top-N movies similar to the target movie using cosine similarity over the weighted TF-IDF metadata soup.

---

### Music Recommendations by Audio Features
```http
GET /api/music/recommend/{id}?limit=6
```
Returns top-N songs sharing acoustic proximity in the 10-dimensional scaled audio feature space.

---

### Conversational AI Agent Chat (SSE)
```http
POST /api/agent/chat
Content-Type: application/json
Accept: text/event-stream
```

**Request Body:**
```json
{
  "user_id": "u-101",
  "agent_name": "Nova",
  "message": "suggest some romantic Hindi songs",
  "mode": "music",
  "history": [],
  "liked_titles": []
}
```

**Response Format:** `text/event-stream` delivering structured cards followed by word-by-word streaming text tokens.

---

### Unified Global Search
```http
GET /api/search?q={query}&mode=movies
```
Performs multi-criteria searching across titles, directors, artists, genres, and audio profiles.

---

### Cold-Start Preference Submission
```http
POST /api/preferences
Content-Type: application/json
```
```json
{
  "user_id": "u-101",
  "genres": ["Action", "Sci-Fi", "Thriller", "Drama", "Crime"],
  "languages": ["English", "Hindi", "Spanish", "French", "Japanese"]
}
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **Python**: `v3.10` or higher
- **Git**

---

### 1. Clone the Repository
```bash
git clone https://github.com/CodeWizardAn/Zhoosh.git
cd Zhoosh
```

---

### 2. Frontend Installation & Startup
```bash
cd frontend
npm install
npm run dev
```
*Frontend application launches at `http://localhost:5173`*

---

### 3. Backend Installation & Startup
```bash
cd ../backend
pip install -r requirements.txt
python run.py
```
*Backend API launches at `http://localhost:8005`*  
*Interactive Swagger Documentation: `http://localhost:8005/docs`*

---

## 📂 Project Directory Structure

```
Zhoosh/
├── frontend/                     # React 18 + TypeScript Client Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── agent/            # Conversational Agent Drawer & Chat Bubbles
│   │   │   ├── cinema/           # Movie Cards, Backdrops & Video Player Modals
│   │   │   ├── music/            # Audio Cards, Album Art, & Audio Player Bar
│   │   │   ├── onboarding/       # 5×5 Cold-Start Preference Wizard
│   │   │   ├── layout/           # AppShell, Navigation Bar, Viewport Splitter
│   │   │   └── search/           # Search Overlays & Result Grids
│   │   ├── store/                # Zustand Global State Management
│   │   ├── services/             # Axios API Clients & Mock Enriched Fallbacks
│   │   ├── types/                # Strict TypeScript Interface Definitions
│   │   └── index.css             # Tailwind Directives & Custom Glassmorphic CSS
│   ├── public/                   # University Crest, Default Posters, & Static Assets
│   └── package.json
│
├── backend/                      # Python FastAPI Application & ML Engine
│   ├── app/
│   │   ├── main.py               # Application Initialization & CORS Configuration
│   │   ├── models.py             # Pydantic Schemas for Requests/Responses
│   │   ├── recommender.py        # Core Scikit-Learn ML Recommendation Engine
│   │   └── routes/               # API Routers (Movies, Music, Agent, Search)
│   ├── data/                     # Cleaned TMDB & Spotify CSV Datasets
│   ├── requirements.txt          # Python Dependencies
│   └── run.py                    # Uvicorn Server Launch Script
│
├── docs/                         # Academic Documentation & Presentation Deck
│   ├── PROJECT_REPORT_AND_PPT.md # Full Technical Report & Speaker Notes
│   ├── Zhoosh_AI_Platform_Presentation.pptx # 16:9 Presentation Slides
│   └── generate_ppt.py           # Presentation Generation Script
│
└── README.md                     # Platform Documentation (Current File)
```

---

## 📄 Academic Clearance & Attribution

This platform is developed and maintained as an academic capstone project for:
- **Institution**: Pillai University (Pillai College of Engineering - PCE)
- **Cohort**: Batch A2
- **Academic Year**: 2025–2026
- **Repository**: [CodeWizardAn/Zhoosh](https://github.com/CodeWizardAn/Zhoosh)

<div align="center">

*Engineered with ❤️ by the Pillai University Batch A2 Cohort.*

</div>
