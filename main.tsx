export type SourceStatus = {
  name: string;
  ok: boolean;
  updatedAt?: number | null;
  message?: string;
};

export type MarketItem = {
  key: string;
  title: string;
  subtitle: string;
  symbol: string;
  value: number;
  unit: string;
  changePercent?: number;
  changeValue?: number;
  source: string;
  updatedAt?: number | null;
};

export type LiveMarketData = {
  fetchedAt: number;
  usdToman: number | null;
  sources: {
    iran: SourceStatus;
    fiat: SourceStatus;
    crypto: SourceStatus;
    gold: SourceStatus;
  };
  iran: {
    currency: MarketItem[];
    gold: MarketItem[];
    coins: MarketItem[];
    crypto: MarketItem[];
  };
  fiat: MarketItem[];
  crypto: MarketItem[];
  globalGold: MarketItem[];
};

export async function fetchLiveMarket(): Promise<LiveMarketData> {
  const response = await fetch(`/api/market?t=${Date.now()}`, {
    cache: "no-store",
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error("live market api failed");
  }

  return response.json();
}