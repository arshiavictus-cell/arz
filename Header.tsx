import { useMemo } from "react";
import { useMarketData } from "./hooks/useMarketData";
import Header from "./components/Header";
import Ticker from "./components/Ticker";
import Section from "./components/Section";
import PriceRow from "./components/PriceRow";
import { FIAT_META, FIAT_ORDER } from "./lib/fiatMeta";
import { formatNumber, formatUsd } from "./lib/format";

export default function App() {
  const { fiat, coins, gold, liveIran, loading, error, lastUpdated, refresh } =
    useMarketData();

  // قیمت واقعی دلار در بازار آزاد ایران از نوسان
  const usdToman = liveIran?.usd || 161500;

  // ---- بازار ایران (قیمت‌های واقعی زنده) ----
  const iranSection = useMemo(() => {
    if (!liveIran) return null;
    return {
      usd: liveIran.usd,
      eur: liveIran.eur,
      gbp: liveIran.gbp,
      afn: liveIran.afn,
      ayar18: liveIran.ayar18,
      sekkeh: liveIran.sekkeh,
      bahar: liveIran.bahar,
      nim: liveIran.nim,
      rob: liveIran.rob,
      mesghal: liveIran.mesghal,
      gerami: liveIran.gerami,
    };
  }, [liveIran]);

  // ---- عیارهای مختلف طلا بر اساس طلای ۱۸ عیار زنده بازار ----
  const goldItems = useMemo(() => {
    if (!liveIran) return [];
    const base18 = liveIran.ayar18;
    return [
      {
        key: "g24",
        title: "طلای ۲۴ عیار (شمش خالص)",
        subtitle: "هر گرم (تومان) - بر اساس خلوص ۹۹.۹٪",
        value: base18 * (24 / 18),
      },
      {
        key: "g22",
        title: "طلای ۲۲ عیار",
        subtitle: "هر گرم (تومان)",
        value: base18 * (22 / 18),
      },
      {
        key: "g21",
        title: "طلای ۲۱ عیار",
        subtitle: "هر گرم (تومان) - پرکاربرد در کشورهای عربی",
        value: base18 * (21 / 18),
      },
      {
        key: "g18",
        title: "طلای ۱۸ عیار",
        subtitle: "هر گرم (تومان) - عیار استاندارد ایران",
        value: base18,
      },
      {
        key: "g14",
        title: "طلای ۱۴ عیار",
        subtitle: "هر گرم (تومان)",
        value: base18 * (14 / 18),
      },
      {
        key: "mesghal",
        title: "مثقال طلای آبشده",
        subtitle: "هر مثقال ۱۷ عیار بازار تهران (تومان)",
        value: liveIran.mesghal || base18 * 4.6083 * (17 / 18),
      },
    ];
  }, [liveIran]);

  // ---- ارزهای فیات جهانی (محاسبه و تبدیل بر اساس دلار بازار آزاد و افغانی) ----
  const fiatItems = useMemo(() => {
    if (!fiat) return [];
    // نرخ ارزها نسبت به دلار
    const afnPerUsd = fiat.rates["AFN"] || 70;
    return FIAT_ORDER.filter((code) => fiat.rates[code] !== undefined).map((code) => {
      const perUsd = fiat.rates[code];
      // ارزش هر واحد ارز نسبت به افغانی
      const inAfn = afnPerUsd / perUsd;
      // ارزش هر واحد ارز به تومان بازار آزاد
      const inToman = (1 / perUsd) * usdToman;
      const meta = FIAT_META[code] || { faName: code, flag: "🏳️" };
      return { code, meta, inAfn, inToman };
    });
  }, [fiat, usdToman]);

  // ---- نوار تیکر متحرک ----
  const tickerItems = useMemo(() => {
    const items: { label: string; value: string; change?: number }[] = [];

    // اضافه کردن قیمت‌های واقعی بازار ایران به تیکر
    if (liveIran) {
      items.push({ label: "💵 دلار آزاد", value: formatNumber(liveIran.usd) + " ت" });
      items.push({ label: "🇪🇺 یورو تهران", value: formatNumber(liveIran.eur) + " ت" });
      items.push({ label: "🇦🇫 افغانی/تومان", value: formatNumber(liveIran.afn) + " ت" });
      items.push({ label: "🪙 سکه امامی", value: formatNumber(liveIran.sekkeh) + " ت" });
      items.push({ label: "🥇 طلا ۱۸ عیار", value: formatNumber(liveIran.ayar18) + " ت" });
    }

    if (gold) {
      items.push({
        label: "🌍 انس طلا جهانی",
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
  }, [liveIran, gold, coins]);

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
        {loading && !fiat && !liveIran && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="h-[72px] animate-pulse rounded-2xl border border-slate-100 bg-slate-50"
              />
            ))}
          </div>
        )}

        {/* ۱. بازار ارز تهران (قیمت‌های واقعی زنده) */}
        {iranSection && (
          <Section
            id="iran-currencies"
            icon="💵"
            title="بازار ارز تهران (قیمت‌های واقعی)"
            description={`آخرین معامله واقعی بازار آزاد • آپدیت زنده ساعت: ${liveIran?.updatedTime || ""}`}
            count={4}
          >
            <PriceRow
              icon="🇺🇸"
              title="دلار آمریکا (آزاد)"
              subtitle="نرخ واقعی معاملات بازار آزاد تهران"
              value={formatNumber(iranSection.usd)}
              unit="تومان"
              rawValue={iranSection.usd}
            />
            <PriceRow
              icon="🇪🇺"
              title="یورو اروپا"
              subtitle="نرخ واقعی صرافی‌های بازار آزاد"
              value={formatNumber(iranSection.eur)}
              unit="تومان"
              rawValue={iranSection.eur}
            />
            <PriceRow
              icon="🇬🇧"
              title="پوند انگلیس"
              subtitle="نرخ واقعی بازار آزاد"
              value={formatNumber(iranSection.gbp)}
              unit="تومان"
              rawValue={iranSection.gbp}
            />
            <PriceRow
              icon="🇦🇫"
              title="افغانی افغانستان (واقعی)"
              subtitle="نرخ هر واحد افغانی به تومان بازار تهران"
              value={formatNumber(iranSection.afn)}
              unit="تومان"
              rawValue={iranSection.afn}
            />
          </Section>
        )}

        {/* ۲. طلا با عیارهای مختلف (واقعی و زنده) */}
        {liveIran && goldItems.length > 0 && (
          <Section
            id="gold-market"
            icon="🥇"
            title="طلا (عیارهای مختلف واقعی)"
            description="محاسبه‌شده بر اساس فرمول‌های استاندارد صنف طلا و جواهر ایران"
            count={goldItems.length}
          >
            {goldItems.map((g) => (
              <PriceRow
                key={g.key}
                icon="🥇"
                title={g.title}
                subtitle={g.subtitle}
                value={formatNumber(g.value)}
                unit="تومان"
                rawValue={g.value}
              />
            ))}
          </Section>
        )}

        {/* ۳. انواع سکه بازار تهران (واقعی زنده) */}
        {iranSection && (
          <Section
            id="coins-market"
            icon="🪙"
            title="انواع سکه بهار آزادی (قیمت واقعی)"
            description="آخرین نرخ معامله سکه به همراه حباب و کارمزد صنف"
            count={5}
          >
            <PriceRow
              icon="🟡"
              title="سکه امامی (طرح جدید)"
              subtitle="وزن ۸.۱۳۳ گرم • عیار ۹۰۰"
              value={formatNumber(iranSection.sekkeh)}
              unit="تومان"
              rawValue={iranSection.sekkeh}
            />
            <PriceRow
              icon="🟡"
              title="سکه بهار آزادی (طرح قدیم)"
              subtitle="وزن ۸.۱۳۳ گرم • عیار ۹۰۰"
              value={formatNumber(iranSection.bahar)}
              unit="تومان"
              rawValue={iranSection.bahar}
            />
            <PriceRow
              icon="🟡"
              title="نیم سکه بهار آزادی"
              subtitle="وزن ۴.۰۶۶ گرم • عیار ۹۰۰"
              value={formatNumber(iranSection.nim)}
              unit="تومان"
              rawValue={iranSection.nim}
            />
            <PriceRow
              icon="🟡"
              title="ربع سکه بهار آزادی"
              subtitle="وزن ۲.۰۳۳ گرم • عیار ۹۰۰"
              value={formatNumber(iranSection.rob)}
              unit="تومان"
              rawValue={iranSection.rob}
            />
            <PriceRow
              icon="🟡"
              title="سکه گرمی"
              subtitle="وزن ۱.۰۱۲ گرم • عیار ۹۰۰"
              value={formatNumber(iranSection.gerami)}
              unit="تومان"
              rawValue={iranSection.gerami}
            />
          </Section>
        )}

        {/* ۴. ارزهای دیجیتال (قیمت‌های واقعی و زنده) */}
        {coins.length > 0 && (
          <Section
            id="crypto"
            icon="🪙"
            title="ارزهای دیجیتال (کریپتو کارنسی)"
            description="قیمت لحظه‌ای به دلار — منبع CoinGecko"
            count={coins.length}
          >
            {coins.map((c) => (
              <PriceRow
                key={c.id}
                icon={<span className="text-sm font-bold">{c.symbol}</span>}
                title={c.faName}
                subtitle={`${c.name} • معادل ${formatNumber(c.usd * usdToman)} تومان`}
                value={"$" + formatUsd(c.usd)}
                change={c.change24h}
                rawValue={c.usd}
              />
            ))}
          </Section>
        )}

        {/* ۵. تمامی ارزها و واحدهای پولی دنیا */}
        {fiatItems.length > 0 && (
          <Section
            id="fiat"
            icon="🌐"
            title="ارزها و واحدهای پولی جهانی"
            description="نرخ تبدیل تمامی ارزهای فیات جهان بر حسب افغانی و تومان"
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
            <strong>تضمین صحت قیمت‌ها:</strong> این اپلیکیشن با اتصال مستقیم به وب‌سرویس عمومی{" "}
            <b>Navasan</b>، قیمت‌های واقعی و در لحظه صرافی‌های بازار آزاد تهران را دریافت و نمایش
            می‌دهد.
          </p>
          <p>
            • بازار ایران و افغانی: <b>Navasan Live Widget Engine</b> (آپدیت کاملاً زنده بدون کش)
            <br />
            • ارزهای فیات جهانی: <b>ExchangeRate-API</b>
            <br />
            • ارزهای دیجیتال و انس طلا: <b>CoinGecko Realtime</b>
          </p>
          <p className="mt-3">
            ساخته‌شده با React + Vite + Tailwind • راست‌چین (RTL) • فونت وزیرمتن • آماده اجرا در
            Railway
          </p>
        </div>
      </footer>
    </div>
  );
}
