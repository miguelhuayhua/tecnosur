"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel, FieldSeparator, FieldTitle } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupInput } from "@/components/ui/input-group"
import { spanishSpeakingCountries } from "@/lib/countries"
import { cn, formatDate } from "@/lib/utils"
import { estudiantes, TipoGenero } from "@/prisma/generated"
import { useModal } from "@/providers/modal-provider"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import z from "zod"
import { PasswordInput } from "@/components/ui/password-input"

const passwordRequirements = [
    { regex: /.{6,}/, text: 'Al menos 6 caracteres' },
    { regex: /[a-z]/, text: 'Al menos 1 letra minúscula' },
    { regex: /[A-Z]/, text: 'Al menos 1 letra mayúscula' },
    { regex: /[0-9]/, text: 'Al menos 1 número' },
    {
        regex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/,
        text: 'Al menos 1 carácter especial'
    }
];
const PasswordStrengthIndicator = ({ password }: { password: string }) => {
    const strength = useMemo(() =>
        passwordRequirements.map(req => ({
            met: req.regex.test(password),
            text: req.text
        })), [password]);

    const strengthScore = useMemo(() =>
        strength.filter(req => req.met).length, [strength]);

    const getColor = (score: number) => {
        if (score === 0) return 'bg-border';
        if (score <= 1) return 'bg-destructive';
        if (score <= 2) return 'bg-orange-500';
        if (score <= 3) return 'bg-amber-500';
        if (score === 4) return 'bg-yellow-400';
        return 'bg-green-500';
    };

    const getText = (score: number) => {
        if (score === 0) return 'Ingresa una contraseña';
        if (score <= 2) return 'Contraseña débil';
        if (score <= 3) return 'Contraseña media';
        if (score === 4) return 'Contraseña fuerte';
        return 'Contraseña muy fuerte';
    };

    return (
        <div className="space-y-2">
            <div className="flex h-1 w-full gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                    <span
                        key={index}
                        className={cn(
                            'h-full flex-1 rounded-full transition-all duration-500 ease-out',
                            index < strengthScore ? getColor(strengthScore) : 'bg-border'
                        )}
                    />
                ))}
            </div>

            <p className="text-foreground text-xs ">
                {getText(strengthScore)}.
            </p>


        </div>
    );
};

// En el componente Formulario, modifica la parte del esquema de validación:
const formSchema = z.object({
    usuario: z
        .string()
        .min(3, "El usuario debe tener al menos 3 caracteres")
        .regex(
            /^[a-zA-Z0-9_.]+$/,
            "El usuario solo puede contener letras, números y guiones bajos"
        ),
    correo: z.email("Ingresa un correo electrónico válido"),

    // Contraseña con validación mejorada
    contrasena: z
        .string()
        .min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmarContrasena: z.string()
}).refine((data) => data.contrasena === data.confirmarContrasena, {
    message: "Las contraseñas no coinciden",
    path: ["confirmarContrasena"],
});

type FormSchema = z.infer<typeof formSchema>;

interface Usuario {
    correo: string,
    avatar: string | null,
    creadoEn: Date,
    actualizadoEn: Date,
    estado: Boolean,
    usuario: string
}
export default function DatosUsuarioClient({ usuario }: { usuario: Usuario }) {
    const { openModal } = useModal();
    const router = useRouter();
    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: { usuario: usuario.usuario, correo: usuario.correo },
    });

    return (<>
        <form onSubmit={form.handleSubmit(data => {
            openModal({
                titulo: "¿Estás Seguro?",
                content: "Tu cuenta será modificada",
                data,
                url: "/api/usuario/actualizar",
                callback() {
                    router.refresh();
                },
                showIcon: false
            })
        })} >
            <FieldContent >
                <FieldTitle className="text-xl md:text-xl text-center mx-auto md:mx-0">
                    Credenciales de acceso
                </FieldTitle>
                <FieldDescription className="text-muted-foreground text-center md:text-start text-sm md:text-md">
                    Crea tu usuario y contraseña para acceder a la plataforma
                </FieldDescription>
                <FieldSeparator />
                <div className="max-w-md space-y-4">
                    <Field >
                        <FieldLabel htmlFor="usuario">Nombre de Usuario *</FieldLabel>
                        <InputGroup>
                            <InputGroupInput
                                id="usuario"
                                placeholder="Ej: juanperez123"
                                aria-invalid={!!form.formState.errors.usuario}
                                {...form.register("usuario")}
                            />
                        </InputGroup>
                        <FieldError>{form.formState.errors.usuario?.message}</FieldError>
                    </Field>

                    <Field >
                        <FieldLabel htmlFor="correo">Correo Electrónico *</FieldLabel>
                        <InputGroup>
                            <InputGroupInput
                                id="correo"
                                type="email"
                                placeholder="Ej: juan@ejemplo.com"
                                aria-invalid={!!form.formState.errors.correo}
                                {...form.register("correo")}
                            />
                        </InputGroup>
                        <FieldError>{form.formState.errors.correo?.message}</FieldError>
                    </Field>

                    <Field >
                        <FieldLabel htmlFor="contrasena">Contraseña *</FieldLabel>
                        <PasswordInput id="contrasena"
                            placeholder="Introduce tu contraseña"
                            aria-invalid={!!form.formState.errors.contrasena}
                            {...form.register("contrasena")} />
                        {/* Indicador de fortaleza de contraseña */}
                        {form.watch('contrasena') && (
                            <div className="mt-3">
                                <PasswordStrengthIndicator password={form.watch('contrasena')} />
                            </div>
                        )}

                        <FieldError>{form.formState.errors.contrasena?.message}</FieldError>
                    </Field>

                    <Field >
                        <FieldLabel htmlFor="confirmarContrasena">Confirmar Contraseña *</FieldLabel>
                        <PasswordInput id="confirmarContrasena"
                            placeholder="Repite tu contraseña"
                            aria-invalid={!!form.formState.errors.confirmarContrasena}
                            {...form.register("confirmarContrasena")} />

                        <FieldError>{form.formState.errors.confirmarContrasena?.message}</FieldError>
                    </Field>
                    <Button type='submit' className="w-fit">
                        Actualizar Cuenta
                    </Button>
                </div>
            </FieldContent>
        </form>
    </>)
}