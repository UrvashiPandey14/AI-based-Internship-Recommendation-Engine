import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  const email = localStorage.getItem("email");

  useEffect(() => {
    if (email) {
      api
        .get(`/profile/${email}`)
        .then((res) => setProfile(res.data))
        .catch(() => console.log("Profile not found"));
    }
  }, [email]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    navigate("/login");
  };

  return (
    <div className="container mt-5 text-center">
      <h2 className="fw-bold">Welcome to InternAI Dashboard 🎯</h2>

      {profile && (
        <div className="alert alert-success mt-3">
          <strong>{profile.name}</strong> — {profile.branch} @ {profile.college}
        </div>
      )}

      <div className="row mt-5">
        <div className="col-md-4 mb-3">
          <div
            className="card p-4 shadow-sm h-100"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/recommend")}
          >
            <h5>🎯 Get Recommendations</h5>
            <p className="text-muted">
              Find best internships for your skills
            </p>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div
            className="card p-4 shadow-sm h-100"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/profile")}
          >
            <h5>👤 Profile</h5>
            <p className="text-muted">
              View / Edit your profile
            </p>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div
            className="card p-4 shadow-sm h-100"
            style={{ cursor: "pointer" }}
            onClick={handleLogout}
          >
            <h5>🚪 Logout</h5>
            <p className="text-muted">
              Exit your account safely
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
