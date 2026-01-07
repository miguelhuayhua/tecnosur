"use client"
import Link from "next/link";
import { MenuIcon, PanelsTopLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Menu } from "@/components/dashboard/menu";
import {
  Sheet,
  SheetHeader,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetClose
} from "@/components/ui/sheet";
import { useStore } from "@/hooks/use-store";
import { useSidebar } from "@/hooks/use-sidebar";
import Image from "next/image";
export function SheetMenu() {
  const sidebar = useStore(useSidebar, (x) => x);

  if (!sidebar) return null;
  const { isOpen, toggleOpen, getOpenState, setIsHover, settings } = sidebar;
  return (
    <Sheet  >
      <SheetTrigger className="lg:hidden" asChild>
        <Button className="h-8" variant="outline" size="icon">
          <MenuIcon size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent className="[&_.close]:hidden bg-gradient-to-b from-primary to-secondary shadow-secondary/20 border-none sm:w-72 px-3 h-full flex flex-col" side="left">
        <SheetHeader>
          <Link href="/dashboard" className="flex mx-auto justify-center h-10 mt-4 items-center gap-2">
            {isOpen ? (
              <Image alt='logo' className='w-30' src='/dark_logo.png' width={80} height={80} />
            ) :
              (
                <Image alt='logo' className='w-6' src='/dark_icon.png' width={80} height={80} />
              )

            }

          </Link>
        </SheetHeader>
        <Menu isOpen={getOpenState()} />
      </SheetContent>
    </Sheet>
  );
}
