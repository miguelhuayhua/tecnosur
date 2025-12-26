import Link from "next/link";
import { ContentLayout } from "@/components/dashboard/content-layout";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { BookOpen, Award, Calendar, FileText, ArrowRight, Users, BarChart3 } from "lucide-react";
import ListarCursos from "../list";

async function getDashboardData(correo: string) {
    const [inscripciones, examenes] = await Promise.all([
        // Cursos inscritos activos
        prisma.inscripciones.findMany({
            where: {
                estudiante: {
                    usuario: { correo }
                },
                estado: true
            }
        }),


        // Exámenes próximos (en los próximos 7 días)
        prisma.examenes.count({
            where: {
                edicion: {
                    inscripciones: {
                        some: {
                            estudiante: {
                                usuario: { correo }
                            },
                            estado: true
                        }
                    }
                },
                fechaDisponible: {
                    gte: new Date(),
                    lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días
                }
            }
        })
    ]);

    return {
        cursosInscritos: inscripciones,
        examenesProximos: examenes
    };

}

export default async function DashboardPage() {
    const session = await getServerSession();

    if (!session?.user) {
        return <div>No autenticado</div>;
    }

    const data = await getDashboardData(session.user.email!);

    return (
        <ContentLayout title="Dashboard">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/">Home</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Dashboard</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            {/* Mensaje de bienvenida */}
            <div className="mt-8 space-y-4 ">
                <h2 className="flex items-center text-2xl font-bold gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Bienvenido de {session.user.name}
                </h2>
                <p className="text-muted-foreground">
                    Ve nuestros cursos más recientes.
                </p>
                <ListarCursos inscripciones={data?.cursosInscritos as any} />
            </div>
            <div className="space-y-4 mt-10">
                {/* Estadísticas rápidas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="pb-4">
                        <CardHeader className="flex flex-row items-center justify-between ">
                            <CardTitle className="text-sm font-medium">Cursos Inscritos</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{data.cursosInscritos.length}</div>
                            <p className="text-xs text-muted-foreground">
                                Cursos activos
                            </p>
                        </CardContent>
                    </Card>



                    <Card className="pb-4">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Próximos Exámenes</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{data.examenesProximos}</div>
                            <p className="text-xs text-muted-foreground">
                                En los próximos 7 días
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Acciones rápidas */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    <Card className="pb-4">
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                                    <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold">Mis Cursos</h3>
                                    <p className="text-sm text-muted-foreground">Ver todos mis cursos</p>
                                </div>
                                <Button asChild variant="ghost" size="icon">
                                    <Link href="/dashboard/cursos">
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>


                    <Card className="pb-4">
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900">
                                    <FileText className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold">Exámenes</h3>
                                    <p className="text-sm text-muted-foreground">Ver mis exámenes</p>
                                </div>
                                <Button asChild variant="ghost" size="icon">
                                    <Link href="/dashboard/examenes">
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="pb-4">
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                                    <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold">Mi Cuenta</h3>
                                    <p className="text-sm text-muted-foreground">Gestionar cuenta</p>
                                </div>
                                <Button asChild variant="ghost" size="icon">
                                    <Link href="/dashboard/cuenta">
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>


            </div>
        </ContentLayout>
    );
}