import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./adminlogin.css";


function AdminLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [error, setError] = useState("");

  // handle input
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // handle submit
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/admin/login",
        null,
        {
          params: {
            email: form.email,
            password: form.password
          }
        }
      );

      // 🔐 token store
      localStorage.setItem("adminToken", res.data.access_token);

      // redirect dashboard
      navigate("/admin/dashboard");

    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-box">
        <h2>Admin Login 🔐</h2>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            name="email"
            placeholder="Enter Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Enter Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <button type="submit">Login</button>
        </form>

        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}

export default AdminLogin;