import { useEffect, useState } from "react";
import axios from "axios";
import "./grievance.css";

function Grievance() {
  const API = "http://127.0.0.1:8000";

  const [grievances, setGrievances] = useState([]);
  const [userId, setUserId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  // 🔥 FETCH ALL (ADMIN)
  const fetchGrievances = async () => {
    try {
      const res = await axios.get(`${API}/grievances`);
      setGrievances(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGrievances();
  }, []);

  // ➕ CREATE
  const createGrievance = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${API}/grievances`, {
        user_id: parseInt(userId),
        title,
        message,
      });

      setGrievances((prev) => [res.data, ...prev]);
      setUserId("");
      setTitle("");
      setMessage("");
    } catch (err) {
      console.error(err);
    }
  };

  // 🔄 UPDATE STATUS
  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API}/grievances/${id}`, { status });
      fetchGrievances();
    } catch (err) {
      console.error(err);
    }
  };

  // ❌ DELETE
  const deleteGrievance = async (id) => {
    if (!window.confirm("Delete this grievance?")) return;

    try {
      await axios.delete(`${API}/grievances/${id}`);
      setGrievances((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="grievance-container">
      <h2>📢 Grievance System</h2>

      {/* ➕ CREATE FORM */}
      <form onSubmit={createGrievance} className="grievance-form">
        <input
          type="number"
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="Write your grievance..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />

        <button type="submit">Submit Grievance</button>
      </form>

      {/* 📋 LIST */}
      {grievances.length === 0 ? (
        <p>No grievances found</p>
      ) : (
        grievances.map((g) => (
          <div key={g.id} className="grievance-card">
            <h3>{g.title}</h3>
            <p>{g.message}</p>

            <p>User ID: {g.user_id}</p>
            <p>Status: {g.status}</p>

            <div className="actions">
              <button onClick={() => updateStatus(g.id, "pending")}>
                Pending
              </button>

              <button onClick={() => updateStatus(g.id, "in-progress")}>
                In Progress
              </button>

              <button onClick={() => updateStatus(g.id, "resolved")}>
                Resolved
              </button>

              <button
                className="delete-btn"
                onClick={() => deleteGrievance(g.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Grievance;