"""
Fetch Official High-Res Album Art for All Tracks in spotify_tracks.csv
======================================================================
Queries Apple Music / iTunes official public search API to retrieve the
authentic, official 600x600 high-resolution album cover artwork for every
single track in our music catalog.
"""

import os
import time
import json
import urllib.request
import urllib.parse
import pandas as pd

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "spotify_tracks.csv")

def get_official_artwork(track_name: str, artists: str, album_name: str = "") -> str:
    primary_artist = artists.split(',')[0].strip()
    # Clean track title (strip features/parentheticals)
    clean_title = track_name.split('(')[0].split('[')[0].strip()
    
    queries = [
        f"{primary_artist} {clean_title}",
        f"{artists} {clean_title}",
        f"{primary_artist} {track_name}",
        f"{clean_title}",
    ]
    if album_name and album_name.lower() != 'single':
        queries.append(f"{primary_artist} {album_name}")

    for q in queries:
        term = urllib.parse.quote_plus(q)
        url = f"https://itunes.apple.com/search?term={term}&entity=song&limit=1"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        try:
            with urllib.request.urlopen(req, timeout=6) as response:
                data = json.loads(response.read().decode('utf-8'))
                if data.get('results') and len(data['results']) > 0:
                    art_100 = data['results'][0].get('artworkUrl100', '')
                    if art_100:
                        # Convert to crystal-clear 600x600 resolution
                        return art_100.replace('100x100bb', '600x600bb')
        except Exception:
            continue
        time.sleep(0.05) # Polite rate limiting

    return ""

def update_all_album_art():
    if not os.path.exists(DATA_PATH):
        print(f"[Error] Dataset not found at: {DATA_PATH}")
        return

    df = pd.read_csv(DATA_PATH)
    total = len(df)
    print("=" * 65)
    print(f"FETCHING OFFICIAL ALBUM ARTWORK FOR {total} TRACKS")
    print("=" * 65)

    updated_count = 0
    new_artworks = []

    for idx, row in df.iterrows():
        title = str(row['track_name'])
        artist = str(row['artists'])
        album = str(row.get('album_name', ''))
        current_art = str(row.get('album_art', ''))

        official_art = get_official_artwork(title, artist, album)
        if official_art:
            new_artworks.append(official_art)
            updated_count += 1
            print(f"[{idx+1:03d}/{total:03d}] [OK] {title} by {artist}")
        else:
            # Fallback to existing or curated genre art
            new_artworks.append(current_art)
            print(f"[{idx+1:03d}/{total:03d}] [KEPT] {title} by {artist}")

    df['album_art'] = new_artworks
    df.to_csv(DATA_PATH, index=False)

    print("=" * 65)
    print(f"COMPLETED: {updated_count}/{total} tracks updated with official high-res album covers.")
    print(f"Saved to: {DATA_PATH}")
    print("=" * 65)

if __name__ == "__main__":
    update_all_album_art()
