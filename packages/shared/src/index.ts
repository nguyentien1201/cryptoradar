// ============================================================
// COIN TYPES
// ============================================================
export interface CoinPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d?: number;
  market_cap: number;
  total_volume: number;
  image: string;
  high_24h: number;
  low_24h: number;
  sparkline_in_7d?: { price: number[] };
}

// ============================================================
// PORTFOLIO TYPES
// ============================================================
export interface PortfolioHolding {
  id: string;
  userId: string;
  coinId: string;
  coinSymbol: string;
  coinName: string;
  amount: number;
  buyPrice: number;
  buyDate: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioStats {
  totalValue: number;
  totalCost: number;
  totalPnl: number;
  totalPnlPercent: number;
  bestPerformer: { symbol: string; pnlPercent: number } | null;
  worstPerformer: { symbol: string; pnlPercent: number } | null;
  allocation: { symbol: string; value: number; percent: number }[];
}

// ============================================================
// ALERT TYPES
// ============================================================
export type AlertCondition = 'above' | 'below' | 'percent_change_up' | 'percent_change_down';
export type AlertStatus = 'active' | 'triggered' | 'paused';
export type AlertChannel = 'email' | 'telegram' | 'push';

export interface PriceAlert {
  id: string;
  userId: string;
  coinId: string;
  coinSymbol: string;
  condition: AlertCondition;
  targetPrice: number;
  percentChange?: number;
  channels: AlertChannel[];
  status: AlertStatus;
  note?: string;
  triggeredAt?: string;
  createdAt: string;
}

// ============================================================
// USER TYPES
// ============================================================
export type UserPlan = 'free' | 'pro';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  plan: UserPlan;
  telegramChatId?: string;
  alertsCount: number;
  planExpiresAt?: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// ============================================================
// NEWS / SENTIMENT TYPES
// ============================================================
export type Sentiment = 'bullish' | 'bearish' | 'neutral' | 'important';

export interface NewsItem {
  id: number;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  sentiment: Sentiment;
  votes: { positive: number; negative: number; important: number };
  currencies?: { code: string; title: string }[];
}

export interface FearGreedData {
  value: number;
  classification: string;
  timestamp: string;
}

// ============================================================
// WHALE TYPES
// ============================================================
export type WhaleTransactionType = 'exchange_in' | 'exchange_out' | 'transfer' | 'mint' | 'burn';

export interface WhaleTransaction {
  id: string;
  blockchain: string;
  symbol: string;
  amount: number;
  amountUsd: number;
  from: { address: string; owner?: string; ownerType: string };
  to: { address: string; owner?: string; ownerType: string };
  transactionType: WhaleTransactionType;
  hash: string;
  timestamp: string;
}

// ============================================================
// PLAN LIMITS
// ============================================================
export const PLAN_LIMITS = {
  free: {
    maxAlerts: 5,
    maxHoldings: 10,
    whaleAccess: false,
    sentimentAccess: false,
    apiAccess: false,
  },
  pro: {
    maxAlerts: Infinity,
    maxHoldings: Infinity,
    whaleAccess: true,
    sentimentAccess: true,
    apiAccess: true,
  },
} as const;

export const SUPPORTED_COINS = [
  'bitcoin', 'ethereum', 'binancecoin', 'solana', 'ripple',
  'cardano', 'avalanche-2', 'polkadot', 'chainlink', 'dogecoin',
  'matic-network', 'uniswap', 'litecoin', 'tron', 'stellar',
] as const;
