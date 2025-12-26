import AdminPanelLayout from "@/components/dashboard/admin-panel-layout";

export default function DemoLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (

    <AdminPanelLayout>{children}</AdminPanelLayout>
  )
}
