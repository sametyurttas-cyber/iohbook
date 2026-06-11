import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { uploadProductMedia } from "@/features/media/actions";
import { STORAGE_BUCKETS } from "@/features/media/storage-config";

type AdminMediaUploadFormProps = {
  productId?: string;
  variantId?: string;
};

async function uploadMediaFromForm(formData: FormData) {
  "use server";
  await uploadProductMedia(formData);
}

export function AdminMediaUploadForm({
  productId,
  variantId
}: AdminMediaUploadFormProps) {
  return (
    <form action={uploadMediaFromForm} className="grid gap-4">
      {productId ? (
        <input name="product_id" type="hidden" value={productId} />
      ) : (
        <Input name="product_id" placeholder="Product id" />
      )}
      {variantId ? (
        <input name="variant_id" type="hidden" value={variantId} />
      ) : (
        <Input name="variant_id" placeholder="Variant id (optional)" />
      )}
      <input name="bucket" type="hidden" value={STORAGE_BUCKETS.publicMedia} />
      <Input accept="image/jpeg,image/png,image/webp,image/avif" name="file" type="file" />
      <Input name="alt_text" placeholder="Alt text" />
      <Select defaultValue="gallery" name="kind">
        <SelectTrigger>
          <SelectValue placeholder="Media kind" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="cover">Cover</SelectItem>
          <SelectItem value="gallery">Gallery</SelectItem>
          <SelectItem value="banner">Banner</SelectItem>
          <SelectItem value="certificate">Certificate</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit">Upload media</Button>
    </form>
  );
}
