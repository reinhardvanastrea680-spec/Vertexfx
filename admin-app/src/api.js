const API_BASE_URL = "http://localhost:4000/api";
let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(callback) {
  refreshSubscribers.push(callback);
}

function onTokenRefreshed(token) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

async function refreshAccessToken() {
  if (isRefreshing) {
    return new Promise((resolve) => subscribeTokenRefresh(resolve));
  }
  isRefreshing = true;
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Refresh failed");
    const data = await res.json();
    const newToken = data.data?.accessToken || data.accessToken;
    localStorage.setItem("accessToken", newToken);
    isRefreshing = false;
    onTokenRefreshed(newToken);
    return newToken;
  } catch (err) {
    isRefreshing = false;
    localStorage.removeItem("accessToken");
    throw err;
  }
}

export async function apiRequest(path, options = {}) {
  let token = localStorage.getItem("accessToken");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  let res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });
  if (res.status === 401) {
    try {
      const newToken = await refreshAccessToken();
      const newHeaders = {
        ...headers,
        Authorization: `Bearer ${newToken}`,
      };
      res = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: newHeaders,
        credentials: "include",
      });
    } catch {
      const data = await res.json();
      throw new Error(data.message || "Invalid or expired token");
    }
  }
  const data = await res.json();
  if (!res.ok)
    throw new Error(data.message || `Request failed (${res.status})`);
  return data.data ?? data;
}

// ─── Auth ───────────────────────────────────────────────────────────────
export const authApi = {
  register: (data) =>
    apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  login: (data) =>
    apiRequest("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  logout: () => apiRequest("/auth/logout", { method: "POST" }),
};

// ─── Admin ────────────────────────────────────────────────────────────────
export const adminApi = {
  getDashboardStats: () => apiRequest("/admin/dashboard/stats"),
  getUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/admin/users${query ? `?${query}` : ""}`);
  },
  getUserById: (id) => apiRequest(`/admin/users/${id}`),
  updateUserStatus: (id, status) =>
    apiRequest(`/admin/users/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  getKycQueue: (status) =>
    apiRequest(`/admin/kyc${status ? `?status=${status}` : ""}`),
  approveKyc: (id) =>
    apiRequest(`/admin/kyc/${id}/approve`, { method: "POST" }),
  rejectKyc: (id, reason) =>
    apiRequest(`/admin/kyc/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
  getTransactions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/admin/transactions${query ? `?${query}` : ""}`);
  },
  getWithdrawalQueue: () => apiRequest("/admin/withdrawals/pending"),
  approveWithdrawal: (id) =>
    apiRequest(`/admin/withdrawals/${id}/approve`, { method: "POST" }),
  rejectWithdrawal: (id, reason) =>
    apiRequest(`/admin/withdrawals/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
  getTradingAccounts: () => apiRequest("/admin/trading-accounts"),
  getOpenPositions: () => apiRequest("/admin/positions/open"),
  getInstruments: (category) =>
    apiRequest(`/admin/instruments${category ? `?category=${category}` : ""}`),
  getAmlAlerts: (status) =>
    apiRequest(`/admin/aml-alerts${status ? `?status=${status}` : ""}`),
  getAuditLogs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/admin/audit-logs${query ? `?${query}` : ""}`);
  },
  getStaff: () => apiRequest("/admin/staff"),
  createStaff: (data) =>
    apiRequest("/admin/staff", { method: "POST", body: JSON.stringify(data) }),
  getFinancialReport: (from, to) => {
    const query = new URLSearchParams({ from, to }).toString();
    return apiRequest(`/admin/reports/financial?${query}`);
  },
  getTradingReport: (from, to) => {
    const query = new URLSearchParams({ from, to }).toString();
    return apiRequest(`/admin/reports/trading?${query}`);
  },
  getClientReport: (from, to) => {
    const query = new URLSearchParams({ from, to }).toString();
    return apiRequest(`/admin/reports/clients?${query}`);
  },
  adjustBalance: (id, data) =>
    apiRequest(`/admin/users/${id}/adjust-balance`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getSettings: () => {
    // Mock settings for now
    return Promise.resolve({
      maintenance_mode: "false",
      max_withdrawal_per_day: "10000",
      min_withdrawal: "10",
      min_deposit_card: "50",
      default_leverage: "100"
    });
  },
};
