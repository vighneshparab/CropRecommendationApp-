import React, { useState } from "react";
import zxcvbn from "zxcvbn"; // For password strength checking
import { Link } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [otpEmail, setOtpEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetForm, setResetForm] = useState({
    email: "",
    otp: "",
    newPassword: "",
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [resetSuccess, setResetSuccess] = useState("");

  // Login handlers
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${BASE_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      // Save data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // ✅ Access role from nested credentials
      const role = data.user.credentials?.role;
      if (role === "admin") {
        window.location.href = "/admin-dashboard";
      } else {
        window.location.href = "/profile";
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Password reset handlers
  const handleResetChange = (e) =>
    setResetForm({ ...resetForm, [e.target.name]: e.target.value });

  const handlePasswordChange = (e) => {
    setResetForm({ ...resetForm, newPassword: e.target.value });
    const strength = zxcvbn(e.target.value);
    setPasswordStrength(strength.score);
  };

  const requestOtp = async () => {
    try {
      const res = await fetch(`${BASE_URL}/users/request-password-update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      setOtpSent(true);
      setResetForm({ ...resetForm, email: otpEmail });
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${BASE_URL}/users/update-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resetForm),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to reset password");

      setResetSuccess("Password reset successfully! You can now login.");
      setShowPasswordReset(false);
      setResetForm({ email: "", otp: "", newPassword: "" });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleResendOTP = async () => {
    try {
      const res = await fetch(`${BASE_URL}/users/request-password-update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetForm.email }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to resend OTP");
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        {!showPasswordReset ? (
          <>
            <h2 className="text-2xl font-semibold mb-6 text-center text-green-700">
              Login
            </h2>

            {error && (
              <div className="bg-red-100 text-red-600 p-2 mb-4 rounded">
                {error}
              </div>
            )}
            {resetSuccess && (
              <div className="bg-green-100 text-green-700 p-2 mb-4 rounded">
                {resetSuccess}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="w-full mb-4 px-4 py-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                className="w-full mb-4 px-4 py-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition font-medium"
              >
                Login
              </button>
            </form>

            <div className="mt-4 text-center">
              <span className="text-gray-600">Don't have an account? </span>
              <Link
                to="/register"
                className="text-green-600 hover:text-green-800 font-medium"
              >
                Register
              </Link>
            </div>

            <div className="mt-6 border-t pt-4">
              <button
                onClick={() => setShowPasswordReset(true)}
                className="w-full text-green-600 hover:text-green-800 font-medium"
              >
                Forgot Password?
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-semibold mb-6 text-center text-green-700">
              Reset Password
            </h2>

            {error && (
              <div className="bg-red-100 text-red-600 p-2 mb-4 rounded">
                {error}
              </div>
            )}

            {!otpSent ? (
              <div>
                <p className="text-gray-600 mb-4">
                  Enter your email to receive a password reset OTP
                </p>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 border rounded mb-4 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  value={otpEmail}
                  onChange={(e) => setOtpEmail(e.target.value)}
                />
                <button
                  onClick={requestOtp}
                  className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition font-medium"
                >
                  Send OTP
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit}>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className="w-full mb-4 px-4 py-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  value={resetForm.email}
                  onChange={handleResetChange}
                  required
                  disabled
                />

                <input
                  type="text"
                  name="otp"
                  placeholder="Enter OTP"
                  className="w-full mb-4 px-4 py-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  value={resetForm.otp}
                  onChange={handleResetChange}
                  required
                />

                <div className="mb-4">
                  <input
                    type="password"
                    name="newPassword"
                    placeholder="New Password"
                    className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    value={resetForm.newPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                  <div
                    className={`mt-2 text-sm ${
                      passwordStrength === 0
                        ? "text-gray-500"
                        : passwordStrength < 2
                        ? "text-red-500"
                        : passwordStrength < 4
                        ? "text-yellow-500"
                        : "text-green-500"
                    }`}
                  >
                    Password Strength:{" "}
                    {["Weak", "Fair", "Good", "Strong"][passwordStrength]}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition font-medium"
                >
                  Reset Password
                </button>

                <button
                  type="button"
                  onClick={handleResendOTP}
                  className="mt-4 text-green-600 hover:text-green-800 text-sm"
                >
                  Didn't receive OTP? Resend
                </button>
              </form>
            )}

            <button
              onClick={() => {
                setShowPasswordReset(false);
                setOtpSent(false);
                setError("");
              }}
              className="mt-4 w-full text-green-600 hover:text-green-800 font-medium"
            >
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
