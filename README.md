# 🎬 Zhoosh — Dual Cinema & Music Streaming Platform

> **One subscription. Unlimited movies. 100M+ tracks.**  
> Zhoosh is a premium AI-powered streaming platform combining Netflix-style cinema with Spotify-style music discovery — all in one seamless experience.

![Zhoosh Banner](frontend/public/zhoosh-logo-ref.jpg)

---

## ✨ Features

### 🎥 Movie Experience
- **Netflix-style dashboard** — full-width hero billboard, horizontal shelf rows (Continue Watching, Your Next Watch, Thriller Movies, Because You Watched…)
- **AI-powered recommendations** — personalised shelves based on your viewing history and music taste
- **Two-tier filtering** — Language first, then Genre (Romance, Action, Thriller, Comedy, Sitcom, Anime, Drama, Sci-Fi, Horror)
- **Rich movie cards** — poster art, play/like/more info actions

### 🎵 Music Experience
- Switch between **Movie Mode** and **Music Mode** from the navbar
- Integrated music player with playback controls
- Liked music and curated playlists

### 🚀 Onboarding Flow
- Beautiful landing page with trending movies & songs
- Subscription plans (Starter, Standard, Premium)
- Account creation
- Preference selection — choose your favourite languages & genres

### 🎨 Design System
- **Theme**: Black × Red (`#FF1E56`) × Purple (`#A855F7`)
- Dark glassmorphism UI with faded grid backdrop
- Smooth Framer Motion transitions throughout
- Fully responsive — mobile to 4K

---

## 🛠️ Tech Stack

### Frontend
| Tech | Purpose |
|------|---------|
| React 18 + TypeScript | UI framework |
| Vite | Build tool |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| Zustand | Global state management |
| TanStack Query | Data fetching & caching |
| Lucide React | Icons |

### Backend
| Tech | Purpose |
|------|---------|
| Python + FastAPI | REST API server |
| Pandas + scikit-learn | ML recommendation engine |
| Content-Based Filtering | Movie & music recommendations |
| TMDB Dataset | Movie metadata |
| Spotify Dataset | Music metadata |

---

## 📁 Project Structure

```
Zhoosh/
├── frontend/                  # React + Vite app
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/        # TopBar (Netflix-style navbar)
│   │   │   ├── movies/        # MoviesView dashboard
│   │   │   ├── music/         # MusicView dashboard
│   │   │   ├── onboarding/    # Landing, Plans, Account, Preferences
│   │   │   ├── common/        # ZhooshLogo, FadedGridBackdrop, Toast
│   │   │   ├── player/        # Audio player bar
│   │   │   └── profile/       # Profile & Plan modals
│   │   ├── api/               # API hooks (React Query)
│   │   ├── store/             # Zustand global store
│   │   ├── types/             # TypeScript interfaces
│   │   └── utils/             # Audio synth, confetti, etc.
│   └── public/                # Static assets (posters, logos)
│
├── backend/                   # Python FastAPI server
│   ├── app/
│   │   ├── main.py            # FastAPI entry point
│   │   ├── recommender.py     # ML recommendation engine
│   │   ├── models.py          # Pydantic models
│   │   └── routes/            # API route handlers
│   ├── run.py                 # Server launcher
│   └── requirements.txt       # Python dependencies
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- pip

### 1. Clone the repo
```bash
git clone https://github.com/CodeWizardAn/Zhoosh.git
cd Zhoosh
```

### 2. Set up the Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`

### 3. Set up the Backend
```bash
cd backend
pip install -r requirements.txt
```

> ⚠️ **Data Setup Required**  
> The dataset files are not included in this repo (proprietary/large).  
> You will need to provide your own:
> - `backend/data/movies.csv` — processed TMDB movie dataset
> - `backend/data/spotify_tracks.csv` — processed Spotify tracks dataset
>
> Run `prepare_data.py` after placing raw data files in the root:
> ```bash
> python prepare_data.py
> ```

```bash
python run.py
```
Backend API runs at `http://localhost:8000`

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/movies` | Fetch all movies |
| `GET` | `/api/movies/recommend/{id}` | Get movie recommendations |
| `GET` | `/api/music` | Fetch all songs |
| `GET` | `/api/music/recommend/{id}` | Get music recommendations |
| `POST` | `/api/like` | Like/unlike a movie or song |

---

## 🌐 Environment Variables

Create a `.env` file in `frontend/` if needed:
```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## 📸 Screenshots

| Landing Page | Dashboard | Preferences |
|---|---|---|
| Hero with trending movies & songs | Netflix-style movie shelves | Clean language + genre picker |

---

## 🔒 Privacy & Data

- Dataset files (CSVs) are **excluded from this repository**
- No API keys or secrets are committed
- See `.gitignore` for the full exclusion list

---

## 📄 License

This project is for educational/portfolio purposes.  
© 2026 Zhoosh · Built with ❤️ by [CodeWizardAn](https://github.com/CodeWizardAn)
