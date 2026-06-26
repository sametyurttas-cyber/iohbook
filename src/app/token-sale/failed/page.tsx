import { redirect } from "next/navigation";

export default function TokenSaleFailedRedirect() {
  redirect("/payment/failed");
}
