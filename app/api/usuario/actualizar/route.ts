// app/api/estudiante/validar/route.ts
import { getToken } from "next-auth/jwt"
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"


export async function POST(req: NextRequest) {
    try {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! })

        if (!token) {
            return Response.json({ error: "No autorizado" }, { status: 401 })
        }

        const body = await req.json()
        const { usuario, correo, contrasena, confirmarContrasena } = body

        if (!usuario || usuario.length < 3 || !/^[a-zA-Z0-9_.]+$/.test(usuario)) {
            return Response.json({ error: "Usuario inválido. Debe tener al menos 3 caracteres y solo letras, números y guiones bajos" }, { status: 400 })
        }

        if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
            return Response.json({ error: "Correo electrónico inválido" }, { status: 400 })
        }

        // Validación de contraseña
        if (!contrasena) {
            return Response.json({ error: "Contraseña es requerida" }, { status: 400 })
        }


        if (contrasena !== confirmarContrasena) {
            return Response.json({ error: "Las contraseñas no coinciden" }, { status: 400 })
        }

        // Verificar estudiante
        const estudianteExistente = await prisma.estudiantes.findFirst({
            where: { usuario: { correo: token.email! } },
            include: { usuario: true }
        })

        if (!estudianteExistente) {
            return Response.json({ error: "Estudiante no encontrado" }, { status: 404 })
        }


        // Verificar unicidad de correo
        if (estudianteExistente.usuario?.correo !== correo) {
            const correoExistente = await prisma.usuariosEstudiantes.findFirst({
                where: { correo, id: { not: estudianteExistente.usuario?.id } }
            })

            if (correoExistente) {
                return Response.json({ error: "El correo electrónico ya está registrado" }, { status: 409 })
            }
        }

        // Verificar unicidad de usuario
        if (estudianteExistente.usuario?.usuario !== usuario) {
            const usuarioExistente = await prisma.usuariosEstudiantes.findFirst({
                where: { usuario, id: { not: estudianteExistente.usuario?.id } }
            })

            if (usuarioExistente) {
                return Response.json({ error: "El nombre de usuario ya está en uso" }, { status: 409 })
            }
        }

        // Hashear contraseña
        const hashedPassword = await bcrypt.hash(contrasena, await bcrypt.genSalt())

        // Actualizar en transacción
        await prisma.$transaction(async (tx) => {
            // Actualizar usuario
            if (estudianteExistente.usuario) {
                await tx.usuariosEstudiantes.update({
                    where: { id: estudianteExistente.usuario.id },
                    data: {
                        correo,
                        contrasena: hashedPassword,
                        usuario,
                        registrado: true,
                        actualizadoEn: new Date()
                    }
                })
            }
        })

        return Response.json({
            success: true,
            message: "Usuario modificado correctamente."
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