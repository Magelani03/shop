import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useAuthStore, getAuthHeaders, type Product } from "@/lib/store";
import { createProduct, getAdminProductById, updateProduct } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

type FormState = {
  name: string;
  description: string;
  category: string;
  image: string;
  price: string;
  stock: string;
  discount: string;
  featured: boolean;
};

const initialState: FormState = {
  name: "",
  description: "",
  category: "",
  image: "",
  price: "",
  stock: "0",
  discount: "",
  featured: false,
};

export default function NewProduct() {
  const { id } = useParams();
  const editingId = id ? Number(id) : null;
  const isEditMode = Number.isInteger(editingId) && (editingId ?? 0) > 0;
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin } = useAuthStore();
  const [form, setForm] = useState<FormState>(initialState);
  const [saving, setSaving] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [imageFileName, setImageFileName] = useState<string>("");

  const canSubmit = useMemo(() => {
    if (!form.name.trim()) return false;
    if (!form.description.trim()) return false;
    if (!form.category.trim()) return false;
    if (!form.image.trim()) return false;
    if (!form.price.trim() || Number.isNaN(Number(form.price))) return false;
    if (!form.stock.trim() || Number.isNaN(Number(form.stock))) return false;
    if (form.discount.trim() && Number.isNaN(Number(form.discount))) return false;
    return true;
  }, [form]);

  async function onPickImage(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please choose an image file", variant: "destructive" });
      return;
    }
    // Keep it simple: store as a data URL in Product.image
    // (works immediately on Vercel/Render without object storage; keep images reasonably small)
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
    setImageFileName(file.name);
    setForm((s) => ({ ...s, image: dataUrl }));
  }

  if (!user || !isAdmin()) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    if (!isEditMode || !editingId) return;
    let mounted = true;
    setInitialLoading(true);
    getAdminProductById(editingId, getAuthHeaders())
      .then((product) => {
        if (!mounted || !product) return;
        setForm({
          name: product.name ?? "",
          description: product.description ?? "",
          category: product.category ?? "",
          image: product.image ?? "",
          price: String(product.price ?? ""),
          stock: String(product.stock ?? "0"),
          discount: product.discount !== undefined && product.discount !== null ? String(product.discount) : "",
          featured: Boolean(product.featured),
        });
      })
      .finally(() => {
        if (mounted) setInitialLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [isEditMode, editingId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || saving) return;

    setSaving(true);
    try {
      const payload: Partial<Product> = {
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        image: form.image.trim(),
        price: Number(form.price),
        stock: Number(form.stock),
        featured: form.featured,
        discount: form.discount.trim() ? Number(form.discount) : undefined,
      };

      const result = isEditMode && editingId
        ? await updateProduct(editingId, payload, getAuthHeaders())
        : await createProduct(payload, getAuthHeaders());
      if (!result) {
        toast({
          title: isEditMode ? "Failed to update product" : "Failed to create product",
          description: "Please check your inputs and try again.",
          variant: "destructive",
        });
        return;
      }

      toast({ title: isEditMode ? "Product updated" : "Product created" });
      navigate("/admin/products");
    } catch (err) {
      console.error("Create product error:", err);
      toast({
        title: "Failed to create product",
        description: "Server error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-bold">{isEditMode ? "Edit Product" : "Add Product"}</h1>
          <Button variant="outline" onClick={() => navigate("/admin/products")}>
            Back
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Product details</CardTitle>
          </CardHeader>
          <CardContent>
            {initialLoading ? (
              <div className="py-10 text-center text-muted-foreground">Loading product...</div>
            ) : (
            <form className="space-y-5" onSubmit={onSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                    placeholder="e.g. Hydrating Face Cream"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={form.category}
                    onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))}
                    placeholder="e.g. Skincare"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                  placeholder="Short product description..."
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="imageUrl">Image</Label>
                  {form.image ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setImageFileName("");
                        setForm((s) => ({ ...s, image: "" }));
                      }}
                    >
                      Clear image
                    </Button>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="imageFile">Upload (from your computer)</Label>
                    <Input
                      id="imageFile"
                      type="file"
                      accept="image/*"
                      onChange={(e) => void onPickImage(e.target.files?.[0] ?? null)}
                    />
                    {imageFileName ? (
                      <div className="text-xs text-muted-foreground">Selected: {imageFileName}</div>
                    ) : (
                      <div className="text-xs text-muted-foreground">
                        This will be stored inside the database as a data URL.
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Or paste an image URL</Label>
                    <Input
                      id="imageUrl"
                      value={form.image.startsWith("data:") ? "" : form.image}
                      onChange={(e) => {
                        setImageFileName("");
                        setForm((s) => ({ ...s, image: e.target.value }));
                      }}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                {form.image ? (
                  <div className="rounded-md border bg-background p-3">
                    <div className="text-xs text-muted-foreground mb-2">Preview</div>
                    <img
                      src={form.image}
                      alt="Product preview"
                      className="max-h-48 w-auto rounded-md object-contain"
                    />
                  </div>
                ) : null}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    inputMode="decimal"
                    value={form.price}
                    onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))}
                    placeholder="e.g. 199.99"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    inputMode="numeric"
                    value={form.stock}
                    onChange={(e) => setForm((s) => ({ ...s, stock: e.target.value }))}
                    placeholder="e.g. 20"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount">Discount % (optional)</Label>
                  <Input
                    id="discount"
                    inputMode="numeric"
                    value={form.discount}
                    onChange={(e) => setForm((s) => ({ ...s, discount: e.target.value }))}
                    placeholder="e.g. 10"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="featured"
                  checked={form.featured}
                  onCheckedChange={(v) => setForm((s) => ({ ...s, featured: v === true }))}
                />
                <Label htmlFor="featured">Featured product</Label>
              </div>

              <div className="flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setForm(initialState)}
                  disabled={saving}
                >
                  Reset
                </Button>
                <Button type="submit" disabled={!canSubmit || saving}>
                  {saving ? "Saving..." : isEditMode ? "Save changes" : "Create product"}
                </Button>
              </div>
            </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

