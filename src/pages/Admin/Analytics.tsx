import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store";
import { Navigate } from "react-router-dom";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
} from "recharts";
import { TrendingUp, DollarSign, ShoppingBag, Users } from "lucide-react";
import { getSalesAnalytics } from "@/lib/api";
import { getAuthHeaders } from "@/lib/store";

const Analytics = () => {
    const { user, isAdmin } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [period, setPeriod] = useState("7d");

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                const result = await getSalesAnalytics(period, getAuthHeaders());
                setData(result);
            } catch (error) {
                console.error("Error fetching analytics:", error);
            } finally {
                setLoading(false);
            }
        };

        if (isAdmin()) {
            fetchAnalytics();
        }
    }, [isAdmin, period]);

    if (!user || !isAdmin()) {
        return <Navigate to="/login" replace />;
    }

    const totalRevenue = data?.salesData?.reduce((acc: number, curr: any) => acc + (Number(curr._sum?.total) || 0), 0) || 0;
    const totalSales = data?.salesData?.reduce((acc: number, curr: any) => acc + (curr._count || 0), 0) || 0;
    const topProduct = data?.topProducts?.[0];

    return (
        <div className="min-h-screen bg-muted/30 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-display text-3xl font-bold">Sales Analytics</h1>
                        <p className="text-muted-foreground">Monitor your store performance</p>
                    </div>
                    <div className="flex gap-2">
                        {["7d", "30d", "90d", "all"].map((p) => (
                            <Button
                                key={p}
                                variant={period === p ? "default" : "outline"}
                                size="sm"
                                onClick={() => setPeriod(p)}
                                className="capitalize"
                            >
                                {p}
                            </Button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="py-20 text-center text-muted-foreground animate-pulse">
                        Analyzing store data...
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                                        Total Revenue
                                    </CardTitle>
                                    <DollarSign className="h-4 w-4 text-primary" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">N${totalRevenue.toFixed(2)}</div>
                                    <p className="text-xs text-muted-foreground mt-1">Based on filtered period</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                                        Orders
                                    </CardTitle>
                                    <ShoppingBag className="h-4 w-4 text-primary" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{totalSales}</div>
                                    <p className="text-xs text-muted-foreground mt-1">Completed orders</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                                        Best Seller
                                    </CardTitle>
                                    <TrendingUp className="h-4 w-4 text-primary" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xl font-bold truncate">
                                        {topProduct?.product?.name || "N/A"}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {topProduct?._sum?.quantity || 0} units sold
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                                        Order Stats
                                    </CardTitle>
                                    <Users className="h-4 w-4 text-primary" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {data?.ordersByStatus?.length || 0}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">Statuses tracked</p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Sales Trend</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={data?.salesData?.map((d: any) => ({
                                                date: new Date(d.createdAt).toLocaleDateString(),
                                                revenue: Number(d._sum?.total) || 0
                                            })) || []}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                <XAxis
                                                    dataKey="date"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fontSize: 10, fill: '#64748b' }}
                                                />
                                                <YAxis
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fontSize: 10, fill: '#64748b' }}
                                                />
                                                <Tooltip />
                                                <Line
                                                    type="monotone"
                                                    dataKey="revenue"
                                                    stroke="#1a3d37"
                                                    strokeWidth={2}
                                                    dot={false}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Top Products</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={data?.topProducts?.map((p: any) => ({
                                                name: p.product?.name || "Unknown",
                                                sales: p._sum?.quantity || 0
                                            })) || []}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                <XAxis
                                                    dataKey="name"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    hide
                                                />
                                                <YAxis
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fontSize: 10, fill: '#64748b' }}
                                                />
                                                <Tooltip />
                                                <Bar
                                                    dataKey="sales"
                                                    fill="#d4e1d1"
                                                    radius={[4, 4, 0, 0]}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Analytics;
