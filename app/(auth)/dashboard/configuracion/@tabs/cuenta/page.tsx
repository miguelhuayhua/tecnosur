import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import DatosUsuarioClient from "./client";

const obtenerUsuario = async (correo: string) => {
    const usuario = await prisma.usuariosEstudiantes.findFirst({
        where: {
            correo
        },
        select: {
            correo: true, avatar: true,
            creadoEn: true,
            actualizadoEn: true,
            estado: true,
            usuario: true
        }
    });
    console.log(usuario)
    if (!usuario) return notFound();
    return usuario;
}

export default async function Cuenta() {
    const session = await getServerSession();
    if (!session) return notFound();
    const usuario = await obtenerUsuario(session.user.email!);

    return (<DatosUsuarioClient usuario={usuario} />)
}