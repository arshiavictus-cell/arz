// منابع داده‌ی واقعی و رایگان:
//  - ExchangeRate-API    : نرخ ارزهای فیات نسبت به دلار (AFN، EUR، ...)
//  - CoinGecko           : قیمت رمزارزها + انس طلای جهانی
//  - Navasan-API (GitHub): قیمت‌های واقعی بازار ایران (دلار آزاد، طلا، سکه، BTC به تومان)

export type FiatRates = {
  base: string;
  updatedUnix: number;
  // نرخ هر واحد ارز به ازای ۱ دلار  (مثلا AFN: 70 یعنی هر دلار = ۷۰ افغانی)
  rates: Record<string, number>;
};

export type CryptoCoin = {
  id: string;
  symbol: string;
  name: string;
  faName: string;
  usd: number;
  change24h: number;
};

export type GoldGlobal = {
  // قیمت هر اونس طلا به دلار
  ouncePerUsd: number;
  change24h: number;
};

export type IranMarket = {
  // قیمت‌های واقعی بازار ایران (بر حسب تومان)
  usdToman: number; // دلار بازار آزاد
  afnToman: number; // افغانی
  eurToman: number; // یورو
  xauToman: number; // طلای خالص (تومان / گرم)
  usdXau: string; // انس طلا (دلار)
  btcToman: number; // بیت‌کوین
  sekkeh: number; // سکه امامی
  bahar: number; // بهار آزادی
  nim: number; // نیم سکه
  rob: number; // ربع سکه
  ayar18: number; // طلای ۱۸ عیار
  gerami: number; // سکه گرمی
  updated: number; // unix timestamp
};

const ER_API = "https://open.er-api.com/v6/latest/USD";

const COINGECKO =
  "https://api.coingecko.com/api/v3/simple/price?ids=" +
  [
    "bitcoin",
    "ethereum",
    "tether",
    "binancecoin",
    "ripple",
    "solana",
    "cardano",
    "dogecoin",
    "tron",
    "the-open-network",
    "polkadot",
    "matic-network",
    "litecoin",
    "shiba-inu",
    "avalanche-2",
    "chainlink",
    "usd-coin",
    "pax-gold",
  ].join(",") +
  "&vs_currencies=usd&include_24hr_change=true";

const COIN_META: Record<string, { symbol: string; name: string; faName: string }> = {
  bitcoin: { symbol: "BTC", name: "Bitcoin", faName: "بیت‌کوین" },
  ethereum: { symbol: "ETH", name: "Ethereum", faName: "اتریوم" },
  tether: { symbol: "USDT", name: "Tether", faName: "تتر" },
  binancecoin: { symbol: "BNB", name: "BNB", faName: "بایننس‌کوین" },
  ripple: { symbol: "XRP", name: "XRP", faName: "ریپل" },
  solana: { symbol: "SOL", name: "Solana", faName: "سولانا" },
  cardano: { symbol: "ADA", name: "Cardano", faName: "کاردانو" },
  dogecoin: { symbol: "DOGE", name: "Dogecoin", faName: "دوج‌کوین" },
  tron: { symbol: "TRX", name: "TRON", faName: "ترون" },
  "the-open-network": { symbol: "TON", name: "Toncoin", faName: "تون‌کوین" },
  polkadot: { symbol: "DOT", name: "Polkadot", faName: "پولکادات" },
  "matic-network": { symbol: "POL", name: "Polygon", faName: "پالیگان" },
  litecoin: { symbol: "LTC", name: "Litecoin", faName: "لایت‌کوین" },
  "shiba-inu": { symbol: "SHIB", name: "Shiba Inu", faName: "شیبا اینو" },
  "avalanche-2": { symbol: "AVAX", name: "Avalanche", faName: "آوالانچ" },
  chainlink: { symbol: "LINK", name: "Chainlink", faName: "چین‌لینک" },
  "usd-coin": { symbol: "USDC", name: "USD Coin", faName: "یواس‌دی‌کوین" },
};

export async function fetchFiat(): Promise<FiatRates> {
  const res = await fetch(ER_API);
  if (!res.ok) throw new Error("fiat fetch failed");
  const json = await res.json();
  return {
    base: json.base_code,
    updatedUnix: json.time_last_update_unix,
    rates: json.rates,
  };
}

export async function fetchCrypto(): Promise<{ coins: CryptoCoin[]; gold: GoldGlobal }> {
  const res = await fetch(COINGECKO);
  if (!res.ok) throw new Error("crypto fetch failed");
  const json = await res.json();

  const coins: CryptoCoin[] = [];
  for (const id of Object.keys(COIN_META)) {
    const d = json[id];
    if (!d) continue;
    const meta = COIN_META[id];
    coins.push({
      id,
      symbol: meta.symbol,
      name: meta.name,
      faName: meta.faName,
      usd: d.usd,
      change24h: d.usd_24h_change ?? 0,
    });
  }

  // PAXG هر توکن معادل یک اونس طلاست
  const pax = json["pax-gold"];
  const gold: GoldGlobal = {
    ouncePerUsd: pax?.usd ?? 0,
    change24h: pax?.usd_24h_change ?? 0,
  };

  return { coins, gold };
}

export async function fetchIranMarket(): Promise<IranMarket> {
  // دریافت قیمت‌های واقعی بازار ایران از Navasan-API (GitHub)
  const [fiatRes, goldRes] = await Promise.all([
    fetch("https://raw.githubusercontent.com/HosseinOdd/Navasan-API/main/data/fiat.json"),
    fetch("https://raw.githubusercontent.com/HosseinOdd/Navasan-API/main/data/gold.json"),
  ]);

  if (!fiatRes.ok || !goldRes.ok) throw new Error("iran market fetch failed");

  const fiat = await fiatRes.json();
  const gold = await goldRes.json();

  return {
    usdToman: fiat.usd?.value ?? 0,
    afnToman: fiat.afn?.value ?? 0,
    eurToman: fiat.eur?.value ?? 0,
    xauToman: gold.xau?.value ?? 0,
    usdXau: gold.usd_xau?.value ?? "0",
    btcToman: fiat.btc?.value ?? 0,
    sekkeh: gold.sekkeh?.value ?? 0,
    bahar: gold.bahar?.value ?? 0,
    nim: gold.nim?.value ?? 0,
    rob: gold.rob?.value ?? 0,
    ayar18: gold["18ayar"]?.value ?? 0,
    gerami: gold.gerami?.value ?? 0,
    updated: gold.xau?.date ?? Date.now() / 1000,
  };
}
