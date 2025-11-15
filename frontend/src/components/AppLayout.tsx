import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Home, MessageSquare, ScanText, Route, BookMarked, Settings, LogOut, User, FlaskConical } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navItems = [
    { icon: Home, label: "Home", path: "/app" },
    { icon: MessageSquare, label: "Chat Assistant", path: "/app/chat" },
    { icon: ScanText, label: "OCR & Forms", path: "/app/ocr" },
    { icon: Route, label: "Workflows", path: "/app/workflows" },
    { icon: FlaskConical, label: "Study Lab", path: "/app/study-lab" },
    { icon: BookMarked, label: "Knowledge Base", path: "/app/kb" },
    { icon: Settings, label: "Settings", path: "/app/settings" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Header */}
      <header className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        isScrolled 
          ? "bg-card/80 backdrop-blur-md border-b/50" 
          : "bg-card/50 backdrop-blur-sm"
      }`}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">Scholarly</span>
          </Link>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                  <AvatarFallback className="bg-primary text-primary-foreground font-minecraft text-xs">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/app/settings")}>
                  <User className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-card hidden lg:block">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  asChild
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive && "bg-primary/10 text-primary hover:bg-primary/20"
                  )}
                >
                  <Link to={item.path}>
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden border-t bg-card">
        <div className="flex justify-around p-2">
          {navItems
            .filter((item) => item.path !== "/app/settings")
            .map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.path}
                asChild
                variant="ghost"
                size="sm"
                className={cn(
                  "flex-col h-auto py-2 px-3",
                  isActive && "text-primary"
                )}
              >
                <Link to={item.path}>
                  <item.icon className="h-5 w-5 mb-1" />
                  <span className="text-xs">{item.label.split(" ")[0]}</span>
                </Link>
              </Button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
