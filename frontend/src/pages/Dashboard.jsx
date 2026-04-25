import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import "./dashboard.css";
import RaiseDoubt from "./RaiseDoubt";
import RaiseGrievance from "./RaiseGrievance";
import RecieveNotification from "./RecieveNotification";

function Dashboard() {
  const [activePlans, setActivePlans] = useState([]);
  const [trackedPlans, setTrackedPlans] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);
  const [revisions, setRevisions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [mainView, setMainView] = useState(null);
  const [viewPlans, setViewPlans] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchActivePlans();
    fetchTrackedPlans();
    fetchTodayTasks();
    fetchRevisions();
    fetchCourses();
  }, []);

  const fetchActivePlans = async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/planner/user/1/active",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      setActivePlans(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchTrackedPlans = async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/planner/user/1/tracked",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      setTrackedPlans(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchDashboard = async () => {
    const res = await axios.get("http://127.0.0.1:8000/dashboard/", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    setData(res.data);
  };

  // 🔥 Today Tasks
  const fetchTodayTasks = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/today", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setTodayTasks(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // 🔥 Revision Alerts
  const fetchRevisions = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/revisions/today", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setRevisions(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // 🔥 Fetch Courses
  const fetchCourses = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/courses/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setCourses(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const continueLearning = () => {
    navigate("/dashboard?tab=active-plans");
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  // _____________________________________________________RETURN__________________________________________________
  // _____________________________________________________RETURN__________________________________________________
  // _____________________________________________________RETURN__________________________________________________

  return (
    <div
      className="dashboard-container"
      style={{ display: "flex", minHeight: "100vh" }}
    >
      {/* 🔥 LEFT SIDEBAR (Top to Bottom Approach) */}
      <div
        className="sidebar"
        style={{
          width: "250px",
          borderRight: "1px solid #2d6a5a",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <h2 style={{ marginBottom: "20px" }}>📊 My Dashboard</h2>
{/* __________________________________________________________________________________________________ */}
{/* __________________________________________________________________________________________________ */}

        <button
          className={`nav-btn ${mainView === "courses" ? "active" : ""}`}
          onClick={() => setMainView(mainView === "courses" ? null : "courses")}
        >
          📚 Courses
        </button>

        <button
          className={`nav-btn ${mainView === "plans" ? "active" : ""}`}
          onClick={() => setMainView(mainView === "plans" ? null : "plans")}
        >
          📋 Plans
        </button>

        <button
          className={`nav-btn ${mainView === "performance" ? "active" : ""}`}
          onClick={() =>
            setMainView(mainView === "performance" ? null : "performance")
          }
        >
          📈 Performance
        </button>

        <button
          className={`nav-btn ${mainView === "grievance" ? "active" : ""}`}
          onClick={() =>
            setMainView(mainView === "grievance" ? null : "grievance")
          }
        >
          ⚖️ Grievances
        </button>

        <button
          className={`nav-btn ${mainView === "doubts" ? "active" : ""}`}
          onClick={() => setMainView(mainView === "doubts" ? null : "doubts")}
        >
          ❓ Doubts
        </button>

        <button
          className={`nav-btn ${mainView === "notifications" ? "active" : ""}`}
          onClick={() =>
            setMainView(mainView === "notifications" ? null : "notifications")
          }
        >
          🔔 Notifications
        </button>


        {/* Logout button at bottom if needed */}
        <div style={{ marginTop: "auto" }}>
          <button className="logout" onClick={logout} style={{ width: "100%" }}>
            Logout ❌
          </button>
        </div>
      </div>
{/* _________________________________________________________________________________________________________ */}
{/* _________________________________________________________________________________________________________ */}

      {/* 🔥 RIGHT CONTENT AREA */}
      <div
        className="main-content"
        style={{ flex: 1, padding: "20px", overflowY: "auto" }}
      >
        {/* NAVBAR (TOP) */}
        <div
          className="dashboard-navbar"
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "20px",
          }}
        >
          <div className="navbar-buttons">
            <button onClick={() => navigate("/create-plan")}>
              Generate Plan 🚀
            </button>
          </div>
        </div>
{/* ____________________________________________________________________________________________________ */}
{/* ____________________________________________________________________________________________________ */}
        {/* PERFORMANCE STATS (Always visible at top of content)
        <div className="dashboard-section">
          <h3 className="section-title">📈 Your Performance Overview</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">🚀 Active Plans</div>
              <div className="stat-value">{activePlans.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">✅ Completed Plans</div>
              <div className="stat-value">{trackedPlans.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">📚 Total Plans</div>
              <div className="stat-value">
                {activePlans.length + trackedPlans.length}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">🎯 Overall Progress</div>
              <div className="stat-value">
                {trackedPlans.length}/{activePlans.length + trackedPlans.length}
              </div>
            </div>
          </div>
        </div> */}
{/* ______________________________________________________________________________________________________ */}
{/* ______________________________________________________________________________________________________ */}
        {/* 🔥 CONDITIONAL VIEWS (Based on Sidebar Selection) */}

        {/* COURSES VIEW */}
        {mainView === "courses" && (
          <div className="dashboard-section">
            <h3 className="section-title">📚 All Courses</h3>
            {courses.length === 0 ? (
              <div className="empty-state">No courses available</div>
            ) : (
              <div className="courses-grid">
                {courses.map((course) => (
                  <div key={course.id} className="course-card-view">
                    <h4>{course.name}</h4>
                    <p>{course.description}</p>
                    <button
                      className="card-button"
                      onClick={() => navigate(`/course/${course.id}`)}
                    >
                      View Lessons 📖
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

{/* _________________________________________________________________________________________________________ */}
{/* _________________________________________________________________________________________________________ */}

        {/* PLANS VIEW */}
        {mainView === "plans" && (
          <div className="dashboard-section">
            <h3 className="section-title">📋 Plans Management</h3>
            <div className="plans-subbuttons">
              <button
                className={`subnav-btn ${viewPlans === "generate" ? "active" : ""}`}
                onClick={() =>
                  setViewPlans(viewPlans === "generate" ? null : "generate")
                }
              >
                📝 Generate Plan
              </button>
              <button
                className={`subnav-btn ${viewPlans === "active" ? "active" : ""}`}
                onClick={() =>
                  setViewPlans(viewPlans === "active" ? null : "active")
                }
              >
                🚀 Active Plans
              </button>
              <button
                className={`subnav-btn ${viewPlans === "completed" ? "active" : ""}`}
                onClick={() =>
                  setViewPlans(viewPlans === "completed" ? null : "completed")
                }
              >
                ✅ Completed Plans
              </button>
            </div>

            {viewPlans === "generate" && (
              <div style={{ marginTop: "20px" }}>
                <button
                  className="card-button"
                  onClick={() => navigate("/create-plan")}
                >
                  Create New Plan 🚀
                </button>
              </div>
            )}

            {viewPlans === "active" && (
              <div style={{ marginTop: "20px" }}>
                {activePlans.length === 0 ? (
                  <div className="empty-state">📝 No active plans.</div>
                ) : (
                  <div className="plans-grid-full">
                    {activePlans.map((plan) => (
                      <div
                        key={plan.planner_id}
                        className="card card-full-width"
                      >
                        <div className="card-meta">
                          <span>📅 {plan.total_days} Days</span>
                          <span>⌛ {plan.daily_hours} hrs/day</span>
                        </div>
                        <button
                          className="card-button"
                          onClick={() =>
                            navigate(`/planner/${plan.planner_id}`)
                          }
                        >
                          Continue Plan ▶️
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {viewPlans === "completed" && (
              <div style={{ marginTop: "20px" }}>
                {trackedPlans.length === 0 ? (
                  <div className="empty-state">🎯 Complete some plans!</div>
                ) : (
                  <div className="plans-grid-full">
                    {trackedPlans.map((plan) => (
                      <div
                        key={plan.planner_id}
                        className="card card-full-width"
                      >
                        <div className="card-meta">
                          <span>
                            ✓ {plan.completed_lessons}/{plan.total_lessons}{" "}
                            Lessons
                          </span>
                          <span>📊 {plan.progress}% Complete</span>
                        </div>
                        <button
                          className="card-button"
                          onClick={() =>
                            navigate(`/planner/${plan.planner_id}/details`)
                          }
                        >
                          View Performance 📊
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

{/* __________________________________________________________________________________________________ */}
{/* __________________________________________________________________________________________________ */}
        {/* PERFORMANCE VIEW */}
        {mainView === "performance" && (
          <div className="dashboard-section">
            <h3 className="section-title">📊 Performance Analysis</h3>
            {(activePlans.length > 0 || trackedPlans.length > 0) && (
              <div className="chart-wrapper">
                {/* Pie Chart and Bar Charts code as is */}
                {/* ... (Charts components here) ... */}
              </div>
            )}
          </div>
        )}

        {/* GRIEVANCES VIEW */}
        {mainView === "grievance" && <RaiseGrievance />}

        {/* DOUBTS VIEW */}
        {mainView === "doubts" && <RaiseDoubt />}

        {/* NOTIFICATIONS VIEW */}
        {mainView === "notifications" && <RecieveNotification />}


        </div>
      </div>
    
);
}
export default Dashboard;
