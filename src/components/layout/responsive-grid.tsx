import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ResponsiveGridProps = HTMLAttributes<HTMLDivElement> & {
  columns?: 2 | 3 | 4;
};

const gridColumns = {
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
};

export function ResponsiveGrid({
  className,
  columns = 3,
  ...props
}: ResponsiveGridProps) {
  return <div className={cn("grid gap-5", gridColumns[columns], className)} {...props} />;
}
