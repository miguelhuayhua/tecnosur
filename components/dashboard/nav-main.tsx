"use client"

import { Calendar, FileSpreadsheet, LayoutGrid, SquareChartGantt, Users, type LucideIcon } from "lucide-react"

import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

export function NavMain() {
    const items = [
        {
            href: "/dashboard/panel",
            label: "Dashboard",
            icon: LayoutGrid,
            submenus: []
        },

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
    const pathname = usePathname();
    return (
        <SidebarGroup>
            <SidebarGroupLabel>Plataforma</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuButton className={cn(pathname.includes(item.href) && ("border-r-3 border-r-primary bg-primary/5 dark:bg-primary/40 shadow"))} key={item.href} asChild tooltip={item.label}>
                        <Link href={item.href}>
                            {item.icon && <item.icon />}
                            <span>{item.label}</span>
                        </Link>
                    </SidebarMenuButton>
                ))}
                <SidebarGroupLabel>Configuración</SidebarGroupLabel>
                <SidebarMenuButton className={cn(pathname.includes("configuracion") && ("border-r-3 border-r-primary bg-primary/5 dark:bg-primary/40 shadow"))} asChild tooltip={"Configuración"}>
                    <Link href={"/dashboard/configuracion/perfil"}>
                        <Users />
                        <span>Configuración</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenu>
        </SidebarGroup>
    )
}
