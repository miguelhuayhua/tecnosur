"use client"

import * as React from "react"
import {
    AudioWaveform,
    BookOpen,
    Bot,
    Calendar,
    Command,
    Facebook,
    FileSpreadsheet,
    Frame,
    GalleryVerticalEnd,
    Instagram,
    LayoutGrid,
    Linkedin,
    Map,
    PieChart,
    Settings2,
    SquareChartGantt,
    SquareTerminal,
    Users,
} from "lucide-react"
import Image from "next/image"
import { NavMain } from "@/components/dashboard/nav-main"
import { NavUser } from "@/components/dashboard/nav-user"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
    useSidebar,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Button } from "../ui/button"
import { cn } from "@/lib/utils"

// URLs de redes sociales (reemplaza con tus URLs reales)
const socialLinks = {
    facebook: "https://facebook.com/tu-pagina",
    instagram: "https://instagram.com/tu-pagina",
    tiktok: "https://tiktok.com/@tu-pagina",
    linkedin: "https://linkedin.com/company/tu-pagina"
};
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { open } = useSidebar();
    const { resolvedTheme } = useTheme();
    return (
        <Sidebar variant="inset" collapsible="icon" {...props}>
            <SidebarHeader>
                <Link href="/dashboard/panel" className="flex mx-auto justify-center h-10 mt-4 items-center gap-2">
                    {open ? (
                        resolvedTheme == "light" ? <Image alt='logo' className='w-40' src='/light_gradient.png' width={190} height={190} /> :
                            <Image alt='logo' className='w-42 h-30' src='/dark_gradient.png' width={190} height={190} />
                    ) :
                        (
                            <Image alt='logo' className='w-10 shrink-0' src='/x_gradient.png' width={80} height={80} />
                        )

                    }

                </Link>
            </SidebarHeader>
            <SidebarContent>
                <NavMain />
            </SidebarContent>
            <SidebarFooter>

                <>
                    <div className={cn(
                        "flex justify-center gap-2",
                        !open ? "flex-col items-center" : "flex-row"
                    )}>
                        <Button
                            size="icon-sm"
                            asChild
                            variant={'outline'}
                        >
                            <Link href={socialLinks.facebook} target="_blank" rel="noopener noreferrer">
                                <Facebook />
                            </Link>
                        </Button>

                        <Button
                            size="icon-sm"
                            asChild
                            variant={'outline'}

                        >
                            <Link href={socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                                <Instagram />
                            </Link>
                        </Button>



                        <Button
                            size="icon-sm"
                            asChild
                            variant={'outline'}

                        >
                            <Link href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                                <Linkedin />
                            </Link>
                        </Button>
                    </div>

                    {/* Texto descriptivo cuando el sidebar está abierto */}
                    {open && (
                        <p className="text-xs text-muted-foreground text-center">
                            Síguenos en nuestras redes sociales
                        </p>
                    )}
                </>
                <NavUser />

            </SidebarFooter >
            <SidebarRail />
        </Sidebar >
    )
}
