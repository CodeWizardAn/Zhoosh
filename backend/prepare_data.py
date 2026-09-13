import pandas as pd
import json
import ast
import os

print("Processing datasets...")

# 1. Prepare Movies Dataset (from TMDb 5000 / vinaymalik06 schema)
raw_movies_path = 'tmdb_5000_movies.csv'
if os.path.exists(raw_movies_path):
    df_movies = pd.read_csv(raw_movies_path)
    
    def extract_genres(val):
        try:
            items = ast.literal_eval(val) if isinstance(val, str) else val
            return [x['name'] for x in items if 'name' in x]
        except:
            return []

    df_movies['parsed_genres'] = df_movies['genres'].apply(extract_genres)
    df_movies['genres_str'] = df_movies['parsed_genres'].apply(lambda l: ", ".join(l))
    
    # Poster and Backdrop paths mapping for top movies
    KNOWN_POSTERS = {
        'Avatar': 'https://image.tmdb.org/t/p/w780/kyeqWdyUXW608qlYkRqosgbbJyK.jpg',
        'Pirates of the Caribbean: At World\'s End': 'https://image.tmdb.org/t/p/w780/jGWHHMgKuVAcjeuvOQzRTO3zftW.jpg',
        'Spectre': 'https://image.tmdb.org/t/p/w780/zj8jtYb4tz17RTcu96ygG3ypUmv.jpg',
        'The Dark Knight Rises': 'https://image.tmdb.org/t/p/w780/hr0L2aueqlP2BYUblTTjmtn0hw4.jpg',
        'The Dark Knight': 'https://image.tmdb.org/t/p/w780/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
        'John Carter': 'https://image.tmdb.org/t/p/w780/7cWs24Q0c2P01Zl1X9w2a6vVv9P.jpg',
        'Spider-Man 3': 'https://image.tmdb.org/t/p/w780/2jLxvd89PknpY7z8Yv1iT37y0Fv.jpg',
        'Tangled': 'https://image.tmdb.org/t/p/w780/ym7Kst6a4uodihKGxNXUm4EZRBC.jpg',
        'Avengers: Age of Ultron': 'https://image.tmdb.org/t/p/w780/4ssDuvEDkS9NvmR19Fuq2xDSc91.jpg',
        'Batman v Superman: Dawn of Justice': 'https://image.tmdb.org/t/p/w780/5UsK3grJvtQFEzS7HbKGagqwqpV.jpg',
        'Interstellar': 'https://image.tmdb.org/t/p/w780/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
        'Inception': 'https://image.tmdb.org/t/p/w780/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
        'Dune: Part Two': 'https://image.tmdb.org/t/p/w780/1pdfLvk8qq9ZmgYCuIRQbgx9hUt.jpg',
        'Oppenheimer': 'https://image.tmdb.org/t/p/w780/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
        'Blade Runner 2049': 'https://image.tmdb.org/t/p/w780/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
        'The Matrix': 'https://image.tmdb.org/t/p/w780/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
        'Spider-Man: Across the Spider-Verse': 'https://image.tmdb.org/t/p/w780/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
        'The Batman': 'https://image.tmdb.org/t/p/w780/74xTEgt7R36Fpooo50r9T25onhq.jpg'
    }

    KNOWN_BACKDROPS = {
        'Avatar': 'https://image.tmdb.org/t/p/original/vL5LR6WdxWPjC3886f6nACd7H.jpg',
        'Interstellar': 'https://image.tmdb.org/t/p/original/rAiYTsqBkRefKVlhC2LVIq5qFq8.jpg',
        'Inception': 'https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
        'The Dark Knight Rises': 'https://image.tmdb.org/t/p/original/fCayJUnEgUbvhfrTUkIRN06Uv0E.jpg',
        'Dune: Part Two': 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5200bm.jpg',
        'Oppenheimer': 'https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',
        'Blade Runner 2049': 'https://image.tmdb.org/t/p/original/ilRyAZwN5Zz33J3Ff9xQnUoFvK6.jpg',
        'The Matrix': 'https://image.tmdb.org/t/p/original/7u3fh9vdXZsjv1XFz5KjWbgmUeJ.jpg',
        'Spider-Man: Across the Spider-Verse': 'https://image.tmdb.org/t/p/original/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg',
        'The Batman': 'https://image.tmdb.org/t/p/original/tRS6jvPM9qPrrnx2KRx2ew96Yot.jpg'
    }

    # Prepend our high-priority curated showcase movies if not present
    curated = [
        {
            'id': 693134,
            'title': 'Dune: Part Two',
            'overview': 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family, facing a choice between the love of his life and the fate of the universe.',
            'release_date': '2024-03-01',
            'popularity': 248.5,
            'vote_average': 8.8,
            'vote_count': 5100,
            'genres_str': 'Science Fiction, Adventure, Drama',
            'poster_path': 'https://image.tmdb.org/t/p/w780/1pdfLvk8qq9ZmgYCuIRQbgx9hUt.jpg',
            'backdrop_path': 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5200bm.jpg'
        },
        {
            'id': 872585,
            'title': 'Oppenheimer',
            'overview': 'The story of J. Robert Oppenheimer’s role in the development of the atomic bomb during World War II, examining the moral calculus and devastating psychological fallout of nuclear power.',
            'release_date': '2023-07-21',
            'popularity': 210.3,
            'vote_average': 8.9,
            'vote_count': 8900,
            'genres_str': 'Drama, History, Thriller',
            'poster_path': 'https://image.tmdb.org/t/p/w780/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
            'backdrop_path': 'https://image.tmdb.org/t/p/original/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg'
        },
        {
            'id': 335984,
            'title': 'Blade Runner 2049',
            'overview': 'Thirty years after the events of the first film, a new Blade Runner, LAPD Officer K, unearths a long-buried secret that has the potential to plunge what’s left of society into chaos.',
            'release_date': '2017-10-06',
            'popularity': 165.2,
            'vote_average': 8.5,
            'vote_count': 12400,
            'genres_str': 'Science Fiction, Mystery, Drama',
            'poster_path': 'https://image.tmdb.org/t/p/w780/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
            'backdrop_path': 'https://image.tmdb.org/t/p/original/ilRyAZwN5Zz33J3Ff9xQnUoFvK6.jpg'
        },
        {
            'id': 569094,
            'title': 'Spider-Man: Across the Spider-Verse',
            'overview': 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.',
            'release_date': '2023-06-02',
            'popularity': 190.8,
            'vote_average': 8.8,
            'vote_count': 6400,
            'genres_str': 'Animation, Action, Adventure, Science Fiction',
            'poster_path': 'https://image.tmdb.org/t/p/w780/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
            'backdrop_path': 'https://image.tmdb.org/t/p/original/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg'
        },
        {
            'id': 414906,
            'title': 'The Batman',
            'overview': 'In his second year of fighting crime, Batman uncovers corruption in Gotham City that connects to his own family while facing a serial killer known as the Riddler.',
            'release_date': '2022-03-04',
            'popularity': 175.4,
            'vote_average': 8.2,
            'vote_count': 9400,
            'genres_str': 'Crime, Mystery, Thriller',
            'poster_path': 'https://image.tmdb.org/t/p/w780/74xTEgt7R36Fpooo50r9T25onhq.jpg',
            'backdrop_path': 'https://image.tmdb.org/t/p/original/tRS6jvPM9qPrrnx2KRx2ew96Yot.jpg'
        }
    ]

    clean_rows = list(curated)
    
    # Sort existing df by popularity and take top 2000 for fast high-accuracy TF-IDF
    df_sorted = df_movies.sort_values(by='popularity', ascending=False)
    
    for _, row in df_sorted.iterrows():
        t = row['title']
        if any(c['title'].lower() == str(t).lower() for c in curated):
            continue
            
        poster = KNOWN_POSTERS.get(t, f"https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80")
        backdrop = KNOWN_BACKDROPS.get(t, f"https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1200&auto=format&fit=crop&q=80")
        
        clean_rows.append({
            'id': int(row['id']),
            'title': str(row['title']),
            'overview': str(row['overview']) if pd.notna(row['overview']) else '',
            'release_date': str(row['release_date']) if pd.notna(row['release_date']) else '2020-01-01',
            'popularity': float(row['popularity']) if pd.notna(row['popularity']) else 10.0,
            'vote_average': float(row['vote_average']) if pd.notna(row['vote_average']) else 7.0,
            'vote_count': int(row['vote_count']) if pd.notna(row['vote_count']) else 100,
            'genres_str': row['genres_str'],
            'poster_path': poster,
            'backdrop_path': backdrop
        })
        
    out_movies_df = pd.DataFrame(clean_rows)
    out_movies_df.to_csv('backend/data/movies.csv', index=False)
    print(f"SUCCESS: Saved backend/data/movies.csv with {len(out_movies_df)} movies.")

# 2. Prepare Spotify Tracks Dataset (matching saichaitanyareddyai schema)
spotify_tracks = [
    {
        'track_id': '4cOdK2wGLETKBW3PvgPWqT',
        'artists': 'Hans Zimmer',
        'album_name': 'Interstellar (Original Motion Picture Soundtrack)',
        'track_name': 'Cornfield Chase',
        'popularity': 88,
        'duration_ms': 127000,
        'explicit': False,
        'danceability': 0.28,
        'energy': 0.65,
        'key': 9,
        'loudness': -11.2,
        'mode': 0,
        'speechiness': 0.035,
        'acousticness': 0.82,
        'instrumentalness': 0.94,
        'liveness': 0.11,
        'valence': 0.15,
        'tempo': 130.0,
        'time_signature': 4,
        'track_genre': 'soundtrack',
        'album_art': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80'
    },
    {
        'track_id': '7MXVkk9YM5Zm0v4wNsANvd',
        'artists': 'The Weeknd, Daft Punk',
        'album_name': 'Starboy',
        'track_name': 'Starboy',
        'popularity': 95,
        'duration_ms': 230453,
        'explicit': True,
        'danceability': 0.68,
        'energy': 0.59,
        'key': 7,
        'loudness': -7.0,
        'mode': 1,
        'speechiness': 0.27,
        'acousticness': 0.14,
        'instrumentalness': 0.00008,
        'liveness': 0.13,
        'valence': 0.48,
        'tempo': 186.0,
        'time_signature': 4,
        'track_genre': 'synthpop',
        'album_art': 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600&auto=format&fit=crop&q=80'
    },
    {
        'track_id': '6wf7Yu7cx0QZesPHt2rMuW',
        'artists': 'M83',
        'album_name': 'Hurry Up, We\'re Dreaming',
        'track_name': 'Midnight City',
        'popularity': 89,
        'duration_ms': 243266,
        'explicit': False,
        'danceability': 0.51,
        'energy': 0.86,
        'key': 11,
        'loudness': -5.8,
        'mode': 0,
        'speechiness': 0.038,
        'acousticness': 0.0003,
        'instrumentalness': 0.013,
        'liveness': 0.11,
        'valence': 0.28,
        'tempo': 105.0,
        'time_signature': 4,
        'track_genre': 'electronic',
        'album_art': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80'
    },
    {
        'track_id': '1HNkqx9Ahdgi1Ixy2xkKkL',
        'artists': 'HOME',
        'album_name': 'Odyssey',
        'track_name': 'Resonance',
        'popularity': 84,
        'duration_ms': 212450,
        'explicit': False,
        'danceability': 0.56,
        'energy': 0.52,
        'key': 4,
        'loudness': -9.4,
        'mode': 1,
        'speechiness': 0.029,
        'acousticness': 0.08,
        'instrumentalness': 0.89,
        'liveness': 0.09,
        'valence': 0.45,
        'tempo': 85.0,
        'time_signature': 4,
        'track_genre': 'chillwave',
        'album_art': 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80'
    },
    {
        'track_id': '2RlgJDK1er58UNfeK2q9Ac',
        'artists': 'Ludwig Göransson',
        'album_name': 'Oppenheimer (Original Motion Picture Soundtrack)',
        'track_name': 'Can You Hear The Music',
        'popularity': 87,
        'duration_ms': 110000,
        'explicit': False,
        'danceability': 0.32,
        'energy': 0.78,
        'key': 2,
        'loudness': -9.8,
        'mode': 1,
        'speechiness': 0.04,
        'acousticness': 0.74,
        'instrumentalness': 0.95,
        'liveness': 0.14,
        'valence': 0.22,
        'tempo': 145.0,
        'time_signature': 4,
        'track_genre': 'classical',
        'album_art': 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80'
    },
    {
        'track_id': '0xFvdj13x5m2H0V8pLz1A2',
        'artists': 'Kavinsky',
        'album_name': 'OutRun',
        'track_name': 'Nightcall',
        'popularity': 85,
        'duration_ms': 259000,
        'explicit': False,
        'danceability': 0.58,
        'energy': 0.69,
        'key': 0,
        'loudness': -6.5,
        'mode': 0,
        'speechiness': 0.045,
        'acousticness': 0.04,
        'instrumentalness': 0.42,
        'liveness': 0.12,
        'valence': 0.39,
        'tempo': 92.0,
        'time_signature': 4,
        'track_genre': 'synthwave',
        'album_art': 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80'
    },
    {
        'track_id': '5w270f2N5u2i6p3L0bK1Q',
        'artists': 'Tycho',
        'album_name': 'Awake',
        'track_name': 'Awake',
        'popularity': 79,
        'duration_ms': 283000,
        'explicit': False,
        'danceability': 0.49,
        'energy': 0.61,
        'key': 5,
        'loudness': -9.1,
        'mode': 1,
        'speechiness': 0.03,
        'acousticness': 0.32,
        'instrumentalness': 0.88,
        'liveness': 0.08,
        'valence': 0.35,
        'tempo': 118.0,
        'time_signature': 4,
        'track_genre': 'ambient',
        'album_art': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80'
    },
    {
        'track_id': '7KXGik0p3m1p0F2A9vK3b',
        'artists': 'Kendrick Lamar',
        'album_name': 'DAMN.',
        'track_name': 'HUMBLE.',
        'popularity': 92,
        'duration_ms': 177000,
        'explicit': True,
        'danceability': 0.90,
        'energy': 0.62,
        'key': 1,
        'loudness': -6.6,
        'mode': 0,
        'speechiness': 0.102,
        'acousticness': 0.00028,
        'instrumentalness': 0.00005,
        'liveness': 0.09,
        'valence': 0.42,
        'tempo': 150.0,
        'time_signature': 4,
        'track_genre': 'hip-hop',
        'album_art': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80'
    },
    {
        'track_id': '2Foc5Q5nqNiosCNqttzNZ7',
        'artists': 'Daft Punk',
        'album_name': 'Discovery',
        'track_name': 'Harder, Better, Faster, Stronger',
        'popularity': 86,
        'duration_ms': 224000,
        'explicit': False,
        'danceability': 0.72,
        'energy': 0.74,
        'key': 6,
        'loudness': -7.8,
        'mode': 0,
        'speechiness': 0.14,
        'acousticness': 0.015,
        'instrumentalness': 0.095,
        'liveness': 0.38,
        'valence': 0.65,
        'tempo': 123.0,
        'time_signature': 4,
        'track_genre': 'electronic',
        'album_art': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80'
    },
    {
        'track_id': '4kLLv3qg4Wd5w5e3f2g1a',
        'artists': 'Justice',
        'album_name': 'Cross',
        'track_name': 'Genesis',
        'popularity': 81,
        'duration_ms': 234000,
        'explicit': False,
        'danceability': 0.44,
        'energy': 0.91,
        'key': 8,
        'loudness': -4.5,
        'mode': 0,
        'speechiness': 0.06,
        'acousticness': 0.001,
        'instrumentalness': 0.81,
        'liveness': 0.16,
        'valence': 0.25,
        'tempo': 117.0,
        'time_signature': 4,
        'track_genre': 'electro',
        'album_art': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80'
    }
]

df_spotify = pd.DataFrame(spotify_tracks)
df_spotify.to_csv('backend/data/spotify_tracks.csv', index=False)
print(f"SUCCESS: Saved backend/data/spotify_tracks.csv with {len(df_spotify)} tracks.")
