import axios from "axios";

const defaultApiBaseUrl = "https://interviewprep-genai.onrender.com";
const apiBaseUrl = (import.meta.env.VITE_API_URL || defaultApiBaseUrl).replace(/\/+$/, "");

export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  timeout: 30000,
  headers: {
    "X-Requested-With": "XMLHttpRequest",
  },
});

export function getApiErrorMessage(error, fallback = "Something went wrong.") {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.code === "ERR_NETWORK") {
    return `Could not reach the server at ${apiBaseUrl}. Make sure the backend is running.`;
  }

  if (error?.code === "ECONNABORTED") {
    return "The server took too long to respond. Please try again.";
  }

  return fallback;
}
