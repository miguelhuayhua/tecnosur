"use client"

import { Badge } from "@/components/ui/badge"
import { Item, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item"

import { formatDateTime } from "@/lib/utils"
import { compras } from "@/prisma/generated"
import { DollarSign } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Compra extends compras {
    edicion: { codigo: string, id: string, curso: { titulo: string, descripcionCorta: string | null } }
}
export default function ComprasUsuarioClient({ compras }: { compras: Array<Compra> }) {

    return (<>
        <ItemGroup className="gap-4">
            <h3 className="text-xl md:text-xl font-semibold mx-auto md:mx-0">
                Listado de todas tus compras
            </h3>
            {compras.map((compra) => (
                <Link href={`/dashboard/cursos/${compra.edicionId}`}>
                    <Item key={compra.id} variant="outline" role="listitem">
                        <ItemMedia className="my-auto" variant="icon">
                            <DollarSign />
                        </ItemMedia>
                        <ItemContent>
                            <ItemTitle >
                                {compra.providerId}

                            </ItemTitle>
                            <ItemTitle className="text-muted-foreground flex items-center ">
                                <span>
                                    {compra.edicion.curso.titulo}
                                </span>

                            </ItemTitle>
                            <Badge variant='outline'>
                                Edición:  {compra.edicion.codigo}
                            </Badge>
                            <Badge variant={'outline'}>
                                Método: {compra.metodo}
                            </Badge>
                        </ItemContent>
                        <ItemContent >
                            <p className="text-2xl flex items-center gap-1">
                                <b>
                                    {compra.monto}
                                </b>
                                <span>
                                    {compra.moneda}
                                </span>

                            </p>
                            <ItemDescription className="text-xs">Fecha: {formatDateTime(compra.fechaCompra)}</ItemDescription>
                            <Badge variant={compra.estadoPago == "COMPLETADO" ? 'secondary' : "warning"}>
                                {compra.estadoPago}
                            </Badge>

                            {
                                compra.estadoPago == "PENDIENTE" && (
                                    <>
                                        <p>
                                            Deuda:     <b> {compra.deuda} {compra.moneda} </b>
                                        </p>
                                    </>
                                )
                            }
                        </ItemContent>
                    </Item>
                </Link>
            ))}
        </ItemGroup>
    </>)
}