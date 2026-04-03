import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PageEmptyStateProps {
  emoji: string;
  title: string;
  subtitle?: string;
  ctaHref?: string;
  ctaLabel?: string;
}

export const PageEmptyState = ({
  emoji,
  title,
  subtitle,
  ctaHref,
  ctaLabel,
}: PageEmptyStateProps) => {
  return (
    <div className="text-center py-20 text-stone-400">
      <div className="text-5xl mb-4">{emoji}</div>
      <p className="text-lg font-medium text-stone-500">{title}</p>
      {subtitle && <p className="text-sm mt-1 mb-6">{subtitle}</p>}
      {ctaHref && ctaLabel && (
        <Link
          href={ctaHref}
          className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition"
        >
          <ArrowLeft size={14} />
          {ctaLabel}
        </Link>
      )}
    </div>
  );
};
