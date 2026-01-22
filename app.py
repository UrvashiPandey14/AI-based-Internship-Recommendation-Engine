from flask import Flask, request, jsonify
from flask_cors import CORS
from recommender import (
    load_data,
    apply_filters,
    rank_jobs_by_skills
)

app = Flask(__name__)
CORS(app)


# Load dataset once when backend starts
df = load_data()


@app.route("/recommend", methods=["POST"])
def recommend():
    data = request.json

    user_skills = data.get("skills", "")
    filters = data.get("filters", {})
    preferred_category = filters.get("category")
    if not user_skills.strip():
        return jsonify({"error": "Skills are required"}), 400


    # Apply filters
    filtered_df = apply_filters(df, filters)

    if filtered_df.empty:
        return jsonify({"results": []})

    # Rank internships
    ranked_df = rank_jobs_by_skills(
        filtered_df,
        user_skills,
        preferred_category=preferred_category
    )

    # Prepare response
    results = []
    for _, row in ranked_df.head(5).iterrows():
        results.append({
            "job_title": row["job_title"],
            "job_location": row["job_location"],
            "category": row["category"],
            "job_type": row["job_type"],
            "score": round(row["final_score"], 2),
            "job_link": row["job_link"]
        })

    return jsonify({"results": results})


if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)
