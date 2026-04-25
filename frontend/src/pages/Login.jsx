import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./login.css";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post("http://127.0.0.1:8000/user/login", form);

      // ✅ Token store
      localStorage.setItem("token", res.data.access_token);

      // ✅ Store user_id
      localStorage.setItem("user_id", res.data.user_id);

      // Save email if remember me is checked
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", form.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      setMessage("✅ Login successful! Redirecting...");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail ||
        err.message ||
        "Login failed. Please check your credentials.";
      setMessage(`❌ ${errorMsg}`);
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load remembered email on component mount
  const [mounted, setMounted] = useState(false);

  if (!mounted) {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail && !form.email) {
      setForm({ ...form, email: rememberedEmail });
      setRememberMe(true);
    }
    setMounted(true);
  }

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Login to access your courses and continue learning</p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={
              message.startsWith("✅") ? "success-message" : "error-message"
            }
          >
            {message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              className={errors.email ? "input-error" : ""}
              required
            />
            {errors.email && (
              <span
                style={{
                  color: "#ef4444",
                  fontSize: "0.85rem",
                  marginTop: "4px",
                  display: "block",
                }}
              >
                {errors.email}
              </span>
            )}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="show-password">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                className={errors.password ? "input-error" : ""}
                required
              />
              <button
                type="button"
                className="show-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            {errors.password && (
              <span
                style={{
                  color: "#ef4444",
                  fontSize: "0.85rem",
                  marginTop: "4px",
                  display: "block",
                }}
              >
                {errors.password}
              </span>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="remember-forgot">
            <label>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>
            <a href="#forgot">Forgot password?</a>
          </div>

          {/* Submit Button */}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading && <span className="loading-spinner"></span>}
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Signup Link */}
        <div className="login-footer">
          <p>
            Don't have an account?
            <Link to="/signup">Create one now</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
