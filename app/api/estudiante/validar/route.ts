// app/api/estudiante/validar/route.ts
import { getToken } from "next-auth/jwt"
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

const SALT_ROUNDS = 10

// Validaciones de contraseña
const passwordValidations = [
  { regex: /.{12,}/, message: "Debe tener al menos 12 caracteres" },
  { regex: /[a-z]/, message: "Debe tener al menos 1 letra minúscula" },
  { regex: /[A-Z]/, message: "Debe tener al menos 1 letra mayúscula" },
  { regex: /[0-9]/, message: "Debe tener al menos 1 número" },
  { regex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/, message: "Debe tener al menos 1 carácter especial" }
]

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! })

    if (!token) {
      return Response.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const { estudianteId, nombre, apellido, fechaNacimiento, genero, celular, pais, usuario, correo, contrasena, confirmarContrasena } = body
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

    if (!usuario || usuario.length < 3 || !/^[a-zA-Z0-9_]+$/.test(usuario)) {
      return Response.json({ error: "Usuario inválido. Debe tener al menos 3 caracteres y solo letras, números y guiones bajos" }, { status: 400 })
    }

    if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      return Response.json({ error: "Correo electrónico inválido" }, { status: 400 })
    }

    // Validación de contraseña
    if (!contrasena) {
      return Response.json({ error: "Contraseña es requerida" }, { status: 400 })
    }

    for (const validation of passwordValidations) {
      if (!validation.regex.test(contrasena)) {
        return Response.json({ error: validation.message }, { status: 400 })
      }
    }

    if (contrasena !== confirmarContrasena) {
      return Response.json({ error: "Las contraseñas no coinciden" }, { status: 400 })
    }

    // Verificar estudiante
    const estudianteExistente = await prisma.estudiantes.findUnique({
      where: { id: estudianteId },
      include: { usuario: true }
    })

    if (!estudianteExistente) {
      return Response.json({ error: "Estudiante no encontrado" }, { status: 404 })
    }

    // Verificar si ya está registrado
    if (estudianteExistente.usuario?.registrado) {
      return Response.json({ error: "El estudiante ya está registrado" }, { status: 400 })
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
    const hashedPassword = await bcrypt.hash(contrasena, SALT_ROUNDS)

    // Actualizar en transacción
    await prisma.$transaction(async (tx) => {
      // Actualizar estudiante
      const fechaNacimientoDate = new Date(fechaNacimiento)
      await tx.estudiantes.update({
        where: { id: estudianteId },
        data: {
          nombre,
          apellido,
          fechaNacimiento: fechaNacimientoDate,
          genero,
          celular,
          pais,
          actualizadoEn: new Date()
        }
      })

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
      message: "Datos validados correctamente."
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