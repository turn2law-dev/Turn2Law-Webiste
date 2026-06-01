"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useActivePath } from "./use-active-path";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell, Settings, LogOut, User, Gavel, BarChart3,
  CheckCircle, AlertCircle, Info, BellOff, MessageCircle, Menu,
  FileText, Building2,
} from "lucide-react";
import { useMessages } from "@/lib/messages-context";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const Logo = () => (
  <div className="flex items-center gap-2">
    <svg width="22" height="28" viewBox="0 0 23 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M17.2048 0L11.4096 6.19541L13.4028 8.16545L15.8223 5.57886V20.2762L2.51237 6.72721C1.58129 5.77941 0 6.45738 0 7.80434V30H2.76506V10.9846L16.075 24.5337C17.006 25.4814 18.5874 24.8036 18.5874 23.4565V5.57886L21.0069 8.16545L23 6.19541L17.2048 0Z"
        fill="currentColor"
      />
    </svg>
    <span className="font-semibold text-base tracking-tight text-foreground">Turn2Law</span>
  </div>
);

const HeaderUserDropdown = ({ user, onLogout }: { user: any; onLogout: () => void }) => {
  const dashboardLink = user.userType === "lawyer" ? "/dashboard/lawyer" : "/dashboard/client";
  const userTitle = user.userType === "lawyer" ? `Advocate ${user.fullName}` : user.fullName;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-primary/20 hover:ring-primary/40">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm">
              {user.fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center gap-2 p-2">
          <div className="flex flex-col space-y-1">
            <p className="font-medium text-sm">{userTitle}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={dashboardLink} className="flex items-center cursor-pointer">
            {user.userType === "lawyer" ? <Gavel className="mr-2 h-4 w-4" /> : <User className="mr-2 h-4 w-4" />}
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer text-red-500 focus:text-red-500" onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const ChatMessagesIcon = ({ user }: { user: any }) => {
  const { getTotalUnread } = useMessages();
  const totalUnread = getTotalUnread();
  return (
    <Link href="/messages">
      <Button variant="ghost" size="sm" className="relative h-9 w-9 p-0">
        <MessageCircle className="h-4 w-4" />
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
            {totalUnread > 99 ? "99+" : totalUnread}
          </span>
        )}
      </Button>
    </Link>
  );
};

interface HeaderProps {
  hideAuthButtons?: boolean;
  leftElement?: React.ReactNode;
}

const Header = ({ hideAuthButtons, leftElement }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pathname = useActivePath();

  useEffect(() => { checkAuthSession(); }, []);

  const checkAuthSession = async () => {
    try {
      const { getSession, getUserProfile } = await import('@/lib/supabase-auth');
      const session = await getSession();
      if (session?.user) {
        const profile = await getUserProfile(session.user.id);
        if (profile) {
          setUser({ id: profile.id, email: profile.email, fullName: profile.full_name, userType: profile.user_type });
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    if (!mobileMenuOpen) { document.body.style.overflow = 'unset'; return; }
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = 'unset'; };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    try {
      const { signOut } = await import('@/lib/supabase-auth');
      await signOut();
    } catch {}
    setUser(null);
    window.location.href = "/";
  };

  const navLinks = [
    { href: "/services", label: "Services" },
    { href: "/lawgpt", label: "LawGPT" },
    { href: "/legal-navigator", label: "Legal Navigator" },
    { href: "/documents", label: "Documents" },
    { href: "/consult", label: "Consult" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-center pt-4 px-4">
      {/* Floating pill header */}
      <div className="w-full max-w-5xl flex items-center justify-between bg-white/95 backdrop-blur-md border border-black/[0.06] rounded-full px-5 py-2.5 shadow-[0_2px_20px_rgba(0,0,0,0.08)]">

        {/* Logo */}
        <Link href="/" aria-label="Home" className="flex-shrink-0">
          <Logo />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-foreground/70">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "hover:text-foreground transition-colors",
                (pathname === href || (href !== "/" && pathname.startsWith(href))) && "text-foreground font-semibold"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          {!hideAuthButtons && !user && (
            <>
              <Link href="/login" className="text-sm font-medium text-foreground/70 hover:text-foreground px-3 py-1.5 transition-colors">
                Login
              </Link>
              <Link href="/signup">
                <Button size="sm" className="rounded-full bg-[#C8922A] hover:bg-[#b5801f] text-white font-semibold px-6 h-9 text-sm shadow-[0_4px_14px_rgba(200,146,42,0.4)] hover:shadow-[0_6px_20px_rgba(200,146,42,0.55)] hover:scale-105 active:scale-95 transition-all duration-200">
                  Signup
                </Button>
              </Link>
            </>
          )}
          {!hideAuthButtons && user && (
            <>
              {user.userType === "client" && <ChatMessagesIcon user={user} />}
              <HeaderUserDropdown user={user} onLogout={handleLogout} />
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden h-9 w-9 p-0"
          onClick={() => setMobileMenuOpen(s => !s)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute top-20 inset-x-4 bg-white rounded-2xl border border-border/60 shadow-xl p-5 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-1">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "py-2.5 px-3 rounded-xl text-sm font-medium text-foreground/70 hover:bg-muted hover:text-foreground transition-colors",
                    (pathname === href || (href !== "/" && pathname.startsWith(href))) && "bg-muted text-foreground"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 pt-4 border-t border-border/40 flex flex-col gap-2">
              {!user ? (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full rounded-full">Sign in</Button>
                  </Link>
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">Get started</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href={user.userType === "lawyer" ? "/dashboard/lawyer" : "/dashboard/client"} className="py-2.5 px-3 rounded-xl text-sm font-medium hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>
                    Dashboard
                  </Link>
                  <Button variant="destructive" className="w-full rounded-full" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
                    <LogOut className="w-4 h-4 mr-2" />Logout
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
