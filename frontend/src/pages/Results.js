import { useLocation } from "react-router-dom";

function Results() {
  const { state } = useLocation();

  if (!state || state.length === 0) {
    return (
      <h4 className="text-center mt-5">
        No internships found 😕
      </h4>
    );
  }

  return (
    <div className="container mt-5">
      <h2 className="fw-bold mb-4">
        Recommended Internships
      </h2>

      {state.map((job, index) => (
        <div key={index} className="card p-4 shadow-sm mb-3">
          <h5 className="fw-bold">{job.job_title}</h5>

          <p className="mb-1">
            📍 <strong>Location:</strong> {job.job_location}
          </p>

          <p className="mb-1">
            🏷 <strong>Category:</strong> {job.category}
          </p>

          <p className="mb-1">
            💼 <strong>Type:</strong> {job.job_type}
          </p>

          <p className="fw-bold text-success">
            Match Score: {job.score}%
          </p>

          <a
            href={job.job_link}
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline-primary"
          >
            Apply Now
          </a>
        </div>
      ))}
    </div>
  );
}

export default Results;
