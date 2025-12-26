import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import Formulario from "./client";

async function getInformacion(correo: string) {
    const estudiante = await prisma.estudiantes.findFirst({
        where: {
            usuario: { correo }
        },
        include: {
            usuario: { select: { correo: true, usuario: true } }
        }
    });

    return estudiante;
}

export default async function TodosLosExamenesPage() {
    const session = await getServerSession();

    if (!session) {
        return notFound();
    }

    const estudiante = await getInformacion(session.user.email!)
    if (!estudiante) return notFound();

    return (
        <Formulario estudiante={estudiante as any} />
    );
}