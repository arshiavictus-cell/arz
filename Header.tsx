import { useMemo } from "react";
import { useMarketData } from "./hooks/useMarketData";
import Header from "./components/Header";
import Ticker from "./components/Ticker";
import Section from "./components/Section";
import PriceRow from "./components/PriceRow";
import { FIAT_META, FIAT_ORDER } from "./lib/fiatMeta";
import { computeCoinPrices, computeGoldPrices } from "./lib/iran";
import { formatNumber, formatUsd } from "./lib/format";

export default function App() {
  const { fiat, coins, gold, iran, loading, error, lastUpdated, refresh } =
    useMarketData();

  const usdToman = iran?.usdToman || 161500; // اگر بازار ایران دریافت نشد، نرخ پیش‌فرض

  // ---- بخش بازار ایران (قیمت‌های واقعی) ----
  const iranSection = useMemo(() => {
    if (!iran) return null;
    return {
      usdToman: iran.usdToman,
      btcToman: iran.btcToman,
      xauToman: iran.xauToman,
      usdXau: iran.usdXau,
      sekkeh: iran.sekkeh,
      bahar: iran.bahar,
      nim: iran.nim,
      rob: iran.rob,
      ayar18: iran.ayar18,
      gerami: iran.gerami,
    };
  }, [iran]);

  // ---- ارزهای فیات (نسبت به افغانی و تومان قابل نمایش) ----
  const fiatItems = useMemo(() => {
    if (!fiat) return [];
    const afn = fiat.rates["AFN"]; // افغانی به ازای ۱ دلار
    return FIAT_ORDER.filter((code) => fiat.rates[code] !== undefined).map((code) => {
      const perUsd = fiat.rates[code]; // واحد ارز به ازای ۱ دلار
      // ارزش هر واحد این ارز نسبت به افغانی = AFN_per_usd / code_per_usd
      const inAfn = afn / perUsd;
      // ارزش هر واحد این ارز به تومان (با نرخ دلار بازار ایران)
      const inToman = (1 / perUsd) * usdToman;
      const meta = FIAT_META[code] || { faName: code, flag: "🏳️" };
      return { code, meta, inAfn, inToman };
    });
  }, [fiat, usdToman]);

  // ---- طلا و سکه ----
  const goldItems = useMemo(() => {
    if (!gold) return [];
    // نرخ دلار به اونس از PAXG (CoinGecko)
    return computeGoldPrices(gold.ouncePerUsd, usdToman);
  }, [gold, usdToman]);

  const coinItems = useMemo(() => {
    if (!gold) return [];
    return computeCoinPrices(gold.ouncePerUsd, usdToman);
  }, [gold, usdToman]);

  // ---- نوار تیکر ----
  const tickerItems = useMemo(() => {
    const items: { label: string; value: string; change?: number }[] = [];

    // قیمت‌های بازار ایران (Navasan)
    if (iranSection) {
      items.push({ label: "دلار بازار ایران", value: formatNumber(iranSection.usdToman) + " ت" });
      items.push({ label: "بیت‌کوین ایران", value: formatNumber(iranSection.btcToman / 1e9) + " میلیارد ت" });
      items.push({ label: "طلا بازار ایران", value: formatNumber(iranSection.xauToman / 1e6) + " میلیون ت" });
    }

    // قیمت‌های دنیا (ExchangeRate + CoinGecko)
    if (fiat) {
      const usdAfn = fiat.rates["AFN"];
      items.push({ label: "دلار/افغانی", value: formatNumber(usdAfn, 2) });
      const eur = fiat.rates["EUR"];
      if (eur) items.push({ label: "یورو/تومان", value: formatNumber(usdToman / eur) });
    }

    if (gold) {
      items.push({
        label: "انس طلا جهانی",
        value: "$" + formatUsd(gold.ouncePerUsd),
        change: gold.change24h,
      });
    }

    coins.slice(0, 4).forEach((c) =>
      items.push({
        label: c.faName,
        value: "$" + formatUsd(c.usd),
        change: c.change24h,
      })
    );

    return items;
  }, [iranSection, fiat, gold, coins, usdToman]);

  return (
    <div className="min-h-screen bg-white pb-16 text-slate-900">
      <Header
        loading={loading}
        error={error}
        lastUpdated={lastUpdated}
        usdToman={usdToman}
        onRefresh={refresh}
        query=""
        onQueryChange={() => {}}
      />

      <Ticker items={tickerItems} />

      <main className="mx-auto max-w-6xl space-y-10 px-4 py-8">
        {loading && !fiat && !iran && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="h-[72px] animate-pulse rounded-2xl border border-slate-100 bg-slate-50"
              />
            ))}
          </div>
        )}

        {/* بازار ایران (قیمت‌های واقعی - Navasan) */}
        {iranSection && (
          <Section
            id="iran-market"
            icon="🇮🇷"
            title="بازار ایران (قیمت‌های واقعی)"
            description="منبع: Navasan • به‌روزرسانی خودکار"
            count={7}
          >
            <PriceRow
              icon="💵"
              title="دلار بازار آزاد"
              subtitle="USD"
              value={formatNumber(iranSection.usdToman)}
              unit="تومان"
              rawValue={iranSection.usdToman}
            />
            <PriceRow
              icon="₿"
              title="بیت‌کوین"
              subtitle="BTC"
              value={formatNumber(iranSection.btcToman / 1e9, 2)}
              unit="میلیارد تومان"
              rawValue={iranSection.btcToman}
            />
            <PriceRow
              icon="🥇"
              title="طلای خالص"
              subtitle="هر گرم ۲۴ عیار"
              value={formatNumber(iranSection.xauToman / 1e6, 1)}
              unit="میلیون تومان"
              rawValue={iranSection.xauToman}
            />
            <PriceRow
              icon="🟡"
              title="سکه امامی"
              subtitle="طرح جدید"
              value={formatNumber(iranSection.sekkeh / 1e6, 1)}
              unit="میلیون تومان"
              rawValue={iranSection.sekkeh}
            />
            <PriceRow
              icon="🟡"
              title="بهار آزادی"
              subtitle="طرح قدیم"
              value={formatNumber(iranSection.bahar / 1e6, 1)}
              unit="میلیون تومان"
              rawValue={iranSection.bahar}
            />
            <PriceRow
              icon="🟡"
              title="نیم سکه"
              subtitle="بهار آزادی"
              value={formatNumber(iranSection.nim / 1e6, 2)}
              unit="میلیون تومان"
              rawValue={iranSection.nim}
            />
            <PriceRow
              icon="🟡"
              title="ربع سکه"
              subtitle="بهار آزادی"
              value={formatNumber(iranSection.rob / 1e6, 2)}
              unit="میلیون تومان"
              rawValue={iranSection.rob}
            />
          </Section>
        )}

        {/* رمزارزها (CoinGecko) */}
        {coins.length > 0 && (
          <Section
            id="crypto"
            icon="🪙"
            title="ارزهای دیجیتال"
            description="قیمت لحظه‌ای به دلار — منبع CoinGecko"
            count={coins.length}
          >
            {coins.map((c) => (
              <PriceRow
                key={c.id}
                icon={<span className="text-sm font-bold">{c.symbol}</span>}
                title={c.faName}
                subtitle={`${c.name}${iranSection ? " • " + formatNumber(c.usd * iranSection.usdToman) + " ت" : ""}`}
                value={"$" + formatUsd(c.usd)}
                change={c.change24h}
                rawValue={c.usd}
              />
            ))}
          </Section>
        )}

        {/* طلا (عیارهای مختلف) */}
        {gold && goldItems.length > 0 && (
          <Section
            id="gold"
            icon="🥇"
            title="طلا (عیارهای مختلف)"
            description="بر پایه انس جهانی و نرخ دلار بازار ایران"
            count={goldItems.length}
          >
            {goldItems.map((g) =>
              g.key === "ounce" ? (
                <PriceRow
                  key={g.key}
                  icon="🌍"
                  title={g.title}
                  subtitle="هر اونس تروی"
                  value={"$" + formatUsd(g.tomanPerGram)}
                  change={gold.change24h}
                  rawValue={g.tomanPerGram}
                />
              ) : (
                <PriceRow
                  key={g.key}
                  icon="🥇"
                  title={g.title}
                  subtitle={g.subtitle}
                  value={formatNumber(g.tomanPerGram)}
                  unit="تومان"
                  rawValue={g.tomanPerGram}
                />
              )
            )}
          </Section>
        )}

        {/* سکه (محاسبه‌شده) */}
        {gold && coinItems.length > 0 && (
          <Section
            id="coins"
            icon="🪙"
            title="سکه (محاسبه‌شده از انس جهانی)"
            description="محاسبه بر اساس انس طلای جهانی و نرخ دلار"
            count={coinItems.length}
          >
            {coinItems.map((c) => (
              <PriceRow
                key={c.key}
                icon="🟡"
                title={c.title}
                subtitle={c.subtitle}
                value={formatNumber(c.toman)}
                unit="تومان"
                rawValue={c.toman}
              />
            ))}
          </Section>
        )}

        {/* ارزهای فیات */}
        {fiatItems.length > 0 && (
          <Section
            id="fiat"
            icon="💵"
            title="ارزها و واحدهای پولی جهانی"
            description="ارزش هر واحد بر حسب افغانی و تومان — منبع ExchangeRate"
            count={fiatItems.length}
          >
            {fiatItems.map((f) => (
              <PriceRow
                key={f.code}
                icon={f.meta.flag}
                title={f.meta.faName}
                subtitle={`${f.code} • ${formatNumber(f.inAfn, 2)} افغانی`}
                value={formatNumber(f.inToman)}
                unit="تومان"
                rawValue={f.inToman}
              />
            ))}
          </Section>
        )}
      </main>

      <footer className="border-t border-slate-100 bg-slate-50/60">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center text-xs leading-relaxed text-slate-400">
          <p className="mb-2">
            <strong>منابع داده‌های واقعی:</strong>
          </p>
          <p>
            • بازار ایران (دلار آزاد، طلا، سکه، BTC): <b>Navasan-API</b> (GitHub — به‌روزرسانی
            هر ۱۰ دقیقه)
            <br />
            • ارزهای فیات جهانی (دلار، یورو، افغانی و ...): <b>ExchangeRate-API</b>
            <br />
            • ارزهای دیجیتال و انس طلا: <b>CoinGecko</b>
          </p>
          <p className="mt-3">
            <strong>توجه:</strong> قیمت‌های نمایش‌داده‌شده واقعی و لحظه‌ای هستند. سکه‌ای که از انس
            جهانی محاسبه شده‌اند تقریبی هستند.
          </p>
          <p className="mt-3">
            ساخته‌شده با React + Vite + Tailwind • راست‌چین (RTL) • فونت وزیرمتن • قابل اجرا روی
            Railway
          </p>
        </div>
      </footer>
    </div>
  );
}
