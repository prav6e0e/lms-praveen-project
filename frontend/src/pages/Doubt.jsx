import { useEffect, useState } from "react";
import axios from "axios";
import "./doubt.css";

function Doubt() {
  const API = "http://127.0.0.1:8000";

  const [doubts, setDoubts] = useState([]);
  const [answers, setAnswers] = useState({});

  // 🔥 FETCH DOUBTS
  const fetchDoubts = async () => {
    try {
      const res = await axios.get(`${API}/doubts`);
      setDoubts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDoubts();
  }, []);

  // ✏️ ANSWER DOUBT
  const answerDoubt = async (id) => {
    const answer = answers[id];

    if (!answer || answer.trim() === "") {
      alert("Please enter an answer");
      return;
    }

    try {
      await axios.put(`${API}/doubts/${id}/answer`, { answer });

      setAnswers((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });

      fetchDoubts();
    } catch (err) {
      console.error(err);
    }
  };

  // ❌ DELETE
  const deleteDoubt = async (id) => {
    if (!window.confirm("Delete this doubt?")) return;

    try {
      await axios.delete(`${API}/doubts/${id}`);
      setDoubts((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="doubt-container">
      <h2>💬 Doubt Management</h2>

      {doubts.length === 0 ? (
        <p className="empty">No doubts available</p>
      ) : (
        doubts.map((d) => (
          <div
            key={d.id}
            className={`doubt-card ${
              d.status === "answered" ? "answered" : ""
            }`}
          >
            {/* HEADER */}
            <div className="doubt-header">
              <h3>❓ {d.question}</h3>

              <span
                className={`status-badge ${
                  d.status === "answered"
                    ? "status-answered"
                    : "status-unanswered"
                }`}
              >
                {d.status}
              </span>
            </div>

            {/* INFO */}
            <p className="doubt-info">👤 User ID: {d.user_id}</p>

            {d.course_id && (
              <p className="doubt-info">📚 Course: {d.course_id}</p>
            )}

            {d.lesson_id && (
              <p className="doubt-info">📖 Lesson: {d.lesson_id}</p>
            )}

            {d.description && (
              <p className="doubt-description">📝 {d.description}</p>
            )}

            {/* ANSWER */}
            {d.answer ? (
              <div className="answer-box">
                <strong>💡 Answer:</strong>
                <p>{d.answer}</p>
              </div>
            ) : (
              <div className="answer-input">
                <textarea
                  placeholder="Write answer..."
                  value={answers[d.id] || ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({
                      ...prev,
                      [d.id]: e.target.value,
                    }))
                  }
                />

                <button onClick={() => answerDoubt(d.id)}>Submit Answer</button>
              </div>
            )}

            {/* ACTION */}
            <div className="actions">
              <button className="delete-btn" onClick={() => deleteDoubt(d.id)}>
                ❌ Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Doubt;
