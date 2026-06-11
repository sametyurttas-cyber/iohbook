import { Badge } from "@/components/ui/badge";
import { PRODUCT_STATUS_LABELS } from "@/features/products/product-utils";
import type { ProductStatus } from "@/types/database";

type ProductStatusBadgeProps = {
  status: ProductStatus;
};

export function ProductStatusBadge({ status }: ProductStatusBadgeProps) {
  const variant =
    status === "active" ? "gold" : status === "archived" ? "red" : "outline";

  return <Badge variant={variant}>{PRODUCT_STATUS_LABELS[status]}</Badge>;
}
