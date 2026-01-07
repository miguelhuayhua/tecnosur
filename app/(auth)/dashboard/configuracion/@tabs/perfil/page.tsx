import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DatosPersonalesClient from "./client";
import { getServerSession } from "next-auth";

const obtenerDatosPersonales = async (correo: string) => {
    const estudiante = await prisma.estudiantes.findFirst({
        where: {
            usuario: { correo }
        }
    });
    if (!estudiante) return notFound();
    return estudiante;
}

export default async function Perfil() {
    const session = await getServerSession();

    if (!session) return notFound();
    const estudiante = await obtenerDatosPersonales(session.user.email!);

    return (<DatosPersonalesClient estudiante={estudiante} />)
}