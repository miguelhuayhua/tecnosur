import AdminPanelLayout from "@/components/dashboard/admin-panel-layout";

// app/dashboard/layout.tsx
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function DashboardLayout({
  children, modal
}: {
  children: React.ReactNode;
  modal: React.ReactNode;

}) {
  return <AdminPanelLayout>{children}

    {modal}
  </AdminPanelLayout>;
}
