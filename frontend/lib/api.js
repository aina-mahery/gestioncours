"use client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

export async function apiFetch(path, options = {}) {
  const token = getAccessToken();
  const headers = { ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok) throw new Error(data?.message || "Erreur API.");
  return data;
}

export async function apiFormData(path, formData, options = {}) {
  const token = getAccessToken();
  const headers = { ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || "POST",
    body: formData,
    headers
  });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok) throw new Error(data?.message || "Erreur API.");
  return data;
}

export async function apiDownload(path, fileName = "document.pdf") {
  const token = getAccessToken();
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, { method: "GET", headers });
  if (!response.ok) {
    let message = "Erreur lors du téléchargement.";
    try {
      const data = await response.json();
      message = data?.message || message;
    } catch (error) {
      // ignore
    }
    throw new Error(message);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
