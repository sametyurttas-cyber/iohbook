import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata("Style Guide");
import {
  Toast,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport
} from "@/components/ui/toast";

const swatches = [
  { name: "ink", className: "bg-ink", text: "text-paper" },
  { name: "paper", className: "bg-paper", text: "text-ink" },
  { name: "gold", className: "bg-gold", text: "text-ink" },
  { name: "burgundy", className: "bg-burgundy", text: "text-paper" },
  { name: "mist", className: "bg-mist", text: "text-ink" },
  { name: "charcoal", className: "bg-charcoal", text: "text-paper" }
];

const books = [
  {
    title: "CODE GOD",
    accentClass: "border-gold/30 bg-gold/10 shadow-glow",
    badge: "gold" as const,
    stock: "24"
  },
  {
    title: "SYS GOD",
    accentClass: "border-mist-blue/30 bg-mist-blue/10 shadow-glow-blue",
    badge: "blue" as const,
    stock: "18"
  },
  {
    title: "CODE WAR",
    accentClass: "border-burgundy-bright/30 bg-burgundy-bright/10 shadow-glow-red",
    badge: "red" as const,
    stock: "12"
  }
];

export default function StyleGuidePage() {
  return (
    <ToastProvider>
      <main className="min-h-screen px-6 py-10 md:px-10" id="main-content">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
          <header className="rounded-lg border border-border bg-card/70 p-6 shadow-panel">
            <Badge variant="gold">Design System</Badge>
            <div className="mt-6 grid gap-4 md:grid-cols-[1fr_20rem] md:items-end">
              <div>
                <p className="text-eyebrow uppercase text-muted-foreground">
                  IOH / Samet Yurttas
                </p>
                <h1 className="mt-3 font-display text-display-sm text-paper md:text-display-md">
                  Cosmic commerce interface foundation
                </h1>
              </div>
              <p className="text-body text-muted-foreground">
                Tokens and primitives for the storefront, checkout, account, and
                admin surfaces.
              </p>
            </div>
          </header>

          <section className="grid gap-4 md:grid-cols-3">
            {books.map((book) => (
              <div
                className="rounded-lg border border-border bg-card p-5 shadow-panel"
                key={book.title}
              >
                <Badge variant={book.badge}>{book.title}</Badge>
                <div className={`mt-5 h-28 rounded-md border ${book.accentClass}`} />
                <div className="mt-5 flex items-end justify-between gap-4">
                  <div>
                    <h2 className="font-display text-title-lg text-paper">
                      {book.title}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Limited edition stock token
                    </p>
                  </div>
                  <p className="font-display text-title-md text-gold">{book.stock}</p>
                </div>
              </div>
            ))}
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="font-display text-title-lg text-paper">Color Tokens</h2>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {swatches.map((swatch) => (
                  <div
                    className={`${swatch.className} ${swatch.text} rounded-md p-4 text-sm font-semibold`}
                    key={swatch.name}
                  >
                    {swatch.name}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="font-display text-title-lg text-paper">Type Scale</h2>
              <div className="mt-5 space-y-3">
                <p className="text-eyebrow uppercase text-gold">Eyebrow / IOH</p>
                <p className="font-display text-display-sm text-paper">Display</p>
                <p className="text-title-lg text-paper">Title large</p>
                <p className="text-body text-muted-foreground">
                  Body copy uses a calm rhythm for product, checkout, and admin
                  surfaces.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card p-6">
            <h2 className="font-display text-title-lg text-paper">Controls</h2>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <Input placeholder="Book title" />
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select variant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard edition</SelectItem>
                  <SelectItem value="signed">Signed edition</SelectItem>
                  <SelectItem value="limited">Limited edition</SelectItem>
                </SelectContent>
              </Select>
              <Textarea placeholder="Editorial product note" />
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="font-display text-title-lg text-paper">Overlays</h2>
              <div className="mt-5 flex flex-wrap gap-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Open Dialog</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Publish limited edition</DialogTitle>
                      <DialogDescription>
                        Confirm visibility and stock rules before launch.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button>Confirm</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="secondary">Open Sheet</Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Cart summary</SheetTitle>
                      <SheetDescription>
                        A right-side surface for cart and admin detail views.
                      </SheetDescription>
                    </SheetHeader>
                  </SheetContent>
                </Sheet>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost">Menu</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Edit product</DropdownMenuItem>
                    <DropdownMenuItem>Duplicate variant</DropdownMenuItem>
                    <DropdownMenuItem>Archive</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="font-display text-title-lg text-paper">Tabs</h2>
              <Tabs className="mt-5" defaultValue="storefront">
                <TabsList>
                  <TabsTrigger value="storefront">Storefront</TabsTrigger>
                  <TabsTrigger value="admin">Admin</TabsTrigger>
                  <TabsTrigger value="checkout">Checkout</TabsTrigger>
                </TabsList>
                <TabsContent value="storefront">
                  <p className="text-sm text-muted-foreground">
                    Editorial, cinematic, book-first product surfaces.
                  </p>
                </TabsContent>
                <TabsContent value="admin">
                  <p className="text-sm text-muted-foreground">
                    Dense operational screens with tables and clear status.
                  </p>
                </TabsContent>
                <TabsContent value="checkout">
                  <p className="text-sm text-muted-foreground">
                    Linear, hosted-payment-friendly purchase flow.
                  </p>
                </TabsContent>
              </Tabs>
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card p-6">
            <h2 className="font-display text-title-lg text-paper">Admin Table</h2>
            <div className="mt-5">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book</TableHead>
                    <TableHead>Variant</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>CODE GOD</TableCell>
                    <TableCell>Signed</TableCell>
                    <TableCell>
                      <Badge variant="gold">Live</Badge>
                    </TableCell>
                    <TableCell className="text-right">24</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>SYS GOD</TableCell>
                    <TableCell>Limited</TableCell>
                    <TableCell>
                      <Badge variant="blue">Draft</Badge>
                    </TableCell>
                    <TableCell className="text-right">18</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>CODE WAR</TableCell>
                    <TableCell>Preorder</TableCell>
                    <TableCell>
                      <Badge variant="red">Queued</Badge>
                    </TableCell>
                    <TableCell className="text-right">12</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </section>
        </div>
      </main>
      <Toast defaultOpen>
        <div className="grid gap-1">
          <ToastTitle>Design system loaded</ToastTitle>
          <ToastDescription>
            Tokens and primitives are ready for the next prompt.
          </ToastDescription>
        </div>
      </Toast>
      <ToastViewport />
    </ToastProvider>
  );
}
