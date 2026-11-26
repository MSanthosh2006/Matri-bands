
import React, { useCallback, useEffect, useMemo, useState } from "react";

const API = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

const getToken = () =>
  localStorage.getItem("karuvil_token") ||
  localStorage.getItem("fetus_token") ||
  "";

const saveToken = (token) => {
  localStorage.setItem("karuvil_token", token);
  localStorage.removeItem("fetus_token");
};

const clearToken = () => {
  localStorage.removeItem("karuvil_token");
  localStorage.removeItem("fetus_token");
};

function getErrorMessage(data) {
  if (!data) return "Something went wrong.";
  if (typeof data === "string") return data;
  if (typeof data.detail === "string") return data.detail;

  if (Array.isArray(data.detail)) {
    return data.detail.map((item) => {
      const field = item.loc?.slice(1).join(".");
      return `${field ? field + ": " : ""}${item.msg || "Invalid value"}`;
    }).join(" | ");
  }

  if (data.detail && typeof data.detail === "object") {
    return data.detail.message || JSON.stringify(data.detail);
  }

  if (typeof data.message === "string") return data.message;

  return JSON.stringify(data);
}

async function apiRequest(path, options = {}) {
  const token = getToken();

  let response;
  try {
    response = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch (error) {
    throw new Error(
      `Cannot reach the Karuvil API at ${API}. Start the FastAPI backend and check frontend/.env (VITE_API_URL).`
    );
  }

  const contentType = response.headers.get("content-type") || "";
  let data;

  try {
    data = contentType.includes("application/json")
      ? await response.json()
      : await response.text();
  } catch {
    data = "Invalid response from server.";
  }

  if (!response.ok) {
    throw new Error(getErrorMessage(data));
  }

  return data;
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap');

:root {
  --primary: #F5EBDD;
  --primary-dark: #E8D8C3;
  --primary-light: #E8DDE1;
  --accent: #D9BFA9;

  --background: #641E35;
  --surface: #762B43;
  --surface-secondary: #84374F;
  --surface-hover: #91435A;

  --text-primary: #FFFFFF;
  --text-secondary: #E8DDE1;
  --text-muted: #D4BBC5;

  --border: rgba(255,255,255,.15);

  --success: #A9E2C4;
  --success-bg: rgba(169,226,196,.13);

  --warning: #F5D28B;
  --warning-bg: rgba(245,210,139,.13);

  --danger: #FFB4BC;
  --danger-bg: rgba(255,180,188,.13);

  --sidebar: #57182D;
  --sidebar-text: #E8DDE1;

  --shadow: 0 8px 30px rgba(30,5,15,.18);
  --shadow-hover: 0 16px 38px rgba(30,5,15,.28);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: 'DM Sans', sans-serif;
  background: var(--background);
  color: var(--text-primary);
}

button, input, select {
  font: inherit;
}

button {
  cursor: pointer;
}

button:disabled {
  opacity: .55;
  cursor: not-allowed;
}

input, select {
  outline: none;
}

button:focus-visible, input:focus-visible, select:focus-visible {
  outline: 3px solid rgba(245,235,221,.35);
  outline-offset: 2px;
}

* {
  scrollbar-width: thin;
  scrollbar-color: #A45B70 transparent;
}

.app-shell {
  min-height: 100vh;
  display: flex;
  background: var(--background);
}

.sidebar {
  width: 252px;
  flex-shrink: 0;
  background: var(--sidebar);
  border-right: 1px solid var(--border);
  min-height: 100vh;
  padding: 27px 17px;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 30;
  transition: transform .3s ease;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 10px 32px;
}

.brand-icon {
  width: 43px;
  height: 43px;
  display: grid;
  place-items: center;
  background: var(--primary);
  color: var(--background);
  border-radius: 15px;
  font-size: 23px;
  box-shadow: 0 7px 16px rgba(0,0,0,.16);
}

.brand-name {
  font-family: Manrope, sans-serif;
  font-size: 21px;
  font-weight: 800;
  letter-spacing: -.8px;
  color: white;
}

.brand-subtitle {
  color: var(--text-muted);
  font-size: 10px;
  letter-spacing: 1.5px;
  font-weight: 700;
  margin-top: 1px;
}

.nav-label {
  color: #D5B5C1;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.5px;
  padding: 0 12px;
  margin: 13px 0 12px;
}

.nav-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.nav-item {
  width: 100%;
  border: 0;
  background: transparent;
  color: var(--sidebar-text);
  padding: 12px 13px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 13px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  transition: .22s ease;
}

.nav-item:hover {
  background: var(--surface-hover);
  color: white;
  transform: translateX(3px);
}

.nav-item.active {
  color: #641E35;
  background: var(--primary);
  box-shadow: 0 7px 16px rgba(0,0,0,.15);
  font-weight: 800;
}

.nav-icon {
  width: 20px;
  text-align: center;
  font-size: 16px;
}

.sidebar-bottom {
  margin-top: auto;
}

.sidebar-help {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 15px;
  margin: 15px 3px;
}

.sidebar-help strong {
  display: block;
  font-size: 12px;
  margin-bottom: 5px;
  color: white;
}

.sidebar-help p {
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

.sidebar-user {
  border-top: 1px solid var(--border);
  padding: 17px 5px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 13px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  color: #641E35;
  background: var(--primary);
  font-weight: 800;
  font-size: 13px;
}

.user-name {
  font-size: 12px;
  font-weight: 700;
  color: white;
}

.user-role {
  color: var(--text-secondary);
  font-size: 10px;
  text-transform: capitalize;
  margin-top: 3px;
}

.main-area {
  margin-left: 252px;
  width: calc(100% - 252px);
  min-height: 100vh;
  background: var(--background);
}

.topbar {
  height: 79px;
  padding: 0 38px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(87,24,45,.96);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 20;
  backdrop-filter: blur(16px);
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 13px;
}

.page-heading {
  font-family: Manrope, sans-serif;
  font-size: 18px;
  font-weight: 800;
  color: white;
}

.page-subheading {
  color: var(--text-secondary);
  font-size: 11px;
  margin-top: 3px;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-button {
  border: 1px solid var(--border);
  width: 39px;
  height: 39px;
  background: var(--surface);
  color: white;
  border-radius: 12px;
  font-size: 16px;
  transition: .2s ease;
}

.icon-button:hover {
  background: var(--primary);
  color: #641E35;
  transform: translateY(-2px);
}

.content {
  padding: 31px 38px 45px;
  max-width: 1600px;
  margin: auto;
  background: var(--background);
}

.welcome-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
  margin-bottom: 25px;
}

.eyebrow {
  color: var(--primary);
  font-size: 10px;
  letter-spacing: 1.7px;
  font-weight: 800;
  text-transform: uppercase;
  margin-bottom: 9px;
}

.welcome-title {
  font-family: Manrope, sans-serif;
  font-size: clamp(23px, 3vw, 29px);
  font-weight: 800;
  letter-spacing: -1.1px;
  margin: 0;
  color: white;
}

.welcome-description {
  color: var(--text-secondary);
  font-size: 12px;
  margin-top: 8px;
}

.primary-button {
  border: 1px solid var(--primary);
  color: #641E35;
  background: var(--primary);
  border-radius: 11px;
  padding: 12px 17px;
  font-size: 12px;
  font-weight: 800;
  box-shadow: 0 6px 15px rgba(0,0,0,.12);
  transition: .22s ease;
}

.primary-button:hover {
  background: white;
  border-color: white;
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

.secondary-button {
  border: 1px solid var(--border);
  color: white;
  background: var(--surface);
  border-radius: 11px;
  padding: 11px 15px;
  font-size: 12px;
  font-weight: 700;
  transition: .2s ease;
}

.secondary-button:hover {
  border-color: var(--primary);
  background: var(--primary);
  color: #641E35;
  transform: translateY(-2px);
}

.danger-button {
  border: 1px solid rgba(255,180,188,.35);
  color: var(--danger);
  background: var(--danger-bg);
  border-radius: 10px;
  padding: 9px 12px;
  font-size: 11px;
  font-weight: 700;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 22px;
}

.stat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 17px;
  padding: 19px;
  box-shadow: var(--shadow);
  position: relative;
  overflow: hidden;
  transition: .25s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-hover);
  border-color: var(--primary);
  background: var(--surface-hover);
}

.stat-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-icon {
  width: 39px;
  height: 39px;
  display: grid;
  place-items: center;
  border-radius: 13px;
  font-size: 17px;
  background: var(--primary);
  color: #641E35;
}

.stat-icon.pink,
.stat-icon.purple,
.stat-icon.green,
.stat-icon.orange {
  background: var(--primary);
  color: #641E35;
}

.stat-tag {
  font-size: 9px;
  color: var(--text-secondary);
  background: rgba(255,255,255,.09);
  padding: 5px 8px;
  border-radius: 20px;
}

.stat-value {
  font-family: Manrope, sans-serif;
  font-size: 29px;
  font-weight: 800;
  letter-spacing: -1px;
  margin-top: 17px;
  color: white;
}

.stat-label {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(270px, .9fr);
  gap: 18px;
  margin-bottom: 20px;
}

.panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 17px;
  box-shadow: var(--shadow);
  padding: 21px;
  min-width: 0;
  animation: fadeUp .4s ease both;
  transition: .25s ease;
}

.panel:hover {
  box-shadow: var(--shadow-hover);
  border-color: rgba(245,235,221,.3);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}

.panel-title {
  font-family: Manrope, sans-serif;
  font-size: 14px;
  font-weight: 800;
  color: white;
}

.panel-subtitle {
  color: var(--text-secondary);
  font-size: 10px;
  margin-top: 4px;
}

.text-link {
  border: 0;
  background: transparent;
  color: var(--primary);
  font-size: 11px;
  font-weight: 800;
}

.text-link:hover {
  text-decoration: underline;
  color: white;
}

.patient-row {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
}

.patient-row:last-child {
  border-bottom: 0;
}

.patient-avatar {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: var(--primary);
  color: #641E35;
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 12px;
  flex-shrink: 0;
}

.patient-info {
  min-width: 0;
  flex: 1;
}

.patient-name {
  font-size: 11px;
  font-weight: 700;
}

.patient-meta {
  font-size: 10px;
  color: var(--text-secondary);
  margin-top: 3px;
}

.status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 9px;
  border-radius: 30px;
  font-size: 9px;
  font-weight: 700;
  white-space: nowrap;
}

.status::before {
  content: '';
  width: 5px;
  height: 5px;
  background: currentColor;
  border-radius: 50%;
}

.status.active, .status.online {
  background: var(--success-bg);
  color: var(--success);
}

.status.pending, .status.stale {
  background: var(--warning-bg);
  color: var(--warning);
}

.status.offline, .status.inactive {
  background: rgba(255,255,255,.09);
  color: var(--text-muted);
}

.status.demo {
  background: rgba(245,235,221,.15);
  color: var(--primary);
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  display: flex;
  gap: 11px;
  align-items: flex-start;
}

.activity-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--primary);
  margin-top: 4px;
  box-shadow: 0 0 0 4px rgba(245,235,221,.12);
  flex-shrink: 0;
}

.activity-text {
  font-size: 11px;
  line-height: 1.5;
}

.activity-time {
  color: var(--text-secondary);
  font-size: 9px;
  margin-top: 3px;
}

.table-wrap {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  min-width: 570px;
  color: white;
}

th {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: .9px;
  color: var(--primary);
  font-weight: 800;
  padding: 12px 13px;
  background: var(--surface-secondary);
  border-bottom: 1px solid var(--border);
}

td {
  padding: 14px 13px;
  font-size: 11px;
  border-bottom: 1px solid var(--border);
  color: var(--text-primary);
}

tbody tr {
  transition: background .2s ease;
}

tbody tr:hover {
  background: var(--surface-hover);
}

.table-primary {
  font-weight: 700;
  color: white;
}

.table-muted {
  color: var(--text-secondary);
  font-size: 10px;
  margin-top: 4px;
}

.search-input, .form-input, .form-select {
  width: 100%;
  border: 1px solid var(--border);
  background: var(--surface-secondary);
  color: white;
  padding: 12px 13px;
  border-radius: 10px;
  font-size: 12px;
  transition: .2s ease;
}

.search-input::placeholder,
.form-input::placeholder {
  color: var(--text-muted);
}

.search-input:focus,
.form-input:focus,
.form-select:focus {
  border-color: var(--primary);
  background: var(--surface-hover);
  box-shadow: 0 0 0 3px rgba(245,235,221,.12);
}

.form-select option {
  background: #762B43;
  color: white;
}

.search-box {
  max-width: 320px;
  width: 100%;
  position: relative;
}

.search-box input {
  padding-left: 36px;
}

.search-symbol {
  position: absolute;
  left: 13px;
  top: 11px;
  color: var(--primary);
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.form-field label {
  font-size: 10px;
  font-weight: 700;
  color: var(--text-secondary);
}

.form-field.full {
  grid-column: 1 / -1;
}

.message {
  border-radius: 11px;
  padding: 11px 13px;
  font-size: 11px;
  margin-bottom: 14px;
  line-height: 1.5;
}

.message.error {
  color: var(--danger);
  background: var(--danger-bg);
  border: 1px solid rgba(255,180,188,.3);
}

.message.success {
  color: var(--success);
  background: var(--success-bg);
  border: 1px solid rgba(169,226,196,.3);
}

.empty-state {
  text-align: center;
  padding: 35px 15px;
  color: var(--text-secondary);
  font-size: 11px;
}

.empty-icon {
  font-size: 28px;
  margin-bottom: 10px;
  color: var(--primary);
}

.lookup-card {
  max-width: 650px;
  margin: 0 auto;
}

.lookup-hero {
  text-align: center;
  padding: 10px 10px 23px;
}

.lookup-icon {
  width: 61px;
  height: 61px;
  margin: 0 auto 13px;
  display: grid;
  place-items: center;
  border-radius: 20px;
  background: var(--primary);
  color: #641E35;
  font-size: 25px;
}

.lookup-hero h2 {
  font-family: Manrope, sans-serif;
  font-size: 19px;
  margin: 0;
  color: white;
}

.lookup-hero p {
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.7;
  max-width: 400px;
  margin: 8px auto 0;
}

.lookup-form {
  display: flex;
  gap: 10px;
  max-width: 420px;
  margin: auto;
}

.lookup-form input {
  text-align: center;
  letter-spacing: 6px;
  font-weight: 800;
  font-size: 17px;
}

.patient-detail {
  margin-top: 20px;
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 17px;
  background: var(--surface-secondary);
}

.patient-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin-top: 15px;
}

.detail-label {
  color: var(--text-secondary);
  font-size: 9px;
  margin-bottom: 5px;
}

.detail-value {
  font-size: 12px;
  font-weight: 700;
  color: white;
  overflow-wrap: anywhere;
}

.reading-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin: 17px 0;
}

.reading-card {
  background: var(--surface-secondary);
  border: 1px solid var(--border);
  padding: 14px;
  border-radius: 13px;
}

.reading-name {
  font-size: 10px;
  color: var(--text-secondary);
}

.reading-value {
  font-family: Manrope, sans-serif;
  font-size: 22px;
  font-weight: 800;
  margin-top: 8px;
  color: white;
}

.reading-unit {
  font-size: 9px;
  color: var(--text-secondary);
  margin-left: 4px;
}

.login-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: var(--background);
}

.login-visual {
  background:
    radial-gradient(circle at 80% 20%, rgba(245,235,221,.15), transparent 30%),
    linear-gradient(145deg, #57182D, #762B43 55%, #91435A);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 9%;
  position: relative;
  overflow: hidden;
}

.login-visual::before,
.login-visual::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(245,235,221,.2);
}

.login-visual::before {
  width: 390px;
  height: 390px;
  right: -130px;
  top: -100px;
}

.login-visual::after {
  width: 270px;
  height: 270px;
  right: -50px;
  top: -40px;
}

.login-visual h1 {
  font-family: Manrope, sans-serif;
  font-size: clamp(30px, 4vw, 47px);
  line-height: 1.17;
  letter-spacing: -1.8px;
  color: white;
  max-width: 500px;
  position: relative;
  z-index: 1;
}

.login-visual p {
  color: var(--text-secondary);
  line-height: 1.8;
  font-size: 13px;
  max-width: 390px;
  position: relative;
  z-index: 1;
}

.login-illustration {
  font-size: 100px;
  margin-top: 25px;
  filter: drop-shadow(0 12px 15px rgba(0,0,0,.15));
}

.login-side {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 35px;
  background: var(--background);
}

.login-card {
  width: 100%;
  max-width: 410px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 22px;
  padding: 28px;
  box-shadow: var(--shadow-hover);
}

.login-card h2 {
  font-family: Manrope, sans-serif;
  font-size: 25px;
  margin: 0 0 8px;
  letter-spacing: -.8px;
  color: white;
}

.login-description {
  color: var(--text-secondary);
  font-size: 12px;
  margin-bottom: 25px;
  line-height: 1.6;
}

.login-card .form-field {
  margin-bottom: 15px;
}

.login-submit {
  width: 100%;
  margin-top: 8px;
  padding: 14px;
}

.login-switch {
  text-align: center;
  color: var(--text-secondary);
  font-size: 11px;
  margin-top: 20px;
}

.login-switch button {
  color: var(--primary);
  border: 0;
  background: none;
  font-weight: 800;
}

.notice {
  border: 1px solid var(--border);
  background: var(--surface-secondary);
  padding: 12px;
  border-radius: 11px;
  color: var(--text-secondary);
  font-size: 10px;
  line-height: 1.6;
  margin-top: 16px;
}

.notice strong {
  color: var(--primary);
}

.mobile-menu {
  display: none;
}

.loading {
  color: var(--text-secondary);
  font-size: 12px;
  padding: 25px;
  text-align: center;
}

.section-enter {
  animation: fadeUp .35s ease both;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 1100px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .content { padding: 25px; }
  .topbar { padding: 0 25px; }
}

@media (max-width: 850px) {
  .sidebar {
    transform: translateX(-100%);
    box-shadow: 10px 0 35px rgba(30,5,15,.3);
  }

  .sidebar.open { transform: translateX(0); }
  .main-area { margin-left: 0; width: 100%; }
  .mobile-menu { display: inline-grid; }
  .dashboard-grid { grid-template-columns: 1fr; }
}

@media (max-width: 600px) {
  .topbar { height: 68px; padding: 0 15px; }
  .content { padding: 21px 15px 35px; }
  .topbar-right .topbar-date { display: none; }
  .welcome-row { align-items: flex-start; flex-direction: column; }
  .stats-grid { gap: 10px; }
  .stat-card { padding: 14px; }
  .stat-value { font-size: 24px; }
  .panel { padding: 15px; }
  .form-grid { grid-template-columns: 1fr; }
  .form-field.full { grid-column: auto; }
  .lookup-form { flex-direction: column; }
  .reading-grid { grid-template-columns: repeat(2, 1fr); }
  .patient-detail-grid { grid-template-columns: 1fr 1fr; }
  .login-page { grid-template-columns: 1fr; }
  .login-visual { display: none; }
  .login-side { min-height: 100vh; padding: 20px; }
  .login-card { padding: 22px; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    transition-duration: .01ms !important;
    scroll-behavior: auto !important;
  }
}
`;

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: "◫" },
  { id: "lookup", label: "Find Patient", icon: "⌕" },
  { id: "patients", label: "Patients", icon: "♙" },
  { id: "monitoring", label: "Monitoring", icon: "♡" },
  { id: "staff", label: "Staff Management", icon: "♧", adminOnly: true },
  { id: "audit", label: "Access Audit", icon: "▤", adminOnly: true },
];

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
};

const getInitials = (name = "") =>
  name.split(" ").filter(Boolean).slice(0, 2)
    .map((part) => part[0]).join("").toUpperCase() || "K";

const getStatus = (value) => {
  const status = String(value || "").toLowerCase();

  if (status.includes("online") || status.includes("active") || status.includes("granted")) {
    return "active";
  }
  if (status.includes("stale") || status.includes("pending")) return "pending";
  if (status.includes("demo")) return "demo";
  return "offline";
};

function Message({ message, type = "error" }) {
  if (!message) return null;
  return <div className={`message ${type}`}>{message}</div>;
}

function EmptyState({ icon = "♡", title = "No records found", description }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <strong style={{ color: "white" }}>{title}</strong>
      {description && <div style={{ marginTop: 7 }}>{description}</div>}
    </div>
  );
}

function StatCard({ icon, color, label, value, tag }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <div className={`stat-icon ${color}`}>{icon}</div>
        {tag && <span className="stat-tag">{tag}</span>}
      </div>
      <div className="stat-value">{value ?? "—"}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function PatientName({ patient }) {
  const name = patient?.name || patient?.full_name ||
    patient?.patient_name || "Patient";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div className="patient-avatar">{getInitials(name)}</div>
      <div>
        <div className="table-primary">{name}</div>
        <div className="table-muted">
          {patient?.patient_code || patient?.patient_id || "Patient record"}
        </div>
      </div>
    </div>
  );
}

function ReadingsTable({ readings = [] }) {
  if (!readings.length) {
    return (
      <EmptyState
        icon="♡"
        title="No readings available"
        description="Device readings will appear here when authenticated devices send data."
      />
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Measurement</th>
            <th>Value</th>
            <th>Device status</th>
            <th>Recorded at</th>
          </tr>
        </thead>
        <tbody>
          {readings.map((reading, index) => {
            const type = reading.type || reading.metric ||
              reading.measurement || reading.sensor_type || "Reading";
            const value = reading.value ?? reading.reading ?? "—";
            const unit = reading.unit || "";
            const status = reading.status || "Unknown";

            return (
              <tr key={reading.id || index}>
                <td className="table-primary">{type}</td>
                <td><strong>{value}</strong> {unit}</td>
                <td>
                  <span className={`status ${getStatus(status)}`}>
                    {status}
                  </span>
                </td>
                <td>{formatDate(reading.recorded_at || reading.timestamp || reading.created_at)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function App() {
  const [token, setToken] = useState(getToken());
  const [user, setUser] = useState(null);
  const [hospital, setHospital] = useState(null);

  const [page, setPage] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [dashboard, setDashboard] = useState({});
  const [patients, setPatients] = useState([]);
  const [staff, setStaff] = useState([]);
  const [audit, setAudit] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [readings, setReadings] = useState([]);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  const [search, setSearch] = useState("");
  const [pin, setPin] = useState("");

  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({
    email: "",
    password: "",
    hospital_name: "",
    hospital_code: "",
    name: "",
  });

  const [staffForm, setStaffForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "doctor",
  });

  const [lookupLoading, setLookupLoading] = useState(false);
  const [staffLoading, setStaffLoading] = useState(false);

  const isAdmin = String(user?.role || "").toLowerCase() === "admin";

  const showMessage = useCallback((text, type = "error") => {
    setMessage(String(text));
    setMessageType(type);
  }, []);

  const clearMessage = () => setMessage("");

  const loadMe = useCallback(async () => {
    const data = await apiRequest("/api/me");
    setUser(data.user || data);
    const hospitalValue = data.hospital || data.user?.hospital || null;
    setHospital(
      typeof hospitalValue === "string"
        ? { name: hospitalValue }
        : hospitalValue
    );
    return data;
  }, []);

  const loadDashboard = useCallback(async () => {
    const data = await apiRequest("/api/dashboard");
    setDashboard(data || {});
  }, []);

  const loadPatients = useCallback(async () => {
    const data = await apiRequest("/api/patients");
    setPatients(Array.isArray(data) ? data : data.items || data.patients || []);
  }, []);

  const loadStaff = useCallback(async (role = user?.role) => {
    if (String(role || "").toLowerCase() !== "admin") {
      setStaff([]);
      return;
    }
    const data = await apiRequest("/api/staff");
    setStaff(Array.isArray(data) ? data : data.items || data.staff || []);
  }, [user?.role]);

  const loadAudit = useCallback(async (role = user?.role) => {
    if (String(role || "").toLowerCase() !== "admin") {
      setAudit([]);
      return;
    }
    const data = await apiRequest("/api/audit");
    setAudit(Array.isArray(data) ? data : data.items || data.logs || []);
  }, [user?.role]);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    clearMessage();

    try {
      const meData = await loadMe();
      const currentUser = meData.user || meData;
      await Promise.all([
        loadDashboard(),
        loadPatients(),
        loadStaff(currentUser.role),
        loadAudit(currentUser.role),
      ]);
    } catch (error) {
      showMessage(error.message);

      if (
        error.message.toLowerCase().includes("token") ||
        error.message.toLowerCase().includes("unauthorized") ||
        error.message.toLowerCase().includes("credential")
      ) {
        clearToken();
        setToken("");
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, [loadMe, loadDashboard, loadPatients, loadStaff, loadAudit, showMessage]);

  useEffect(() => {
    if (token) loadInitialData();
  }, [token, loadInitialData]);

  const handleLogin = async (event) => {
    event.preventDefault();
    clearMessage();
    setLoading(true);

    try {
      const data = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: authForm.email.trim(),
          password: authForm.password,
        }),
      });

      const newToken = data.access_token || data.token;
      if (!newToken) throw new Error("Login response did not contain an access token.");

      saveToken(newToken);
      setToken(newToken);
      showMessage("Login successful. Welcome to Karuvil.", "success");
    } catch (error) {
      showMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleHospitalRegister = async (event) => {
    event.preventDefault();
    clearMessage();
    setLoading(true);

    try {
      const payload = {
        hospital_name: authForm.hospital_name.trim(),
        hospital_code: authForm.hospital_code.trim() || null,
        admin_name: authForm.name.trim(),
        email: authForm.email.trim(),
        password: authForm.password,
      };

      const data = await apiRequest("/api/hospitals/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const newToken = data.access_token || data.token;

      if (newToken) {
        saveToken(newToken);
        setToken(newToken);
      } else {
        setAuthMode("login");
        showMessage(
          "Hospital registered. Please log in using your account credentials.",
          "success"
        );
      }
    } catch (error) {
      showMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearToken();
    setToken("");
    setUser(null);
    setHospital(null);
    setPatients([]);
    setStaff([]);
    setAudit([]);
    setDashboard({});
    setSelectedPatient(null);
    setReadings([]);
    setPage("overview");
    setMessage("");
  };

  const handleCreateStaff = async (event) => {
    event.preventDefault();
    clearMessage();
    setStaffLoading(true);

    try {
      await apiRequest("/api/staff", {
        method: "POST",
        body: JSON.stringify({
          name: staffForm.name.trim(),
          email: staffForm.email.trim(),
          password: staffForm.password,
          role: staffForm.role,
        }),
      });

      setStaffForm({
        name: "",
        email: "",
        password: "",
        role: "doctor",
      });

      await loadStaff();
      showMessage("Staff account created successfully.", "success");
    } catch (error) {
      showMessage(error.message);
    } finally {
      setStaffLoading(false);
    }
  };

  const handlePatientLookup = async (event) => {
    event.preventDefault();
    clearMessage();

    if (!/^[0-9]{6}$/.test(pin)) {
      showMessage("Enter a valid six-digit patient PIN.");
      return;
    }

    setLookupLoading(true);

    try {
      const data = await apiRequest(
        `/api/patients/lookup?pin=${encodeURIComponent(pin)}`,
        { method: "POST" }
      );

      const patient = data.patient || data;
      setSelectedPatient(patient);
      setReadings(data.readings || []);
      showMessage("Patient record retrieved.", "success");
    } catch (error) {
      setSelectedPatient(null);
      setReadings([]);
      showMessage(error.message);
    } finally {
      setLookupLoading(false);
    }
  };

  const openPatient = async (patient) => {
    clearMessage();
    setSelectedPatient(patient);
    setReadings([]);
    setPage("monitoring");

    const patientId =
      patient.id || patient.patient_id || patient.patient_code;

    if (!patientId) {
      showMessage("This patient record does not contain a valid ID.");
      return;
    }

    try {
      const data = await apiRequest(
        `/api/patients/${encodeURIComponent(patientId)}/readings`
      );
      setReadings(Array.isArray(data) ? data : data.readings || []);
    } catch (error) {
      showMessage(error.message);
    }
  };

  const refreshCurrentPage = async () => {
    setRefreshing(true);
    clearMessage();

    try {
      if (page === "overview") {
        await Promise.all([loadDashboard(), loadPatients()]);
      } else if (page === "patients") {
        await loadPatients();
      } else if (page === "staff") {
        await loadStaff();
      } else if (page === "audit") {
        await loadAudit();
      } else if (page === "monitoring" && selectedPatient) {
        const id = selectedPatient.id ||
          selectedPatient.patient_id || selectedPatient.patient_code;

        const data = await apiRequest(
          `/api/patients/${encodeURIComponent(id)}/readings`
        );
        setReadings(Array.isArray(data) ? data : data.readings || []);
      }

      showMessage("Data refreshed successfully.", "success");
    } catch (error) {
      showMessage(error.message);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredPatients = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return patients;

    return patients.filter((patient) =>
      [
        patient.name,
        patient.full_name,
        patient.patient_name,
        patient.email,
        patient.patient_code,
        patient.patient_id,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [patients, search]);

  const stats = {
    totalPatients: dashboard.total_patients ??
      dashboard.patient_count ?? patients.length,

    activePatients: dashboard.active_patients ??
      dashboard.active_count ??
      patients.filter((p) => p.status === "active").length,

    doctors: dashboard.total_doctors ??
      staff.filter((s) => s.role === "doctor").length,

    nurses: dashboard.total_nurses ??
      staff.filter((s) => s.role === "nurse").length,
  };

  const changePage = (nextPage) => {
    setPage(nextPage);
    setSidebarOpen(false);
    setSearch("");
    clearMessage();
  };

  const pageInfo = {
    overview: ["Overview", "Your hospital's maternal care overview"],
    lookup: ["Find Patient", "Securely locate an authorized patient"],
    patients: ["Patients", "Manage your hospital's patient records"],
    monitoring: ["Patient Monitoring", "Review available device readings"],
    staff: ["Staff Management", "Manage your hospital team"],
    audit: ["Access Audit", "Review patient record access activity"],
  };

  if (!token) {
    return (
      <>
        <style>{styles}</style>

        <div className="login-page">
          <div className="login-visual">
            <div className="brand" style={{ padding: 0 }}>
              <div className="brand-icon">♡</div>
              <div>
                <div className="brand-name">Karuvil</div>
                <div className="brand-subtitle">MATERNAL CARE PLATFORM</div>
              </div>
            </div>

            <h1>Better care begins with better connection.</h1>
            <p>
              A connected maternal healthcare workspace designed to help
              hospitals coordinate patient care, review monitoring data, and
              support informed clinical decisions.
            </p>
            <div className="login-illustration">🤰🏻</div>
          </div>

          <div className="login-side">
            <div className="login-card">
              <div className="brand" style={{ padding: "0 0 25px" }}>
                <div className="brand-icon">♡</div>
                <div>
                  <div className="brand-name">Karuvil</div>
                  <div className="brand-subtitle">HOSPITAL WORKSPACE</div>
                </div>
              </div>

              <h2>
                {authMode === "login"
                  ? "Welcome back"
                  : "Register your hospital"}
              </h2>

              <div className="login-description">
                {authMode === "login"
                  ? "Sign in to access your hospital's maternal care dashboard."
                  : "Create a hospital workspace and administrator account."}
              </div>

              <Message message={message} type={messageType} />

              <form onSubmit={authMode === "login" ? handleLogin : handleHospitalRegister}>
                {authMode === "register" && (
                  <>
                    <div className="form-field">
                      <label>Hospital name</label>
                      <input
                        className="form-input"
                        placeholder="Enter hospital name"
                        value={authForm.hospital_name}
                        onChange={(e) => setAuthForm({
                          ...authForm, hospital_name: e.target.value,
                        })}
                        required
                      />
                    </div>

                    <div className="form-field">
                      <label>Hospital code</label>
                      <input
                        className="form-input"
                        placeholder="Create a hospital code"
                        value={authForm.hospital_code}
                        onChange={(e) => setAuthForm({
                          ...authForm, hospital_code: e.target.value,
                        })}
                      />
                      <small style={{ color: "var(--text-secondary)", fontSize: 10 }}>
                        Optional. Leave blank to generate a unique hospital code.
                      </small>
                    </div>

                    <div className="form-field">
                      <label>Administrator name</label>
                      <input
                        className="form-input"
                        placeholder="Your full name"
                        value={authForm.name}
                        onChange={(e) => setAuthForm({
                          ...authForm, name: e.target.value,
                        })}
                        required
                      />
                    </div>
                  </>
                )}

                <div className="form-field">
                  <label>Email address</label>
                  <input
                    className="form-input"
                    type="email"
                    placeholder="name@hospital.com"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({
                      ...authForm, email: e.target.value,
                    })}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Password</label>
                  <input
                    className="form-input"
                    type="password"
                    placeholder="Enter your password"
                    value={authForm.password}
                    onChange={(e) => setAuthForm({
                      ...authForm, password: e.target.value,
                    })}
                    required
                    minLength={authMode === "register" ? 12 : 1}
                  />
                  {authMode === "register" && (
                    <small style={{ color: "var(--text-secondary)", fontSize: 10 }}>
                      Use at least 12 characters for the administrator password.
                    </small>
                  )}
                </div>

                <button className="primary-button login-submit" type="submit" disabled={loading}>
                  {loading
                    ? "Please wait..."
                    : authMode === "login"
                    ? "Sign in to Karuvil →"
                    : "Create hospital workspace →"}
                </button>
              </form>

              <div className="login-switch">
                {authMode === "login" ? (
                  <>
                    New hospital?{" "}
                    <button type="button" onClick={() => {
                      setAuthMode("register");
                      clearMessage();
                    }}>
                      Register here
                    </button>
                  </>
                ) : (
                  <>
                    Already registered?{" "}
                    <button type="button" onClick={() => {
                      setAuthMode("login");
                      clearMessage();
                    }}>
                      Sign in
                    </button>
                  </>
                )}
              </div>

              <div className="notice">
                <strong>Secure access:</strong> Only authorized hospital
                personnel should use this workspace. Patient information must
                only be accessed with valid authorization and consent.
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const currentPage = pageInfo[page] || pageInfo.overview;

  return (
    <>
      <style>{styles}</style>

      <div className="app-shell">
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(20,5,10,.55)",
              zIndex: 25,
            }}
          />
        )}

        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="brand">
            <div className="brand-icon">♡</div>
            <div>
              <div className="brand-name">Karuvil</div>
              <div className="brand-subtitle">MATERNAL CARE</div>
            </div>
          </div>

          <div className="nav-label">WORKSPACE</div>

          <nav className="nav-list">
            {NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin).map((item) => (
              <button
                key={item.id}
                className={`nav-item ${page === item.id ? "active" : ""}`}
                onClick={() => changePage(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="sidebar-bottom">
            <div className="sidebar-help">
              <strong>Maternal care workspace</strong>
              <p>
                Patient records and monitoring information are available
                according to your hospital permissions.
              </p>
            </div>

            <div className="sidebar-user">
              <div className="avatar">
                {getInitials(user?.name || user?.email || "K")}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="user-name">
                  {user?.name || user?.email || "Hospital User"}
                </div>
                <div className="user-role">
                  {user?.role || "Staff"}{" "}
                  {hospital?.name ? `· ${hospital.name}` : ""}
                </div>
              </div>

              <button
                className="icon-button"
                title="Log out"
                onClick={logout}
                style={{ width: 34, height: 34 }}
              >
                ↪
              </button>
            </div>
          </div>
        </aside>

        <main className="main-area">
          <header className="topbar">
            <div className="topbar-left">
              <button
                className="icon-button mobile-menu"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle menu"
              >
                ☰
              </button>

              <div>
                <div className="page-heading">{currentPage[0]}</div>
                <div className="page-subheading">{currentPage[1]}</div>
              </div>
            </div>

            <div className="topbar-right">
              <span
                className="topbar-date"
                style={{ fontSize: 10, color: "var(--text-secondary)" }}
              >
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>

              <button
                className="icon-button"
                title="Refresh current page"
                onClick={refreshCurrentPage}
                disabled={refreshing}
              >
                {refreshing ? "…" : "↻"}
              </button>

              <div className="avatar">
                {getInitials(user?.name || user?.email || "K")}
              </div>
            </div>
          </header>

          <div className="content">
            <Message message={message} type={messageType} />

            {loading && !user ? (
              <div className="loading">Loading your hospital workspace...</div>
            ) : (
              <div className="section-enter">

                {page === "overview" && (
                  <>
                    <div className="welcome-row">
                      <div>
                        <div className="eyebrow">HOSPITAL DASHBOARD</div>
                        <h1 className="welcome-title">
                          Good day, {user?.name?.split(" ")[0] || "there"} 👋
                        </h1>
                        <div className="welcome-description">
                          Here's an overview of your maternal care workspace.
                        </div>
                      </div>

                      <button className="primary-button" onClick={() => changePage("lookup")}>
                        + Find a patient
                      </button>
                    </div>

                    <div className="stats-grid">
                      <StatCard icon="♙" color="pink" label="Total registered patients" value={stats.totalPatients} tag="Patient records" />
                      <StatCard icon="♡" color="purple" label="Active patients" value={stats.activePatients} tag="Current records" />
                      <StatCard icon="✚" color="green" label="Doctors" value={stats.doctors} tag="Medical team" />
                      <StatCard icon="♧" color="orange" label="Nursing staff" value={stats.nurses} tag="Care team" />
                    </div>

                    <div className="dashboard-grid">
                      <section className="panel">
                        <div className="panel-header">
                          <div>
                            <div className="panel-title">Recently registered patients</div>
                            <div className="panel-subtitle">Latest patient records in your hospital</div>
                          </div>
                          <button className="text-link" onClick={() => changePage("patients")}>
                            View all →
                          </button>
                        </div>

                        {patients.length === 0 ? (
                          <EmptyState
                            title="No patients yet"
                            description="Patient records will appear here when they are registered and authorized for this hospital."
                          />
                        ) : (
                          patients.slice(0, 5).map((patient, index) => (
                            <div className="patient-row" key={patient.id || patient.patient_id || index}>
                              <PatientName patient={patient} />
                              <button className="text-link" onClick={() => openPatient(patient)}>
                                View
                              </button>
                            </div>
                          ))
                        )}
                      </section>

                      <section className="panel">
                        <div className="panel-header">
                          <div>
                            <div className="panel-title">Workspace overview</div>
                            <div className="panel-subtitle">Hospital information</div>
                          </div>
                          <span className="status active">Connected</span>
                        </div>

                        <div style={{ padding: "7px 0" }}>
                          <div className="detail-label">HOSPITAL</div>
                          <div className="detail-value">
                            {hospital?.name || hospital?.hospital_name || dashboard.hospital_name || "Hospital workspace"}
                          </div>
                        </div>

                        <div style={{ borderTop: "1px solid var(--border)", padding: "14px 0" }}>
                          <div className="detail-label">YOUR ROLE</div>
                          <div className="detail-value">{user?.role || "Staff"}</div>
                        </div>

                        <div style={{ borderTop: "1px solid var(--border)", padding: "14px 0" }}>
                          <div className="detail-label">ACCOUNT EMAIL</div>
                          <div className="detail-value">{user?.email || "—"}</div>
                        </div>

                        <div style={{ borderTop: "1px solid var(--border)", padding: "14px 0 5px" }}>
                          <div className="detail-label">DATA CONNECTION</div>
                          <div className="detail-value">API connection established</div>
                        </div>
                      </section>
                    </div>

                    <section className="panel">
                      <div className="panel-header">
                        <div>
                          <div className="panel-title">Quick actions</div>
                          <div className="panel-subtitle">Common hospital workspace activities</div>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <button className="secondary-button" onClick={() => changePage("lookup")}>⌕ &nbsp; Find patient using PIN</button>
                        <button className="secondary-button" onClick={() => changePage("patients")}>♙ &nbsp; View patient records</button>
                        <button className="secondary-button" onClick={() => changePage("monitoring")}>♡ &nbsp; Monitoring</button>
                        {isAdmin && (
                          <button className="secondary-button" onClick={() => changePage("staff")}>♧ &nbsp; Manage staff</button>
                        )}
                      </div>
                    </section>
                  </>
                )}

                {page === "lookup" && (
                  <section className="panel lookup-card">
                    <div className="lookup-hero">
                      <div className="lookup-icon">⌕</div>
                      <h2>Find a patient</h2>
                      <p>
                        Enter the patient's six-digit PIN to search for a
                        record shared with your hospital. Access depends on
                        valid authorization and patient consent.
                      </p>
                    </div>

                    <form className="lookup-form" onSubmit={handlePatientLookup}>
                      <input
                        className="form-input"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="000000"
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        aria-label="Six-digit patient PIN"
                      />

                      <button className="primary-button" disabled={lookupLoading}>
                        {lookupLoading ? "Searching..." : "Search patient"}
                      </button>
                    </form>

                    {selectedPatient && (
                      <div className="patient-detail">
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div className="patient-avatar" style={{ width: 46, height: 46, fontSize: 15 }}>
                            {getInitials(selectedPatient.name || selectedPatient.full_name)}
                          </div>

                          <div style={{ flex: 1 }}>
                            <div className="panel-title">
                              {selectedPatient.name || selectedPatient.full_name || selectedPatient.patient_name || "Patient"}
                            </div>
                            <div className="panel-subtitle">Patient record retrieved</div>
                          </div>

                          <span className="status active">Found</span>
                        </div>

                        <div className="patient-detail-grid">
                          <div>
                            <div className="detail-label">PATIENT ID</div>
                            <div className="detail-value">{selectedPatient.id || selectedPatient.patient_id || "—"}</div>
                          </div>
                          <div>
                            <div className="detail-label">EMAIL</div>
                            <div className="detail-value">{selectedPatient.email || "—"}</div>
                          </div>
                          <div>
                            <div className="detail-label">PHONE</div>
                            <div className="detail-value">{selectedPatient.phone || selectedPatient.phone_number || "—"}</div>
                          </div>
                          <div>
                            <div className="detail-label">STATUS</div>
                            <div className="detail-value">{selectedPatient.status || "Available"}</div>
                          </div>
                        </div>

                        <button
                          className="primary-button"
                          style={{ marginTop: 18 }}
                          onClick={() => setPage("monitoring")}
                        >
                          Open monitoring →
                        </button>
                      </div>
                    )}
                  </section>
                )}

                {page === "patients" && (
                  <section className="panel">
                    <div className="welcome-row">
                      <div>
                        <div className="eyebrow">PATIENT DIRECTORY</div>
                        <h1 className="welcome-title">Patient records</h1>
                        <div className="welcome-description">Patients available to your hospital account.</div>
                      </div>

                      <button className="primary-button" onClick={() => changePage("lookup")}>
                        + Find patient
                      </button>
                    </div>

                    <div className="toolbar">
                      <div className="search-box">
                        <span className="search-symbol">⌕</span>
                        <input
                          className="search-input"
                          placeholder="Search patients..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                        />
                      </div>

                      <span style={{ color: "var(--text-secondary)", fontSize: 10 }}>
                        {filteredPatients.length} patient records
                      </span>
                    </div>

                    {filteredPatients.length === 0 ? (
                      <EmptyState title="No matching patients" description="Try another search term or use the patient PIN lookup." />
                    ) : (
                      <div className="table-wrap">
                        <table>
                          <thead>
                            <tr>
                              <th>Patient</th>
                              <th>Email</th>
                              <th>Phone</th>
                              <th>Status</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredPatients.map((patient, index) => (
                              <tr key={patient.id || patient.patient_id || index}>
                                <td><PatientName patient={patient} /></td>
                                <td>{patient.email || "—"}</td>
                                <td>{patient.phone || patient.phone_number || "—"}</td>
                                <td>
                                  <span className={`status ${getStatus(patient.status)}`}>
                                    {patient.status || "Registered"}
                                  </span>
                                </td>
                                <td>
                                  <button className="text-link" onClick={() => openPatient(patient)}>
                                    View readings →
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </section>
                )}

                {page === "monitoring" && (
                  <>
                    <div className="welcome-row">
                      <div>
                        <div className="eyebrow">MONITORING WORKSPACE</div>
                        <h1 className="welcome-title">Patient monitoring</h1>
                        <div className="welcome-description">
                          Review recorded device data for an authorized patient.
                        </div>
                      </div>

                      <button className="secondary-button" onClick={() => changePage("lookup")}>
                        ⌕ Find another patient
                      </button>
                    </div>

                    {selectedPatient ? (
                      <>
                        <section className="panel">
                          <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                            <div className="patient-avatar" style={{ width: 48, height: 48, fontSize: 16 }}>
                              {getInitials(selectedPatient.name || selectedPatient.full_name)}
                            </div>

                            <div style={{ flex: 1 }}>
                              <div className="panel-title">
                                {selectedPatient.name || selectedPatient.full_name || selectedPatient.patient_name || "Patient"}
                              </div>
                              <div className="panel-subtitle">
                                Patient ID: {selectedPatient.id || selectedPatient.patient_id || "—"}
                              </div>
                            </div>

                            <span className="status active">Record selected</span>
                          </div>
                        </section>

                        <section className="panel" style={{ marginTop: 18 }}>
                          <div className="panel-header">
                            <div>
                              <div className="panel-title">Recorded measurements</div>
                              <div className="panel-subtitle">Data returned by the backend for this patient</div>
                            </div>

                            <button className="secondary-button" onClick={refreshCurrentPage}>
                              ↻ Refresh readings
                            </button>
                          </div>

                          <div className="notice" style={{ marginTop: 0 }}>
                            <strong>Clinical data notice:</strong> These readings are displayed as received from the backend. This dashboard does not independently validate sensor accuracy or diagnose a medical condition. Check timestamps and device status before interpreting any measurement.
                          </div>

                          <ReadingsTable readings={readings} />
                        </section>
                      </>
                    ) : (
                      <section className="panel lookup-card">
                        <EmptyState
                          icon="♡"
                          title="No patient selected"
                          description="Find a patient using their six-digit PIN or select a patient from the directory."
                        />
                        <div style={{ textAlign: "center" }}>
                          <button className="primary-button" onClick={() => changePage("lookup")}>
                            Find patient →
                          </button>
                        </div>
                      </section>
                    )}
                  </>
                )}

                {page === "staff" && isAdmin && (
                  <>
                    <div className="welcome-row">
                      <div>
                        <div className="eyebrow">TEAM ADMINISTRATION</div>
                        <h1 className="welcome-title">Staff management</h1>
                        <div className="welcome-description">
                          Create doctor and nurse accounts for this hospital.
                        </div>
                      </div>
                    </div>

                    <div className="dashboard-grid">
                      <section className="panel">
                        <div className="panel-header">
                          <div>
                            <div className="panel-title">Create staff account</div>
                            <div className="panel-subtitle">Add an authorized hospital team member</div>
                          </div>
                        </div>

                        <form className="form-grid" onSubmit={handleCreateStaff}>
                          <div className="form-field full">
                            <label>Full name</label>
                            <input
                              className="form-input"
                              placeholder="Enter staff name"
                              value={staffForm.name}
                              onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                              required
                            />
                          </div>

                          <div className="form-field full">
                            <label>Email address</label>
                            <input
                              className="form-input"
                              type="email"
                              placeholder="staff@hospital.com"
                              value={staffForm.email}
                              onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                              required
                            />
                          </div>

                          <div className="form-field full">
                            <label>Temporary password</label>
                            <input
                              className="form-input"
                              type="password"
                              minLength={12}
                              placeholder="At least 8 characters"
                              value={staffForm.password}
                              onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                              required
                            />
                          </div>

                          <div className="form-field full">
                            <label>Staff role</label>
                            <select
                              className="form-select"
                              value={staffForm.role}
                              onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                            >
                              <option value="doctor">Doctor</option>
                              <option value="nurse">Nurse</option>
                            </select>
                          </div>

                          <div className="form-field full">
                            <button className="primary-button" disabled={staffLoading}>
                              {staffLoading ? "Creating account..." : "Create staff account →"}
                            </button>
                          </div>
                        </form>
                      </section>

                      <section className="panel">
                        <div className="panel-header">
                          <div>
                            <div className="panel-title">Team summary</div>
                            <div className="panel-subtitle">Registered staff accounts</div>
                          </div>
                        </div>

                        <div className="reading-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
                          <div className="reading-card">
                            <div className="reading-name">Doctors</div>
                            <div className="reading-value">{staff.filter((s) => s.role === "doctor").length}</div>
                          </div>
                          <div className="reading-card">
                            <div className="reading-name">Nurses</div>
                            <div className="reading-value">{staff.filter((s) => s.role === "nurse").length}</div>
                          </div>
                        </div>

                        <div className="notice">
                          Staff accounts are created within the authenticated hospital workspace. Confirm that your backend enforces hospital-level access restrictions.
                        </div>
                      </section>
                    </div>

                    <section className="panel" style={{ marginTop: 18 }}>
                      <div className="panel-header">
                        <div>
                          <div className="panel-title">Hospital team</div>
                          <div className="panel-subtitle">Current staff directory</div>
                        </div>
                        <span className="status active">{staff.length} accounts</span>
                      </div>

                      {staff.length === 0 ? (
                        <EmptyState title="No staff accounts found" description="Create a doctor or nurse account to get started." />
                      ) : (
                        <div className="table-wrap">
                          <table>
                            <thead>
                              <tr>
                                <th>Staff member</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {staff.map((member, index) => (
                                <tr key={member.id || index}>
                                  <td>
                                    <PatientName patient={{
                                      name: member.name,
                                      patient_code: `Staff #${member.id || index + 1}`,
                                    }} />
                                  </td>
                                  <td>{member.email || "—"}</td>
                                  <td style={{ textTransform: "capitalize" }}>{member.role || "—"}</td>
                                  <td>
                                    <span className={`status ${member.active === false ? "inactive" : "active"}`}>
                                      {member.active === false ? "Inactive" : "Active"}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </section>
                  </>
                )}

                {page === "audit" && isAdmin && (
                  <section className="panel">
                    <div className="welcome-row">
                      <div>
                        <div className="eyebrow">SECURITY & COMPLIANCE</div>
                        <h1 className="welcome-title">Access audit</h1>
                        <div className="welcome-description">
                          Review recorded access activity in your hospital.
                        </div>
                      </div>
                    </div>

                    {audit.length === 0 ? (
                      <EmptyState
                        icon="▤"
                        title="No audit records available"
                        description="Recorded patient access events will appear here when your backend logs them."
                      />
                    ) : (
                      <div className="table-wrap">
                        <table>
                          <thead>
                            <tr>
                              <th>Activity</th>
                              <th>User</th>
                              <th>Patient</th>
                              <th>Time</th>
                            </tr>
                          </thead>
                          <tbody>
                            {audit.map((item, index) => (
                              <tr key={item.id || index}>
                                <td className="table-primary">
                                  {item.action || item.event || item.activity || "Record access"}
                                </td>
                                <td>{item.user_email || item.user_name || item.user_id || "—"}</td>
                                <td>{item.patient_name || item.patient_id || "—"}</td>
                                <td>{formatDate(item.created_at || item.timestamp || item.accessed_at)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </section>
                )}

                {!isAdmin && (page === "staff" || page === "audit") && (
                  <section className="panel">
                    <EmptyState
                      icon="🔒"
                      title="Administrator access required"
                      description="Your account does not have permission to view this section."
                    />
                    <div style={{ textAlign: "center" }}>
                      <button className="primary-button" onClick={() => changePage("overview")}>
                        Back to overview
                      </button>
                    </div>
                  </section>
                )}

                <div style={{
                  textAlign: "center",
                  color: "var(--text-muted)",
                  fontSize: 9,
                  padding: "25px 0 0",
                }}>
                  KARUVIL HOSPITAL WORKSPACE · MATERNAL CARE PLATFORM
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
