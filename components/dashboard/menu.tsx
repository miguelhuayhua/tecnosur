"use client";

import Link from "next/link";
import { Ellipsis, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { Facebook, Instagram, Linkedin, } from "lucide-react";
import { cn } from "@/lib/utils";
import { getMenuList } from "@/lib/menu-list";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CollapseMenuButton } from "@/components/dashboard/collapse-menu-button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider
} from "@/components/ui/tooltip";
import { signOut } from "next-auth/react";

interface MenuProps {
  isOpen: boolean | undefined;
}

// URLs de redes sociales (reemplaza con tus URLs reales)
const socialLinks = {
  facebook: "https://facebook.com/tu-pagina",
  instagram: "https://instagram.com/tu-pagina",
  tiktok: "https://tiktok.com/@tu-pagina",
  linkedin: "https://linkedin.com/company/tu-pagina"
};
export function Menu({ isOpen }: MenuProps) {
  const pathname = usePathname();
  const menuList = getMenuList(pathname);

  // Función específica para determinar si un item está activo
  const isItemActive = (href: string, active?: boolean, isParent?: boolean) => {
    if (active !== undefined) return active;

    // Si el href está vacío (caso de menús padre sin ruta propia), nunca activar directamente
    if (!href || href === "") return false;

    // Normalizar las rutas (remover trailing slashes)
    const normalizedPathname = pathname.endsWith('/') && pathname !== '/'
      ? pathname.slice(0, -1)
      : pathname;
    const normalizedHref = href.endsWith('/') && href !== '/'
      ? href.slice(0, -1)
      : href;

    // Si es la ruta exacta, siempre activar
    if (normalizedPathname === normalizedHref) return true;

    // IMPORTANTE: Si no es ruta exacta y es Dashboard, NO activar
    // Dashboard solo debe estar activo en /dashboard exactamente
    if (normalizedHref === "/dashboard") {
      return false;
    }

    // Para menús padre con submenús: NO activar automáticamente
    if (isParent) {
      return false;
    }

    // Para menús sin submenús (items individuales como "Certificados")
    // Se activa si pathname comienza con href + '/'
    // Por ejemplo: href="/dashboard/certificados" activa para "/dashboard/certificados/abc123"
    return normalizedPathname.startsWith(normalizedHref + '/');
  };

  return (
    <ScrollArea className="[&>div>div[style]]:!block h-fit">
      <nav className=" w-full">
        <ul className="flex flex-col min-h-screen lg:min-h-[calc(100vh-32px-40px-32px)] items-start space-y-1 ">
          {menuList.map(({ groupLabel, menus }, index) => (
            <li className={cn("w-full", groupLabel ? "pt-5" : "")} key={index}>
              {/* Grupo de menú */}
              {(isOpen && groupLabel) ? (
                <p className="text-sm font-medium  px-4 mb-4 pb-2 max-w-[248px] truncate border-b border-border/50">
                  {groupLabel}
                </p>
              ) : (!isOpen && groupLabel) ? (
                null
              ) : (
                <div className="py-2" />
              )}

              {/* Items del menú */}
              {menus.map(
                ({ href, label, icon: Icon, active, submenus }, index) => {
                  // Para items con submenús, considerarlos como "padre"
                  const isParent = submenus && submenus.length > 0;
                  const isActive = isItemActive(href, active, isParent);

                  return !submenus || submenus.length === 0 ? (
                    <div className="w-full" key={index}>
                      <TooltipProvider disableHoverableContent>
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger asChild>
                            <Button
                              variant={isActive ? "ghost" : "ghost"}
                              className={cn(
                                "w-full justify-start  h-10 mb-1 transition-colors",
                                isActive
                                  ? "bg-primary/5 border-r-2 border-r-primary "
                                  : "hover:bg-accent/50 text-muted-foreground"
                              )}
                              asChild
                            >
                              <Link href={href}>
                                <span className={cn(!isOpen ? "pl-2" : "mr-4")}>
                                  <Icon size={18} />
                                </span>
                                <p
                                  className={cn(
                                    "max-w-[200px] truncate transition-all duration-200",
                                    !isOpen
                                      ? "opacity-0 w-0"
                                      : "opacity-100 w-auto"
                                  )}
                                >
                                  {label}
                                </p>
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          {!isOpen && (
                            <TooltipContent side="right" sideOffset={10}>
                              {label}
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  ) : (
                    <div className="w-full" key={index}>
                      <CollapseMenuButton
                        icon={Icon}
                        label={label}
                        active={isActive}
                        submenus={submenus}
                        isOpen={isOpen}
                        isItemActive={isItemActive}
                      />
                    </div>
                  );
                }
              )}
            </li>
          ))}


          {/* Botón de cerrar sesión */}
          <li className="w-full grow flex mb-4 items-end mt-auto">
            <TooltipProvider disableHoverableContent>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => signOut()}
                    variant="outline"
                    className={cn(
                      "w-full h-10 mt-5 transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/50",
                      !isOpen ? "justify-center" : "justify-start"
                    )}
                  >
                    <span className={cn(!isOpen ? "pl-2" : "mr-4")}>
                      <LogOut size={18} />
                    </span>
                    <p
                      className={cn(
                        "whitespace-nowrap transition-all duration-200",
                        !isOpen ? "opacity-0 w-0" : "opacity-100 w-auto"
                      )}
                    >
                      Cerrar sesión
                    </p>
                  </Button>
                </TooltipTrigger>
                {!isOpen && (
                  <TooltipContent side="right" sideOffset={10}>
                    Cerrar sesión
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>

          </li>
          {/* Redes Sociales */}
          <div className="mt-auto w-full  space-y-4">
            {/* Botones de redes sociales */}
            <div className={cn(
              "flex justify-center gap-2",
              !isOpen ? "flex-col items-center" : "flex-row"
            )}>
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="h-8 w-8 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <Link href={socialLinks.facebook} target="_blank" rel="noopener noreferrer">
                  <Facebook className="h-4 w-4" />
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                asChild
                className="h-8 w-8 hover:bg-pink-100 dark:hover:bg-pink-900 hover:text-pink-600 dark:hover:text-pink-400"
              >
                <Link href={socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                  <Instagram className="h-4 w-4" />
                </Link>
              </Button>



              <Button
                variant="ghost"
                size="icon"
                asChild
                className="h-8 w-8 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <Link href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Texto descriptivo cuando el sidebar está abierto */}
            {isOpen && (
              <p className="text-xs text-center text-muted-foreground px-2">
                Síguenos en nuestras redes sociales
              </p>
            )}
          </div>
        </ul>
      </nav>

    </ScrollArea>
  );
}