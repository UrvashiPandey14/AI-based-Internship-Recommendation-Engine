import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="container text-center mt-5">
      <h1 className="fw-bold">
        AI-Based Internship Recommendation Engine
      </h1>

      <p className="text-muted mt-3">
        Get personalized internship recommendations based on your skills and interests
      </p>

      {/* Get Started Button */}
      <button
        className="btn btn-primary btn-lg mt-4"
        data-bs-toggle="modal"
        data-bs-target="#authModal"
      >
        Get Started
      </button>

      {/* Feature Cards */}
      <div className="row mt-5">
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm p-3">
            <h5>Skill Based</h5>
            <p className="text-muted">
              Recommendations based on your technical skills
            </p>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card shadow-sm p-3">
            <h5>AI Powered</h5>
            <p className="text-muted">
              Intelligent matching using machine learning
            </p>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card shadow-sm p-3">
            <h5>Career Focused</h5>
            <p className="text-muted">
              Helps students choose the right career path
            </p>
          </div>
        </div>
      </div>

      {/* Modal */}
      <div
        className="modal fade"
        id="authModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4 shadow">
            <div className="modal-header border-0">
              <h5 className="modal-title fw-bold">Get Started</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body text-center">
              <p className="text-muted">Choose an option to continue</p>

              <div className="d-grid gap-3 mt-4">
                <button
                  className="btn btn-success btn-lg w-100"
                  data-bs-dismiss="modal"
                  onClick={() => navigate("/register")}
                >
                  New User? Register
                </button>

                <button
                  className="btn btn-primary btn-lg w-100"
                  data-bs-dismiss="modal"
                  onClick={() => navigate("/login")}
                >
                  Already Registered? Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
