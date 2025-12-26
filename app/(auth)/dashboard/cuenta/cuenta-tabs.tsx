"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Calendar, CreditCard, BookOpen, Award, Shield, Edit, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { EditarPerfilForm } from "./editar-perfil-form"

interface CuentaData {
    usuario: any
    compras: any[]
    inscripcionesActivas: any[]
    certificadosObtenidos: any[]
}

interface CuentaTabsProps {
    data: CuentaData
}

export function CuentaTabs({ data }: CuentaTabsProps) {
    const [mostrarContrasena, setMostrarContrasena] = useState(false)

    const formatFecha = (fecha: Date) => {
        return new Intl.DateTimeFormat('es-BO', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(new Date(fecha))
    }

    const formatMoneda = (monto: number, moneda: string = "USD") => {
        return new Intl.NumberFormat('es-BO', {
            style: 'currency',
            currency: moneda
        }).format(monto)
    }

    const totalGastado = data.compras.reduce((total, compra) => total + compra.monto, 0)

    return (
        <div className="mt-8">
            <Tabs defaultValue="perfil" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="perfil" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Perfil
                    </TabsTrigger>
                    <TabsTrigger value="compras" className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Compras
                    </TabsTrigger>
                    <TabsTrigger value="cursos" className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Cursos
                    </TabsTrigger>
                    <TabsTrigger value="seguridad" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Seguridad
                    </TabsTrigger>
                </TabsList>

                {/* Tab: Perfil */}
                <TabsContent value="perfil" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Información personal */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <User className="h-5 w-5" />
                                            Información Personal
                                        </CardTitle>
                                        <CardDescription>
                                            Tus datos de cuenta y perfil
                                        </CardDescription>
                                    </div>
                                    <EditarPerfilForm usuario={data.usuario} />
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Nombre completo</label>
                                            <p className="font-semibold">{data.usuario.nombre}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Correo electrónico</label>
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                                <p className="font-semibold">{data.usuario.correo}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Estado de la cuenta</label>
                                            <div className="mt-1">
                                                <Badge variant={data.usuario.estado ? "default" : "secondary"}>
                                                    {data.usuario.estado ? "Activa" : "Inactiva"}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Miembro desde</label>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <p className="font-semibold">{formatFecha(data.usuario.creadoEn)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Resumen general */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Resumen General</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="text-center p-4 border rounded-lg">
                                            <p className="text-2xl font-bold text-blue-600">{data.inscripcionesActivas.length}</p>
                                            <p className="text-sm text-muted-foreground">Cursos Activos</p>
                                        </div>
                                        <div className="text-center p-4 border rounded-lg">
                                            <p className="text-2xl font-bold text-green-600">{data.certificadosObtenidos.length}</p>
                                            <p className="text-sm text-muted-foreground">Certificados</p>
                                        </div>
                                        <div className="text-center p-4 border rounded-lg">
                                            <p className="text-2xl font-bold text-purple-600">{data.compras.length}</p>
                                            <p className="text-sm text-muted-foreground">Compras</p>
                                        </div>
                                        <div className="text-center p-4 border rounded-lg">
                                            <p className="text-2xl font-bold text-orange-600">{formatMoneda(totalGastado)}</p>
                                            <p className="text-sm text-muted-foreground">Total Gastado</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Acciones rápidas */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Acciones Rápidas</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button asChild variant="outline" className="w-full justify-start">
                                        <Link href="/dashboard/cursos">
                                            <BookOpen className="h-4 w-4 mr-2" />
                                            Mis Cursos
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" className="w-full justify-start">
                                        <Link href="/dashboard/certificados">
                                            <Award className="h-4 w-4 mr-2" />
                                            Mis Certificados
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" className="w-full justify-start">
                                        <Link href="/dashboard/examenes">
                                            <CreditCard className="h-4 w-4 mr-2" />
                                            Mis Exámenes
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* Tab: Compras */}
                <TabsContent value="compras" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Historial de Compras
                            </CardTitle>
                            <CardDescription>
                                Todas tus transacciones y compras de cursos
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {data.compras.length > 0 ? (
                                <div className="space-y-4">
                                    {data.compras.map((compra) => (
                                        <div key={compra.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex-1">
                                                <h4 className="font-semibold">{compra.edicion.curso.titulo}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatFecha(compra.fechaCompra)} • {compra.edicion.codigo}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-green-600">
                                                    {formatMoneda(compra.monto, compra.moneda)}
                                                </p>
                                                <Badge variant={compra.comprobado ? "default" : "secondary"} className="text-xs">
                                                    {compra.comprobado ? "Comprobado" : "Pendiente"}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">No hay compras registradas</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab: Cursos */}
                <TabsContent value="cursos" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Cursos activos */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5" />
                                    Cursos Activos
                                </CardTitle>
                                <CardDescription>
                                    Cursos en los que estás inscrito actualmente
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {data.inscripcionesActivas.length > 0 ? (
                                    <div className="space-y-3">
                                        {data.inscripcionesActivas.map((inscripcion) => (
                                            <div key={inscripcion.id} className="p-3 border rounded-lg">
                                                <h4 className="font-semibold">{inscripcion.edicion.curso.titulo}</h4>
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {inscripcion.edicion.curso.descripcion}
                                                </p>
                                                <div className="flex justify-between items-center mt-2">
                                                    <Badge variant="outline" className="text-xs">
                                                        {inscripcion.edicion.codigo}
                                                    </Badge>
                                                    <Button asChild size="sm" variant="ghost">
                                                        <Link href={`/dashboard/cursos/${inscripcion.edicionId}`}>
                                                            Ir al curso
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">No tienes cursos activos</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Certificados */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="h-5 w-5" />
                                    Certificados Obtenidos
                                </CardTitle>
                                <CardDescription>
                                    Tus certificados de finalización
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {data.certificadosObtenidos.length > 0 ? (
                                    <div className="space-y-3">
                                        {data.certificadosObtenidos.map((certificado) => (
                                            <div key={certificado.id} className="p-3 border rounded-lg">
                                                <h4 className="font-semibold">{certificado.edicion.curso.titulo}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    Obtenido el {formatFecha(certificado.fechaEmision)}
                                                </p>
                                                <div className="flex justify-between items-center mt-2">
                                                    <code className="text-xs bg-muted px-2 py-1 rounded">
                                                        {certificado.codigoUnico}
                                                    </code>
                                                    <Button asChild size="sm" variant="ghost">
                                                        <Link href={`/dashboard/certificados/${certificado.id}`}>
                                                            Ver
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">No tienes certificados</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Tab: Seguridad */}
                <TabsContent value="seguridad" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Seguridad de la Cuenta
                                </CardTitle>
                                <CardDescription>
                                    Configuración de seguridad y privacidad
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Correo electrónico verificado</label>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="default">Verificado</Badge>
                                        <p className="text-sm text-muted-foreground">{data.usuario.correo}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Última actualización</label>
                                    <p className="text-sm">{formatFecha(data.usuario.actualizadoEn)}</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Estado de la cuenta</label>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={data.usuario.estado ? "default" : "secondary"}>
                                            {data.usuario.estado ? "Activa" : "Inactiva"}
                                        </Badge>
                                        <p className="text-sm text-muted-foreground">
                                            {data.usuario.estado 
                                                ? "Tu cuenta está activa y funcionando correctamente"
                                                : "Tu cuenta está temporalmente desactivada"
                                            }
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Información de Sesión</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-4 border rounded-lg bg-muted/50">
                                    <h4 className="font-semibold mb-2">Datos de Registro</h4>
                                    <div className="text-sm space-y-1">
                                        <div><strong>ID Usuario:</strong> <code className="text-xs">{data.usuario.id}</code></div>
                                        <div><strong>Fecha de Registro:</strong> {formatFecha(data.usuario.creadoEn)}</div>
                                        <div><strong>Última Actualización:</strong> {formatFecha(data.usuario.actualizadoEn)}</div>
                                    </div>
                                </div>

                                <Button asChild variant="outline" className="w-full">
                                    <Link href="/soporte">
                                        Contactar Soporte
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}