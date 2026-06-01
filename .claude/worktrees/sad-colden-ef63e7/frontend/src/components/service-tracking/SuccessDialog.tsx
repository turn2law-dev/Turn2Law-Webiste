import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface SuccessDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    serviceNumber?: string;
}

export function SuccessDialog({ open, onOpenChange, serviceNumber }: SuccessDialogProps) {
    const router = useRouter();

    const handleGoToDashboard = () => {
        router.push("/dashboard/client?tab=track");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md border-0 shadow-2xl">
                <DialogHeader className="space-y-4">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100/50 ring-8 ring-green-50 animate-in zoom-in duration-300">
                        <CheckCircle className="h-10 w-10 text-green-600 drop-shadow-sm" />
                    </div>
                    <div>
                        <DialogTitle className="text-center text-2xl font-bold text-foreground">Application Submitted!</DialogTitle>
                        <DialogDescription className="text-center pt-2 text-base">
                            We have received your request. Our legal team will review it shortly.
                        </DialogDescription>
                    </div>
                    {serviceNumber && (
                        <div className="bg-muted/30 border border-border/50 rounded-xl p-4 text-center space-y-1">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Reference Number</p>
                            <p className="font-mono text-xl font-bold text-primary tracking-tight">{serviceNumber}</p>
                        </div>
                    )}
                </DialogHeader>
                <div className="flex flex-col gap-3 pt-4">
                    <Button onClick={handleGoToDashboard} className="w-full text-lg h-12 shadow-lg hover:shadow-xl transition-all">
                        Track Application Status
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full text-muted-foreground">
                        Stay on this page
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
