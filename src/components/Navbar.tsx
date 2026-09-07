import { Button } from "@/components/ui/button";
import { Sparkles, Menu, X, LogOut, User as UserIcon, CreditCard, Settings } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NavItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface NavbarProps {
  navItems?: NavItem[];
  showAuth?: boolean;
}

const Navbar = ({ navItems, showAuth = true }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();
  const isHome = location.pathname === "/";

  const defaultNavItems: NavItem[] = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Billing", href: "/billing" },
  ];

  const items = navItems || defaultNavItems;

  const handleSignOut = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img 
              src="/laali-logo.png" 
              alt="LAALI" 
              className="w-8 h-8 group-hover:scale-110 transition-transform duration-300"
            />
            <span className="text-2xl font-bold bg-gradient-gold bg-clip-text text-transparent">
              LAALI AI
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {items.map((item, index) => (
              item.href ? (
                <Link 
                  key={index}
                  to={item.href} 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <button 
                  key={index}
                  onClick={item.onClick} 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </button>
              )
            ))}
            
            {showAuth && (
              user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                      <Avatar className="w-8 h-8 border border-primary/20">
                        {profile?.avatar_url && (
                          <AvatarImage src={profile.avatar_url} alt={profile.full_name || "User"} />
                        )}
                        <AvatarFallback className="bg-gradient-premium text-white text-sm">
                          {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">
                        {profile?.full_name || user.email?.split("@")[0] || "User"}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                      <UserIcon className="w-4 h-4 mr-2" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/billing")}>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Billing
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/settings")}>
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/auth">
                  <Button variant="hero" size="sm">
                    Sign In
                  </Button>
                </Link>
              )
            )}
          </nav>

          {/* Mobile menu button */}
          <button 
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-lg border-b border-border md:hidden">
            <div className="flex flex-col gap-4 p-6">
              {items.map((item, index) => (
                item.href ? (
                  <Link 
                    key={index}
                    to={item.href} 
                    onClick={() => setIsOpen(false)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button 
                    key={index}
                    onClick={() => { item.onClick?.(); setIsOpen(false); }} 
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                  >
                    {item.label}
                  </button>
                )
              ))}
              
              {showAuth && (
                user ? (
                  <>
                    <div className="flex items-center gap-3 p-3 bg-card/50 rounded-lg border border-border/50">
                      <Avatar className="w-10 h-10 border border-primary/20">
                        {profile?.avatar_url && (
                          <AvatarImage src={profile.avatar_url} alt={profile.full_name || "User"} />
                        )}
                        <AvatarFallback className="bg-gradient-premium text-white">
                          {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {profile?.full_name || user.email?.split("@")[0] || "User"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full">
                        <UserIcon className="w-4 h-4 mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                    <Link to="/billing" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Billing
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => { handleSignOut(); setIsOpen(false); }}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Link to="/auth" onClick={() => setIsOpen(false)}>
                    <Button variant="hero" size="sm" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
