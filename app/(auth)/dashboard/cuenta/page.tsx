import Link from "next/link";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { CuentaTabs } from "./cuenta-tabs";
import { Button } from "@/components/ui/button";
import { ContentLayout } from "@/components/dashboard/content-layout";

async function getDatosCuenta(correo: string) {
    try {
        const [usuario, compras, inscripciones] = await Promise.all([
            // Datos del usuario
            prisma.usuariosEstudiantes.findUnique({
                where: { correo },
                include: {
                    estudiante: true
                }
            }),

            // Compras del usuario
            prisma.compras.findMany({
                where: { usuario: { correo } },
                include: {
                    edicion: {
                        include: {
                            curso: {
                                select: { titulo: true, urlMiniatura: true }
                            }
                        }
                    }
                },
                orderBy: { fechaCompra: 'desc' }
            }),

            // Inscripciones activas
            prisma.inscripciones.findMany({
                where: {
                    estudiante: {
                        usuario: { correo }
                    },
                    estado: true
                },
                include: {
                    edicion: {
                        include: {
                            curso: {
                                select: { titulo: true, descripcion: true, urlMiniatura: true }
                            }
                        }
                    }
                }
            }),


        ]);

        return {
            usuario,
            compras,
            inscripcionesActivas: inscripciones,
        };
    } catch (error) {
        console.error('Error fetching cuenta data:', error);
        return {
            usuario: null,
            compras: [],
            inscripcionesActivas: [],
            certificadosObtenidos: []
        };
    }
}

export default async function CuentaPage() {
    const session = await getServerSession();

    if (!session?.user) {
        return <div>No autenticado</div>;
    }

    const data = await getDatosCuenta(session.user.email!);

    if (!data.usuario) {
        return (
            <ContentLayout title="Cuenta No Encontrada">
                <div className="text-center py-16">
                    <h2 className="text-2xl font-bold text-muted-foreground">
                        Información no disponible
                    </h2>
                    <Button asChild className="mt-4">
                        <Link href="/dashboard">
                            Volver al dashboard
                        </Link>
                    </Button>
                </div>
            </ContentLayout>
        );
    }

    return (
        <ContentLayout title="Mi Cuenta">
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
                        <BreadcrumbPage>Mi Cuenta</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <CuentaTabs data={data as any} />
        </ContentLayout>
    );
}