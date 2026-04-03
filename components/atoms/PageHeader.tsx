import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

interface PageHeaderProps {
  backHref: string;
  title: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  maxWidth?: "2xl" | "3xl";
}

export const PageHeader = ({
  backHref,
  title,
  icon,
  actions,
  maxWidth = "2xl",
}: PageHeaderProps) => {
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-stone-200">
      <div className={`${maxWidth === "3xl" ? "max-w-3xl" : "max-w-2xl"} mx-auto px-4 h-14 flex items-center gap-3`}>
        <Link
          href={backHref}
          className="p-2 -ml-2 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition flex-shrink-0"
        >
          <ArrowLeft size={18} />
        </Link>
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span className="font-semibold text-stone-900 truncate flex-1">{title}</span>
        {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
      </div>
    </header>
  );
};
