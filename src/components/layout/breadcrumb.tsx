import Link from "next/link";
import { cn } from "@/lib/utils";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export function Breadcrumb({ className, items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm", className)}>
      <ol className="flex flex-wrap items-center gap-1 text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li className="flex min-h-11 items-center gap-1" key={`${item.label}-${index}`}>
              {index > 0 ? <span className="text-border">/</span> : null}
              {item.href && !isLast ? (
                <Link
                  className="inline-flex min-h-11 items-center rounded-md px-2 transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  href={item.href}
                >
                  {item.label}
                </Link>
              ) : (
                <span className={cn("inline-flex min-h-11 items-center px-2", isLast ? "text-paper" : undefined)}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
