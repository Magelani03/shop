import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";
import authBg from "@/assets/auth-bg.jpg";

const SignUp = () => {
  const navigate = useNavigate();
  const { register } = useAuthStore();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      await register(
        formData.name,
        formData.email,
        formData.password,
        formData.phone,
      );
      toast.success("Account created successfully!");
      navigate("/");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: `url(${authBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-full bg-sage/60 backdrop-blur-sm flex items-center justify-center">
            <User className="w-12 h-12 text-sage-light" />
          </div>
        </div>

        {/* Form Card */}
        <div className="glass-card p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="flex items-center gap-3">
              <Input
                type="text"
                placeholder="FULL NAME"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="flex-1 bg-background/90 border-0 rounded-lg h-12 text-center font-medium placeholder:text-muted-foreground"
              />
              <div className="w-10 h-10 rounded-full bg-charcoal flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-primary-foreground" />
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3">
              <Input
                type="email"
                placeholder="EMAIL"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="flex-1 bg-background/90 border-0 rounded-lg h-12 text-center font-medium placeholder:text-muted-foreground"
              />
              <div className="w-10 h-10 rounded-full bg-charcoal flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-primary-foreground" />
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3">
              <Input
                type="tel"
                placeholder="PHONE (OPTIONAL)"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="flex-1 bg-background/90 border-0 rounded-lg h-12 text-center font-medium placeholder:text-muted-foreground"
              />
              <div className="w-10 h-10 rounded-full bg-charcoal flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-primary-foreground" />
              </div>
            </div>

            {/* Password */}
            <div className="flex items-center gap-3">
              <Input
                type="password"
                placeholder="PASSWORD"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="flex-1 bg-background/90 border-0 rounded-lg h-12 text-center font-medium placeholder:text-muted-foreground"
              />
              <div className="w-10 h-10 rounded-full bg-charcoal flex items-center justify-center flex-shrink-0">
                <Lock className="w-5 h-5 text-primary-foreground" />
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Link
                to="/login"
                className="flex items-center gap-2 text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                <span className="w-5 h-5 border border-primary-foreground/50 rounded flex items-center justify-center text-xs">
                  ↗
                </span>
                Already have an account?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-background/90 text-foreground hover:bg-background rounded-lg font-medium text-lg disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
