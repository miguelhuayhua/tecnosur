import {
  Tag,
  Users,
  Settings,
  Bookmark,
  SquarePen,
  LayoutGrid,
  LucideIcon,
  Calendar,
  FileSpreadsheet,
  SquareChartGantt
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
        
      ]
    },
    {
      groupLabel: "Sobre los cursos",
      menus: [
       
         {
          href: "/dashboard/cursos",
          label: "Mis cursos",
          icon: SquareChartGantt
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
          href: "/dashboard/configuracion/perfil",
          label: "Mi cuenta",
          icon: Users
        }
      ]
    }
  ];
}
