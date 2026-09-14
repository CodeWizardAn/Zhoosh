import os
import re
import pandas as pd
import numpy as np

print("=" * 60)
print("FAST VECTORIZED TMDB POSTER & BACKDROP ENRICHMENT")
print("=" * 60)

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "movies.csv")
df_our = pd.read_csv(DATA_PATH)
print(f"Loaded our dataset: {len(df_our)} movies")

def norm_title(t):
    if not t or pd.isna(t):
        return ""
    t = re.sub(r"\s*\(\d{4}\)\s*$", "", str(t))
    t = re.sub(r"[^\w\s]", "", t.lower())
    return " ".join(t.split())

df_our['norm_title'] = df_our['title'].apply(norm_title)
our_titles_set = set(df_our['norm_title'].dropna())

# -------------------------------------------------------------
# 1. First Pass: 930k TMDB dataset (covers titles, posters, backdrops)
# -------------------------------------------------------------
p_930k = os.path.expanduser(r"~\.cache\kagglehub\datasets\asaniczka\tmdb-movies-dataset-2023-930k-movies\versions\1059\TMDB_movie_dataset_v11.csv")

tmdb_posters = {}
tmdb_backdrops = {}

if os.path.exists(p_930k):
    print(f"Reading 930k TMDB dataset from: {p_930k}")
    # Load only necessary columns
    chunksize = 150000
    for chunk in pd.read_csv(p_930k, usecols=['title', 'poster_path', 'backdrop_path', 'vote_count'], chunksize=chunksize, low_memory=False):
        # Quick pre-filter: keep only rows where title normalized is in our set
        chunk['norm_title'] = chunk['title'].apply(norm_title)
        matched = chunk[chunk['norm_title'].isin(our_titles_set)]
        
        for _, row in matched.iterrows():
            k = row['norm_title']
            vc = row.get('vote_count', 0)
            p = row['poster_path']
            b = row['backdrop_path']
            
            # Prioritize higher vote count if multiple entries exist
            if k not in tmdb_posters or tmdb_posters[k][1] < vc:
                if pd.notna(p) and str(p).strip() and str(p).strip() != 'nan':
                    tmdb_posters[k] = (str(p).strip(), vc)
            if k not in tmdb_backdrops or tmdb_backdrops[k][1] < vc:
                if pd.notna(b) and str(b).strip() and str(b).strip() != 'nan':
                    tmdb_backdrops[k] = (str(b).strip(), vc)

    print(f"Pass 1 matches: {len(tmdb_posters)} posters, {len(tmdb_backdrops)} backdrops")

# -------------------------------------------------------------
# 2. Second Pass: 45k TMDB dataset fallback
# -------------------------------------------------------------
p_45k = os.path.expanduser(r"~\.cache\kagglehub\datasets\rounakbanik\the-movies-dataset\versions\7\movies_metadata.csv")
if os.path.exists(p_45k):
    print("Reading 45k TMDB metadata fallback...")
    df_45k = pd.read_csv(p_45k, usecols=['title', 'poster_path', 'vote_count'], low_memory=False)
    df_45k = df_45k.dropna(subset=['title', 'poster_path'])
    df_45k['norm_title'] = df_45k['title'].apply(norm_title)
    matched_45k = df_45k[df_45k['norm_title'].isin(our_titles_set)]
    for _, row in matched_45k.iterrows():
        k = row['norm_title']
        p = str(row['poster_path']).strip()
        vc = row.get('vote_count', 0)
        if k not in tmdb_posters:
            tmdb_posters[k] = (p, vc)

print(f"Total resolved unique titles: {len(tmdb_posters)} posters, {len(tmdb_backdrops)} backdrops")

# -------------------------------------------------------------
# 3. Apply to our dataset
# -------------------------------------------------------------
updated_posters = 0
updated_backdrops = 0

for idx, row in df_our.iterrows():
    k = row['norm_title']
    
    # 1. Update poster
    if k in tmdb_posters:
        path = tmdb_posters[k][0]
        if not path.startswith("http"):
            path = "https://image.tmdb.org/t/p/w780" + (path if path.startswith("/") else "/" + path)
        df_our.at[idx, 'poster_path'] = path
        updated_posters += 1
        
    # 2. Update backdrop
    if k in tmdb_backdrops:
        path = tmdb_backdrops[k][0]
        if not path.startswith("http"):
            path = "https://image.tmdb.org/t/p/original" + (path if path.startswith("/") else "/" + path)
        df_our.at[idx, 'backdrop_path'] = path
        updated_backdrops += 1
    elif k in tmdb_posters:
        # If no dedicated backdrop found, use the high-res poster as backdrop rather than generic unsplash
        if 'unsplash.com' in str(row['backdrop_path']):
            path = tmdb_posters[k][0]
            if not path.startswith("http"):
                path = "https://image.tmdb.org/t/p/original" + (path if path.startswith("/") else "/" + path)
            df_our.at[idx, 'backdrop_path'] = path
            updated_backdrops += 1

# Clean up temp column
df_our = df_our.drop(columns=['norm_title'])

df_our.to_csv(DATA_PATH, index=False)
print("=" * 60)
print(f"ENRICHMENT COMPLETE!")
print(f"Total Movies: {len(df_our)}")
print(f"Movies with verified official TMDB Posters: {updated_posters} ({updated_posters/len(df_our)*100:.1f}%)")
print(f"Movies with verified official TMDB Backdrops: {updated_backdrops} ({updated_backdrops/len(df_our)*100:.1f}%)")
print("Saved to:", DATA_PATH)
print("=" * 60)
