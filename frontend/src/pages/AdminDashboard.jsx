import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
//import Instructor from "./Instructor";
//import Grievance from "./Grievance";

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
} from "recharts";
import "./admindashboard.css";

function AdminDashboard() {
  const API = "http://127.0.0.1:8000";

  // CoURSES LESSON INSTRUCTOR FOR COURSE
  const [view, setView] = useState("courses");

  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [users, setUsers] = useState([]);
  const [userPlans, setUserPlans] = useState({});
  const [instructors, setInstructors] = useState([]);
  const [instructorPermissions, setInstructorPermissions] = useState({});
  //
  // _______________________COURSE MANAGEMENT______________________________________________
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");

  //EDIT COURSE
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const [editInstructorName, setEditInstructorName] = useState("");

  //LESSON MANAGEMENT
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonContent, setLessonContent] = useState("");

  const [uploadingLessonId, setUploadingLessonId] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);

  // 📢 ANNOUNCEMENTS & COMMUNICATIONS
  const [announcements, setAnnouncements] = useState([]);
  const [grievances, setGrievances] = useState([]);
  const [doubts, setDoubts] = useState([]);
  const [communicationTab, setCommunicationTab] = useState(null); // 'grievance' or 'doubt'
  const [doubtAnswers, setDoubtAnswers] = useState({}); // Store answers for doubts

  const [announcementText, setAnnouncementText] = useState("");
  const [announcementTitle, setAnnouncementTitle] = useState("");

  // 👨‍🏫 INSTRUCTOR MANAGEMENT
  const [instructorEmail, setInstructorEmail] = useState("");
  const [instructorName, setInstructorName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState({
    canCreateCourses: false,
    canEditCourses: false,
    canDeleteCourses: false,
    canCreateLessons: false,
    canEditLessons: false,
    canDeleteLessons: false,
    canViewAnalytics: false,
  });

  const navigate = useNavigate();

  // 📚 COURSES
  const fetchCourses = async () => {
    try {
      const res = await axios.get(`${API}/courses`);
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // 📘 LESSONS
  const fetchLessons = async (courseId) => {
    try {
      const res = await axios.get(`${API}/lesson/course/${courseId}/lessons`);
      setLessons(res.data);
      setSelectedCourseId(courseId);
    } catch (err) {
      console.error(err);
    }
  };

  // 👤 USERS
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API}/user/admin/users`);
      setUsers(res.data);

      // Fetch plans for each user
      const plansMap = {};
      for (const user of res.data) {
        try {
          const activePlan = await axios.get(
            `${API}/planner/user/${user.id}/active`,
          );
          const trackedPlan = await axios.get(
            `${API}/planner/user/${user.id}/tracked`,
          );
          plansMap[user.id] = {
            active: activePlan.data || [],
            completed: trackedPlan.data || [],
          };
        } catch (err) {
          plansMap[user.id] = { active: [], completed: [] };
        }
      }
      setUserPlans(plansMap);
    } catch (err) {
      console.error(err);
    }
  };

  // ➕ CREATE COURSE
  const createCourse = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/courses`, {
        name,
        description,
        price: parseFloat(price) || 0,
        duration: parseInt(duration) || 0,
        instructor_name: instructorName,
      });

      setCourses((prev) => [...prev, res.data]);
      setName("");
      setDescription("");
      setPrice("");
      setDuration("");
      setInstructorName("");
    } catch (err) {
      console.error(err);
    }
  };

  // ➕ CREATE LESSON
  const createLesson = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) {
      alert("Please select a course first");
      return;
    }

    try {
      const res = await axios.post(`${API}/lesson/create`, {
        title: lessonTitle,
        content: lessonContent,
        course_id: selectedCourseId,
      });

      fetchLessons(selectedCourseId);
      setLessonTitle("");
      setLessonContent("");
    } catch (err) {
      console.error(err);
    }
  };

  // ❌ DELETE LESSON
  const deleteLesson = async (lessonId) => {
    if (!window.confirm("Delete this lesson?")) return;

    try {
      await axios.delete(`${API}/lesson/${lessonId}`);
      setLessons((prev) => prev.filter((l) => l.id !== lessonId));
    } catch (err) {
      console.error(err);
    }
  };

  // 📤 UPLOAD LESSON CONTENT
  const uploadLessonContent = async (lessonId) => {
    if (!uploadFile) {
      alert("Please select a file to upload");
      return;
    }

    const formData = new FormData();
    formData.append("file", uploadFile);

    try {
      setUploadingLessonId(lessonId);
      const res = await axios.post(
        `${API}/lesson/upload-media/${lessonId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      alert("✅ Content uploaded successfully!");
      setUploadFile(null);
      setUploadingLessonId(null);
      // Refresh lessons
      if (selectedCourseId) {
        fetchLessons(selectedCourseId);
      }
    } catch (err) {
      alert("❌ Upload failed: " + (err.response?.data?.detail || err.message));
      setUploadingLessonId(null);
    }
  };

  // ❌ DELETE COURSE
  const deleteCourse = async (id) => {
    if (!window.confirm("Delete this course?")) return;

    try {
      await axios.delete(`${API}/courses/${id}`);
      setCourses((prev) => prev.filter((c) => c.id !== id));

      if (selectedCourseId === id) {
        setLessons([]);
        setSelectedCourseId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ✏️ EDIT COURSE
  const startEdit = (course) => {
    setEditId(course.id);
    setEditName(course.name);
    setEditDesc(course.description);
    setEditPrice(course.price || "");
    setEditDuration(course.duration || "");
    setEditInstructorName(course.instructor_name || "");
  };

  const updateCourse = async (id) => {
    try {
      const res = await axios.put(`${API}/courses/${id}`, {
        name: editName,
        description: editDesc,
        price: parseFloat(editPrice) || 0,
        duration: parseInt(editDuration) || 0,
        instructor_name: editInstructorName,
      });

      setCourses((prev) => prev.map((c) => (c.id === id ? res.data : c)));

      setEditId(null);
    } catch (err) {
      console.error(err);
    }
  };

  // ❌ DELETE USER
  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      await axios.delete(`${API}/user/admin/user/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // 🚫 BLOCK USER
  const blockUser = async (id) => {
    if (!window.confirm("Block this user?")) return;

    try {
      await axios.put(`${API}/user/admin/user/block/${id}`);

      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, is_active: false } : u)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ UNBLOCK USER
  const unblockUser = async (id) => {
    if (!window.confirm("Unblock this user?")) return;

    try {
      await axios.put(`${API}/user/admin/user/unblock/${id}`);

      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, is_active: true } : u)),
      );
    } catch (err) {
      console.error(err);
    }
  };




//____________________________________________________________________________
// ________________________________RETURN__________________________________________________-_
// ________________________________RETURN__________________________________________________-_
// ________________________________RETURN__________________________________________________-_
// ________________________________RETURN__________________________________________________-_
  return (
    <div className="container">
      {/* 🔹 Sidebar */}
      <div className="sidebar">
        <h2>Admin Panel</h2>

        <button
          onClick={() => {
            setView("courses");
            fetchCourses();
          }}
        >
          Courses
        </button>

        <button
          onClick={() => {
            setView("users");
            fetchUsers();
          }}
        >
          Users
        </button>

        <button
          onClick={() => {
            setView("performance");
            fetchUsers();
          }}
        >
          Performance
        </button>


        
        

        <button
          onClick={() => navigate("/notification")}
        >
          👨‍🏫 Notifications
        </button>

        <button
          onClick={() => navigate("/doubt")}
        >
          👨‍🏫 Doubts
        </button>

        <button
          onClick={() => navigate("/grievance")}
        >
          👨‍🏫 Grievance
        </button>

        <button
          onClick={() => navigate("/instructor")}
        >
          👨‍🏫 Instructors
        </button>
      </div>

      {/* 🔹 Content */}
      <div className="content">
        {/* 📚 COURSES */}
        {view === "courses" && (
          <>
            <div className="section">
              <h2>📚 All Available Courses</h2>
              <p style={{ color: "#6b7280", marginBottom: "20px" }}>
                Total Courses:{" "}
                <strong style={{ color: "#667eea" }}>{courses.length}</strong>
              </p>
            </div>

            {courses.length === 0 ? (
              <div
                className="section"
                style={{ textAlign: "center", padding: "40px" }}
              >
                <p style={{ color: "#c5f76e", fontSize: "16px" }}>
                  No courses available. Create one below!
                </p>
              </div>
            ) : (
              courses.map((c, index) => {
                const colors = [
                  { bg: "#f0fdf4", border: "#064E3B", accent: "#064E3B" },
                  { bg: "#fffbeb", border: "#D9F99D", accent: "#064E3B" },
                  { bg: "#ecfdf5", border: "#064E3B", accent: "#064E3B" },
                  { bg: "#f8fafc", border: "#D9F99D", accent: "#064E3B" },
                  { bg: "#f0fdf4", border: "#064E3B", accent: "#064E3B" },
                ];
                const color = colors[index % colors.length];

                return (
                  <div
                    key={c.id}
                    className="course-card"
                    style={{
                      background: color.bg,
                      borderLeftColor: color.border,
                    }}
                  >
                    {editId === c.id ? (
                      <div style={{ padding: "20px" }}>
                        <h3
                          style={{ marginBottom: "15px", color: color.accent }}
                        >
                          Edit Course
                        </h3>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Course Name"
                          style={{
                            marginBottom: "10px",
                            padding: "10px",
                            width: "100%",
                            boxSizing: "border-box",
                            borderRadius: "6px",
                            border: `1px solid ${color.border}`,
                          }}
                        />
                        <input
                          type="text"
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          placeholder="Description"
                          style={{
                            marginBottom: "10px",
                            padding: "10px",
                            width: "100%",
                            boxSizing: "border-box",
                            borderRadius: "6px",
                            border: `1px solid ${color.border}`,
                          }}
                        />
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          placeholder="Price (₹)"
                          min="0"
                          step="0.01"
                          style={{
                            marginBottom: "10px",
                            padding: "10px",
                            width: "100%",
                            boxSizing: "border-box",
                            borderRadius: "6px",
                            border: `1px solid ${color.border}`,
                          }}
                        />
                        <input
                          type="number"
                          value={editDuration}
                          onChange={(e) => setEditDuration(e.target.value)}
                          placeholder="Duration (Days)"
                          min="1"
                          style={{
                            marginBottom: "10px",
                            padding: "10px",
                            width: "100%",
                            boxSizing: "border-box",
                            borderRadius: "6px",
                            border: `1px solid ${color.border}`,
                          }}
                        />
                        <input
                          type="text"
                          value={editInstructorName}
                          onChange={(e) =>
                            setEditInstructorName(e.target.value)
                          }
                          placeholder="Instructor Name"
                          style={{
                            marginBottom: "15px",
                            padding: "10px",
                            width: "100%",
                            boxSizing: "border-box",
                            borderRadius: "6px",
                            border: `1px solid ${color.border}`,
                          }}
                        />
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button
                            onClick={() => updateCourse(c.id)}
                            style={{
                              background: color.accent,
                              color: "white",
                              padding: "8px 16px",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontWeight: "600",
                            }}
                          >
                            ✅ Save
                          </button>
                          <button
                            onClick={() => setEditId(null)}
                            style={{
                              background: "#e5e7eb",
                              color: "#374151",
                              padding: "8px 16px",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontWeight: "600",
                            }}
                          >
                            ❌ Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div
                          style={{
                            paddingBottom: "15px",
                            borderBottom: `2px solid ${color.border}`,
                          }}
                        >
                          <h3
                            style={{
                              color: color.accent,
                              marginBottom: "8px",
                              fontSize: "18px",
                            }}
                          >
                            {c.name}
                          </h3>
                          <p
                            style={{
                              color: "#6b7280",
                              fontSize: "14px",
                              marginBottom: "8px",
                            }}
                          >
                            {c.description}
                          </p>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns:
                                "repeat(auto-fit, minmax(150px, 1fr))",
                              gap: "10px",
                              fontSize: "13px",
                            }}
                          >
                            <p style={{ color: "#6b7280" }}>
                              💰 Price:{" "}
                              <strong style={{ color: color.accent }}>
                                ₹{c.price || 0}
                              </strong>
                            </p>
                            <p style={{ color: "#6b7280" }}>
                              ⏱️ Duration:{" "}
                              <strong style={{ color: color.accent }}>
                                {c.duration || 0} Days
                              </strong>
                            </p>
                            <p style={{ color: "#6b7280" }}>
                              👨‍🏫 Instructor:{" "}
                              <strong style={{ color: color.accent }}>
                                {c.instructor_name || "N/A"}
                              </strong>
                            </p>
                          </div>
                        </div>

                        <div
                          style={{
                            paddingTop: "15px",
                            display: "flex",
                            gap: "8px",
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            onClick={() => fetchLessons(c.id)}
                            style={{
                              background:
                                color.border === "#064E3B"
                                  ? "#064E3B"
                                  : "#D9F99D",
                              color:
                                color.border === "#064E3B"
                                  ? "#D9F99D"
                                  : "#064E3B",
                              padding: "8px 14px",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontWeight: "500",
                              fontSize: "13px",
                              transition: "all 0.3s ease",
                            }}
                            onMouseEnter={(e) =>
                              (e.target.style.opacity = "0.8")
                            }
                            onMouseLeave={(e) => (e.target.style.opacity = "1")}
                          >
                            👁️ View Lessons
                          </button>

                          <button
                            onClick={() => startEdit(c)}
                            style={{
                              background: "#064E3B",
                              color: "#D9F99D",
                              padding: "8px 14px",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontWeight: "500",
                              fontSize: "13px",
                              transition: "all 0.3s ease",
                            }}
                            onMouseEnter={(e) =>
                              (e.target.style.opacity = "0.8")
                            }
                            onMouseLeave={(e) => (e.target.style.opacity = "1")}
                          >
                            ✏️ Edit
                          </button>

                          <button
                            onClick={() => deleteCourse(c.id)}
                            style={{
                              background: "#fee2e2",
                              color: "#991b1b",
                              padding: "8px 14px",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontWeight: "500",
                              fontSize: "13px",
                              transition: "all 0.3s ease",
                            }}
                            onMouseEnter={(e) =>
                              (e.target.style.background = "#fecaca")
                            }
                            onMouseLeave={(e) =>
                              (e.target.style.background = "#fee2e2")
                            }
                          >
                            🗑️ Delete Course
                          </button>
                        </div>

                        {/* 📘 LESSONS FOR THIS COURSE */}
                        {selectedCourseId === c.id && lessons.length > 0 && (
                          <div
                            style={{
                              marginTop: "20px",
                              paddingTop: "20px",
                              borderTop: `2px dashed ${color.border}`,
                            }}
                          >
                            <h4
                              style={{
                                color: color.accent,
                                marginBottom: "15px",
                                fontSize: "15px",
                                fontWeight: "600",
                              }}
                            >
                              📚 Lessons in this Course:
                            </h4>
                            {lessons.map((lesson) => (
                              <div
                                key={lesson.id}
                                style={{
                                  background: "#0f3d2f",
                                  padding: "12px",
                                  marginBottom: "10px",
                                  borderRadius: "6px",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  border: `1px solid ${color.border}`,
                                }}
                              >
                                <div>
                                  <h5
                                    style={{
                                      color: "#D9F99D",
                                      marginBottom: "4px",
                                      fontSize: "14px",
                                      fontWeight: "600",
                                    }}
                                  >
                                    {lesson.title}
                                  </h5>
                                  <p
                                    style={{
                                      color: "#c5f76e",
                                      fontSize: "12px",
                                    }}
                                  >
                                    {lesson.content.substring(0, 50)}...
                                  </p>
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    gap: "8px",
                                    alignItems: "center",
                                    flexWrap: "wrap",
                                  }}
                                >
                                  <button
                                    onClick={() =>
                                      navigate(`/lesson/${lesson.id}`)
                                    }
                                    style={{
                                      background:
                                        color.border === "#064E3B"
                                          ? "#064E3B"
                                          : "#D9F99D",
                                      color:
                                        color.border === "#064E3B"
                                          ? "#D9F99D"
                                          : "#064E3B",
                                      padding: "6px 12px",
                                      border: "none",
                                      borderRadius: "4px",
                                      cursor: "pointer",
                                      fontWeight: "500",
                                      fontSize: "12px",
                                    }}
                                  >
                                    🔗 Open
                                  </button>

                                  {/* 📤 UPLOAD CONTENT SECTION */}
                                  {uploadingLessonId === lesson.id ? (
                                    <div
                                      style={{
                                        display: "flex",
                                        gap: "6px",
                                        alignItems: "center",
                                      }}
                                    >
                                      <input
                                        type="file"
                                        onChange={(e) =>
                                          setUploadFile(e.target.files[0])
                                        }
                                        accept=".pdf,.mp4,.mpeg,.mov,.avi,.mp3,.wav"
                                        style={{
                                          padding: "4px",
                                          fontSize: "11px",
                                          borderRadius: "4px",
                                          background: "#0f3d2f",
                                          color: "#c5f76e",
                                          border: "1px solid #2d6a5a",
                                        }}
                                      />
                                      <button
                                        onClick={() =>
                                          uploadLessonContent(lesson.id)
                                        }
                                        disabled={!uploadFile}
                                        style={{
                                          background: "#10b981",
                                          color: "white",
                                          padding: "6px 10px",
                                          border: "none",
                                          borderRadius: "4px",
                                          cursor: uploadFile
                                            ? "pointer"
                                            : "not-allowed",
                                          fontWeight: "500",
                                          fontSize: "12px",
                                          opacity: uploadFile ? 1 : 0.5,
                                        }}
                                      >
                                        ✓
                                      </button>
                                      <button
                                        onClick={() => {
                                          setUploadingLessonId(null);
                                          setUploadFile(null);
                                        }}
                                        style={{
                                          background: "#6b7280",
                                          color: "white",
                                          padding: "6px 10px",
                                          border: "none",
                                          borderRadius: "4px",
                                          cursor: "pointer",
                                          fontWeight: "500",
                                          fontSize: "12px",
                                        }}
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() =>
                                        setUploadingLessonId(lesson.id)
                                      }
                                      style={{
                                        background: "#0ea5e9",
                                        color: "white",
                                        padding: "6px 12px",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                        fontWeight: "500",
                                        fontSize: "12px",
                                      }}
                                    >
                                      📤 Upload Content
                                    </button>
                                  )}

                                  <button
                                    onClick={() => deleteLesson(lesson.id)}
                                    style={{
                                      background: "#fee2e2",
                                      color: "#991b1b",
                                      padding: "6px 12px",
                                      border: "none",
                                      borderRadius: "4px",
                                      cursor: "pointer",
                                      fontWeight: "500",
                                      fontSize: "12px",
                                    }}
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })
            )}

            {/* CREATE LESSON SECTION - Shows when a course is selected */}
            {selectedCourseId && (
              <div
                className="section"
                style={{ marginTop: "30px", borderLeftColor: "#667eea" }}
              >
                <h2>➕ Create New Lesson</h2>

                <form onSubmit={createLesson}>
                  <input
                    type="text"
                    placeholder="Lesson Title"
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    required
                  />

                  <textarea
                    placeholder="Lesson Content"
                    value={lessonContent}
                    onChange={(e) => setLessonContent(e.target.value)}
                    required
                    rows="4"
                  />

                  <button type="submit">Create Lesson</button>
                </form>
              </div>
            )}

            {/* CREATE COURSE SECTION - AT THE BOTTOM */}
            <div
              className="section"
              style={{ marginTop: "40px", borderLeftColor: "#10b981" }}
            >
              <h2>➕ Create New Course</h2>

              <form onSubmit={createCourse}>
                <input
                  type="text"
                  placeholder="Course Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <input
                  type="text"
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />

                <input
                  type="number"
                  placeholder="Course Price (₹)"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0"
                  step="0.01"
                  required
                />

                <input
                  type="number"
                  placeholder="Course Duration (Days)"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  min="1"
                  required
                />

                <input
                  type="text"
                  placeholder="Instructor Name"
                  value={instructorName}
                  onChange={(e) => setInstructorName(e.target.value)}
                  required
                />

                <button type="submit">Create Course</button>
              </form>
            </div>
          </>
        )}

        {/* 👤 USERS */}
        {view === "users" && (
          <>
            <div className="section">
              <h2>👥 User Management</h2>
              <p style={{ color: "#c5f76e", marginBottom: "15px" }}>
                Total Users:{" "}
                <strong style={{ color: "#D9F99D" }}>{users.length}</strong>
              </p>
            </div>

            {users.length === 0 ? (
              <div
                className="section"
                style={{ textAlign: "center", padding: "40px" }}
              >
                <p style={{ color: "#c5f76e", fontSize: "16px" }}>
                  No users found
                </p>
              </div>
            ) : (
              users.map((u) => (
                <div
                  key={u.id}
                  className="section"
                  style={{
                    borderLeftColor: u.is_active ? "#10b981" : "#ef4444",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "15px",
                    }}
                  >
                    <div>
                      <h3 style={{ marginBottom: "5px" }}>{u.email}</h3>
                      <p style={{ fontSize: "13px" }}>
                        Status:{" "}
                        <span
                          style={{
                            fontWeight: "600",
                            color: u.is_active ? "#10b981" : "#ef4444",
                          }}
                        >
                          {u.is_active ? "🟢 Active" : "🔴 Blocked"}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* 🚀 ACTIVE PLANS */}
                  {userPlans[u.id]?.active &&
                    userPlans[u.id].active.length > 0 && (
                      <div
                        style={{
                          marginBottom: "15px",
                          paddingBottom: "15px",
                          borderBottom: "1px solid #2d6a5a",
                        }}
                      >
                        <h4
                          style={{
                            color: "#D9F99D",
                            fontSize: "14px",
                            fontWeight: "600",
                            marginBottom: "10px",
                          }}
                        >
                          🚀 Active Plans ({userPlans[u.id].active.length})
                        </h4>
                        {userPlans[u.id].active.map((plan, idx) => (
                          <div
                            key={idx}
                            style={{
                              background: "#0f3d2f",
                              padding: "8px 12px",
                              marginBottom: "8px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              color: "#c5f76e",
                              border: "1px solid #2d6a5a",
                            }}
                          >
                            📅 Days: {plan.total_days} | ⏰ Hours/Day:{" "}
                            {plan.daily_hours}
                          </div>
                        ))}
                      </div>
                    )}

                  {/* ✅ COMPLETED PLANS */}
                  {userPlans[u.id]?.completed &&
                    userPlans[u.id].completed.length > 0 && (
                      <div
                        style={{
                          marginBottom: "15px",
                          paddingBottom: "15px",
                          borderBottom: "1px solid #2d6a5a",
                        }}
                      >
                        <h4
                          style={{
                            color: "#D9F99D",
                            fontSize: "14px",
                            fontWeight: "600",
                            marginBottom: "10px",
                          }}
                        >
                          ✅ Completed Plans ({userPlans[u.id].completed.length}
                          )
                        </h4>
                        {userPlans[u.id].completed.map((plan, idx) => (
                          <div
                            key={idx}
                            style={{
                              background: "#0f3d2f",
                              padding: "8px 12px",
                              marginBottom: "8px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              color: "#c5f76e",
                              border: "1px solid #2d6a5a",
                            }}
                          >
                            📊 {plan.completed_lessons}/{plan.total_lessons}{" "}
                            Lessons | ✓ {plan.progress}% Complete
                          </div>
                        ))}
                      </div>
                    )}

                  {/* NO PLANS MESSAGE */}
                  {(!userPlans[u.id]?.active ||
                    userPlans[u.id].active.length === 0) &&
                    (!userPlans[u.id]?.completed ||
                      userPlans[u.id].completed.length === 0) && (
                      <div
                        style={{
                          marginBottom: "15px",
                          paddingBottom: "15px",
                          borderBottom: "1px solid #2d6a5a",
                        }}
                      >
                        <p
                          style={{
                            color: "#9ca3af",
                            fontSize: "12px",
                            fontStyle: "italic",
                          }}
                        >
                          No study plans yet
                        </p>
                      </div>
                    )}

                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    {u.is_active ? (
                      <button
                        style={{
                          background: "#D9F99D",
                          color: "#064E3B",
                          padding: "8px 14px",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontWeight: "500",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.background = "#c5f76e")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.background = "#D9F99D")
                        }
                        onClick={() => blockUser(u.id)}
                      >
                        🚫 Block User
                      </button>
                    ) : (
                      <button
                        style={{
                          background: "#064E3B",
                          color: "#D9F99D",
                          padding: "8px 14px",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontWeight: "500",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.background = "#0a3d2a")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.background = "#064E3B")
                        }
                        onClick={() => unblockUser(u.id)}
                      >
                        ✅ Unblock User
                      </button>
                    )}

                    <button
                      className="delete-btn"
                      style={{
                        background: "#fee2e2",
                        color: "#991b1b",
                        padding: "8px 14px",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "500",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.background = "#fecaca")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.background = "#fee2e2")
                      }
                      onClick={() => deleteUser(u.id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* 📊 PERFORMANCE ANALYTICS */}
        {view === "performance" && (
          <>
            <div className="section">
              <h2>📊 User Performance Analytics</h2>
            </div>

            {/* 📈 KEY STATISTICS */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "15px",
                marginBottom: "30px",
              }}
            >
              <div
                className="section"
                style={{
                  background:
                    "linear-gradient(135deg, #064E3B 0%, #0a3d2a 100%)",
                  borderLeft: "4px solid #D9F99D",
                }}
              >
                <h3 style={{ color: "#D9F99D", marginBottom: "10px" }}>
                  👥 Total Users
                </h3>
                <p
                  style={{
                    fontSize: "28px",
                    color: "#c5f76e",
                    fontWeight: "bold",
                  }}
                >
                  {users.length}
                </p>
              </div>

              <div
                className="section"
                style={{
                  background:
                    "linear-gradient(135deg, #064E3B 0%, #0a3d2a 100%)",
                  borderLeft: "4px solid #D9F99D",
                }}
              >
                <h3 style={{ color: "#D9F99D", marginBottom: "10px" }}>
                  🚀 Active Users
                </h3>
                <p
                  style={{
                    fontSize: "28px",
                    color: "#c5f76e",
                    fontWeight: "bold",
                  }}
                >
                  {users.filter((u) => u.is_active).length}
                </p>
              </div>

              <div
                className="section"
                style={{
                  background:
                    "linear-gradient(135deg, #064E3B 0%, #0a3d2a 100%)",
                  borderLeft: "4px solid #D9F99D",
                }}
              >
                <h3 style={{ color: "#D9F99D", marginBottom: "10px" }}>
                  📚 Total Plans
                </h3>
                <p
                  style={{
                    fontSize: "28px",
                    color: "#c5f76e",
                    fontWeight: "bold",
                  }}
                >
                  {Object.values(userPlans).reduce(
                    (acc, p) =>
                      acc +
                      (p.active ? p.active.length : 0) +
                      (p.completed ? p.completed.length : 0),
                    0,
                  )}
                </p>
              </div>

              <div
                className="section"
                style={{
                  background:
                    "linear-gradient(135deg, #064E3B 0%, #0a3d2a 100%)",
                  borderLeft: "4px solid #D9F99D",
                }}
              >
                <h3 style={{ color: "#D9F99D", marginBottom: "10px" }}>
                  ✅ Completed Plans
                </h3>
                <p
                  style={{
                    fontSize: "28px",
                    color: "#c5f76e",
                    fontWeight: "bold",
                  }}
                >
                  {Object.values(userPlans).reduce(
                    (acc, p) => acc + (p.completed ? p.completed.length : 0),
                    0,
                  )}
                </p>
              </div>
            </div>

            {/* 📊 CHARTS SECTION */}
            {users.length > 0 && (
              <>
                {/* USER COMPLETION RATE BAR CHART */}
                <div className="section" style={{ marginBottom: "30px" }}>
                  <h3 style={{ color: "#D9F99D", marginBottom: "20px" }}>
                    📈 User Completion Rate
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={users.map((u) => {
                        const completedCount =
                          userPlans[u.id]?.completed?.length || 0;
                        const totalCount =
                          (userPlans[u.id]?.active?.length || 0) +
                          completedCount;
                        const completionRate =
                          totalCount > 0
                            ? Math.round((completedCount / totalCount) * 100)
                            : 0;
                        return {
                          name: u.email.substring(0, 15),
                          "Completion %": completionRate,
                          Completed: completedCount,
                          Active: userPlans[u.id]?.active?.length || 0,
                        };
                      })}
                      margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#2d6a5a"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        stroke="#c5f76e"
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={100}
                      />
                      <YAxis stroke="#c5f76e" tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          background: "#0f3d2f",
                          border: "1px solid #2d6a5a",
                          color: "#D9F99D",
                          borderRadius: "6px",
                        }}
                        cursor={{ fill: "rgba(212, 249, 157, 0.1)" }}
                      />
                      <Legend wrapperStyle={{ color: "#D9F99D" }} />
                      <Bar
                        dataKey="Completion %"
                        fill="#D9F99D"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* ACTIVE VS COMPLETED PIE CHART */}
                <div className="section" style={{ marginBottom: "30px" }}>
                  <h3 style={{ color: "#D9F99D", marginBottom: "20px" }}>
                    🎯 Active vs Completed Plans Overview
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: "Active Plans",
                            value: Object.values(userPlans).reduce(
                              (acc, p) =>
                                acc + (p.active ? p.active.length : 0),
                              0,
                            ),
                          },
                          {
                            name: "Completed Plans",
                            value: Object.values(userPlans).reduce(
                              (acc, p) =>
                                acc + (p.completed ? p.completed.length : 0),
                              0,
                            ),
                          },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#D9F99D" />
                        <Cell fill="#10b981" />
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "#0f3d2f",
                          border: "1px solid #2d6a5a",
                          color: "#D9F99D",
                          borderRadius: "6px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* USER DETAILED PERFORMANCE TABLE */}
                <div className="section">
                  <h3 style={{ color: "#D9F99D", marginBottom: "20px" }}>
                    📋 Detailed User Performance
                  </h3>
                  <div
                    style={{
                      overflowX: "auto",
                      borderRadius: "8px",
                      border: "1px solid #2d6a5a",
                    }}
                  >
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: "14px",
                      }}
                    >
                      <thead>
                        <tr style={{ background: "#064E3B" }}>
                          <th
                            style={{
                              padding: "12px",
                              textAlign: "left",
                              color: "#D9F99D",
                              borderBottom: "2px solid #2d6a5a",
                            }}
                          >
                            User Email
                          </th>
                          <th
                            style={{
                              padding: "12px",
                              textAlign: "center",
                              color: "#D9F99D",
                              borderBottom: "2px solid #2d6a5a",
                            }}
                          >
                            Active Plans
                          </th>
                          <th
                            style={{
                              padding: "12px",
                              textAlign: "center",
                              color: "#D9F99D",
                              borderBottom: "2px solid #2d6a5a",
                            }}
                          >
                            Completed Plans
                          </th>
                          <th
                            style={{
                              padding: "12px",
                              textAlign: "center",
                              color: "#D9F99D",
                              borderBottom: "2px solid #2d6a5a",
                            }}
                          >
                            Total Plans
                          </th>
                          <th
                            style={{
                              padding: "12px",
                              textAlign: "center",
                              color: "#D9F99D",
                              borderBottom: "2px solid #2d6a5a",
                            }}
                          >
                            Completion Rate
                          </th>
                          <th
                            style={{
                              padding: "12px",
                              textAlign: "center",
                              color: "#D9F99D",
                              borderBottom: "2px solid #2d6a5a",
                            }}
                          >
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => {
                          const completedCount =
                            userPlans[u.id]?.completed?.length || 0;
                          const activeCount =
                            userPlans[u.id]?.active?.length || 0;
                          const totalCount = activeCount + completedCount;
                          const completionRate =
                            totalCount > 0
                              ? Math.round((completedCount / totalCount) * 100)
                              : 0;

                          return (
                            <tr
                              key={u.id}
                              style={{
                                background:
                                  u.id % 2 === 0 ? "#0f3d2f" : "#1a4d3f",
                                borderBottom: "1px solid #2d6a5a",
                              }}
                            >
                              <td
                                style={{
                                  padding: "12px",
                                  color: "#c5f76e",
                                  fontWeight: "500",
                                }}
                              >
                                {u.email}
                              </td>
                              <td
                                style={{
                                  padding: "12px",
                                  textAlign: "center",
                                  color: "#D9F99D",
                                }}
                              >
                                {activeCount}
                              </td>
                              <td
                                style={{
                                  padding: "12px",
                                  textAlign: "center",
                                  color: "#10b981",
                                  fontWeight: "bold",
                                }}
                              >
                                {completedCount}
                              </td>
                              <td
                                style={{
                                  padding: "12px",
                                  textAlign: "center",
                                  color: "#c5f76e",
                                }}
                              >
                                {totalCount}
                              </td>
                              <td
                                style={{
                                  padding: "12px",
                                  textAlign: "center",
                                  color:
                                    completionRate > 50 ? "#10b981" : "#f97316",
                                  fontWeight: "bold",
                                }}
                              >
                                {completionRate}%
                              </td>
                              <td
                                style={{
                                  padding: "12px",
                                  textAlign: "center",
                                  color: u.is_active ? "#10b981" : "#ef4444",
                                  fontWeight: "bold",
                                }}
                              >
                                {u.is_active ? "🟢 Active" : "🔴 Blocked"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </>
        )}

                          {/*__________________________________________________________________________  */}
                          {/*__________________________________________________________________________  */}
                          {/*__________________________________________________________________________  */}
                        
      
      </div>
    </div>
  );
}

export default AdminDashboard;
