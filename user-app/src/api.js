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
  let res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers, credentials: "include" });
  if (res.status === 401) {
    try {
      const newToken = await refreshAccessToken();
      const newHeaders = {
        ...headers,
        Authorization: `Bearer ${newToken}`,
      };
      res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers: newHeaders, credentials: "include" });
    } catch {
      const data = await res.json();
      throw new Error(data.message || "Invalid or expired token");
    }
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data.data ?? data;
}

// ── Users ──────────────────────────────────────────────────────────────────
export const usersApi = {
  getMe: () => apiRequest("/users/me"),
  updateProfile: (data) => apiRequest("/users/me", { method: "PATCH", body: JSON.stringify(data) }),
  submitKyc: (data) => apiRequest("/users/me/kyc", { method: "POST", body: JSON.stringify(data) }),
  getKycDocuments: () => apiRequest("/users/me/kyc"),
  getTradingAccounts: () => apiRequest("/users/me/accounts"),
  getNotifications: (page = 1) => apiRequest(`/users/me/notifications?page=${page}`),
  markNotificationRead: (id) => apiRequest(`/users/me/notifications/${id}/read`, { method: "PATCH" }),
  markAllNotificationsRead: () => apiRequest("/users/me/notifications/read-all", { method: "POST" }),
};

// ── Wallet ─────────────────────────────────────────────────────────────────
export const walletApi = {
  getWallet: () => apiRequest("/wallet"),
  initiateDeposit: (data) => apiRequest("/wallet/deposit", { method: "POST", body: JSON.stringify(data) }),
  requestWithdrawal: (data) => apiRequest("/wallet/withdraw", { method: "POST", body: JSON.stringify(data) }),
  getTransactions: (page = 1, type) => apiRequest(`/wallet/transactions?page=${page}${type ? `&type=${type}` : ""}`),
  getBankAccounts: () => apiRequest("/wallet/bank-accounts"),
  addBankAccount: (data) => apiRequest("/wallet/bank-accounts", { method: "POST", body: JSON.stringify(data) }),
  deleteBankAccount: (id) => apiRequest(`/wallet/bank-accounts/${id}`, { method: "DELETE" }),
};

// ── Trading ────────────────────────────────────────────────────────────────
export const tradingApi = {
  placeOrder: (data) => apiRequest("/trading/orders", { method: "POST", body: JSON.stringify(data) }),
  getOrders: (accountId, page = 1) => apiRequest(`/trading/orders?accountId=${accountId}&page=${page}`),
  cancelOrder: (id) => apiRequest(`/trading/orders/${id}`, { method: "DELETE" }),
  getPositions: (accountId) => apiRequest(`/trading/positions?accountId=${accountId}`),
  closePosition: (id, closePrice) => apiRequest(`/trading/positions/${id}/close`, { method: "POST", body: JSON.stringify({ closePrice }) }),
  modifyPosition: (id, stopLoss, takeProfit) => apiRequest(`/trading/positions/${id}/modify`, { method: "POST", body: JSON.stringify({ stopLoss, takeProfit }) }),
};

// ── Market ─────────────────────────────────────────────────────────────────
export const marketApi = {
  getInstruments: (category) => apiRequest(`/market/instruments${category ? `?category=${category}` : ""}`),
  getInstrument: (symbol) => apiRequest(`/market/instruments/${symbol}`),
  getPrice: (symbol) => apiRequest(`/market/instruments/${symbol}/price`),
  getCandles: (symbol, timeframe, from, to) => apiRequest(`/market/instruments/${symbol}/candles?timeframe=${timeframe}&from=${from}&to=${to}`),
};
