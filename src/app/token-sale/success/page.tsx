import { redirect } from "next/navigation";

export default function TokenSaleSuccessRedirect() {
  redirect("/payment/success");
}
