import React, { useEffect, useState } from "react";
import { Edit2, LayoutDashboard } from "lucide-react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { useAuthStore, useOrderStore, getAuthHeaders } from "@/lib/store";
import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateProfile } from "@/lib/api";

const Profile = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const updateUser = useAuthStore((state) => state.updateUser);

  const orders = useOrderStore((state) => state.orders);
  const loading = useOrderStore((state) => state.loading);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    address: user.address || "",
    city: user.city || "",
    avatar: user.avatar || "",
  });

  const [isSaving, setIsSaving] = useState(false);

  const initials =
    user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  useEffect(() => {
    // Fetch orders once when the profile mounts
    useOrderStore.getState().fetchUserOrders();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const authHeaders = getAuthHeaders();
      const updated = await updateProfile(
        {
          name: formData.name,
          phone: formData.phone || undefined,
          avatar: formData.avatar || undefined,
          address: formData.address || undefined,
          city: formData.city || undefined,
        },
        authHeaders,
      );

      if (!updated) {
        toast.error("Failed to update profile");
        return;
      }

      updateUser(updated);
      toast.success("Profile updated");
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Something went wrong updating your profile");
    } finally {
      setIsSaving(false);
    }
  };

  const avatarUrl = formData.avatar || user.avatar;

  return (
    <SidebarLayout>
      <div className="p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Admin shortcut - only for admins */}
          {isAdmin() && (
            <Link to="/admin">
              <Button
                variant="outline"
                className="w-full rounded-xl h-12 gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <LayoutDashboard className="h-5 w-5" />
                Open Admin Dashboard
              </Button>
            </Link>
          )}

          {/* Profile Card */}
          <div className="bg-primary rounded-2xl p-6 text-primary-foreground">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 rounded-full bg-sage-light overflow-hidden flex-shrink-0 flex items-center justify-center text-xl font-bold">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-2xl font-bold">
                    {user.name}
                  </h2>
                  <span className="px-2 py-1 text-xs rounded-full bg-primary-foreground/10">
                    {user.email}
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  {user.phone && (
                    <p>
                      <span className="font-medium">Phone:</span>{" "}
                      {user.phone}
                    </p>
                  )}
                  {(user.address || user.city) && (
                    <p>
                      <span className="font-medium">Address:</span>{" "}
                      {[user.address, user.city].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Editable Profile Form + Orders */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-xl font-bold">
                  Edit Profile
                </h3>
                <Edit2 className="w-4 h-4 text-muted-foreground" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. +264..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Street and house number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="City / Town"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avatar">Profile Picture URL</Label>
                  <Input
                    id="avatar"
                    name="avatar"
                    value={formData.avatar}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Paste a link to an image to use as your profile picture.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isSaving}
                  className="w-full rounded-full mt-2"
                >
                  {isSaving ? "Saving..." : "Save Profile"}
                </Button>
              </form>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="font-display text-xl font-bold mb-4">
                Your Orders
              </h3>

              {loading ? (
                <p className="text-sm text-muted-foreground">
                  Loading your orders...
                </p>
              ) : orders.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  You have not placed any orders yet.
                </p>
              ) : (
                <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-xl border border-border px-3 py-2 text-sm bg-muted/40"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          Order #{order.id}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {order.status}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                        <span>
                          {order.orderItems.length} items · N$
                          {Number(order.total).toFixed(0)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default Profile;
