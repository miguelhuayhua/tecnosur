// app/api/reviews/crear/route.ts
import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });

  if (!token || !token.id) {
    return Response.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const { cursoId, rating, comentario } = await req.json()

    // Validar campos requeridos
    if (!cursoId || !rating || !comentario) {
      return Response.json({
        error: "cursoId, rating y comentario son requeridos"
      }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return Response.json({
        error: "Rating debe estar entre 1 y 5"
      }, { status: 400 })
    }

    if (comentario.length > 300) {
      return Response.json({
        error: "El comentario no puede superar 300 caracteres"
      }, { status: 400 })
    }

    const usuarioId = token.id as string

    // Verificar que el usuario ha comprado el curso
    const compraExistente = await prisma.compras.findFirst({
      where: {
        usuariosEstudiantesId: usuarioId,
        edicion: {
          cursoId: cursoId
        }
      }
    })

    if (!compraExistente) {
      return Response.json({
        error: "Debes haber comprado el curso"
      }, { status: 403 })
    }

    // Verificar que no haya dejado ya una opinión
    const reviewExistente = await prisma.reviewsCursos.findFirst({
      where: {
        cursoId: cursoId,
        usuariosEstudiantesId: usuarioId
      }
    })

    if (reviewExistente) {
      return Response.json({
        message: "Ya opinaste este curso",
        success: false
      }, { status: 400 })
    }

    // Crear review
    const nuevaReview = await prisma.reviewsCursos.create({
      data: {
        cursoId,
        rating,
        comentario,
        usuariosEstudiantesId: usuarioId
      }
    })

    return Response.json({
      success: true,
      message: "Opinión creada"
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error creando review:', error)

    if (error.code === 'P2002') {
      return Response.json({
        error: "Ya opinaste este curso"
      }, { status: 400 })
    }

    return Response.json({
      error: "Error del servidor"
    }, { status: 500 })
  }
}