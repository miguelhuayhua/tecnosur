"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Dot } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DropdownMenuArrow } from "@radix-ui/react-dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

interface CollapseMenuButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  submenus: {
    href: string;
    label: string;
    active?: boolean;
  }[];
  isOpen: boolean | undefined;
  isItemActive: (href: string, active?: boolean, isParent?: boolean) => boolean;
}

export function CollapseMenuButton({
  icon: Icon,
  label,
  active,
  submenus,
  isOpen,
  isItemActive
}: CollapseMenuButtonProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // Determinar si algún submenú está activo
  const hasActiveSubmenu = submenus.some(({ href, active: subActive }) =>
    isItemActive(href, subActive, false)
  );

  // Auto-abrir el menú si alguna sub-ruta está activa
  useEffect(() => {
    setIsCollapsed(hasActiveSubmenu);
  }, [pathname, hasActiveSubmenu]);

  // Si el sidebar está abierto, mostrar collapsible
  if (isOpen) {
    return (
      <Collapsible
        open={isCollapsed}
        onOpenChange={setIsCollapsed}
        className="w-full"
      >
        <CollapsibleTrigger
          className="[&[data-state=open]>div>div>svg]:rotate-180 mb-1"
          asChild
        >
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start h-10 mb-1 transition-colors",
              hasActiveSubmenu
                ? "bg-primary/10 border-r-2 border-primary"
                : "hover:bg-accent/50 text-muted-foreground"
            )}
          >
            <div className="w-full items-center flex justify-between">
              <div className="flex items-center">
                <span className="mr-4">
                  <Icon />
                </span>
                <p
                  className={cn(
                    "max-w-[150px] truncate transition-opacity duration-200",
                    !isOpen ? "opacity-0" : "opacity-100"
                  )}
                >
                  {label}
                </p>
              </div>
              <div
                className={cn(
                  "transition-all duration-200",
                  !isOpen ? "opacity-0 scale-0" : "opacity-100 scale-100"
                )}
              >
                <ChevronDown
                  size={18}
                  className="transition-transform duration-200"
                />
              </div>
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
          {submenus.map(({ href, label: subLabel, active: subActive }, index) => {
            const isActiveSubmenu = isItemActive(href, subActive, false);

            return (
              <Button
                key={index}
                variant="ghost"
                className={cn(
                  "w-full justify-start h-9 mb-1 transition-colors pl-8",
                  isActiveSubmenu
                    ? "bg-primary/10 border-r-2 border-primary"
                    : "hover:bg-accent/50 text-muted-foreground"
                )}
                asChild
              >
                <Link href={href}>
                  <span className="mr-3">
                    <Dot
                      size={20}
                      className={cn(
                        isActiveSubmenu ? "text-primary" : "text-muted-foreground/60"
                      )}
                    />
                  </span>
                  <p
                    className={cn(
                      "max-w-[170px] truncate text-sm",
                      isActiveSubmenu ? "font-medium" : ""
                    )}
                  >
                    {subLabel}
                  </p>
                </Link>
              </Button>
            );
          })}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  // Si el sidebar está colapsado, mostrar dropdown
  return (
    <DropdownMenu>
      <TooltipProvider disableHoverableContent>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-center h-10 mb-1 transition-colors",
                  hasActiveSubmenu
                    ? "bg-primary/10"
                    : "hover:bg-accent/50 text-muted-foreground"
                )}
              >
                <Icon />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={10}>
            {label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenuContent
        side="right"
        sideOffset={25}
        align="start"
        className="w-56"
      >
        <DropdownMenuLabel className="max-w-[190px] truncate">
          {label}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {submenus.map(({ href, label: subLabel, active: subActive }, index) => {
          const isActiveSubmenu = isItemActive(href, subActive, false);

          return (
            <DropdownMenuItem
              key={index}
              asChild
              className={cn(
                "cursor-pointer transition-colors",
                isActiveSubmenu && "bg-primary/10"
              )}
            >
              <Link href={href} className="flex items-center w-full">
                <Dot
                  size={16}
                  className={cn(
                    "mr-2",
                    isActiveSubmenu ? "" : "text-muted-foreground/60"
                  )}
                />
                <p className={cn(
                  "max-w-[180px] truncate text-sm",
                  isActiveSubmenu ? "font-medium" : ""
                )}>
                  {subLabel}
                </p>
              </Link>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuArrow className="fill-border" />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}