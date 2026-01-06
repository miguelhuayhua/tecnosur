"use client";
import { Menu } from "@/components/dashboard/menu";
import { SidebarToggle } from "@/components/dashboard/sidebar-toggle";
import { useSidebar } from "@/hooks/use-sidebar";
import { useStore } from "@/hooks/use-store";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { ScrollArea } from "../ui/scroll-area";

export function Sidebar() {
  const sidebar = useStore(useSidebar, (x) => x);
  const { resolvedTheme } = useTheme();

  if (!sidebar) return null;
  const { isOpen, toggleOpen, getOpenState, setIsHover, settings } = sidebar;
  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-20 h-screen bg-gradient-to-b from-primary to-secondary -translate-x-full  lg:translate-x-0 transition-[width] ease-in-out duration-300",
        !getOpenState() ? "w-[90px]" : "w-72",
        settings.disabled && "hidden"
      )}
    >
      <SidebarToggle isOpen={isOpen} setIsOpen={toggleOpen} />
      <ScrollArea
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        className="relative h-full flex flex-col px-3  shadow-md dark:shadow-zinc-800"
      >

        <Link href="/dashboard" className="flex mx-auto justify-center h-10 mt-4 items-center gap-2">
          {isOpen ? (
            <Image alt='logo' className='w-30' src='/dark_logo.png' width={80} height={80} />
          ) :
            (
              <Image alt='logo' className='w-6' src='/dark_icon.png' width={80} height={80} />
            )

          }

        </Link>
        <Menu isOpen={getOpenState()} />
      </ScrollArea>
    </aside>
  );
}