import pandas as pd
import re
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


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
# Internship Categorization
# --------------------------------------------------

def categorize_internship(title):
    title = title.lower()
    if any(k in title for k in ['software', 'engineer', 'robot', 'hardware', 'technical']):
        return 'Tech'
    elif any(k in title for k in ['data', 'ai', 'ml', 'analytics']):
        return 'AI/Data'
    elif any(k in title for k in ['finance', 'bank', 'investment']):
        return 'Finance'
    elif any(k in title for k in ['marketing', 'sales', 'media']):
        return 'Marketing'
    elif any(k in title for k in ['management', 'operations', 'project']):
        return 'Management'
    elif any(k in title for k in ['nurse', 'medical', 'health']):
        return 'Healthcare'
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
# Data Loading
# --------------------------------------------------

def load_data():
    # Base directory of the project
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DATA_DIR = os.path.join(BASE_DIR, "data")

    # Load main job postings
    df = pd.read_csv(
        os.path.join(DATA_DIR, "linkedin_job_postings.csv"),
        nrows=50000
    )

    # Identify internship roles
    intern_mask = df['job_title'].str.contains(
        r'\bintern(?:ship)?\b',
        case=False,
        na=False
    )
    df = df[intern_mask].copy()

    # Categorize internships
    df['category'] = df['job_title'].apply(categorize_internship)

    # Detect work mode
    df['work_mode'] = df['job_location'].apply(detect_work_mode)

    # Load job summaries
    summary_df = pd.read_csv(
        os.path.join(DATA_DIR, "job_summary.csv"),
        nrows=100000
    )

    # Merge summaries
    df = df.merge(summary_df, on='job_link', how='left')

    # Clean summaries
    df = df.dropna(subset=['job_summary']).copy()
    df['clean_summary'] = df['job_summary'].apply(clean_text)

    return df



# --------------------------------------------------
# Ranking Logic (NLP + Boosts)
# --------------------------------------------------

def rank_jobs_by_skills(df, user_skills, preferred_category=None):
    user_text = clean_text(user_skills)
    user_skill_list = user_text.split()

    tfidf = TfidfVectorizer(stop_words="english", max_features=300)

    job_vectors = tfidf.fit_transform(df["clean_summary"])
    user_vector = tfidf.transform([user_text])

    similarity_scores = cosine_similarity(user_vector, job_vectors)[0]

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
    def title_boost(title):
        title = title.lower()
        return sum(1 for skill in user_skill_list if skill in title) * 0.15

    df["title_boost"] = df["job_title"].apply(title_boost)

    # Base score
    df["base_score"] = 0.05

    # Final score
    df["final_score"] = (
        df["base_score"]
        + df["similarity_score"]
        + df["category_boost"]
        + df["title_boost"]
    )

    return df.sort_values("final_score", ascending=False)
