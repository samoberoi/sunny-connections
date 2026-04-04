import { ReactNode } from 'react';
import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, Users, UserCheck, GraduationCap, Settings, Tag, BarChart3 } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/bookings', icon: CalendarDays, label: 'Bookings' },
  { to: '/admin/customers', icon: Users, label: 'Customers' },
  { to: '/admin/cleaners', icon: UserCheck, label: 'Cleaners' },
  { to: '/admin/enrolments', icon: GraduationCap, label: 'Enrolments' },
  { to: '/admin/training', icon: GraduationCap, label: 'Training' },
  { to: '/admin/services', icon: Settings, label: 'Services' },
  { to: '/admin/coupons', icon: Tag, label: 'Coupons' },
  { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
];

function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="p-4 pb-2">
          <h2 className={`font-bold text-sidebar-foreground ${collapsed ? 'text-xs' : 'text-lg'}`}>
            {collapsed ? 'CF' : 'Cleanfit'}
          </h2>
          {!collapsed && <p className="text-xs text-sidebar-foreground/50 mt-0.5">Super Admin</p>}
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const active = location.pathname === item.to;
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild>
                      <RouterNavLink to={item.to} end className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 ${active ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold' : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'}`}>
                        <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                        {!collapsed && <span className="text-sm">{item.label}</span>}
                      </RouterNavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b border-border px-4 bg-card/80 backdrop-blur-xl">
            <SidebarTrigger className="mr-4" />
            <span className="font-bold text-foreground">Admin Panel</span>
          </header>
          <main className="flex-1 p-6 overflow-auto bg-muted/30">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
