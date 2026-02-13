import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Home, Send, History, Shield, Settings, LogOut, CreditCard } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation, useNavigate } from "react-router-dom";

export function AppSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { title: "Dashboard", icon: Home, url: "/dashboard" },
    { title: "Transfer", icon: Send, url: "/transfer" },
    { title: "History", icon: History, url: "/logs" },
    { title: "Settings", icon: Settings, url: "/settings" },
  ];

  if (user?.isAdmin) {
    menuItems.push({ title: "Admin Panel", icon: Shield, url: "/admin" });
  }

  return (
    <Sidebar>
      <SidebarHeader className="p-6 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-primary-glow">
            <CreditCard className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl tracking-wider">
            MY<span className="text-primary">BANK</span>
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs uppercase tracking-widest font-semibold opacity-50">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent className="p-2">
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    className="transition-all duration-200"
                  >
                    <Link to={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent className="p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => { logout(); navigate("/"); }}
                  className="text-destructive hover:text-destructive transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
