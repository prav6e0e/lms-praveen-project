import { useState, useEffect } from "react";
import axios from "axios";

function RaiseDoubt() {
  const API = "http://127.0.0.1:8000";
  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [courseId, setCourseId] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [courses, setCourses] = useState([]);
  const [userDoubts, setUserDoubts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch user's courses
  useEffect(() => {
    fetchCourses();
    fetchUserDoubts();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get(`${API}/courses/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUserDoubts = async () => {
    try {
      const res = await axios.get(`${API}/doubts/user/1`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUserDoubts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const raiseDoubt = async (e) => {
    e.preventDefault();

    if (!question.trim()) {
      alert("Please enter a question");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${API}/doubts`,
        {
          user_id: 1,
          question,
          description: description || null,
          course_id: courseId ? parseInt(courseId) : null,
          lesson_id: lessonId ? parseInt(lessonId) : null,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      alert("✅ Doubt raised successfully!");
      setQuestion("");
      setDescription("");
      setCourseId("");
      setLessonId("");
      fetchUserDoubts();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to raise doubt");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="raise-doubt-container"
      style={{ padding: "20px", maxWidth: "800px" }}
    >
      <h2>❓ Raise a Doubt</h2>

      {/* FORM */}
      <form
        onSubmit={raiseDoubt}
        className="raise-form"
        style={{ marginBottom: "30px" }}
      >
        <div className="form-group">
          <label>📝 Your Question *</label>
          <input
            type="text"
            placeholder="What's your doubt?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #ddd",
              marginBottom: "10px",
            }}
          />
        </div>

        <div className="form-group">
          <label>📚 Course (Optional)</label>
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #ddd",
              marginBottom: "10px",
            }}
          >
            <option value="">Select a course...</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>📖 Lesson ID (Optional)</label>
          <input
            type="number"
            placeholder="Lesson ID"
            value={lessonId}
            onChange={(e) => setLessonId(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #ddd",
              marginBottom: "10px",
            }}
          />
        </div>

        <div className="form-group">
          <label>💬 Description (Optional)</label>
          <textarea
            placeholder="Provide more details about your doubt..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #ddd",
              minHeight: "100px",
              marginBottom: "10px",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 20px",
            backgroundColor: "#2d6a5a",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "16px",
          }}
        >
          {loading ? "Submitting..." : "Submit Doubt 🚀"}
        </button>
      </form>

      {/* MY DOUBTS */}
      <h3>📋 Your Doubts</h3>
      {userDoubts.length === 0 ? (
        <p style={{ color: "#780a0a" }}>No doubts raised yet</p>
      ) : (
        <div style={{ display: "grid", gap: "15px" }}>
          {userDoubts.map((doubt) => (
            <div
              key={doubt.id}
              style={{
                padding: "15px",
                border: "1px solid #178227",
                borderRadius: "5px",
                backgroundColor:
                  doubt.status === "answered" ? "#022004" : "#032909",
              }}
            >
              <h4>❓ {doubt.question}</h4>
              <p>{doubt.description}</p>
              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  fontSize: "14px",
                  color: "#097f2d",
                  marginTop: "10px",
                }}
              >
                <span>
                  Status: <strong>{doubt.status}</strong>
                </span>
                <span>
                  📅 {new Date(doubt.created_at).toLocaleDateString()}
                </span>
              </div>
              {doubt.answer && (
                <div
                  style={{
                    marginTop: "10px",
                    padding: "10px",
                    backgroundColor: "#095c4a",
                    borderLeft: "4px solid #2196f3",
                    borderRadius: "3px",
                  }}
                >
                  <strong>✅ Answer:</strong> {doubt.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RaiseDoubt;
