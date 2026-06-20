import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchCrypto,
  fetchFiat,
  type CryptoCoin,
  type FiatRates,
  type GoldGlobal,
} from "../lib/api";
import { fetchLiveNavasan, type LiveRates } from "../lib/navasanLive";

export type MarketData = {
  fiat: FiatRates | null;
  coins: CryptoCoin[];
  gold: GoldGlobal | null;
  liveIran: LiveRates | null; // قیمت‌های واقعی، زنده و لحظه‌ای
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
};

const REFRESH_MS = 30_000;

export function useMarketData() {
  const [data, setData] = useState<MarketData>({
    fiat: null,
    coins: [],
    gold: null,
    liveIran: null,
    loading: true,
    error: null,
    lastUpdated: null,
  });

  const timer = useRef<number | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) {
      setData((d) => ({ ...d, loading: true }));
    }
    try {
      const [fiat, crypto, liveIran] = await Promise.all([
        fetchFiat().catch(() => null),
        fetchCrypto().catch(() => ({ coins: [], gold: null })),
        fetchLiveNavasan().catch((err) => {
          console.error("Live Navasan err, fallback to empty", err);
          return null;
        }),
      ]);

      setData({
        fiat,
        coins: crypto.coins,
        gold: crypto.gold,
        liveIran,
        loading: false,
        error: null,
        lastUpdated: Date.now(),
      });
    } catch (e) {
      setData((d) => ({
        ...d,
        loading: false,
        error:
          "خطا در دریافت اطلاعات لحظه‌ای. اتصال اینترنت را بررسی کنید؛ تلاش مجدد به‌صورت خودکار انجام می‌شود.",
      }));
    }
  }, []);

  useEffect(() => {
    load(false);
    timer.current = window.setInterval(() => load(true), REFRESH_MS);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [load]);

  return { ...data, refresh: () => load(false) };
}
