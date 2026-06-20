import { useMemo, useState } from "react";
import Header from "./components/Header";
import PriceRow from "./components/PriceRow";
import Section from "./components/Section";
import Ticker from "./components/Ticker";
import { useMarketData } from "./hooks/useMarketData";
import { formatNumber, formatUsd } from "./lib/format";
import type { LiveMarketData, MarketItem, SourceStatus } from "./lib/api";

function valueText(item: MarketItem) {
  if (item.unit === "دلار") return "$" + formatUsd(item.value);
  if (item.value < 1) return formatNumber(item.value, 6);
  if (item.value < 1000) return formatNumber(item.value, 2);
  return formatNumber(item.value);
}

function itemMatches(item: MarketItem, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return `${item.title} ${item.subtitle} ${item.symbol} ${item.source}`
    .toLowerCase()
    .includes(q);
}

function statusText(status: SourceStatus) {
  if (!status.ok) return status.message || "در دسترس نیست";
  if (!status.updatedAt) return "دریافت شد";
  return new Intl.DateTimeFormat("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(status.updatedAt);
}

function sourceClass(ok: boolean) {
  return ok
    ? "border-emerald-100 bg-emerald-50 text-emerald-700"
    : "border-rose-100 bg-rose-50 text-rose-700";
}

function renderItems(items: MarketItem[], query: string) {
  return items
    .filter((item) => itemMatches(item, query))
    .map((item) => (
      <PriceRow
        key={item.key}
        icon={<span className="text-xs font-black">{item.symbol}</span>}
        title={item.title}
        subtitle={`${item.subtitle} • ${item.source}`}
        value={valueText(item)}
        unit={item.unit === "دلار" ? undefined : item.unit}
        change={item.changePercent}
        rawValue={item.value}
      />
    ));
}

function sourceBadges(market: LiveMarketData | null) {
  if (!market) return [];
  return [
    ["بازار ایران", market.sources.iran] as const,
    ["ارز جهانی", market.sources.fiat] as const,
    ["رمزارز", market.sources.crypto] as const,
    ["طلا", market.sources.gold] as const,
  ];
}

export default function App() {
  const { market, loading, error, lastUpdated, refresh } = useMarketData();
  const [query, setQuery] = useState("");

  const tickerItems = useMemo(() => {
    if (!market) return [];
    const important = [
      ...market.iran.currency.filter((item) => ["usd", "eur", "afn"].includes(item.key)),
      ...market.iran.gold.slice(0, 2),
      ...market.iran.coins.slice(0, 2),
      ...market.crypto.filter((item) => ["BTC", "ETH", "USDT"].includes(item.symbol)),
      ...market.globalGold.slice(0, 1),
    ];

    return important.slice(0, 12).map((item) => ({
      label: item.title,
      value: `${valueText(item)}${item.unit === "دلار" ? "" : " " + item.unit}`,
      change: item.changePercent,
    }));
  }, [market]);

  const iranAll = market
    ? [...market.iran.currency, ...market.iran.crypto, ...market.iran.gold, ...market.iran.coins]
    : [];
  const iranRows = renderItems(iranAll, query);
  const cryptoRows = renderItems(market?.crypto || [], query);
  const fiatRows = renderItems(market?.fiat || [], query);
  const globalGoldRows = renderItems(market?.globalGold || [], query);

  return (
    <div className="min-h-screen bg-white pb-16 text-slate-900">
      <Header
        loading={loading}
        error={error}
        lastUpdated={lastUpdated}
        usdToman={market?.usdToman ?? null}
        onRefresh={refresh}
        query={query}
        onQueryChange={setQuery}
      />

      <Ticker items={tickerItems} />

      <main className="mx-auto max-w-6xl space-y-10 px-4 py-8">
        <section className="space-y-5 py-4">
          <div className="max-w-3xl space-y-3">
            <p className="text-sm font-bold text-amber-600">بدون قیمت ساختگی</p>
            <h1 className="text-3xl font-black leading-tight text-slate-950 sm:text-5xl">
              قیمت زنده دلار، افغانی، ارزهای دیجیتال، طلا و سکه برای Railway
            </h1>
            <p className="text-sm leading-7 text-slate-500 sm:text-base">
              داده‌ها از API سمت سرور دریافت می‌شوند تا CORS و کلیدهای خصوصی در مرورگر لو نروند.
              اگر منبعی در دسترس نباشد، همان بخش با پیام خطا نمایش داده می‌شود و عدد حدسی جایگزین نمی‌شود.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {sourceBadges(market).map(([label, status]) => (
              <div
                key={label}
                className={`rounded-2xl border px-4 py-3 text-xs ${sourceClass(status.ok)}`}
              >
                <div className="font-extrabold">{label}</div>
                <div className="mt-1 leading-5">{status.name}</div>
                <div className="tabular mt-1 font-semibold">{statusText(status)}</div>
              </div>
            ))}
          </div>
        </section>

        {loading && !market && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, index) => (
              <div
                key={index}
                className="h-[72px] animate-pulse rounded-2xl border border-slate-100 bg-slate-50"
              />
            ))}
          </div>
        )}

        {market && !market.sources.iran.ok && (
          <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm leading-7 text-amber-800">
            قیمت بازار ایران دریافت نشد. برای داده پایدار روی Railway، متغیرهای
            <span className="tabular font-bold"> BRS_API_KEY </span>
            یا
            <span className="tabular font-bold"> NAVASAN_API_KEY </span>
            را تنظیم کنید. این برنامه عدد جعلی برای دلار، طلا یا سکه ایران نشان نمی‌دهد.
          </div>
        )}

        {iranRows.length > 0 && (
          <Section
            id="iran-market"
            icon="IR"
            title="بازار ایران"
            description="دلار آزاد، یورو، افغانی، تتر، بیت‌کوین، طلا و سکه از API واقعی Baha24/Navasan/BrsApi"
            count={iranRows.length}
          >
            {iranRows}
          </Section>
        )}

        {cryptoRows.length > 0 && (
          <Section
            id="crypto"
            icon="CR"
            title="ارزهای دیجیتال جهانی"
            description="قیمت زنده معاملات USDT از Binance، با fallback به CoinGecko"
            count={cryptoRows.length}
          >
            {cryptoRows}
          </Section>
        )}

        {globalGoldRows.length > 0 && (
          <Section
            id="global-gold"
            icon="AU"
            title="طلای جهانی"
            description="انس و گرم طلا؛ اگر GOLDAPI_KEY تنظیم شود از GoldAPI، در غیر این صورت PAXG/Binance"
            count={globalGoldRows.length}
          >
            {globalGoldRows}
          </Section>
        )}

        {fiatRows.length > 0 && (
          <Section
            id="fiat"
            icon="FX"
            title="ارزها و واحدهای پولی"
            description="نرخ مرجع جهانی نسبت به دلار و افغانی؛ تبدیل تومان با نرخ واقعی دلار بازار ایران"
            count={fiatRows.length}
          >
            {fiatRows}
          </Section>
        )}
      </main>

      <footer className="border-t border-slate-100 bg-slate-50/60">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center text-xs leading-7 text-slate-500">
          منابع: Baha24، BrsApi یا Navasan برای بازار ایران، Binance برای رمزارز، ExchangeRate-API برای ارزهای
          جهانی، و GoldAPI/PAXG برای طلای جهانی. برای قیمت کاملا تجاری و بدون محدودیت، کلید API رسمی
          خودتان را در Railway Environment Variables قرار دهید.
        </div>
      </footer>
    </div>
  );
}