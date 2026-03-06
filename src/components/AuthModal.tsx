import { useNavigate } from "react-router-dom";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store";
import { LogIn, UserPlus } from "lucide-react";

const AuthModal = () => {
    const navigate = useNavigate();
    const { showAuthModal, setShowAuthModal } = useAuthStore();

    const handleLogin = () => {
        setShowAuthModal(false);
        navigate("/login");
    };

    const handleSignUp = () => {
        setShowAuthModal(false);
        navigate("/signup");
    };

    return (
        <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
            <DialogContent className="sm:max-w-[425px] bg-charcoal text-primary-foreground border-sage/20">
                <DialogHeader>
                    <DialogTitle className="font-display text-2xl font-bold text-center">
                        Authentication Required
                    </DialogTitle>
                    <DialogDescription className="text-primary-foreground/70 text-center pt-2">
                        Please log in or create an account to continue with your purchase.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-6">
                    <Button
                        onClick={handleLogin}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2 h-12 text-lg rounded-xl"
                    >
                        <LogIn className="w-5 h-5" />
                        Login to Internal Account
                    </Button>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-primary-foreground/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-charcoal px-2 text-primary-foreground/50">
                                Or
                            </span>
                        </div>
                    </div>
                    <Button
                        onClick={handleSignUp}
                        variant="outline"
                        className="w-full border-primary-foreground/20 hover:bg-primary-foreground/10 text-primary-foreground flex items-center justify-center gap-2 h-12 text-lg rounded-xl"
                    >
                        <UserPlus className="w-5 h-5" />
                        Create New Account
                    </Button>
                </div>
                <p className="text-center text-sm text-primary-foreground/50">
                    Join us to track your orders and enjoy a personalized shopping experience.
                </p>
            </DialogContent>
        </Dialog>
    );
};

export default AuthModal;
