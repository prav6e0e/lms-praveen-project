import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./createplan.css";

function CreatePlan() {
  const [days, setDays] = useState("");
  const [hours, setHours] = useState("");
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/courses", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setData(res.data);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setMessage("❌ Failed to load courses. Please try again.");
      setLoading(false);
    }
  };

  const handleSelect = (id) => {
    setSelectedCourses((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const validateForm = () => {
    const newErrors = {};

    if (!days || days <= 0) {
      newErrors.days = "Please enter a valid number of days (greater than 0)";
    } else if (days > 365) {
      newErrors.days = "Plan duration cannot exceed 365 days";
    }

    if (!hours || hours <= 0) {
      newErrors.hours = "Please enter valid daily study hours (greater than 0)";
    } else if (hours > 24) {
      newErrors.hours = "Daily hours cannot exceed 24";
    }

    if (selectedCourses.length === 0) {
      newErrors.courses = "Please select at least one course";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createPlan = async () => {
    if (!validateForm()) {
      return;
    }

    setCreating(true);
    setMessage("");

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/planner/create",
        {
          total_days: parseInt(days),
          daily_hours: parseInt(hours),
          course_ids: selectedCourses,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      localStorage.setItem("plannerId", res.data.planner_id);
      setMessage("✅ Plan created successfully! Redirecting...");

      setTimeout(() => {
        navigate(`/planner/${res.data.planner_id}`);
      }, 1500);
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail ||
        err.message ||
        "Failed to create plan. Please try again.";
      setMessage(`❌ ${errorMsg}`);
      console.error("Plan creation error:", err);
      setCreating(false);
    }
  };

  return (
    <div className="createplan-container">
      <div className="createplan-wrapper">
        {/* HEADER */}
        <div className="createplan-header">
          <h1>🎯 Create Your Study Plan</h1>
          <p>
            Customize your learning journey by selecting courses, duration, and
            daily study hours
          </p>
        </div>

        {/* MESSAGE */}
        {message && (
          <div
            className={
              message.startsWith("✅") ? "success-message" : "error-message"
            }
          >
            {message}
          </div>
        )}

        {/* FORM SECTION */}
        <div className="form-section">
          <h3 className="form-title">📋 Plan Details</h3>

          <div className="form-grid">
            {/* Days Input */}
            <div className="form-group">
              <label htmlFor="days">📅 Total Days</label>
              <input
                id="days"
                type="number"
                placeholder="e.g., 30"
                value={days}
                onChange={(e) => {
                  setDays(e.target.value);
                  if (errors.days) {
                    setErrors({ ...errors, days: "" });
                  }
                }}
                disabled={creating}
                min="1"
                max="365"
              />
              {errors.days && <div className="input-error">{errors.days}</div>}
              <div className="input-info">
                💡 How many days do you have to complete this plan?
              </div>
            </div>

            {/* Hours Input */}
            <div className="form-group">
              <label htmlFor="hours">⏰ Daily Study Hours</label>
              <input
                id="hours"
                type="number"
                placeholder="e.g., 2"
                value={hours}
                onChange={(e) => {
                  setHours(e.target.value);
                  if (errors.hours) {
                    setErrors({ ...errors, hours: "" });
                  }
                }}
                disabled={creating}
                min="1"
                max="24"
              />
              {errors.hours && (
                <div className="input-error">{errors.hours}</div>
              )}
              <div className="input-info">
                💡 How many hours per day can you dedicate?
              </div>
            </div>
          </div>

          {/* SELECTION SUMMARY */}
          {(days || hours || selectedCourses.length > 0) && (
            <div className="selection-summary">
              <div>
                <span className="summary-item">
                  ✓ <strong>{days || "0"}</strong> days
                </span>
                <span style={{ marginLeft: "20px" }} className="summary-item">
                  ✓ <strong>{hours || "0"}</strong> hours/day
                </span>
                <span style={{ marginLeft: "20px" }} className="summary-item">
                  ✓ <strong>{selectedCourses.length}</strong> courses selected
                </span>
              </div>
            </div>
          )}
        </div>

        {/* COURSES SECTION */}
        <div className="courses-section">
          <h3 className="courses-title">📚 Select Courses</h3>

          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading courses...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="empty-state">
              <p>📭 No courses available yet</p>
              <p style={{ marginTop: "10px", fontSize: "0.9rem" }}>
                Ask your instructor to add courses to get started
              </p>
            </div>
          ) : (
            <div className="courses-grid">
              {data.map((course) => (
                <div
                  key={course.id}
                  className={`course-card ${
                    selectedCourses.includes(course.id) ? "selected" : ""
                  }`}
                  onClick={() => handleSelect(course.id)}
                >
                  <input
                    type="checkbox"
                    className="course-checkbox"
                    checked={selectedCourses.includes(course.id)}
                    onChange={() => handleSelect(course.id)}
                    disabled={creating}
                  />
                  <div className="course-content">
                    <div className="course-name">{course.name}</div>
                    <div className="course-description">
                      {course.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {errors.courses && (
            <div
              className="input-error"
              style={{
                marginTop: "15px",
                padding: "10px 15px",
                background: "rgba(239, 68, 68, 0.1)",
                borderRadius: "8px",
              }}
            >
              {errors.courses}
            </div>
          )}
        </div>

        {/* BUTTONS */}
        <div className="button-section">
          <button
            className="cancel-btn"
            onClick={() => navigate("/dashboard")}
            disabled={creating}
          >
            ← Go Back
          </button>
          <button
            className="generate-btn"
            onClick={createPlan}
            disabled={
              creating || !days || !hours || selectedCourses.length === 0
            }
          >
            {creating ? (
              <>
                <span
                  className="loading-spinner"
                  style={{
                    width: "16px",
                    height: "16px",
                    margin: "0 8px 0 0",
                    verticalAlign: "middle",
                  }}
                ></span>
                Creating Plan...
              </>
            ) : (
              "Generate Plan 🚀"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreatePlan;
