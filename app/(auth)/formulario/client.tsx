"use client";
import {
    Stepper,
    StepperList,
    StepperItem,
    StepperTrigger,
    StepperIndicator,
    StepperTitle,
    StepperDescription,
    type StepperProps,
    StepperSeparator,
    StepperContent,
    StepperPrev,
    StepperNext,
} from "@/components/ui/stepper";
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldLabel,
    FieldTitle
} from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { estudiantes, usuariosEstudiantes } from "@/prisma/generated";
import Image from "next/image";
import { useCallback, useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Home, Info, User, Eye, EyeOff, Loader2 } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { spanishSpeakingCountries } from "@/lib/countries";
import { useRouter } from "next/navigation";
import { useModal } from "@/providers/modal-provider";

interface Props {
    estudiante: estudiantes & { usuario: usuariosEstudiantes };
}

const steps = [
    {
        value: "estudiante",
        title: "Datos personales",
        description: "Información básica",
        fields: ["nombre", "apellido", "fechaNacimiento", "genero", "celular", "pais"] as const,
        icon: User
    },
    {
        value: "usuario",
        title: "Datos de Usuario",
        description: "Credenciales de acceso",
        fields: ["usuario", "correo", "contrasena", "confirmarContrasena"] as const,
        icon: Home
    },
    {
        value: "review",
        title: "Revisar",
        description: "Verifica tu información",
        fields: [] as const,
        icon: Info
    },
];

export default function Formulario({ estudiante }: Props) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [step, setStep] = useState("estudiante");
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const formSchema = z.object({
        // Datos del estudiante
        nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
        apellido: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
        fechaNacimiento: z.string().min(1, "La fecha de nacimiento es requerida"),
        genero: z.enum(["HOMBRE", "MUJER"], {
            message: "Selecciona un género"
        }),
        celular: z.string().min(8, "El celular debe tener al menos 8 dígitos"),
        pais: z.string().min(2, "El país es requerido"),

        // Datos del usuario
        usuario: z
            .string()
            .min(3, "El usuario debe tener al menos 3 caracteres")
            .regex(
                /^[a-zA-Z0-9_]+$/,
                "El usuario solo puede contener letras, números y guiones bajos"
            ),
        correo: z.email("Ingresa un correo electrónico válido"),
        contrasena: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
        confirmarContrasena: z.string()
    }).refine((data) => data.contrasena === data.confirmarContrasena, {
        message: "Las contraseñas no coinciden",
        path: ["confirmarContrasena"],
    });

    type FormSchema = z.infer<typeof formSchema>;

    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nombre: estudiante.nombre || "",
            apellido: estudiante.apellido || "",
            fechaNacimiento: estudiante.fechaNacimiento?.toISOString().split('T')[0] || "",
            genero: estudiante.genero || undefined,
            celular: estudiante.celular || "",
            pais: estudiante.pais || "",
            usuario: estudiante.usuario.usuario,
            correo: estudiante.usuario.correo,
            contrasena: "",
            confirmarContrasena: "",
        },
    });

    const selectedCountry = useMemo(() => {
        return spanishSpeakingCountries.find(c => c.code === form.watch('pais'));
    }, [form.watch('pais')]);

    const stepIndex = useMemo(
        () => steps.findIndex((s) => s.value === step),
        [step],
    );
    const { openModal } = useModal();
    const onSubmit = useCallback(async (data: FormSchema) => {
        openModal({
            titulo: '¿Continuar?',
            content: "Tus datos serán registrados",
            url: "/api/estudiante/confirmar",
            data,
            showIcon: false,
            callback() {

            }
        })

    }, [estudiante.id, router]);

    const onValidate: NonNullable<StepperProps["onValidate"]> = useCallback(
        async (_value, direction) => {
            if (direction === "prev") return true;

            const stepData = steps.find((s) => s.value === step);
            if (!stepData) return true;

            const isValid = await form.trigger(stepData.fields);
            return isValid;
        },
        [form, step],
    );

    return (
        <ScrollArea className="min-h-screen">
            <div className="grid grid-cols-3 h-screen">
                <div className="col-span-1 bg-muted hidden lg:block relative h-full">
                    <Image
                        src='/student.svg'
                        className="lg:px-20 xl:px-30 2xl:px-35"
                        fill
                        alt="Imagen svg de estudiante"
                    />
                </div>
                <div className="col-span-3 lg:col-span-2 flex items-center justify-center">
                    <Stepper
                        value={step}
                        onValueChange={setStep}
                        onValidate={onValidate}
                        className="max-w-4xl px-10 xl:px-0 w-full"
                    >
                        <StepperList className="flex-col items-start lg:items-center lg:flex-row gap-y-5">
                            {steps.map((stepItem, index) => (
                                <StepperItem key={stepItem.value} value={stepItem.value}>
                                    <StepperTrigger>
                                        <StepperIndicator>
                                            <stepItem.icon className="size-5" />
                                        </StepperIndicator>
                                        <div className="flex flex-col gap-1">
                                            <StepperTitle>{stepItem.title}</StepperTitle>
                                            <StepperDescription>{stepItem.description}</StepperDescription>
                                        </div>
                                    </StepperTrigger>
                                    {index < steps.length - 1 && (
                                        <StepperSeparator className="mx-4 hidden lg:block" />
                                    )}
                                </StepperItem>
                            ))}
                        </StepperList>

                        {/* PASO 1: Datos personales del estudiante */}
                        <StepperContent value="estudiante">
                            <FieldContent className="space-y-6">
                                <div className="space-y-1">
                                    <FieldTitle className="text-2xl font-semibold">
                                        Datos personales
                                    </FieldTitle>
                                    <FieldDescription className="text-muted-foreground text-md">
                                        Completa tu información personal para crear tu perfil
                                    </FieldDescription>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Field>
                                        <FieldLabel htmlFor="nombre">Nombre *</FieldLabel>
                                        <InputGroup>
                                            <InputGroupInput
                                                id="nombre"
                                                placeholder="Ej: Juan"
                                                aria-invalid={!!form.formState.errors.nombre}
                                                {...form.register("nombre")}
                                            />
                                        </InputGroup>
                                        <FieldError>{form.formState.errors.nombre?.message}</FieldError>
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="apellido">Apellido *</FieldLabel>
                                        <InputGroup>
                                            <InputGroupInput
                                                id="apellido"
                                                placeholder="Ej: Pérez"
                                                aria-invalid={!!form.formState.errors.apellido}
                                                {...form.register("apellido")}
                                            />
                                        </InputGroup>
                                        <FieldError>{form.formState.errors.apellido?.message}</FieldError>
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="fechaNacimiento">Fecha de Nacimiento *</FieldLabel>
                                        <InputGroup>
                                            <InputGroupInput
                                                id="fechaNacimiento"
                                                type="date"
                                                aria-invalid={!!form.formState.errors.fechaNacimiento}
                                                {...form.register("fechaNacimiento")}
                                            />
                                        </InputGroup>
                                        <FieldError>{form.formState.errors.fechaNacimiento?.message}</FieldError>
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="genero">Género *</FieldLabel>
                                        <Select
                                            value={form.watch("genero")}
                                            onValueChange={(value: any) => form.setValue("genero", value, { shouldValidate: true })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona una opción" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="HOMBRE">Hombre</SelectItem>
                                                <SelectItem value="MUJER">Mujer</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FieldError>{form.formState.errors.genero?.message}</FieldError>
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="pais">País *</FieldLabel>
                                        <Select
                                            value={form.watch("pais")}
                                            onValueChange={(value) => form.setValue("pais", value, { shouldValidate: true })}
                                        >
                                            <SelectTrigger
                                                aria-invalid={!!form.formState.errors.pais}
                                                className='[&>span_img]:shrink-0 w-full [&>span]:flex [&>span]:items-center [&>span]:gap-2'
                                            >
                                                <SelectValue placeholder='Selecciona el país'>
                                                    {selectedCountry && (
                                                        <div className="flex items-center gap-2">
                                                            <img src={selectedCountry.flag} alt={selectedCountry.name} className='h-4 w-5' />
                                                            <span>{selectedCountry.name}</span>
                                                        </div>
                                                    )}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent className='max-h-[300px]'>
                                                {spanishSpeakingCountries.map(pais => (
                                                    <SelectItem key={pais.code} value={pais.code}>
                                                        <div className="flex items-center gap-2">
                                                            <img src={pais.flag} alt={`${pais.name} flag`} className='h-4 w-5' />
                                                            <span className='truncate'>{pais.name}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FieldError>{form.formState.errors.pais?.message}</FieldError>
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="celular">Celular *</FieldLabel>
                                        <InputGroup>
                                            <InputGroupAddon>
                                                <InputGroupText>
                                                    {selectedCountry?.phoneCode || '+00'}
                                                </InputGroupText>
                                            </InputGroupAddon>
                                            <InputGroupInput
                                                id="celular"
                                                type="tel"
                                                placeholder="12345678"
                                                aria-invalid={!!form.formState.errors.celular}
                                                {...form.register("celular")}
                                            />
                                        </InputGroup>
                                        <FieldError>{form.formState.errors.celular?.message}</FieldError>
                                    </Field>
                                </div>
                            </FieldContent>
                        </StepperContent>

                        {/* PASO 2: Datos de usuario */}
                        <StepperContent value="usuario">
                            <FieldContent className="space-y-6">
                                <div className="space-y-1">
                                    <FieldTitle className="text-2xl font-semibold">
                                        Credenciales de acceso
                                    </FieldTitle>
                                    <FieldDescription className="text-muted-foreground text-md">
                                        Crea tu usuario y contraseña para acceder a la plataforma
                                    </FieldDescription>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Field className="md:col-span-2">
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

                                    <Field className="md:col-span-2">
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

                                    <Field>
                                        <FieldLabel htmlFor="contrasena">Contraseña *</FieldLabel>
                                        <InputGroup>
                                            <div className="relative w-full">
                                                <InputGroupInput
                                                    id="contrasena"
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Mínimo 8 caracteres"
                                                    className="pr-10"
                                                    aria-invalid={!!form.formState.errors.contrasena}
                                                    {...form.register("contrasena")}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                >
                                                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                                </button>
                                            </div>
                                        </InputGroup>
                                        <FieldError>{form.formState.errors.contrasena?.message}</FieldError>
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="confirmarContrasena">Confirmar Contraseña *</FieldLabel>
                                        <InputGroup>
                                            <div className="relative w-full">
                                                <InputGroupInput
                                                    id="confirmarContrasena"
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    placeholder="Repite tu contraseña"
                                                    className="pr-10"
                                                    aria-invalid={!!form.formState.errors.confirmarContrasena}
                                                    {...form.register("confirmarContrasena")}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                >
                                                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                                </button>
                                            </div>
                                        </InputGroup>
                                        <FieldError>{form.formState.errors.confirmarContrasena?.message}</FieldError>
                                    </Field>
                                </div>
                            </FieldContent>
                        </StepperContent>

                        {/* PASO 3: Revisión */}
                        <StepperContent value="review">
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <FieldTitle className="text-2xl font-semibold">
                                        Revisa tu información
                                    </FieldTitle>
                                    <FieldDescription className="text-muted-foreground text-md">
                                        Verifica que todos los datos sean correctos antes de continuar
                                    </FieldDescription>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="flex flex-col gap-1 rounded-md border p-4">
                                        <span className="font-medium text-sm text-muted-foreground">Nombre completo</span>
                                        <p className="text-sm font-semibold">
                                            {form.watch("nombre") && form.watch("apellido")
                                                ? `${form.watch("nombre")} ${form.watch("apellido")}`
                                                : "No proporcionado"}
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-1 rounded-md border p-4">
                                        <span className="font-medium text-sm text-muted-foreground">Fecha de nacimiento</span>
                                        <p className="text-sm font-semibold">
                                            {form.watch("fechaNacimiento")
                                                ? new Date(form.watch("fechaNacimiento")).toLocaleDateString('es-ES', {
                                                    day: '2-digit',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })
                                                : "No proporcionado"}
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-1 rounded-md border p-4">
                                        <span className="font-medium text-sm text-muted-foreground">Género</span>
                                        <p className="text-sm font-semibold">
                                            {form.watch("genero") === "HOMBRE"
                                                ? "Hombre"
                                                : form.watch("genero") === "MUJER"
                                                    ? "Mujer"
                                                    : "No proporcionado"}
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-1 rounded-md border p-4">
                                        <span className="font-medium text-sm text-muted-foreground">País</span>
                                        <p className="text-sm font-semibold">
                                            {selectedCountry?.name || "No proporcionado"}
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-1 rounded-md border p-4">
                                        <span className="font-medium text-sm text-muted-foreground">Celular</span>
                                        <p className="text-sm font-semibold">
                                            {form.watch("celular")
                                                ? `${selectedCountry?.phoneCode || ''} ${form.watch("celular")}`
                                                : "No proporcionado"}
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-1 rounded-md border p-4">
                                        <span className="font-medium text-sm text-muted-foreground">Usuario</span>
                                        <p className="text-sm font-semibold">{form.watch("usuario") || "No proporcionado"}</p>
                                    </div>

                                    <div className="flex flex-col gap-1 rounded-md border p-4 md:col-span-2 lg:col-span-3">
                                        <span className="font-medium text-sm text-muted-foreground">Correo electrónico</span>
                                        <p className="text-sm font-semibold">{form.watch("correo") || "No proporcionado"}</p>
                                    </div>
                                </div>
                            </div>
                        </StepperContent>

                        {/* Navegación */}
                        <div className="flex justify-between items-center mt-8">
                            <StepperPrev asChild>
                                <Button type="button" variant="outline" disabled={isPending}>
                                    Anterior
                                </Button>
                            </StepperPrev>
                            <div className="text-muted-foreground text-sm">
                                Paso {stepIndex + 1} de {steps.length}
                            </div>
                            {stepIndex === steps.length - 1 ? (
                                <Button
                                    type="submit"
                                    onClick={form.handleSubmit(onSubmit)}
                                    disabled={isPending}
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Guardando...
                                        </>
                                    ) : (
                                        "Completar Registro"
                                    )}
                                </Button>
                            ) : (
                                <StepperNext asChild>
                                    <Button type="button" disabled={isPending}>
                                        Siguiente
                                    </Button>
                                </StepperNext>
                            )}
                        </div>
                    </Stepper>
                </div>
            </div>
        </ScrollArea>
    );
}