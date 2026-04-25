import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./signup.css";

function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return Math.min(strength, 3);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });

    if (name === "password") {
      setPasswordStrength(calculatePasswordStrength(value));
    }

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
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!agreeTerms) {
      newErrors.terms = "You must agree to the terms and conditions";
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
      const response = await axios.post("http://127.0.0.1:8000/user/signup", {
        email: form.email,
        password: form.password,
      });

      setMessage("✅ Signup successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail ||
        err.message ||
        "Signup failed. Please try again.";
      setMessage(`❌ ${errorMsg}`);
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthLevel = () => {
    if (passwordStrength === 1) return "weak";
    if (passwordStrength === 2) return "medium";
    if (passwordStrength === 3) return "strong";
    return "";
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        {/* Header */}
        <div className="signup-header">
          <h1>Create Account</h1>
          <p>
            Join our learning community and start your educational journey today
          </p>
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
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Create a strong password"
              value={form.password}
              onChange={handleChange}
              className={errors.password ? "input-error" : ""}
              required
            />
            {form.password && (
              <>
                <div className="password-strength">
                  <div
                    className={`strength-bar ${passwordStrength >= 1 ? `strength-${getPasswordStrengthLevel()}` : ""}`}
                  ></div>
                  <div
                    className={`strength-bar ${passwordStrength >= 2 ? `strength-${getPasswordStrengthLevel()}` : ""}`}
                  ></div>
                  <div
                    className={`strength-bar ${passwordStrength >= 3 ? `strength-${getPasswordStrengthLevel()}` : ""}`}
                  ></div>
                </div>
                <div className={`strength-text ${getPasswordStrengthLevel()}`}>
                  {getPasswordStrengthLevel() === "weak" && "Weak password"}
                  {getPasswordStrengthLevel() === "medium" && "Medium strength"}
                  {getPasswordStrengthLevel() === "strong" && "Strong password"}
                </div>
              </>
            )}
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

          {/* Confirm Password Field */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Re-enter your password"
              value={form.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? "input-error" : ""}
              required
            />
            {errors.confirmPassword && (
              <span
                style={{
                  color: "#ef4444",
                  fontSize: "0.85rem",
                  marginTop: "4px",
                  display: "block",
                }}
              >
                {errors.confirmPassword}
              </span>
            )}
          </div>

          {/* Terms & Conditions */}
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={(e) => {
                setAgreeTerms(e.target.checked);
                if (errors.terms) {
                  setErrors({ ...errors, terms: "" });
                }
              }}
            />
            <label htmlFor="terms">
              I agree to the <a href="#terms">Terms & Conditions</a> and{" "}
              <a href="#privacy">Privacy Policy</a>
            </label>
          </div>
          {errors.terms && (
            <span
              style={{
                color: "#ef4444",
                fontSize: "0.85rem",
                marginBottom: "16px",
                display: "block",
              }}
            >
              {errors.terms}
            </span>
          )}

          {/* Submit Button */}
          <button type="submit" className="signup-btn" disabled={loading}>
            {loading && <span className="loading-spinner"></span>}
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        {/* Login Link */}
        <div className="signup-footer">
          <p>
            Already have an account?
            <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
