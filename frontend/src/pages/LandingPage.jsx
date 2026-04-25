import { useNavigate } from "react-router-dom";
import "./landing.css";
import { Link } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* NAVBAR */}
      <nav className="navbar-new">
        <div className="logo">EligiBilio</div>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/signup">Student Login</Link>
          <Link to="/admin/login">Admin Login</Link>
        </div>
        <button className="contact-btn">Contact us</button>
      </nav>

      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Leading educational platforms available online</h1>
          <p>
            AI-powered LMS platform with smart lessons, PDFs, and real-time
            progress tracking.
          </p>
          <button
            className="get-started-btn"
            onClick={() => navigate("/signup")}
          >
            Get started
          </button>

          <div className="stats-row">
            <div>
              <strong>270+</strong> <p>Courses</p>
            </div>
            <div>
              <strong>5550+</strong> <p>Students</p>
            </div>
            <div>
              <strong>330+</strong> <p>Instructors</p>
            </div>
          </div>
        </div>

        <div className="hero-image-container">
          {/* Yahan aap apni image lagayenge jo laptop wali ladki hai */}
          <div className="floating-icons">✨ 🚀 🎓</div>
        </div>
      </section>

      {/* TRUSTED BY LOGOS */}
      <div className="brands-bar">
        <span>Google</span>
        <span>Trello</span>
        <span>monday.com</span>
        <span>Notion</span>
        <span>slack</span>
      </div>

      {/* HOW IT WORKS SECTION */}
      <section className="steps-section">
        <h2>Your Online Learning Journey Made Easy</h2>
        <div className="steps-grid">
          <div className="step-card">
            <span className="step-num">01</span>
            <h3>Choose Your Course</h3>
            <p>Select from our wide range of AI-powered courses.</p>
          </div>
          <div className="step-card">
            <span className="step-num">02</span>
            <h3>Sign Up and Pay</h3>
            <p>Easy enrollment process with secure payment.</p>
          </div>
          <div className="step-card">
            <span className="step-num">03</span>
            <h3>Learn and Engage</h3>
            <p>Start your journey with interactive lessons.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
