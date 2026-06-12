import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── System Settings ──────────────────────────────────────────────────────
  const settings = [
    {
      key: "maintenance_mode",
      value: "false",
      valueType: "boolean",
      description: "Put platform in maintenance mode",
    },
    {
      key: "maintenance_message",
      value: "We are performing scheduled maintenance. Back soon.",
      valueType: "string",
      description: "Maintenance mode message",
    },
    {
      key: "max_withdrawal_per_day",
      value: "10000",
      valueType: "number",
      description: "Maximum withdrawal amount per day ($)",
    },
    {
      key: "min_withdrawal",
      value: "50",
      valueType: "number",
      description: "Minimum withdrawal amount ($)",
    },
    {
      key: "min_deposit_card",
      value: "10",
      valueType: "number",
      description: "Minimum card deposit ($)",
    },
    {
      key: "min_deposit_bank",
      value: "500",
      valueType: "number",
      description: "Minimum bank wire deposit ($)",
    },
    {
      key: "kyc_required_for_deposit",
      value: "false",
      valueType: "boolean",
      description: "Require KYC before first deposit",
    },
    {
      key: "kyc_required_for_withdrawal",
      value: "true",
      valueType: "boolean",
      description: "Require KYC before withdrawal",
    },
    {
      key: "default_leverage",
      value: "200",
      valueType: "number",
      description: "Default leverage for standard accounts",
    },
    {
      key: "margin_call_level",
      value: "100",
      valueType: "number",
      description: "Margin call level (%)",
    },
    {
      key: "stop_out_level",
      value: "50",
      valueType: "number",
      description: "Stop-out level (%)",
    },
    {
      key: "max_positions_per_account",
      value: "200",
      valueType: "number",
      description: "Maximum open positions per account",
    },
    {
      key: "demo_accounts_enabled",
      value: "true",
      valueType: "boolean",
      description: "Allow demo account creation",
    },
    {
      key: "withdrawal_auto_approval_threshold",
      value: "500",
      valueType: "number",
      description:
        "Auto-approve withdrawals below this amount for verified users ($)",
    },
    {
      key: "referral_commission_flat",
      value: "50",
      valueType: "number",
      description: "Flat referral commission per qualified referral ($)",
    },
  ];

  for (const s of settings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { ...s, valueType: s.valueType as never },
    });
  }
  console.log(`✅ ${settings.length} system settings seeded`);

  // ─── Admin User ────────────────────────────────────────────────────────────
  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@vertexfx.com" },
    update: { passwordHash: await bcrypt.hash("VertexFx@2025", 12) },
    create: {
      email: "admin@vertexfx.com",
      passwordHash: await bcrypt.hash("VertexFx@2025", 12),
      firstName: "Alexandra",
      lastName: "Hunt",
      role: "super_admin",
      status: "active",
      emailVerified: true,
      referralCode: "ADMIN001",
    },
  });

  await prisma.user.upsert({
    where: { email: "compliance@vertexfx.com" },
    update: { passwordHash: await bcrypt.hash("Compliance@2025", 12) },
    create: {
      email: "compliance@vertexfx.com",
      passwordHash: await bcrypt.hash("Compliance@2025", 12),
      firstName: "Sarah",
      lastName: "Kimani",
      role: "compliance",
      status: "active",
      emailVerified: true,
      referralCode: "COMP001",
    },
  });

  await prisma.user.upsert({
    where: { email: "finance@vertexfx.com" },
    update: { passwordHash: await bcrypt.hash("Finance@2025", 12) },
    create: {
      email: "finance@vertexfx.com",
      passwordHash: await bcrypt.hash("Finance@2025", 12),
      firstName: "Mike",
      lastName: "Adewale",
      role: "finance",
      status: "active",
      emailVerified: true,
      referralCode: "FIN001",
    },
  });

  console.log("✅ Staff accounts seeded");

  // ─── Demo Trader User ─────────────────────────────────────────────────────
  const trader = await prisma.user.upsert({
    where: { email: "demo@vertexfx.com" },
    update: { passwordHash: await bcrypt.hash("Demo@2025", 12) },
    create: {
      email: "demo@vertexfx.com",
      passwordHash: await bcrypt.hash("Demo@2025", 12),
      firstName: "Demo",
      lastName: "Trader",
      country: "Nigeria",
      nationality: "Nigerian",
      role: "trader",
      status: "active",
      emailVerified: true,
      kycStatus: "approved",
      referralCode: "DEMO001",
    },
  });

  // Wallet for demo user
  const wallet = await prisma.walletAccount.upsert({
    where: { userId: trader.id },
    update: {},
    create: { userId: trader.id, balance: 10000, totalDeposited: 10000 },
  });

  // Trading account for demo user
  const existingAccount = await prisma.tradingAccount.findFirst({
    where: { userId: trader.id, accountType: "live" },
  });

  if (!existingAccount) {
    await prisma.tradingAccount.create({
      data: {
        userId: trader.id,
        accountNumber: "VFX-100001",
        accountType: "live",
        accountTier: "standard",
        leverage: 200,
        balance: 10000,
        equity: 10000,
        freeMargin: 10000,
        status: "active",
        platform: "webtrader",
      },
    });
  }

  console.log("✅ Demo trader seeded");

  // ─── Instruments ─────────────────────────────────────────────────────────
  const instruments = [
    {
      symbol: "EURUSD",
      displayName: "Euro / US Dollar",
      category: "forex",
      baseCurrency: "EUR",
      quoteCurrency: "USD",
      pipSize: 0.0001,
      spread: 0.0001,
      commissionPerLot: 3,
      swapLong: -0.52,
      swapShort: 0.23,
      marginPercent: 0.5,
    },
    {
      symbol: "GBPUSD",
      displayName: "British Pound / US Dollar",
      category: "forex",
      baseCurrency: "GBP",
      quoteCurrency: "USD",
      pipSize: 0.0001,
      spread: 0.0002,
      commissionPerLot: 3,
      swapLong: -0.88,
      swapShort: 0.45,
      marginPercent: 0.5,
    },
    {
      symbol: "USDJPY",
      displayName: "US Dollar / Japanese Yen",
      category: "forex",
      baseCurrency: "USD",
      quoteCurrency: "JPY",
      pipSize: 0.01,
      spread: 0.01,
      commissionPerLot: 3,
      swapLong: 0.12,
      swapShort: -0.34,
      marginPercent: 0.5,
    },
    {
      symbol: "USDCHF",
      displayName: "US Dollar / Swiss Franc",
      category: "forex",
      baseCurrency: "USD",
      quoteCurrency: "CHF",
      pipSize: 0.0001,
      spread: 0.00015,
      commissionPerLot: 3,
      swapLong: -0.21,
      swapShort: 0.1,
      marginPercent: 0.5,
    },
    {
      symbol: "AUDUSD",
      displayName: "Australian Dollar / US Dollar",
      category: "forex",
      baseCurrency: "AUD",
      quoteCurrency: "USD",
      pipSize: 0.0001,
      spread: 0.00015,
      commissionPerLot: 3,
      swapLong: -0.35,
      swapShort: 0.15,
      marginPercent: 0.5,
    },
    {
      symbol: "BTCUSD",
      displayName: "Bitcoin / US Dollar",
      category: "crypto",
      baseCurrency: "BTC",
      quoteCurrency: "USD",
      contractSize: 1,
      pipSize: 0.01,
      minLot: 0.01,
      maxLot: 10,
      spread: 20,
      commissionPerLot: 0,
      swapLong: -15.2,
      swapShort: -18.4,
      marginPercent: 2,
    },
    {
      symbol: "ETHUSD",
      displayName: "Ethereum / US Dollar",
      category: "crypto",
      baseCurrency: "ETH",
      quoteCurrency: "USD",
      contractSize: 1,
      pipSize: 0.01,
      minLot: 0.01,
      maxLot: 20,
      spread: 2,
      commissionPerLot: 0,
      swapLong: -8.1,
      swapShort: -10.3,
      marginPercent: 2,
    },
    {
      symbol: "XRPUSD",
      displayName: "Ripple / US Dollar",
      category: "crypto",
      baseCurrency: "XRP",
      quoteCurrency: "USD",
      contractSize: 1000,
      pipSize: 0.0001,
      minLot: 1,
      maxLot: 1000,
      spread: 0.0005,
      commissionPerLot: 0,
      swapLong: -5,
      swapShort: -7,
      marginPercent: 5,
    },
    {
      symbol: "GOLD",
      displayName: "Gold / US Dollar",
      category: "commodities",
      baseCurrency: "XAU",
      quoteCurrency: "USD",
      contractSize: 100,
      pipSize: 0.01,
      minLot: 0.01,
      maxLot: 50,
      spread: 0.3,
      commissionPerLot: 0,
      swapLong: -3.4,
      swapShort: 0.9,
      marginPercent: 0.5,
    },
    {
      symbol: "SILVER",
      displayName: "Silver / US Dollar",
      category: "commodities",
      baseCurrency: "XAG",
      quoteCurrency: "USD",
      contractSize: 5000,
      pipSize: 0.001,
      minLot: 0.01,
      maxLot: 50,
      spread: 0.03,
      commissionPerLot: 0,
      swapLong: -1.8,
      swapShort: 0.4,
      marginPercent: 0.5,
    },
    {
      symbol: "OILUSD",
      displayName: "Crude Oil / US Dollar",
      category: "commodities",
      baseCurrency: "OIL",
      quoteCurrency: "USD",
      contractSize: 1000,
      pipSize: 0.01,
      minLot: 0.1,
      maxLot: 50,
      spread: 0.04,
      commissionPerLot: 0,
      swapLong: -2.8,
      swapShort: 0.6,
      marginPercent: 1,
    },
    {
      symbol: "NAS100",
      displayName: "NASDAQ 100 Index",
      category: "indices",
      baseCurrency: "NAS",
      quoteCurrency: "USD",
      contractSize: 1,
      pipSize: 0.1,
      minLot: 0.01,
      maxLot: 20,
      spread: 0.8,
      commissionPerLot: 0,
      swapLong: -4.2,
      swapShort: 1.1,
      marginPercent: 0.5,
    },
    {
      symbol: "SP500",
      displayName: "S&P 500 Index",
      category: "indices",
      baseCurrency: "SP5",
      quoteCurrency: "USD",
      contractSize: 1,
      pipSize: 0.1,
      minLot: 0.01,
      maxLot: 20,
      spread: 0.4,
      commissionPerLot: 0,
      swapLong: -3.8,
      swapShort: 0.9,
      marginPercent: 0.5,
    },
    {
      symbol: "DOW30",
      displayName: "Dow Jones 30",
      category: "indices",
      baseCurrency: "DJI",
      quoteCurrency: "USD",
      contractSize: 1,
      pipSize: 1,
      minLot: 0.01,
      maxLot: 10,
      spread: 3,
      commissionPerLot: 0,
      swapLong: -3.2,
      swapShort: 0.8,
      marginPercent: 0.5,
    },
  ];

  for (const inst of instruments) {
    await prisma.instrument.upsert({
      where: { symbol: inst.symbol },
      update: {},
      create: {
        ...inst,
        category: inst.category as never,
        contractSize: inst.contractSize ?? 100000,
        minLot: inst.minLot ?? 0.01,
        maxLot: inst.maxLot ?? 100,
        lotStep: 0.01,
        tradingHours: {
          mon: "00:00-23:59",
          tue: "00:00-23:59",
          wed: "00:00-23:59",
          thu: "00:00-23:59",
          fri: "00:00-22:00",
          sat: "closed",
          sun: "closed",
        },
        isActive: true,
      },
    });
  }

  console.log(`✅ ${instruments.length} instruments seeded`);
  console.log("\n🎉 Seed complete!\n");
  console.log("Test Accounts:");
  console.log("  Super Admin: admin@vertexfx.com / VertexFx@2025");
  console.log("  Compliance:  compliance@vertexfx.com / Compliance@2025");
  console.log("  Finance:     finance@vertexfx.com / Finance@2025");
  console.log("  Demo Trader: demo@vertexfx.com / Demo@2025");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
