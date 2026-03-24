import { useEffect } from "react";
import { useAdminStore, useAuthStore } from "@/lib/store";
import { Navigate, useSearchParams } from "react-router-dom";
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
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

const AdminOrders = () => {
    const { user, isAdmin } = useAuthStore();
    const { orders, loading, fetchAdminOrders, updateOrderStatus, generateWhatsApp } = useAdminStore();
    const [searchParams, setSearchParams] = useSearchParams();
    const search = searchParams.get("search") ?? "";
    const status = searchParams.get("status") ?? "all";

    useEffect(() => {
        if (isAdmin()) {
            const filters: Record<string, string> = {};
            if (search) filters.search = search;
            if (status && status !== "all") filters.status = status;
            fetchAdminOrders(filters);
        }
    }, [fetchAdminOrders, isAdmin, search, status]);

    if (!user || !isAdmin()) {
        return <Navigate to="/login" replace />;
    }

    const handleStatusUpdate = async (orderId: number, status: string) => {
        const success = await updateOrderStatus(orderId, status);
        if (success) {
            toast.success("Order status updated");
        } else {
            toast.error("Failed to update order status");
        }
    };

    const handleWhatsApp = async (orderId: number) => {
        const url = await generateWhatsApp(orderId);
        if (url) {
            window.open(url, "_blank");
        } else {
            toast.error("Failed to generate WhatsApp link");
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING": return "bg-yellow-500";
            case "CONFIRMED": return "bg-blue-500";
            case "PROCESSING": return "bg-purple-500";
            case "SHIPPED": return "bg-orange-500";
            case "DELIVERED": return "bg-green-500";
            case "CANCELLED": return "bg-red-500";
            default: return "bg-gray-500";
        }
    };

    return (
        <div className="min-h-screen bg-muted/30 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="font-display text-3xl font-bold">Manage Orders</h1>
                    <Button
                        variant="outline"
                        onClick={() => {
                            const filters: Record<string, string> = {};
                            if (search) filters.search = search;
                            if (status && status !== "all") filters.status = status;
                            fetchAdminOrders(filters);
                        }}
                    >
                        Refresh
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input
                        placeholder="Search by name / email / phone"
                        value={search}
                        onChange={(e) => {
                            const next = new URLSearchParams(searchParams);
                            if (e.target.value) next.set("search", e.target.value);
                            else next.delete("search");
                            setSearchParams(next);
                        }}
                    />
                    <select
                        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                        value={status}
                        onChange={(e) => {
                            const next = new URLSearchParams(searchParams);
                            if (e.target.value && e.target.value !== "all") next.set("status", e.target.value);
                            else next.delete("status");
                            setSearchParams(next);
                        }}
                    >
                        <option value="all">All statuses</option>
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                    </select>
                    <Button
                        variant="secondary"
                        onClick={() => setSearchParams(new URLSearchParams())}
                    >
                        Clear Filters
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="py-8 text-center text-muted-foreground">Loading orders...</div>
                        ) : orders.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground">No orders found</div>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Order #</TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Total</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {orders.map((order) => (
                                            <TableRow key={order.id}>
                                                <TableCell className="font-medium">#{order.id}</TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{order.customerName}</p>
                                                        <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                                                <TableCell>N${Number(order.total).toFixed(2)}</TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusColor(order.status)}>
                                                        {order.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleWhatsApp(order.id)}
                                                            title="Send WhatsApp"
                                                        >
                                                            <MessageCircle className="h-4 w-4" />
                                                        </Button>
                                                        <select
                                                            className="text-xs border rounded p-1"
                                                            value={order.status}
                                                            onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                                        >
                                                            <option value="PENDING">PENDING</option>
                                                            <option value="CONFIRMED">CONFIRMED</option>
                                                            <option value="PROCESSING">PROCESSING</option>
                                                            <option value="SHIPPED">SHIPPED</option>
                                                            <option value="DELIVERED">DELIVERED</option>
                                                            <option value="CANCELLED">CANCELLED</option>
                                                        </select>
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

export default AdminOrders;
