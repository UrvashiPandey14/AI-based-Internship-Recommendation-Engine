import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Recommend() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    skills: "",
    category: "",
    type: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:5000/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skills: formData.skills,
          filters: {
            category: formData.category,
            job_type: formData.type,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch recommendations");
      }

      const data = await response.json();

      navigate("/results", {
        state: data.results,
      });

    } catch (err) {
      console.error(err);
      setError("Unable to fetch recommendations. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "600px" }}>
      <h2 className="text-center fw-bold mb-2">
        Get Internship Recommendations
      </h2>

      <form onSubmit={handleSubmit} className="card p-4 shadow-sm">

        <div className="mb-3">
          <label className="form-label">Skills</label>
          <input
            type="text"
            name="skills"
            className="form-control"
            placeholder="e.g. python, ml, react"
            value={formData.skills}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Category</label>
          <select
            name="category"
            className="form-select"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select category</option>
            <option value="Tech">Tech</option>
            <option value="AI/Data">AI / Data</option>
            <option value="Finance">Finance</option>
            <option value="Marketing">Marketing</option>
            <option value="Management">Management</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Internship Type</label>
          <select
            name="type"
            className="form-select"
            value={formData.type}
            onChange={handleChange}
            required
          >
            <option value="">Select type</option>
            <option value="Remote">Remote</option>
            <option value="Onsite">Onsite</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>

        {error && (
          <div className="alert alert-danger py-2">{error}</div>
        )}

        <button
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading ? "Fetching..." : "Get Recommendations"}
        </button>

      </form>
    </div>
  );
}

export default Recommend;
