import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

function ProfileView() {
    const [profile, setProfile] = useState({});
    const email = localStorage.getItem("email");
    const navigate = useNavigate();
    const skillMap = {
        ml: "Machine Learning",
        ai: "Artificial Intelligence",
        data: "Data Science",
        cloud: "Cloud Computing",
        web: "Web Development",
        android: "Android Development",
        react: "React",
        python: "Python",
        java: "Java",
        node: "Node.js",
        sql: "SQL",
        html: "HTML",
        css: "CSS"
    };

    useEffect(() => {
        if (!email) return;

        api.get(`/profile/${email}`)
            .then((res) => {
                console.log("PROFILE DATA:", res.data);
                setProfile(res.data);
            })
            .catch((err) => console.log(err));
    }, [email]);

    return (
        <div className="container mt-5" style={{ maxWidth: "600px" }}>
            <h3 className="text-center mb-4">My Profile</h3>

            <div className="card p-4 shadow position-relative">
                <button
                    className="btn btn-outline-primary btn-sm position-absolute"
                    style={{ top: "15px", right: "15px" }}
                    onClick={() => navigate("/profile")}
                >
                    Edit
                </button>

                <div className="d-flex align-items-start gap-4"></div>
                <img
                    src={
                        profile.profile_pic
                            ? `http://127.0.0.1:5000/${profile.profile_pic}`
                            : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                    }
                    alt="profile"
                    width="120"
                    height="120"
                    className="rounded-3 shadow-sm"
                    style={{ objectFit: "cover" }}
                />

                <p><b>Name:</b> {profile.name}</p>
                <p><b>College:</b> {profile.college}</p>
                <p><b>Branch:</b> {profile.branch}</p>
                <p>
                    <b>Skills:</b>{" "}
                    {profile.skills?.split(",").map((s) =>
                        skillMap[s] || s.charAt(0).toUpperCase() + s.slice(1)).join(", ")}
                </p>

                <p>
                    <b>Interests:</b>{" "}
                    {profile.interests?.split(",").map((i) =>
                        skillMap[i] || i.charAt(0).toUpperCase() + i.slice(1)).join(", ")}
                </p>

                {profile.resume && (
                    <a
                        href={`http://127.0.0.1:5000/${profile.resume}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline-secondary btn-sm mt-3"
                    >
                        View Resume
                    </a>
                )}
            </div>
        </div>
    );
}

export default ProfileView;