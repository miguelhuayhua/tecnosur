"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Edit, Eye, EyeOff, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useModal } from "@/providers/modalprovider"

const perfilSchema = z.object({
    nombre: z.string().min(2, "Mínimo 2 caracteres").max(100, "Máximo 100 caracteres"),
    contrasenaActual: z.string().min(1, "La contraseña actual es requerida"),
    nuevaContrasena: z.string().min(6, "Mínimo 6 caracteres").optional().or(z.literal('')),
    confirmarContrasena: z.string().optional().or(z.literal(''))
}).refine((data) => {
    if (data.nuevaContrasena && data.nuevaContrasena !== data.confirmarContrasena) {
        return false
    }
    return true
}, {
    message: "Las contraseñas no coinciden",
    path: ["confirmarContrasena"],
}).refine((data) => {
    if (data.nuevaContrasena && data.nuevaContrasena === data.contrasenaActual) {
        return false
    }
    return true
}, {
    message: "La nueva contraseña no puede ser igual a la actual",
    path: ["nuevaContrasena"],
})

type PerfilFormData = z.infer<typeof perfilSchema>

interface EditarPerfilFormProps {
    usuario: any
}

export function EditarPerfilForm({ usuario }: EditarPerfilFormProps) {
    const [open, setOpen] = useState(false)
    const [mostrarContrasenaActual, setMostrarContrasenaActual] = useState(false)
    const [mostrarNuevaContrasena, setMostrarNuevaContrasena] = useState(false)
    const [mostrarConfirmarContrasena, setMostrarConfirmarContrasena] = useState(false)
    
    const router = useRouter()
    const { openModal } = useModal()

    const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<PerfilFormData>({
        resolver: zodResolver(perfilSchema),
        defaultValues: {
            nombre: usuario.nombre || ""
        }
    })

    const onSubmit = async (data: PerfilFormData) => {
        const { confirmarContrasena, ...updateData } = data

        // Si no se proporcionó nueva contraseña, eliminar el campo
        if (!updateData.nuevaContrasena) {
            delete updateData.nuevaContrasena
        }

        openModal({
            titulo: '¿Actualizar perfil?',
            content: `Se actualizarán tus datos personales`,
            url: `/api/usuarios/actualizar-perfil`,
            data: {
                ...updateData,
                usuarioId: usuario.id_,
            },
            callback: () => {
                setOpen(false)
                reset()
                setTimeout(() => {
                    router.refresh()
                }, 100)
            }
        })
    }

    const handleClose = () => {
        setOpen(false)
        reset()
    }

    const nuevaContrasena = watch("nuevaContrasena")

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Editar
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Edit className="h-5 w-5" />
                        Editar Perfil
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <FieldGroup>
                        <Field>
                            <FieldLabel>Nombre completo</FieldLabel>
                            <Input
                                placeholder="Juan Pérez"
                                {...register("nombre")}
                            />
                            {errors.nombre && <FieldError>{errors.nombre.message}</FieldError>}
                        </Field>

                        <Field>
                            <FieldLabel>Correo electrónico</FieldLabel>
                            <div className="flex">
                                <Input
                                    value={usuario.correo}
                                    type="email"
                                    disabled
                                    className="flex-1"
                                />
                                <span className="flex items-center px-3 border border-l-0 rounded-r-md bg-muted">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                </span>
                            </div>
                            <FieldDescription>
                                El correo electrónico no se puede modificar por seguridad
                            </FieldDescription>
                        </Field>

                        <Field>
                            <FieldLabel>Contraseña actual *</FieldLabel>
                            <div className="relative">
                                <Input
                                    type={mostrarContrasenaActual ? "text" : "password"}
                                    placeholder="Ingresa tu contraseña actual"
                                    {...register("contrasenaActual")}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setMostrarContrasenaActual(!mostrarContrasenaActual)}
                                >
                                    {mostrarContrasenaActual ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                            {errors.contrasenaActual && <FieldError>{errors.contrasenaActual.message}</FieldError>}
                            <FieldDescription>
                                Requerida para confirmar cualquier cambio
                            </FieldDescription>
                        </Field>

                        <Field>
                            <FieldLabel>Nueva contraseña (opcional)</FieldLabel>
                            <div className="relative">
                                <Input
                                    type={mostrarNuevaContrasena ? "text" : "password"}
                                    placeholder="Nueva contraseña"
                                    {...register("nuevaContrasena")}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setMostrarNuevaContrasena(!mostrarNuevaContrasena)}
                                >
                                    {mostrarNuevaContrasena ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                            {errors.nuevaContrasena && <FieldError>{errors.nuevaContrasena.message}</FieldError>}
                        </Field>

                        {nuevaContrasena && (
                            <Field>
                                <FieldLabel>Confirmar nueva contraseña</FieldLabel>
                                <div className="relative">
                                    <Input
                                        type={mostrarConfirmarContrasena ? "text" : "password"}
                                        placeholder="Confirmar nueva contraseña"
                                        {...register("confirmarContrasena")}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setMostrarConfirmarContrasena(!mostrarConfirmarContrasena)}
                                    >
                                        {mostrarConfirmarContrasena ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                                {errors.confirmarContrasena && <FieldError>{errors.confirmarContrasena.message}</FieldError>}
                            </Field>
                        )}

                        <Field orientation="horizontal" className="pt-4">
                            <Button type="submit" className="flex-1">
                                Actualizar Perfil
                            </Button>
                            <Button variant="outline" onClick={handleClose} type="button">
                                Cancelar
                            </Button>
                        </Field>
                    </FieldGroup>
                </form>
            </DialogContent>
        </Dialog>
    )
}