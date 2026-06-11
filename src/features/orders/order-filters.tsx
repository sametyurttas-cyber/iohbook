import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import type { OrderStatus, PaymentStatus, ShipmentStatus } from "@/types/database";

type OrderFiltersProps = {
  fulfillment?: ShipmentStatus | "all";
  payment?: PaymentStatus | "all";
  q?: string;
  status?: OrderStatus | "all";
};

export function OrderFilters({
  fulfillment = "all",
  payment = "all",
  q,
  status = "all"
}: OrderFiltersProps) {
  return (
    <form className="grid gap-3 rounded-lg border border-border bg-card p-4 lg:grid-cols-[1fr_12rem_12rem_12rem_auto]">
      <Input defaultValue={q} name="q" placeholder="Siparis no, e-posta veya isim ara" />
      <Select defaultValue={status} name="status">
        <SelectTrigger>
          <SelectValue placeholder="Siparis durumu" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tum siparisler</SelectItem>
          <SelectItem value="draft">Taslak</SelectItem>
          <SelectItem value="pending_payment">Odeme bekliyor</SelectItem>
          <SelectItem value="paid">Odendi</SelectItem>
          <SelectItem value="fulfilled">Gonderildi</SelectItem>
          <SelectItem value="completed">Tamamlandi</SelectItem>
          <SelectItem value="cancelled">Iptal</SelectItem>
          <SelectItem value="refunded">Iade</SelectItem>
        </SelectContent>
      </Select>
      <Select defaultValue={payment} name="payment">
        <SelectTrigger>
          <SelectValue placeholder="Odeme" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tum odemeler</SelectItem>
          <SelectItem value="initiated">Baslatildi</SelectItem>
          <SelectItem value="pending">Bekliyor</SelectItem>
          <SelectItem value="authorized">Onaylandi</SelectItem>
          <SelectItem value="paid">Odendi</SelectItem>
          <SelectItem value="failed">Basarisiz</SelectItem>
          <SelectItem value="cancelled">Iptal</SelectItem>
          <SelectItem value="refunded">Iade</SelectItem>
        </SelectContent>
      </Select>
      <Select defaultValue={fulfillment} name="fulfillment">
        <SelectTrigger>
          <SelectValue placeholder="Fulfillment" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tum kargolar</SelectItem>
          <SelectItem value="pending">Bekliyor</SelectItem>
          <SelectItem value="preparing">Paketleniyor</SelectItem>
          <SelectItem value="shipped">Gonderildi</SelectItem>
          <SelectItem value="delivered">Teslim edildi</SelectItem>
          <SelectItem value="returned">Iade dondu</SelectItem>
          <SelectItem value="cancelled">Iptal</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit" variant="secondary">
        Filtrele
      </Button>
    </form>
  );
}
