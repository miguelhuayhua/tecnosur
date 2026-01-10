import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ValidarCertificadoClient from './client';

async function getCertificadoData(certificadoId: string) {
  try {
    const certificado = await prisma.certificados.findFirst({
      where: {
        OR: [
          { id_: certificadoId },
          { codigoUnico: certificadoId } // Ya no usamos toUpperCase() aquí
        ]
      },
      include: {
        estudiante: {
          include: {
            usuario: {
              select: {
                nombre: true,
                correo: true
              }
            }
          }
        },
        edicion: {
          include: {
            curso: {
              select: {
                titulo: true,
                descripcion: true,
                urlMiniatura: true
              }
            }
          }
        }
      }
    });

    if (!certificado) return null;

    return {
      id: certificado.id_,
      codigoUnico: certificado.codigoUnico,
      fechaEmision: certificado.fechaEmision,
      estudiante: {
        id: certificado.estudiante.id_,
        nombre: certificado.estudiante.nombre,
        apellido: certificado.estudiante.apellido,
        usuario: {
          nombre: certificado.estudiante.usuario.nombre,
          correo: certificado.estudiante.usuario.correo
        }
      },
      edicion: {
        id: certificado.edicion.id_,
        codigo: certificado.edicion.codigo,
        curso: {
          titulo: certificado.edicion.curso.titulo,
          descripcion: certificado.edicion.curso.descripcion,
          urlMiniatura: certificado.edicion.curso.urlMiniatura
        }
      },
      urlCertificado: certificado.urlCertificado,
      isValid: true
    };
  } catch (error) {
    console.error('Error fetching certificado:', error);
    return null;
  }
}

interface PageProps {
  params: Promise<{ certificadoId: string }>;
}

export default async function ValidarCertificadoPage({ params }: PageProps) {
  // Usar await con params
  const { certificadoId } = await params;

  const certificado = await getCertificadoData(certificadoId);

  if (!certificado) {
    notFound();
  }

  return <ValidarCertificadoClient certificado={certificado as any} />;
}

// También puedes generar metadata dinámica
export async function generateMetadata({ params }: PageProps) {
  const { certificadoId } = await params;
  const certificado = await getCertificadoData(certificadoId);

  if (!certificado) {
    return {
      title: 'Certificado No Encontrado',
    };
  }

  return {
    title: `Certificado - ${certificado.edicion.curso.titulo}`,
    description: `Certificado válido de ${certificado.estudiante.nombre} ${certificado.estudiante.apellido} para el curso ${certificado.edicion.curso.titulo}`,
  };
}