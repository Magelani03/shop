import { useEffect } from "react";
import { useAdminStore, useAuthStore } from "@/lib/store";
import { Navigate, Link } from "react-router-dom";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2 } from "lucide-react";

const AdminProducts = () => {
    const { user, isAdmin } = useAuthStore();
    const { products, loading, fetchAdminProducts } = useAdminStore();

    useEffect(() => {
        if (isAdmin()) {
            fetchAdminProducts();
        }
    }, [fetchAdminProducts, isAdmin]);

    if (!user || !isAdmin()) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen bg-muted/30 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="font-display text-3xl font-bold">Manage Products</h1>
                    <Link to="/admin/products/new">
                        <Button className="bg-primary hover:bg-primary/90 rounded-full">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Product
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Inventory</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="py-8 text-center text-muted-foreground">Loading products...</div>
                        ) : products.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground">No products found</div>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Image</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Stock</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {products.map((product) => (
                                            <TableRow key={product.id}>
                                                <TableCell>
                                                    <img
                                                        src={product.image}
                                                        alt={product.name}
                                                        className="w-10 h-10 object-cover rounded-md"
                                                    />
                                                </TableCell>
                                                <TableCell className="font-medium">{product.name}</TableCell>
                                                <TableCell>{product.category}</TableCell>
                                                <TableCell>N${Number(product.price).toFixed(2)}</TableCell>
                                                <TableCell>
                                                    <Badge variant={product.stock > 0 ? "outline" : "destructive"}>
                                                        {product.stock} in stock
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={product.active ? "secondary" : "outline"}>
                                                        {product.active ? "Active" : "Inactive"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button variant="ghost" size="sm">
                                                            <Edit2 className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminProducts;
