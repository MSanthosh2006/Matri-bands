
import React, { useState } from "react";

export default function AddDoctor({ token, onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  async function registerDoctor(e) {
    e.preventDefault();
    setMessage("");

    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const API = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
      const response = await fetch(
        `${API}/api/staff`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
            role: "doctor"
          })
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const detail = Array.isArray(data.detail)
          ? data.detail.map((item) => item.msg).join(", ")
          : data.detail;
        throw new Error(detail || "Registration failed");
      }

      setMessage("Doctor registered successfully!");
      setForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
      });

      onSuccess?.();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="doctor-form" onSubmit={registerDoctor}>
      <h2>Register New Doctor</h2>
      <p>Create a doctor account for your hospital.</p>

      <label>Doctor name</label>
      <input
        name="name"
        value={form.name}
        onChange={update}
        placeholder="Dr. Arun Kumar"
        required
      />

      <label>Email address</label>
      <input
        name="email"
        type="email"
        value={form.email}
        onChange={update}
        placeholder="doctor@hospital.com"
        required
      />

      <label>Password</label>
      <input
        name="password"
        type="password"
        value={form.password}
        onChange={update}
        minLength={12}
        required
      />

      <label>Confirm password</label>
      <input
        name="confirmPassword"
        type="password"
        value={form.confirmPassword}
        onChange={update}
        minLength={12}
        required
      />

      {message && <p role="status">{message}</p>}

      <button type="submit" disabled={loading}>
        {loading ? "Registering..." : "Register Doctor"}
      </button>
    </form>
  );
}
