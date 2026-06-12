const API_BASE_URL = "https://vertexfx-backend.onrender.com/api";
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

// â”€â”€â”€ Auth â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€ Admin â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Mock data for admin dashboard
const mockUsers = [
  {
    id: "u-1",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    country: "USA",
    status: "active",
    kycStatus: "approved",
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "u-2",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane@example.com",
    country: "UK",
    status: "pending",
    kycStatus: "pending",
    createdAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "u-3",
    firstName: "Bob",
    lastName: "Johnson",
    email: "bob@example.com",
    country: "Canada",
    status: "active",
    kycStatus: "not_submitted",
    createdAt: "2024-02-01T00:00:00Z",
  },
];

const mockKycRecords = [
  {
    id: "kyc-1",
    userId: "u-2",
    userName: "Jane Smith",
    email: "jane@example.com",
    documentType: "Passport",
    documentNumber: "A1234567",
    submittedAt: "2024-01-16T00:00:00Z",
    status: "pending",
  },
];

const mockDeposits = [
  {
    id: "dep-1",
    userId: "u-1",
    userName: "John Doe",
    email: "john@example.com",
    amount: 1000,
    method: "Card",
    status: "approved",
    createdAt: "2024-01-02T00:00:00Z",
  },
  {
    id: "dep-2",
    userId: "u-2",
    userName: "Jane Smith",
    email: "jane@example.com",
    amount: 500,
    method: "Bank Transfer",
    status: "pending",
    createdAt: "2024-01-17T00:00:00Z",
  },
];

const mockWithdrawals = [
  {
    id: "w-1",
    userId: "u-1",
    userName: "John Doe",
    email: "john@example.com",
    amount: 300,
    method: "Bank Transfer",
    status: "pending",
    createdAt: "2024-01-10T00:00:00Z",
  },
];

const mockTransfers = [
  {
    id: "t-1",
    fromAccount: "123456",
    toAccount: "789012",
    amount: 200,
    status: "completed",
    createdAt: "2024-01-05T00:00:00Z",
  },
];

const mockPositions = [
  {
    id: "p-1",
    account: "123456",
    symbol: "EURUSD",
    type: "BUY",
    volume: 1,
    openPrice: 1.08,
    currentPrice: 1.085,
    pnl: 50,
    status: "open",
  },
];

const mockInstruments = [
  {
    id: "i-1",
    symbol: "EURUSD",
    displayName: "Euro/USD",
    category: "forex",
    spread: 0.5,
    commissionPerLot: 7,
    marginPercent: 1,
    isActive: true,
  },
  {
    id: "i-2",
    symbol: "GBPUSD",
    displayName: "Pound/USD",
    category: "forex",
    spread: 0.7,
    commissionPerLot: 7,
    marginPercent: 1,
    isActive: true,
  },
  {
    id: "i-3",
    symbol: "BTCUSD",
    displayName: "Bitcoin/USD",
    category: "crypto",
    spread: 10,
    commissionPerLot: 15,
    marginPercent: 5,
    isActive: true,
  },
];

const mockTradingAccounts = [
  {
    id: "ta-1",
    accountNumber: "123456",
    userId: "u-1",
    userName: "John Doe",
    accountType: "Live",
    accountTier: "Gold",
    balance: 1500,
    equity: 1550,
    leverage: 100,
    status: "active",
  },
  {
    id: "ta-2",
    accountNumber: "789012",
    userId: "u-2",
    userName: "Jane Smith",
    accountType: "Demo",
    accountTier: "Silver",
    balance: 10000,
    equity: 10000,
    leverage: 100,
    status: "active",
  },
];

export const adminApi = {
  getDashboardStats: () =>
    Promise.resolve({
      totalAum: 500000,
      totalActiveUsers: 150,
      openPositions: 25,
      pendingKyc: 10,
    }),
  getUsers: (params = {}) => {
    let filtered = [...mockUsers];
    if (params.status && params.status !== "all") {
      filtered = filtered.filter((u) => u.status === params.status);
    }
    if (params.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.firstName.toLowerCase().includes(search) ||
          u.lastName.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search),
      );
    }
    return Promise.resolve({ users: filtered });
  },
  getUserById: (id) => {
    const user = mockUsers.find((u) => u.id === id);
    if (user) {
      return Promise.resolve({
        ...user,
        kycDocuments: mockKycRecords.filter((k) => k.userId === id),
        deposits: mockDeposits.filter((d) => d.userId === id),
        accounts: mockTradingAccounts.filter((a) => a.userId === id),
      });
    }
    return Promise.reject(new Error("User not found"));
  },
  updateUserStatus: (id, status) => {
    const index = mockUsers.findIndex((u) => u.id === id);
    if (index !== -1) mockUsers[index].status = status;
    return Promise.resolve({ success: true });
  },
  getKycQueue: (status) =>
    Promise.resolve({
      docs: status
        ? mockKycRecords.filter((k) => k.status === status)
        : mockKycRecords,
    }),
  approveKyc: (id) => {
    const kyc = mockKycRecords.find((k) => k.id === id);
    if (kyc) kyc.status = "approved";
    const user = mockUsers.find((u) => u.id === kyc?.userId);
    if (user) user.kycStatus = "approved";
    return Promise.resolve({ success: true });
  },
  rejectKyc: (id, reason) => {
    const kyc = mockKycRecords.find((k) => k.id === id);
    if (kyc) {
      kyc.status = "rejected";
      kyc.rejectionReason = reason;
    }
    const user = mockUsers.find((u) => u.id === kyc?.userId);
    if (user) user.kycStatus = "rejected";
    return Promise.resolve({ success: true });
  },
  getTransactions: (params = {}) => {
    const deposits = mockDeposits.map((d) => ({ ...d, type: "deposit" }));
    const withdrawals = mockWithdrawals.map((w) => ({
      ...w,
      type: "withdrawal",
    }));
    let all = [...deposits, ...withdrawals];
    if (params.status && params.status !== "all") {
      all = all.filter((t) => t.status === params.status);
    }
    return Promise.resolve({ transactions: all });
  },
  getWithdrawalQueue: () =>
    Promise.resolve({
      withdrawals: mockWithdrawals.filter(
        (w) => w.status === "pending" || w.status === "approved",
      ),
    }),
  approveWithdrawal: (id) => {
    const withdrawal = mockWithdrawals.find((w) => w.id === id);
    if (withdrawal) withdrawal.status = "processing";
    return Promise.resolve({ success: true });
  },
  rejectWithdrawal: (id, reason) => {
    const withdrawal = mockWithdrawals.find((w) => w.id === id);
    if (withdrawal) withdrawal.status = "rejected";
    return Promise.resolve({ success: true });
  },
  getTradingAccounts: () => Promise.resolve({ accounts: mockTradingAccounts }),
  getOpenPositions: () => Promise.resolve({ positions: mockPositions }),
  getInstruments: (category) => {
    let filtered = [...mockInstruments];
    if (category) filtered = filtered.filter((i) => i.category === category);
    return Promise.resolve({ instruments: filtered });
  },
  getAmlAlerts: (status) => Promise.resolve({ alerts: [] }),
  getAuditLogs: (params = {}) => Promise.resolve({ logs: [] }),
  getStaff: () => Promise.resolve({ staff: [] }),
  createStaff: (data) =>
    Promise.resolve({ success: true, staff: { id: "new-staff", ...data } }),
  getFinancialReport: (from, to) =>
    Promise.resolve({ revenue: 10000, expenses: 5000, profit: 5000 }),
  getTradingReport: (from, to) =>
    Promise.resolve({ totalVolume: 500, totalProfit: 2500 }),
  getClientReport: (from, to) =>
    Promise.resolve({ newUsers: 25, activeUsers: 150 }),
  adjustBalance: (id, data) => Promise.resolve({ success: true }),
  getSettings: () =>
    Promise.resolve({
      maintenance_mode: "false",
      max_withdrawal_per_day: "10000",
      min_withdrawal: "10",
      min_deposit_card: "50",
      default_leverage: "100",
    }),
};
