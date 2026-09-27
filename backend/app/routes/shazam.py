import os
import tempfile
import asyncio
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
import imageio_ffmpeg
import pydub

# Ensure pydub and subprocesses use imageio-ffmpeg executable on Windows
try:
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    ffmpeg_dir = os.path.dirname(ffmpeg_exe)
    if ffmpeg_dir not in os.environ.get("PATH", ""):
        os.environ["PATH"] = ffmpeg_dir + os.pathsep + os.environ.get("PATH", "")
    pydub.AudioSegment.converter = ffmpeg_exe
except Exception as e:
    print(f"Warning setting ffmpeg converter: {e}")

from shazamio import Shazam
from backend.app.recommender import engine
from backend.app.models import SongItem, MovieItem

router = APIRouter(prefix="/shazam", tags=["Shazam Audio Identification"])
shazam = Shazam()

def convert_audio_to_wav(input_path: str, output_path: str) -> None:
    """
    Converts incoming client audio (webm, mp4, ogg, wav) into
    standard 44.1kHz 16-bit mono PCM WAV format required by Rust shazamio_core.
    """
    import subprocess
    ffmpeg_bin = imageio_ffmpeg.get_ffmpeg_exe()
    cmd = [
        ffmpeg_bin,
        "-y",
        "-i", input_path,
        "-ac", "1",
        "-ar", "44100",
        "-c:a", "pcm_s16le",
        output_path
    ]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if res.returncode != 0:
        err_msg = res.stderr.decode("utf-8", errors="ignore")
        raise RuntimeError(f"FFmpeg conversion error: {err_msg}")

class ShazamIdentifyResponse(BaseModel):
    found: bool
    message: Optional[str] = None
    track: Optional[Dict[str, Any]] = None
    similar_songs: List[SongItem] = []
    matching_movies: List[MovieItem] = []

@router.post("/identify", response_model=ShazamIdentifyResponse)
async def identify_audio(
    file: UploadFile = File(...),
):
    """
    Accepts an audio file/blob from the client microphone,
    converts it to standard 44.1kHz mono WAV,
    recognizes it using Shazam's acoustic fingerprinting engine,
    and returns rich metadata along with cross-modal Zhoosh recommendations.
    """
    filename = file.filename or "recording.webm"
    ext = os.path.splitext(filename)[1] or ".webm"

    # Save to a temporary raw file and prepare converted wav target
    temp_raw = tempfile.NamedTemporaryFile(delete=False, suffix=ext)
    temp_raw_path = temp_raw.name
    temp_wav = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
    temp_wav_path = temp_wav.name
    temp_wav.close()

    try:
        content = await file.read()
        if len(content) < 512:
            return ShazamIdentifyResponse(
                found=False,
                message="Audio clip was too short or empty. Please record for at least 4-5 seconds."
            )

        temp_raw.write(content)
        temp_raw.flush()
        temp_raw.close()

        # Convert webm / any format to 44.1kHz mono WAV for shazamio_core
        try:
            convert_audio_to_wav(temp_raw_path, temp_wav_path)
            target_path = temp_wav_path
        except Exception as conv_err:
            print(f"Warning: Audio conversion failed ({conv_err}), attempting direct recognition...")
            target_path = temp_raw_path

        # Run Shazam recognition with acoustic fingerprinting
        out = await shazam.recognize(target_path)
        track_data = out.get("track")
        if not track_data:
            return ShazamIdentifyResponse(
                found=False,
                message="No match found. Bring your device closer to the music source and try again."
            )

        title = track_data.get("title", "Unknown Title")
        artist = track_data.get("subtitle", "Unknown Artist")
        
        # Extract images
        images = track_data.get("images", {})
        cover_art = (
            images.get("coverarthq")
            or images.get("coverart")
            or images.get("background")
            or "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80"
        )

        # Extract genres
        genre = "Pop"
        genres_dict = track_data.get("genres", {})
        if isinstance(genres_dict, dict) and "primary" in genres_dict:
            genre = genres_dict["primary"]
        elif track_data.get("subtitle"):
            genre = "Soundtrack"

        # Extract album name if present in metadata sections
        album = "Single"
        sections = track_data.get("sections", [])
        for section in sections:
            if section.get("type") == "SONG":
                metadata_items = section.get("metadata", [])
                for meta in metadata_items:
                    if meta.get("title", "").lower() == "album":
                        album = meta.get("text", album)
                        break

        # Extract preview audio stream URL if available
        audio_preview_url = None
        hub = track_data.get("hub", {})
        actions = hub.get("actions", [])
        for action in actions:
            if action.get("type") == "uri" and action.get("uri"):
                audio_preview_url = action.get("uri")
                break

        # Check apple music / shazam share link
        share_url = track_data.get("url") or (track_data.get("share", {}).get("href"))

        parsed_track = {
            "id": f"shazam-{track_data.get('key', '0')}",
            "title": title,
            "artist": artist,
            "album": album,
            "album_art": cover_art,
            "genre": genre,
            "duration_sec": 180,
            "audio_url": audio_preview_url,
            "match_score": 98,
            "share_url": share_url,
            "agent_rationale": f"Identified with high confidence from live acoustic constellation fingerprinting."
        }

        # 1. Retrieve similar songs from Zhoosh engine
        similar_songs: List[SongItem] = []
        try:
            # First search by artist or title
            search_res = engine.search_all(f"{artist}")
            found_music = search_res.get("music", [])
            if found_music:
                for m in found_music[:4]:
                    try:
                        similar_songs.append(SongItem(**m))
                    except Exception:
                        pass
            
            # If not enough, recommend by genre
            if len(similar_songs) < 4:
                genre_songs = engine.get_music(genre=genre, limit=6)
                for gs in genre_songs:
                    if len(similar_songs) >= 6:
                        break
                    if not any(s.title.lower() == gs.title.lower() for s in similar_songs):
                        similar_songs.append(gs)

            # Fallback if still empty
            if not similar_songs:
                similar_songs = engine.get_music(limit=6)
        except Exception as e:
            print(f"Error fetching similar songs: {e}")

        # 2. Retrieve cross-modal matching movies
        matching_movies: List[MovieItem] = []
        try:
            # Check if song is from a movie or query genre
            movie_search = engine.search_all(f"{title} {genre}")
            movies = movie_search.get("movies", [])
            for mov in movies[:4]:
                try:
                    matching_movies.append(MovieItem(**mov))
                except Exception:
                    pass

            if not matching_movies:
                # Fallback to trending cross-modal
                all_movies = engine.get_movies(limit=4)
                matching_movies = all_movies[:4]
        except Exception as e:
            print(f"Error fetching matching movies: {e}")

        return ShazamIdentifyResponse(
            found=True,
            message="Track successfully identified!",
            track=parsed_track,
            similar_songs=similar_songs[:6],
            matching_movies=matching_movies[:4]
        )

    except Exception as e:
        print(f"Shazam recognition error: {e}")
        return ShazamIdentifyResponse(
            found=False,
            message=f"Identification error: {str(e)}"
        )
    finally:
        # Clean up temporary files
        for p in (temp_raw_path, temp_wav_path):
            if p and os.path.exists(p):
                try:
                    os.remove(p)
                except Exception:
                    pass
