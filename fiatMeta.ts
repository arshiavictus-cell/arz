import { useCallback, useEffect, useRef, useState } from "react";
import { fetchLiveMarket, type LiveMarketData } from "../lib/api";

export type MarketState = {
  market: LiveMarketData | null;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
};

const REFRESH_MS = 30_000;

export function useMarketData() {
  const [state, setState] = useState<MarketState>({
    market: null,
    loading: true,
    error: null,
    lastUpdated: null,
  });
  const timer = useRef<number | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setState((current) => ({ ...current, loading: true }));

    try {
      const market = await fetchLiveMarket();
      setState({
        market,
        loading: false,
        error: null,
        lastUpdated: Date.now(),
      });
    } catch {
      setState((current) => ({
        ...current,
        loading: false,
        error:
          "اتصال به API زنده برقرار نشد. در Railway باید سرور Node همین پروژه اجرا شود؛ قیمت ساختگی نمایش داده نمی‌شود.",
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

  return { ...state, refresh: () => load(false) };
}