// app/api/categorias/route.ts - Versión simplificada
import { prisma } from "@/lib/prisma";
export async function GET() {
  try {
    const categorias = await prisma.categorias.findMany({
      select: {
        id: true,
        nombre: true,
        descripcion: true,
      },
      orderBy: {
        nombre: 'asc',
      },
    });

    return Response.json(categorias);

  } catch (error) {
    console.error('Error fetching categorias:', error);
    return Response.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}