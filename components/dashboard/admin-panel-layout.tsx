"use client";
import { useSidebar } from "@/hooks/use-sidebar";
import { useStore } from "@/hooks/use-store";
import { SidebarInset } from "../ui/sidebar";
import { AppSidebar } from "./app-sidebar";

export default function AdminPanelLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const sidebar = useStore(useSidebar, (x) => x);
  if (!sidebar) return null;
  return (
    <>
      <AppSidebar />
      <SidebarInset className="h-[calc(100dvh-1em)] overflow-hidden overflow-y-auto" >
        {children}
      </SidebarInset>
    </>
  );
}
