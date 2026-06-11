import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

type ProductFiltersProps = {
  q?: string;
  status?: string;
};

export function ProductFilters({ q, status = "all" }: ProductFiltersProps) {
  return (
    <form className="grid gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-[1fr_14rem_auto]">
      <Input defaultValue={q} name="q" placeholder="Başlık veya slug ara" />
      <Select defaultValue={status} name="status">
        <SelectTrigger>
          <SelectValue placeholder="Durum" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tüm durumlar</SelectItem>
          <SelectItem value="draft">Taslak</SelectItem>
          <SelectItem value="active">Yayında</SelectItem>
          <SelectItem value="archived">Arşiv</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit" variant="secondary">
        Filtrele
      </Button>
    </form>
  );
}
