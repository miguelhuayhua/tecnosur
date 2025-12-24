'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { User, Lock, Phone, BookOpen, AtSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useModal } from '@/providers/modalprovider';

// Schema de validación mejorado
const registroSchema = z.object({
    // Datos de estudiante
    nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
    celular: z.string().min(1, 'El celular es obligatorio'),

    // Datos de usuario
    nombreUsuario: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres'),
    contrasena: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmarContrasena: z.string(),
}).refine((data) => data.contrasena === data.confirmarContrasena, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmarContrasena'],
});

type RegistroFormData = z.infer<typeof registroSchema>;

interface CompletarRegistroFormProps {
    compraId: string;
    cursoId: string;
    datosIniciales: {
        email: string;
        nombreActual: string;
        apellidoActual: string;
        celularActual: string;
        cursoNombre: string;
        edicionCodigo: string;
    };
}

export default function CompletarRegistroForm({
    compraId,
    cursoId,
    datosIniciales
}: CompletarRegistroFormProps) {
    const router = useRouter();
    const { openModal } = useModal();
    const [error, setError] = useState<string | null>(null);
    const [validandoUsuario, setValidandoUsuario] = useState(false);
    const [usuarioDisponible, setUsuarioDisponible] = useState<boolean | null>(null);

    const { register, handleSubmit, formState: { errors }, watch } = useForm<RegistroFormData>({
        resolver: zodResolver(registroSchema),
        defaultValues: {
            nombre: datosIniciales.nombreActual,
            apellido: datosIniciales.apellidoActual,
            celular: datosIniciales.celularActual,
            nombreUsuario: datosIniciales.nombreActual.toLowerCase().replace(/\s+/g, '')
        }
    });

    // En el formulario, cambia la función validarUsuario:
    const validarUsuario = async (nombreUsuario: string) => {
        if (nombreUsuario.length < 3) return;

        setValidandoUsuario(true);
        setUsuarioDisponible(null);
        setError(null);

        try {
            const response = await fetch('/api/usuarios/validar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombreUsuario, // Solo envía el nombre de usuario,
                    compraId
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Error al validar usuario');
            }

            setUsuarioDisponible(result.disponible);

            if (!result.disponible) {
                setError(result.mensaje || 'El nombre de usuario ya está en uso');
            }
        } catch (error: any) {
            console.error('Error validando usuario:', error);
            setError(error.message || 'Error al validar el nombre de usuario');
        } finally {
            setValidandoUsuario(false);
        }
    };

    const onSubmit = async (data: RegistroFormData) => {
        setError(null);

        // Validar nombre de usuario antes de enviar
        if (usuarioDisponible === false) {
            setError('Por favor, verifica que el nombre de usuario esté disponible');
            return;
        }

        // Si no se ha validado, validar ahora
        if (usuarioDisponible === null) {
            await validarUsuario(data.nombreUsuario);
            if (usuarioDisponible === false) {
                return;
            }
        }

        openModal({
            titulo: '¿Completar registro?',
            content: `Se actualizarán tus datos personales y podrás acceder al curso "${datosIniciales.cursoNombre}"`,
            url: '/api/compras/confirmar',
            data: {
                compraId,
                nombre: data.nombre,
                apellido: data.apellido,
                nombreUsuario: data.nombreUsuario,
                celular: data.celular,
                contrasena: data.contrasena,
                email: datosIniciales.email
            },
            callback: () => {
                router.push(`/cursos/${cursoId}/checkout/${compraId}`);
                setTimeout(() => {
                    router.refresh();
                }, 100);
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Información del curso */}
            <Card className="border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/20">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-sm leading-tight">
                                {datosIniciales.cursoNombre}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">
                                Edición: <Badge variant="secondary" className="text-xs">{datosIniciales.edicionCodigo}</Badge>
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Formulario principal */}
            <Card>
                <CardContent className="p-6">
                    <div className="text-center mb-6">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                            <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-foreground mb-2">
                            Completa tu perfil
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Actualiza tus datos personales para acceder al curso
                        </p>
                    </div>


                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        {/* Sección: Datos Personales del Estudiante */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2 text-foreground">
                                <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                Datos Personales
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                <Field>
                                    <FieldLabel>Nombre *</FieldLabel>
                                    <Input
                                        placeholder="Tu nombre"
                                        {...register('nombre')}
                                    />
                                    {errors.nombre && <FieldError>{errors.nombre.message}</FieldError>}
                                </Field>

                                <Field>
                                    <FieldLabel>Apellido *</FieldLabel>
                                    <Input
                                        placeholder="Tu apellido"
                                        {...register('apellido')}
                                    />
                                    {errors.apellido && <FieldError>{errors.apellido.message}</FieldError>}
                                </Field>
                            </div>

                            <Field>
                                <FieldLabel>Celular *</FieldLabel>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="tel"
                                        placeholder="Ej: 999888777"
                                        className="pl-10"
                                        {...register('celular')}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Para contactarte sobre el curso
                                </p>
                                {errors.celular && <FieldError>{errors.celular.message}</FieldError>}
                            </Field>
                        </div>

                        {/* Sección: Datos de Cuenta */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2 text-foreground">
                                <AtSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                Datos de Cuenta
                            </h3>

                            <Field>
                                <FieldLabel>Nombre de usuario *</FieldLabel>
                                <div className="relative">
                                    <AtSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="nombreusuario"
                                        className="pl-10"
                                        {...register('nombreUsuario')}
                                        onBlur={(e) => validarUsuario(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    {validandoUsuario && (
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                                            Verificando disponibilidad...
                                        </div>
                                    )}
                                    {usuarioDisponible === true && !validandoUsuario && (
                                        <div className="flex items-center gap-1 text-xs text-green-600">
                                            ✓ Nombre de usuario disponible
                                        </div>
                                    )}
                                    {usuarioDisponible === false && !validandoUsuario && (
                                        <div className="flex items-center gap-1 text-xs text-destructive">
                                            ✗ Nombre de usuario no disponible
                                        </div>
                                    )}
                                </div>
                                {errors.nombreUsuario && <FieldError>{errors.nombreUsuario.message}</FieldError>}
                            </Field>

                        </div>

                        {/* Sección: Seguridad */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2 text-foreground">
                                <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                Seguridad
                            </h3>

                            <Field>
                                <FieldLabel>Nueva contraseña *</FieldLabel>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="password"
                                        placeholder="Mínimo 6 caracteres"
                                        className="pl-10"
                                        {...register('contrasena')}
                                    />
                                </div>
                                {errors.contrasena && <FieldError>{errors.contrasena.message}</FieldError>}
                            </Field>

                            <Field>
                                <FieldLabel>Confirmar contraseña *</FieldLabel>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="password"
                                        placeholder="Repite tu contraseña"
                                        className="pl-10"
                                        {...register('confirmarContrasena')}
                                    />
                                </div>
                                {errors.confirmarContrasena && (
                                    <FieldError>{errors.confirmarContrasena.message}</FieldError>
                                )}
                            </Field>
                        </div>

                        {/* Botón de envío */}
                        <Button
                            type="submit"
                            disabled={usuarioDisponible === false || validandoUsuario}
                            size="lg"
                            className='w-full'
                        >
                            Completar registro y acceder al curso
                        </Button>
                    </form>

                    {/* Información adicional */}
                    <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                        <p className="text-xs text-muted-foreground text-center">
                            Al completar el registro, aceptas nuestros términos y condiciones.
                            Tus datos estarán protegidos y solo se usarán para fines educativos.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}