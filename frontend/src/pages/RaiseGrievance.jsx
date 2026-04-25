import { useState, useEffect } from "react";
import axios from "axios";

function RaiseGrievance() {
  const API = "http://127.0.0.1:8000";
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [userGrievances, setUserGrievances] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserGrievances();
  }, []);

  const fetchUserGrievances = async () => {
    try {
      const res = await axios.get(`${API}/grievances/user/1`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUserGrievances(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const raiseGrievance = async (e) => {
    e.preventDefault();

    if (!subject.trim() || !message.trim()) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${API}/grievances`,
        {
          user_id: 1,
          subject,
          message,
          status: "pending",
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      alert("✅ Grievance submitted successfully!");
      setSubject("");
      setMessage("");
      fetchUserGrievances();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to submit grievance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="raise-grievance-container"
      style={{ padding: "20px", maxWidth: "800px" }}
    >
      <h2>⚖️ Raise a Grievance</h2>

      {/* FORM */}
      <form
        onSubmit={raiseGrievance}
        className="raise-form"
        style={{ marginBottom: "30px" }}
      >
        <div className="form-group">
          <label>📝 Grievance Subject *</label>
          <input
            type="text"
            placeholder="Brief subject of your grievance"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
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
          <label>💬 Message *</label>
          <textarea
            placeholder="Describe your grievance in detail..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #ddd",
              minHeight: "120px",
              marginBottom: "10px",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 20px",
            backgroundColor: "#d32f2f",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "16px",
          }}
        >
          {loading ? "Submitting..." : "Submit Grievance 📤"}
        </button>
      </form>

      {/* MY GRIEVANCES */}
      <h3>📋 Your Grievances</h3>
      {userGrievances.length === 0 ? (
        <p style={{ color: "#0e0101" }}>No grievances raised yet</p>
      ) : (
        <div style={{ display: "grid", gap: "15px" }}>
          {userGrievances.map((grievance) => (
            <div
              key={grievance.id}
              style={{
                padding: "15px",
                border: "1px solid #ddd",
                borderRadius: "5px",
                backgroundColor:
                  grievance.status === "resolved" ? "#162206" : "#fce4ec",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                }}
              >
                <div style={{ flex: 1 }}>
                  <h4>📢 {grievance.subject}</h4>
                  <p>{grievance.message}</p>
                </div>
                <span
                  style={{
                    padding: "5px 10px",
                    backgroundColor:
                      grievance.status === "resolved" ? "#4caf50" : "#ff9800",
                    color: "white",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  {grievance.status}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  fontSize: "14px",
                  color: "#666",
                  marginTop: "10px",
                }}
              >
                <span>
                  📅 {new Date(grievance.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RaiseGrievance;
