import { useState, useEffect } from "react";
import api from "../services/api";
import Select from "react-select";

const skillOptions = [
  { value: "react", label: "React" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "node", label: "Node.js" },
  { value: "ml", label: "Machine Learning" },
  { value: "sql", label: "SQL" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
];

const interestOptions = [
  { value: "web", label: "Web Development" },
  { value: "ai", label: "Artificial Intelligence" },
  { value: "data", label: "Data Science" },
  { value: "android", label: "Android Development" },
  { value: "cloud", label: "Cloud Computing" },
];

function Profile() {
  const [email, setEmail] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    college: "",
    branch: "",
    skills: "",
    interests: "",
  });

  const [resume, setResume] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(
    localStorage.getItem("profilePic")
  );

  useEffect(() => {
    const e = localStorage.getItem("email");
    if (e) setEmail(e);
  }, []);

  useEffect(() => {
    if (!email) return;

    api.get(`/profile/${email}`)
      .then((res) => {
        setFormData({
          name: res.data.name || "",
          college: res.data.college || "",
          branch: res.data.branch || "",
          skills: res.data.skills || "",
          interests: res.data.interests || "",
        });

        if (res.data.profile_pic) {
          const img = `http://127.0.0.1:5000/${res.data.profile_pic}`;
          setPreview(img);
          localStorage.setItem("profilePic", img);
        }
      })
      .catch((err) => console.log("Profile fetch error:", err));
  }, [email]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("email", email);

    Object.entries(formData).forEach(([key, value]) =>
      data.append(key, value)
    );

    if (resume) data.append("resume", resume);
    if (profilePic) data.append("profile_pic", profilePic);

    try {
      const res = await api.post("/profile", data);

      if (res.data.profile_pic) {
        const img = `http://127.0.0.1:5000/${res.data.profile_pic}`;
        localStorage.setItem("profilePic", img);
        setPreview(img);
      }

      alert("Profile updated successfully!");
    } catch (err) {
      alert("Profile save failed");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "650px" }}>
      <h3 className="fw-bold text-center mb-4">Student Profile</h3>

      <form onSubmit={handleSubmit} className="card p-4 shadow">

        <div className="text-center mb-3">
          <img
            src={
              preview ||
              "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            }
            alt="profile"
            width="110"
            height="110"
            className="rounded-circle border"
            style={{ objectFit: "cover" }}
          />
        </div>

        <input
          type="file"
          className="form-control mb-3"
          onChange={(e) => {
            const file = e.target.files[0];
            setProfilePic(file);
            setPreview(URL.createObjectURL(file));
          }}
          accept="image/*"
        />

        <input
          className="form-control mb-3"
          placeholder="Full Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          className="form-control mb-3"
          placeholder="College Name"
          name="college"
          value={formData.college}
          onChange={handleChange}
          required
        />

        <input
          className="form-control mb-3"
          placeholder="Branch"
          name="branch"
          value={formData.branch}
          onChange={handleChange}
          required
        />

        <Select
          options={skillOptions}
          isMulti
          placeholder="Select Skills"
          className="mb-3"
          value={skillOptions.filter((s) =>
            formData.skills.split(",").includes(s.value)
          )}
          onChange={(selected) =>
            setFormData({
              ...formData,
              skills: selected.map((s) => s.value).join(","),
            })
          }
        />

        <Select
          options={interestOptions}
          isMulti
          placeholder="Select Interests"
          className="mb-3"
          value={interestOptions.filter((i) =>
            formData.interests.split(",").includes(i.value)
          )}
          onChange={(selected) =>
            setFormData({
              ...formData,
              interests: selected.map((s) => s.value).join(","),
            })
          }
        />

        <label className="fw-semibold mb-1">Upload Resume</label>
        <input
          type="file"
          className="form-control mb-3"
          onChange={(e) => setResume(e.target.files[0])}
          accept=".pdf,.doc,.docx"
        />

        <button className="btn btn-primary w-100">
          Save Profile
        </button>
      </form>
    </div>
  );
}

export default Profile;
