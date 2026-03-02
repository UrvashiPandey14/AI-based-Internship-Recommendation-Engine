import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/authService";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(formData.email)) {
    alert("Enter valid email (example@gmail.com)");
    return;
  }

  if (formData.password.length < 6) {
    alert("Password must be at least 6 characters");
    return;
  }

  try {
    await registerUser(formData);
    alert("Registration successful!");
    navigate("/login");
  } catch (err) {
    alert(err.response?.data?.error || "Registration failed");
  }
};


  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      <div className="card p-4 shadow" style={{ width: "400px" }}>
        <h3 className="text-center fw-bold mb-3">Register</h3>

        <form onSubmit={handleSubmit}>
          <input
            className="form-control mb-3"
            placeholder="Full Name"
            name="name"
            onChange={handleChange}
            required
          />

          <input
            className="form-control mb-3"
            placeholder="Email"
            type="email"
            name="email"
            onChange={handleChange}
            required
          />

          <input
            className="form-control mb-3"
            placeholder="Password"
            type="password"
            name="password"
            onChange={handleChange}
            required
          />

          <button className="btn btn-primary w-100">
            Register
          </button>
        </form>

        <p className="text-center mt-3">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
