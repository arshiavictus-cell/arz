type Props = {
  id: string;
  icon: string;
  title: string;
  description?: string;
  count?: number;
  children: React.ReactNode;
};

export default function Section({ id, icon, title, description, count, children }: Props) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">{title}</h2>
            {description && <p className="text-xs text-slate-400">{description}</p>}
          </div>
        </div>
        {count !== undefined && (
          <span className="tabular rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
            {new Intl.NumberFormat("fa-IR").format(count)} مورد
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}
