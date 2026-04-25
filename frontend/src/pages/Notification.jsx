import { useEffect, useState } from "react";
import axios from "axios";
import "./notification.css";

function Notification() {
  const API = "http://127.0.0.1:8000";

  const [notifications, setNotifications] = useState([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState("");

  // 🔥 FETCH ALL
  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API}/notifications`);
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // ➕ CREATE
  const createNotification = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${API}/notifications`, {
        title,
        message,
        user_id: userId ? parseInt(userId) : null,
      });

      setNotifications((prev) => [res.data, ...prev]);
      setTitle("");
      setMessage("");
      setUserId("");
    } catch (err) {
      console.error(err);
    }
  };

  // 👤 FETCH USER NOTIFICATIONS
  const fetchUserNotifications = async () => {
    if (!userId) {
      alert("Enter User ID first");
      return;
    }

    try {
      const res = await axios.get(
        `${API}/notifications/user/${userId}`
      );
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ MARK AS READ
  const markAsRead = async (id) => {
    try {
      await axios.put(`${API}/notifications/read/${id}`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  // ❌ DELETE
  const deleteNotification = async (id) => {
    if (!window.confirm("Delete notification?")) return;

    try {
      await axios.delete(`${API}/notifications/${id}`);
      setNotifications((prev) =>
        prev.filter((n) => n.id !== id)
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="notification-container">
      <h2>📢 Notification System</h2>

      {/* ➕ CREATE */}
      <form onSubmit={createNotification} className="notification-form">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="User ID (optional)"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />

        <button type="submit">Send Notification</button>
      </form>

      {/* 🔍 FILTER */}
      <div className="filter-box">
        <input
          type="number"
          placeholder="Enter User ID to filter"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />

        <button onClick={fetchUserNotifications}>
          Get User Notifications
        </button>

        <button onClick={fetchNotifications}>
          Show All
        </button>
      </div>

      {/* 📋 LIST */}
      {notifications.length === 0 ? (
        <p>No notifications found</p>
      ) : (
        notifications.map((n) => (
          <div
            key={n.id}
            className={`notification-card ${
              n.is_read ? "read" : "unread"
            }`}
          >
            <h3>{n.title}</h3>
            <p>{n.message}</p>

            <p>User ID: {n.user_id || "All Users"}</p>
            <p>Status: {n.is_read ? "Read" : "Unread"}</p>

            <div className="actions">
              {!n.is_read && (
                <button onClick={() => markAsRead(n.id)}>
                
                </button>
              )}

              <button
                className="delete-btn"
                onClick={() => deleteNotification(n.id)}
              >
                ❌ Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Notification;