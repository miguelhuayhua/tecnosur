import AdminPanelLayout from "@/components/dashboard/admin-panel-layout";
import { ThemeProvider } from "next-themes";

export default function DemoLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (

    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange >
      <AdminPanelLayout>{children}</AdminPanelLayout>
    </ThemeProvider>
  )
}
