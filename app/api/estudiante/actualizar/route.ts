// app/api/estudiante/validar/route.ts
import { getToken } from "next-auth/jwt"
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
export async function POST(req: NextRequest) {
    try {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! })

        if (!token) {
            return Response.json({ error: "No autorizado" }, { status: 401 })
        }

        const body = await req.json()
        const { estudianteId, nombre, apellido, fechaNacimiento, genero, celular, pais } = body
        if (!estudianteId) {
            return Response.json({ error: "estudianteId es requerido" }, { status: 400 })
        }


        if (!nombre || nombre.length < 2) {
            return Response.json({ error: "Nombre debe tener al menos 2 caracteres" }, { status: 400 })
        }

        if (!apellido || apellido.length < 2) {
            return Response.json({ error: "Apellido debe tener al menos 2 caracteres" }, { status: 400 })
        }

        if (!fechaNacimiento) {
            return Response.json({ error: "Fecha de nacimiento es requerida" }, { status: 400 })
        }

        if (!genero || !["HOMBRE", "MUJER"].includes(genero)) {
            return Response.json({ error: "Género inválido" }, { status: 400 })
        }

        if (!celular || celular.length < 8) {
            return Response.json({ error: "Celular debe tener al menos 8 dígitos" }, { status: 400 })
        }

        if (!pais || pais.length < 2) {
            return Response.json({ error: "País es requerido" }, { status: 400 })
        }

        // Actualizar en transacción
        await prisma.$transaction(async (tx) => {
            // Actualizar estudiante
            await tx.estudiantes.update({
                where: { id: estudianteId },
                data: {
                    nombre,
                    apellido,
                    fechaNacimiento: fechaNacimiento,
                    genero,
                    celular,
                    pais,
                    actualizadoEn: new Date()
                }
            })
        })

        return Response.json({
            success: true,
            message: "Datos personale modificados correctamente."
        })

    } catch (error: any) {
        console.error("Error validando estudiante:", error)

        if (error.code === "P2025") {
            return Response.json({ error: "Estudiante no encontrado" }, { status: 404 })
        }

        if (error.code === "P2002") {
            return Response.json({ error: "Conflicto de datos únicos" }, { status: 409 })
        }

        return Response.json({ error: "Error interno del servidor" }, { status: 500 })
    }
}