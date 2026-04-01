import { useEffect } from "react";
import { useAdminStore, useAuthStore } from "@/lib/store";
import { Link, Navigate } from "react-router-dom";
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
import { User, Phone, Mail } from "lucide-react";

const AdminUsers = () => {
    const { user, isAdmin } = useAuthStore();
    const { users, loading, fetchUsers } = useAdminStore();

    useEffect(() => {
        if (isAdmin()) {
            fetchUsers();
        }
    }, [fetchUsers, isAdmin]);

    if (!user || !isAdmin()) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen bg-muted/30 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="font-display text-3xl font-bold">Manage Customers</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Registered Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="py-8 text-center text-muted-foreground">Loading users...</div>
                        ) : users.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground">No users found</div>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Phone</TableHead>
                                            <TableHead>Joined Date</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.map((u) => (
                                            <TableRow key={u.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-sage-light flex items-center justify-center">
                                                            <User className="h-4 w-4 text-sage-dark" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{u.name}</p>
                                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <Mail className="h-3 w-3" /> {u.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={u.role === "ADMIN" ? "secondary" : "outline"}>
                                                        {u.role}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm flex items-center gap-1 text-muted-foreground">
                                                        <Phone className="h-3 w-3" /> {u.phone || "No phone"}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {new Date(u.createdAt).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Link to={`/admin/orders?search=${encodeURIComponent(u.email)}`}>
                                                        <Button variant="ghost" size="sm">
                                                            View Orders
                                                        </Button>
                                                    </Link>
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

export default AdminUsers;
