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
async function getEdicion(id: string) {
    const edicion = await prisma.edicionesCursos.findFirst({
        where: {
            id
        },
        select: {
            codigo: true,
            curso: {
                select: {
                    titulo: true
                }
            }
        }
    });

    return edicion;
}
interface Props {
    searchParams: Promise<{ callbackUrl?: string, edicionId?: string }>
}
export default async function FormularioPage({ searchParams }: Props) {
    const sParams = await searchParams;
    const session = await getServerSession();

    if (!session) {
        return notFound();
    }

    const estudiante = await getInformacion(session.user.email!)
    if (!estudiante || !estudiante.usuario) return notFound();
    const edicionData = sParams.edicionId ? await getEdicion(sParams.edicionId) : undefined;
    const edicion = edicionData ?? undefined;
    return (
        <Formulario estudiante={estudiante as typeof estudiante & { usuario: { correo: string; usuario: string } }} edicion={edicion} />
    );
}