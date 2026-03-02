from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import re
import os
from flask import send_from_directory
from flask_bcrypt import Bcrypt
from werkzeug.utils import secure_filename
from recommender import (
    load_data,
    apply_filters,
    rank_jobs_by_skills
)

app = Flask(__name__)
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# Proper CORS configuration for React frontend
CORS(
    app,
    resources={r"/*": {"origins": "http://localhost:3000"}},
    supports_credentials=True
)

bcrypt = Bcrypt(app)



# Load dataset once when backend starts
def init_db():
    conn = sqlite3.connect("users.db")
    c = conn.cursor()
#Users table
    c.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT
        )
    """)
#Profiles table
    c.execute("""
        CREATE TABLE IF NOT EXISTS profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE,
            name TEXT,
            college TEXT,
            branch TEXT,
            skills TEXT,
            interests TEXT,
            resume TEXT,
            profile_pic TEXT
        )
    """)
    conn.commit()
    conn.close()

init_db()

df = load_data()


# ---------------- AUTH ROUTES ---------------- #

@app.route("/register", methods=["POST"])
def register():
    data = request.json

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"error": "All fields required"}), 400

    email = email.lower()

    email_regex = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    if not re.match(email_regex, email):
        return jsonify({"error": "Invalid email format"}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400


    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

    try:
        conn = sqlite3.connect("users.db")
        c = conn.cursor()
        c.execute(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            (name, email, hashed_password)
        )
        conn.commit()
        conn.close()

        return jsonify({"message": "Registration successful"}), 200

    except sqlite3.IntegrityError:
        return jsonify({"error": "User already exists"}), 409


# --------------------- LOGIN ROUTES ----------------------------------------- #

@app.route("/login", methods=["POST"])
def login():
    data = request.json

    email = data.get("email").lower()
    password = data.get("password")

    conn = sqlite3.connect("users.db")
    c = conn.cursor()
    c.execute("SELECT password FROM users WHERE email = ?", (email,))
    user = c.fetchone()
    conn.close()

    if not user:
        return jsonify({"error": "User not found"}), 404

    if not bcrypt.check_password_hash(user[0], password):
        return jsonify({"error": "Invalid password"}), 401

    return jsonify({"message": "Login successful"}), 200

# -------------------- PROFILE ROUTE -------------------------------- #

@app.route("/profile", methods=["POST"])
def save_profile():
    email = request.form.get("email")
    name = request.form.get("name")
    college = request.form.get("college")
    branch = request.form.get("branch")
    skills = request.form.get("skills")
    interests = request.form.get("interests")

    resume_file = request.files.get("resume")
    profile_pic = request.files.get("profile_pic")

    resume_path = None
    profile_pic_path = None

    if resume_file:
        resume_filename = f"{email}_resume_{secure_filename(resume_file.filename)}"
        resume_path = os.path.join(app.config["UPLOAD_FOLDER"], resume_filename)
        resume_file.save(resume_path)

    if profile_pic:
        pic_filename = f"{email}_profile_{secure_filename(profile_pic.filename)}"
        profile_pic_path = os.path.join(app.config["UPLOAD_FOLDER"], pic_filename)
        profile_pic.save(profile_pic_path)

    conn = sqlite3.connect("users.db")
    c = conn.cursor()

    c.execute("""
        INSERT INTO profiles (email, name, college, branch, skills, interests, resume, profile_pic)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(email) DO UPDATE SET
            name=excluded.name,
            college=excluded.college,
            branch=excluded.branch,
            skills=excluded.skills,
            interests=excluded.interests,
            resume=excluded.resume,
            profile_pic=excluded.profile_pic
    """, (email, name, college, branch, skills, interests, resume_path, profile_pic_path))

    conn.commit()
    conn.close()

    return jsonify({"message": "Profile saved successfully", "profile_pic": profile_pic_path}), 200
    
# ---------------------- PROFILE PIC UPLOAD ROUTE ----------------------  #

@app.route('/uploads/<path:filename>')
def serve_upload(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

# ---------------- GET PROFILE ROUTE -------------------- #

@app.route("/profile/<email>", methods=["GET"])
def get_profile(email):
    conn = sqlite3.connect("users.db")
    c = conn.cursor()

    c.execute("""
        SELECT name, college, branch, skills, interests, resume, profile_pic
        FROM profiles WHERE email = ?
    """, (email,))

    row = c.fetchone()
    conn.close()

    if not row:
        return jsonify({"error": "Profile not found"}), 404

    return jsonify({
        "name": row[0],
        "college": row[1],
        "branch": row[2],
        "skills": row[3],
        "interests": row[4],
        "resume": row[5],
        "profile_pic": row[6]
    })

# ---------------- RECOMMENDATION ROUTE ---------------- #

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


# ---------------- MAIN ---------------- #

if __name__ == "__main__":
    app.run(debug=True, port=5000, use_reloader=False)
