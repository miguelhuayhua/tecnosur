import Link from "next/link";
import { notFound } from "next/navigation";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { prisma } from "@/lib/prisma";
import CursoEstudianteDetalle from "./curso-detalle";
import { ContentLayout } from "@/components/dashboard/content-layout";


async function getEdicionCurso(id: string) {
    try {
        const edicionprueba = await prisma.edicionesCursos.findFirst({
            where: { id: id },
        });
        const edicion = await prisma.edicionesCursos.findUnique({
            where: { id: id },
            include: {
                curso: {
                    include: {
                        categorias: {
                            include: {
                                categoria: true
                            }
                        },
                        beneficios: {
                            orderBy: { orden: 'asc' }
                        },
                        objetivos: {
                            orderBy: { orden: 'asc' }
                        },
                        requisitos: {
                            orderBy: { orden: 'asc' }
                        }
                    }
                },
                clases: {
                    orderBy: { orden: 'asc' },
                    include: {
                        materiales: true
                    }
                },
                examenes: {
                    orderBy: { creadoEn: 'asc' }
                },
                inscripciones: {
                    include: {
                        estudiante: true
                    }
                },
                precios: {
                    orderBy: { esPrecioDefault: 'desc' }
                }
            }
        });

        if (!edicion) return null;

        return {
            id: edicion.id,
            codigo: edicion.codigo,
            descripcion: edicion.descripcion,
            estado: edicion.estado,
            fechaInicio: edicion.fechaInicio,
            fechaFin: edicion.fechaFin,
            urlWhatsapp: edicion.urlWhatsapp,
            vigente: edicion.vigente,
            curso: {
                id: edicion.curso.id,
                titulo: edicion.curso.titulo,
                descripcion: edicion.curso.descripcion,
                urlMiniatura: edicion.curso.urlMiniatura,
                categorias: edicion.curso.categorias.map(cc => ({
                    id: cc.categoria.id,
                    nombre: cc.categoria.nombre
                })),
                beneficios: edicion.curso.beneficios.map(beneficio => ({
                    id: beneficio.id,
                    descripcion: beneficio.descripcion,
                    orden: beneficio.orden
                })),
                objetivos: edicion.curso.objetivos.map(objetivo => ({
                    id: objetivo.id,
                    descripcion: objetivo.descripcion,
                    orden: objetivo.orden
                })),
                requisitos: edicion.curso.requisitos.map(requisito => ({
                    id: requisito.id,
                    descripcion: requisito.descripcion,
                    orden: requisito.orden
                }))
            },
            clases: edicion.clases.map(clase => ({
                id: clase.id,
                titulo: clase.titulo,
                descripcion: clase.descripcion,
                urlYoutube: clase.urlYoutube,
                duracion: clase.duracion,
                fecha: clase.fecha,
                orden: clase.orden,
                materiales: clase.materiales.map(material => ({
                    id: material.id,
                    titulo: material.titulo,
                    tipo: material.tipo,
                    url: material.url
                }))
            })),
            examenes: edicion.examenes.map(examen => ({
                id: examen.id,
                titulo: examen.titulo,
                descripcion: examen.descripcion,
                fechaDisponible: examen.fechaDisponible,
                fechaLimite: examen.fechaLimite,
                notaMinima: examen.notaMinima,
                notaMaxima: examen.notaMaxima
            })),
            inscripciones: edicion.inscripciones.map(inscripcion => ({
                id: inscripcion.id,
                estudiante: {
                    id: inscripcion.estudiante.id,
                    nombre: inscripcion.estudiante.nombre,
                    apellido: inscripcion.estudiante.apellido
                },
                inscritoEn: inscripcion.inscritoEn,
                estaActivo: inscripcion.estado
            })),
            precios: edicion.precios.map(precio => ({
                id: precio.id,
                nombre: precio.nombre,
                precio: precio.precio,
                precioOriginal: precio.precioOriginal,
                porcentajeDescuento: precio.porcentajeDescuento,
                esDescuento: precio.esDescuento,
                esPrecioDefault: precio.esPrecioDefault,
                moneda: precio.moneda,
                fechaInicio: precio.fechaInicio,
                fechaFin: precio.fechaFin
            }))
        };
    } catch (error) {
        console.error('Error fetching edicion curso:', error);
        return null;
    }
}

export default async function CursoDetailPage({ params }: any) {
    const param = await params;
    const edicion = await getEdicionCurso(param.id);


    if (!edicion) {
        notFound();
    }

    return (
        <ContentLayout title={`Curso: ${edicion.curso.titulo} - ${edicion.codigo}`}>
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/">Home</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/dashboard">Dashboard</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/dashboard/cursos">Mis Cursos</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>{edicion.curso.titulo}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <CursoEstudianteDetalle edicion={edicion as any} />
        </ContentLayout>
    );
}