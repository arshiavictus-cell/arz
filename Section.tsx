import { timeNow } from "../lib/format";
import { useEffect, useState } from "react";

type Props = {
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
  usdToman: number | null;
  onRefresh: () => void;
  query: string;
  onQueryChange: (v: string) => void;
};

export default function Header({
  loading,
  error,
  lastUpdated,
  usdToman,
  onRefresh,
  query,
  onQueryChange,
}: Props) {
  const [clock, setClock] = useState(timeNow());
  useEffect(() => {
    const t = setInterval(() => setClock(timeNow()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/85 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 text-xl shadow-sm">
              💹
            </div>
            <div>
              <h1 className="text-lg font-extrabold leading-tight text-slate-900 sm:text-xl">
                نرخ لحظه‌ای
              </h1>
              <p className="text-[11px] text-slate-400">
                قیمت زنده دلار، ارز، افغانی، طلا، سکه و رمزارز
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 sm:flex">
              <span
                className={`h-2 w-2 rounded-full ${
                  error ? "bg-rose-500" : loading ? "bg-amber-500" : "bg-emerald-500"
                } ${!error && !loading ? "animate-pulse" : ""}`}
              />
              <span className="tabular text-xs font-medium text-slate-500">{clock}</span>
            </div>
            <button
              onClick={onRefresh}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white transition hover:bg-slate-700"
              title="به‌روزرسانی"
            >
              <span className={loading ? "inline-block animate-spin" : ""}>↻</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              🔍
            </span>
            <input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="جستجو: دلار، افغانی، بیت‌کوین، طلا ..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-10 pl-3 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            />
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5">
            <label className="whitespace-nowrap text-xs text-slate-500">
              دلار بازار آزاد:
            </label>
            <span className="tabular font-bold text-slate-900">
              {usdToman
                ? `${new Intl.NumberFormat("fa-IR").format(usdToman)} تومان`
                : "دریافت نشد"}
            </span>
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>
        )}
        {lastUpdated && !error && (
          <p className="text-[11px] text-slate-400">
            آخرین به‌روزرسانی:{" "}
            {new Intl.DateTimeFormat("fa-IR", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }).format(lastUpdated)}{" "}
            • به‌روزرسانی خودکار هر ۳۰ ثانیه
          </p>
        )}
      </div>
    </header>
  );
}
