import pandas as pd
import re
import os
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# Load model once (VERY IMPORTANT)
model = SentenceTransformer('all-MiniLM-L6-v2')


# --------------------------------------------------
# Text Cleaning
# --------------------------------------------------

def clean_text(text):
    if pd.isna(text):
        return ""
    text = text.lower()
    text = re.sub(r'\n', ' ', text)
    text = re.sub(r'[^a-zA-Z0-9 ]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


# --------------------------------------------------
# Improved Categorization
# --------------------------------------------------

def categorize_internship(title):
    title = title.lower()

    if any(k in title for k in [
        'software', 'engineer', 'developer', 'frontend', 'backend',
        'full stack', 'web', 'react', 'node', 'python', 'java',
        'cloud', 'devops', 'aws'
    ]):
        return 'Tech'

    elif any(k in title for k in ['data', 'ai', 'ml', 'analytics']):
        return 'AI/Data'

    elif any(k in title for k in ['finance', 'bank', 'investment']):
        return 'Finance'

    elif any(k in title for k in ['marketing', 'sales', 'media']):
        return 'Marketing'

    else:
        return 'Other'


# --------------------------------------------------
# Work Mode Detection
# --------------------------------------------------

def detect_work_mode(location):
    if pd.isna(location):
        return 'Onsite'

    location = location.lower()
    if any(k in location for k in ['remote', 'work from home', 'wfh']):
        return 'Remote'
    elif 'hybrid' in location:
        return 'Hybrid'
    else:
        return 'Onsite'


# --------------------------------------------------
# Filters
# --------------------------------------------------

def apply_filters(df, user_filters):
    filtered_df = df.copy()

    if user_filters.get('category'):
        filtered_df = filtered_df[filtered_df['category'] == user_filters['category']]

    if user_filters.get('job_type'):
        filtered_df = filtered_df[filtered_df['job_type'] == user_filters['job_type']]

    if user_filters.get('work_mode'):
        filtered_df = filtered_df[filtered_df['work_mode'] == user_filters['work_mode']]

    if user_filters.get('location'):
        location = user_filters['location'].lower()
        filtered_df = filtered_df[
            filtered_df['job_location'].str.lower().str.contains(location, na=False)
        ]

    return filtered_df


# --------------------------------------------------
# Data Loading (FIXED + OPTIMIZED)
# --------------------------------------------------

def load_data():
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DATA_DIR = os.path.join(BASE_DIR, "data")

    # Load main dataset (limit size for speed)
    df = pd.read_csv(
        os.path.join(DATA_DIR, "linkedin_job_postings.csv"),
        nrows=50000
    )

    # 🔥 REMOVED strict intern filter (IMPORTANT FIX)

    # Categorization
    df['category'] = df['job_title'].apply(categorize_internship)

    # Keep only relevant tech jobs (optional but recommended)
    df = df[df['category'].isin(['Tech', 'AI/Data'])]

    # Work mode
    df['work_mode'] = df['job_location'].apply(detect_work_mode)

    # Load summaries
    summary_df = pd.read_csv(
        os.path.join(DATA_DIR, "job_summary.csv"),
        nrows=100000
    )

    # Merge
    df = df.merge(summary_df, on='job_link', how='left')

    # 🔥 FIX: don't drop rows
    df['job_summary'] = df['job_summary'].fillna('')

    # Clean text
    df['clean_summary'] = df['job_summary'].apply(clean_text)

    # Combine text (VERY IMPORTANT)
    df['text'] = df['job_title'] + " " + df['clean_summary']

    # Reduce size for speed
    sample_size = min(5000, len(df))
    df = df.sample(n=sample_size, random_state=42)

    # 🔥 Precompute embeddings (MAJOR SPEED BOOST)
    embeddings = model.encode(df['text'].tolist(), show_progress_bar=True)
    df['embedding'] = list(embeddings)
    return df


# --------------------------------------------------
# Ranking (Sentence Transformer Based)
# --------------------------------------------------

def rank_jobs_by_skills(df, user_skills, preferred_category=None):

    user_text = clean_text(user_skills)

    # Encode user input
    user_embedding = model.encode([user_text])

    # Use precomputed embeddings
    job_embeddings = list(df['embedding'])

    # Similarity
    similarity_scores = cosine_similarity(user_embedding, job_embeddings)[0]

    df = df.copy()
    df["similarity_score"] = similarity_scores

    # Category boost
    if preferred_category:
        df["category_boost"] = (
            df["category"] == preferred_category
        ).astype(int) * 0.3
    else:
        df["category_boost"] = 0.0

    # Title keyword boost
    user_skill_list = user_text.split()

    def title_boost(title):
        return sum(1 for skill in user_skill_list if skill in title.lower()) * 0.15

    df["title_boost"] = df["job_title"].apply(title_boost)

    # Final score
    df["final_score"] = (
        df["similarity_score"]
        + df["category_boost"]
        + df["title_boost"]
    )

    return df.sort_values("final_score", ascending=False)