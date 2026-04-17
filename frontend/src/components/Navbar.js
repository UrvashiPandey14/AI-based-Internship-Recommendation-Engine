import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "../pages/ThemeToggle";
import { ProfileContext } from "../pages/ProfileContext";
import api from "../services/api";
import { useEffect } from "react";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const { theme, toggleTheme } = useContext(ThemeContext);  
  const { profilePic, setProfilePic } = useContext(ProfileContext);
  const email = localStorage.getItem("email");
   useEffect(() => {
    if (!email) return;

    api.get(`/profile/${email}`)
      .then((res) => {
        if (res.data.profile_pic) {
          const img = `http://127.0.0.1:5000/${res.data.profile_pic}`;
          setProfilePic(img);
        }
      })
      .catch(() => console.log("Error loading profile pic"));
  }, [email, setProfilePic]);
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("profilePic");
    navigate("/login");
  };

  return (
    <nav
      className={`navbar navbar-expand-lg fixed-top px-4 shadow-sm ${
        theme === "dark" ? "navbar-dark bg-dark" : "navbar-dark bg-primary"
      }`}
    >
      <Link className="navbar-brand fw-bold" to="/">
        InternAI
      </Link>

      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navContent"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navContent">
        <ul className="navbar-nav ms-auto align-items-center">

          {/* 🌙 THEME TOGGLE */}
          <li className="nav-item me-3">
            <button
              className={`btn btn-sm ${
                theme === "dark" ? "btn-light" : "btn-outline-light"
              }`}
              onClick={toggleTheme}
            >
              {theme === "light" ? "🌙 Dark" : "☀ Light"}
            </button>
          </li>

          {token && (
            <>
              <li className="nav-item">
                <Link className="nav-link" to="/dashboard">
                  Dashboard
                </Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/recommend">
                  Get Recommendation
                </Link>
              </li>

              {/* 👤 PROFILE PIC */}
              <li className="nav-item ms-3">
                <img
                  src={
                    profilePic ||
                    "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                  }
                  alt="profile"
                  width="38"
                  height="38"
                  className="rounded-circle border"
                  style={{ cursor: "pointer", objectFit: "cover" }}
                  onClick={() => navigate("/profile/view")}
                />
              </li>

              <li className="nav-item">
                <button
                  className="btn btn-outline-light ms-3"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
