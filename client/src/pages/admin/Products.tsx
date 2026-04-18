import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Edit, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";

export default function AdminProducts() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    categoryId: "1",
    imageUrl: "",
    stock: "",
  });

  const productsQuery = trpc.adminProducts.list.useQuery();
  const createMutation = trpc.adminProducts.create.useMutation();
  const updateMutation = trpc.adminProducts.update.useMutation();
  const deleteMutation = trpc.adminProducts.delete.useMutation();

  // Redirect if not admin
  if (user?.role !== "admin") {
    return (
      <div className="container py-12 text-center">
        <p className="text-muted-foreground mb-4">Access denied</p>
        <Button onClick={() => navigate("/")}>Go Home</Button>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.slug || !formData.price || !formData.stock) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          name: formData.name,
          slug: formData.slug,
          description: formData.description || null,
          price: formData.price,
          categoryId: parseInt(formData.categoryId),
          imageUrl: formData.imageUrl || null,
          stock: parseInt(formData.stock),
        });
        toast.success("Product updated successfully");
      } else {
        await createMutation.mutateAsync({
          ...formData,
          stock: parseInt(formData.stock),
          categoryId: parseInt(formData.categoryId),
        });
        toast.success("Product created successfully");
      }
      
      setFormData({
        name: "",
        slug: "",
        description: "",
        price: "",
        categoryId: "1",
        imageUrl: "",
        stock: "",
      });
      setEditingId(null);
      setShowForm(false);
      productsQuery.refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to save product");
    }
  };

  const handleEdit = (product: any) => {
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      price: product.price,
      categoryId: product.categoryId.toString(),
      imageUrl: product.imageUrl || "",
      stock: product.stock.toString(),
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Product deleted successfully");
      productsQuery.refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete product");
    }
  };

  return (
    <AdminLayout>
      <div className="container py-12">

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-foreground">Products Management</h1>
          <Button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({
                name: "",
                slug: "",
                description: "",
                price: "",
                categoryId: "1",
                imageUrl: "",
                stock: "",
              });
            }}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <h3 className="font-semibold mb-6">
              {editingId ? "Edit Product" : "Create New Product"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Product Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  placeholder="Slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <textarea
                placeholder="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-lg"
                rows={3}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="Price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  placeholder="Stock"
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  placeholder="Image URL"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingId ? "Update" : "Create"} Product
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Products Table */}
        {productsQuery.isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse h-16 bg-muted rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {productsQuery.data?.map((product) => (
              <div
                key={product.id}
                className="bg-card border border-border rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex-1">
                  <h4 className="font-semibold">{product.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    ${parseFloat(product.price).toFixed(2)} • Stock: {product.stock}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(product)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(product.id)}
                    className="text-destructive hover:text-destructive flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
