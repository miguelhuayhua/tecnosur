import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { ExamenesTable } from "./examenes-table";
import { ContentLayout } from "@/components/dashboard/content-layout";
import { notFound } from "next/navigation";

async function getTodosLosExamenes(correo: string) {
    return await prisma.examenes.findMany({
        where: {
            edicion: {
                compras: {
                    some: {
                        usuario: {
                            correo
                        }
                    }
                }
            }
        },
        include: {
            edicion: {
                select: {
                    id: true, codigo: true,
                    curso: { select: { titulo: true } }
                }
            },
            calificaciones: {
                where: {
                    estudiante: { usuario: { correo } }
                }
            }
        }
    });

}

export default async function TodosLosExamenesPage() {
    const session = await getServerSession();

    if (!session?.user?.email) return notFound()
    const examenes = await getTodosLosExamenes(session.user.email);
    console.log(examenes)
    return (
        <ContentLayout title="Exámenes">
            <ExamenesTable examenes={examenes} />
        </ContentLayout>
    );
}