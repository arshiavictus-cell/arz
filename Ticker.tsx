import { useEffect, useRef, useState } from "react";

type Props = {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  value: string;
  unit?: string;
  change?: number; // درصد تغییر ۲۴ ساعته (اختیاری)
  rawValue: number; // برای تشخیص فلش
};

export default function PriceRow({
  icon,
  title,
  subtitle,
  value,
  unit,
  change,
  rawValue,
}: Props) {
  const prev = useRef(rawValue);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    if (prev.current !== rawValue && isFinite(rawValue) && isFinite(prev.current)) {
      setFlash(rawValue > prev.current ? "up" : "down");
      const t = setTimeout(() => setFlash(null), 1000);
      prev.current = rawValue;
      return () => clearTimeout(t);
    }
    prev.current = rawValue;
  }, [rawValue]);

  const changeColor =
    change === undefined
      ? ""
      : change > 0
      ? "text-emerald-600 bg-emerald-50"
      : change < 0
      ? "text-rose-600 bg-rose-50"
      : "text-slate-500 bg-slate-100";

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 transition-shadow hover:shadow-md ${
        flash === "up" ? "flash-up" : flash === "down" ? "flash-down" : ""
      }`}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-xl">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-slate-800">{title}</p>
        <p className="truncate text-xs text-slate-400">{subtitle}</p>
      </div>
      <div className="flex flex-col items-end">
        <div className="flex items-baseline gap-1">
          <span className="tabular text-base font-bold text-slate-900 sm:text-lg">
            {value}
          </span>
          {unit && <span className="text-[11px] text-slate-400">{unit}</span>}
        </div>
        {change !== undefined && (
          <span
            className={`tabular mt-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${changeColor}`}
          >
            {change > 0 ? "▲" : change < 0 ? "▼" : "•"}{" "}
            {new Intl.NumberFormat("fa-IR", {
              maximumFractionDigits: 2,
            }).format(Math.abs(change))}
            ٪
          </span>
        )}
      </div>
    </div>
  );
}
