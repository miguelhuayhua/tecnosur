import AdminPanelLayout from "@/components/dashboard/admin-panel-layout";

// app/dashboard/layout.tsx
export const dynamic = 'force-dynamic'
export const revalidate = 0
import { NuqProvider } from "./nuq-provider";
import { ModalProvider } from "@/providers/modal-provider";


export default function DashboardLayout({
  children, modal
}: {
  children: React.ReactNode;
  modal: React.ReactNode;

}) {

  return (
    <ModalProvider>
      <NuqProvider>
        <AdminPanelLayout>
          {children}
          {modal}
        </AdminPanelLayout>
      </NuqProvider>
    </ModalProvider>
  )
}
