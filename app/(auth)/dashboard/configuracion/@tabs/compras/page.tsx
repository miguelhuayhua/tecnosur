import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import ComprasUsuarioClient from "./client";

const obtenerCompras = async (correo: string) => {
    const compras = await prisma.compras.findMany({
        where: {
            inscripcion: {
                estudiante: { usuario: { correo } }
            },
        },
        include: {
            edicion: {
                select: {
                    precios: {
                        where: { esPrecioDefault: true },
                        take: 1
                    },
                    codigo: true,
                    id: true,
                    curso: {
                        select: {
                            titulo: true,
                            descripcionCorta: true
                        }
                    }
                }
            }
        }
    });
    return compras;
}

export default async function Compras() {
    const session = await getServerSession();
    if (!session) return notFound();
    const compras = await obtenerCompras(session.user.email!);

    return (<ComprasUsuarioClient compras={compras} />)
}