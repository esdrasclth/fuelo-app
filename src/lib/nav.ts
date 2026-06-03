import {
  LayoutDashboard,
  Fuel,
  Car,
  MapPin,
  Route,
  BarChart3,
  Bell,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/fuel", label: "Cargas", icon: Fuel },
  { href: "/trips", label: "Trayectos", icon: Route },
  { href: "/stats", label: "Estadísticas", icon: BarChart3 },
  { href: "/vehicles", label: "Vehículos", icon: Car },
  { href: "/stations", label: "Gasolineras", icon: MapPin },
  { href: "/reminders", label: "Recordatorios", icon: Bell },
  { href: "/household", label: "Hogar", icon: Users },
  { href: "/settings", label: "Ajustes", icon: Settings },
];

// Primary items shown in the mobile bottom bar (rest live under the "Menú" sheet)
export const primaryNavHrefs = ["/dashboard", "/fuel", "/trips", "/stats"];
