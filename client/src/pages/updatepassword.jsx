import React, { useState } from "react";
import zxcvbn from "zxcvbn"; // For password strength checking

const BASE_URL = import.meta.env.VITE_API_BASE_URL; // For Vite
// const BASE_URL = process.env.REACT_APP_API_BASE_URL; // For CRA

const UpdatePassword = () => {
  const [form, setForm] = useState({
    email: "",
    otp: "",
    newPassword: "",
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handlePasswordChange = (e) => {
    setForm({ ...form, newPassword: e.target.value });
    const strength = zxcvbn(e.target.value);
    setPasswordStrength(strength.score);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${BASE_URL}/auth/update-password-with-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to update password");
      setSuccess("Password updated successfully!");
      setForm({ email: "", otp: "", newPassword: "" });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${BASE_URL}/auth/request-password-update-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to resend OTP");
      setSuccess("OTP sent to your email!");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Update Password with OTP
        </h2>

        {error && (
          <div className="bg-red-100 text-red-600 p-2 mb-4 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 text-green-700 p-2 mb-4 rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full mb-4 px-4 py-2 border rounded"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="otp"
            placeholder="Enter OTP"
            className="w-full mb-4 px-4 py-2 border rounded"
            value={form.otp}
            onChange={handleChange}
            required
          />

          <div className="mb-4">
            <input
              type="password"
              name="newPassword"
              placeholder="New Password"
              className="w-full px-4 py-2 border rounded"
              value={form.newPassword}
              onChange={handlePasswordChange}
              required
            />
            <div
              className={`mt-2 ${
                passwordStrength === 0
                  ? "text-gray-600"
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
            className="w-full bg-teal-700 text-white py-2 rounded hover:bg-teal-800 transition"
          >
            Update Password
          </button>
        </form>

        <button
          onClick={handleResendOTP}
          className="mt-4 w-full text-teal-700 hover:text-teal-800"
        >
          Resend OTP
        </button>
      </div>
    </div>
  );
};

export default UpdatePassword;
