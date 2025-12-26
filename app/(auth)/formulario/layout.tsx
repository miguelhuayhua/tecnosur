import { ModalProvider } from "@/providers/modal-provider";

// dashboard/formulario/layout.tsx
export default function FormularioLayout({
    children
}: {
    children: React.ReactNode;
}) {
    return (
        <ModalProvider>
            {children}
        </ModalProvider>
    )
}