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
      <SidebarContent className="bg-foreground">
        <div className="p-4 pb-2">
          <h2 className={`font-display font-black text-background ${collapsed ? 'text-xs' : 'text-lg'}`}>
            {collapsed ? 'CF' : 'Clean Fit'}
          </h2>
          {!collapsed && <p className="text-xs text-primary mt-0.5 font-bold">Super Admin</p>}
        </div>
        <SidebarGroup>
          <SidebarGroupLabel className="text-background/20 text-[10px] uppercase tracking-[0.2em] font-bold">Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const active = location.pathname === item.to;
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild>
                      <RouterNavLink to={item.to} end className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${active ? 'bg-primary text-primary-foreground font-bold' : 'text-background/40 hover:bg-background/5 hover:text-background/70'}`}>
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
          <header className="h-14 flex items-center border-b border-border px-4 bg-card">
            <SidebarTrigger className="mr-4" />
            <span className="font-display font-bold text-foreground text-sm">Admin Panel</span>
          </header>
          <main className="flex-1 p-6 overflow-auto bg-background">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
