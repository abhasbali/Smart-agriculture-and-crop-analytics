import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

export const fetchEtlSummary = () => apiClient.get("/api/etl/summary").then((r) => r.data);
export const refreshPipeline = () => apiClient.post("/api/etl/refresh").then((r) => r.data);
export const fetchRanking = () => apiClient.get("/api/ranking").then((r) => r.data);
export const searchRanking = (state) =>
  apiClient.get("/api/ranking/search", { params: { state } }).then((r) => r.data);
export const fetchDashboard = () => apiClient.get("/api/dashboard").then((r) => r.data);
export const fetchRiskMap = () => apiClient.get("/api/riskmap").then((r) => r.data);
export const fetchRiskMapSummary = () =>
  apiClient.get("/api/riskmap/summary").then((r) => r.data);

export const sendChatMessage = (message, history = []) =>
  apiClient
    .post("/api/chat", { message, history }, { timeout: 45000 })
    .then((r) => r.data);

export const csvDownloadUrl = `${BASE_URL}/outputs/crop_census.csv`;
export const dashboardPngUrl = `${BASE_URL}/outputs/agri_dashboard.png`;
export const riskMapHtmlUrl = `${BASE_URL}/outputs/agri_risk_map.html`;
