import { ModeToggle } from "@/components/ui/mode-toggle";
import { UserNav } from "@/components/dashboard/user-nav";
import { SheetMenu } from "@/components/dashboard/sheet-menu";
import { SidebarTrigger } from "../ui/sidebar";

interface NavbarProps {
  title: string;
}

export function Navbar({ title }: NavbarProps) {
  return (
    <header className="sticky top-0 z-10 w-full bg-background/80 backdrop-blur ">

      <div className="px-4 flex h-14 items-center">

        <div className="flex items-center space-x-4 lg:space-x-0">
          <SidebarTrigger className="-ml-1" />
          <h1 className="font-bold ml-3">{title}</h1>
        </div>
        <div className="flex flex-1 items-center justify-end">
          <ModeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
