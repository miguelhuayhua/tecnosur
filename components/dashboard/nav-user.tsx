"use client"

import {
    BadgeCheck,
    Bell,
    ChevronsUpDown,
    CreditCard,
    LayoutGrid,
    LogOut,
    Search,
    Sparkles,
    User,
} from "lucide-react"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { signOut, useSession } from "next-auth/react"
import Link from "next/link"

export function NavUser() {
    const { isMobile } = useSidebar()
    const { data: token, status } = useSession();
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground ml-1"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={token?.user.image!} alt={"icono"} />
                                <AvatarFallback className="rounded-lg">{token?.user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{token?.user.name}</span>
                                <span className="truncate text-xs">{token?.user.email}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">
                                    {status === "authenticated" ? token?.user?.name : "Invitado"}
                                </p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {status === "authenticated" ? token?.user?.email : "No autenticado"}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem className="hover:cursor-pointer" asChild>
                                <Link href="/cursos" className="flex items-center">
                                    <Search className="w-4 h-4 mr-3 text-muted-foreground" />
                                    Volver a buscar cursos
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="hover:cursor-pointer" asChild>
                                <Link href="/dashboard/panel" className="flex items-center">
                                    <LayoutGrid className="w-4 h-4 mr-3 text-muted-foreground" />
                                    Dashboard
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="hover:cursor-pointer" asChild>
                                <Link href="/dashboard/cuenta" className="flex items-center">
                                    <User className="w-4 h-4 mr-3 text-muted-foreground" />
                                    Cuenta
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="hover:cursor-pointer" onClick={() => { signOut() }}>
                            <LogOut className="w-4 h-4 mr-3 text-muted-foreground" />
                            Cerrar sesión
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
