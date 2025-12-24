import {
  Tag,
  Users,
  Settings,
  Bookmark,
  SquarePen,
  LayoutGrid,
  LucideIcon,
  Calendar,
  FileSpreadsheet
} from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active?: boolean;
};

type Menu = {
  href: string;
  label: string;
  active?: boolean;
  icon: LucideIcon;
  submenus?: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/dashboard",
          label: "Dashboard",
          icon: LayoutGrid,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "Sobre los cursos",
      menus: [
       
         {
          href: "/dashboard/cursos",
          label: "Mis cursos",
          icon: SquarePen
        },
        {
          href: "/dashboard/calendario",
          label: "Calendario",
          icon: Calendar
        },
      
        {
          href: "/dashboard/examenes",
          label: "Exámenes",
          icon: FileSpreadsheet
        }
      ]
    },
    {
      groupLabel: "Configuración",
      menus: [
        {
          href: "/dashboard/cuenta",
          label: "Mi cuenta",
          icon: Users
        }
      ]
    }
  ];
}
