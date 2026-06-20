import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchCrypto,
  fetchFiat,
  fetchIranMarket,
  type CryptoCoin,
  type FiatRates,
  type GoldGlobal,
  type IranMarket,
} from "../lib/api";

export type MarketData = {
  fiat: FiatRates | null;
  coins: CryptoCoin[];
  gold: GoldGlobal | null;
  iran: IranMarket | null; // قیمت‌های واقعی بازار ایران
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
    iran: null,
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
      const [fiat, crypto, iran] = await Promise.all([
        fetchFiat(),
        fetchCrypto(),
        fetchIranMarket().catch(() => null), // اگر Navasan fail شد، خاموش می‌شود
      ]);
      setData({
        fiat,
        coins: crypto.coins,
        gold: crypto.gold,
        iran,
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
