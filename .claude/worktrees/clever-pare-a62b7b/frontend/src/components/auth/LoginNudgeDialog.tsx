import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface LoginNudgeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    redirectPath: string;
}

export function LoginNudgeDialog({
    open,
    onOpenChange,
    redirectPath,
}: LoginNudgeDialogProps) {
    const router = useRouter();

    const handleLogin = () => {
        router.push(`/login?redirect=${encodeURIComponent(redirectPath)}`);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="mx-auto bg-primary/10 p-4 rounded-full mb-4 w-16 h-16 flex items-center justify-center">
                        <Lock className="h-8 w-8 text-primary" />
                    </div>
                    <DialogTitle className="text-center text-2xl font-bold">
                        Login Required
                    </DialogTitle>
                    <DialogDescription className="text-center pt-2">
                        To ensure the security of your documents and track your service request progress, you need to be logged in.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="flex items-center gap-4 bg-muted/50 p-3 rounded-lg">
                        <UserCircle className="h-5 w-5 text-primary" />
                        <div className="text-sm">
                            <p className="font-medium text-foreground">Secure Account</p>
                            <p className="text-muted-foreground">Protect your business details</p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-col gap-2">
                    <Button onClick={handleLogin} className="w-full text-lg h-11">
                        Login or Sign Up
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/')}
                        className="w-full"
                    >
                        Go Back Home
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
