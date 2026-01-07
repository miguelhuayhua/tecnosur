"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel, FieldSeparator, FieldTitle } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Calendar as CalendarIcon } from "lucide-react"
import { es } from "date-fns/locale"
// En el componente Formulario, modifica la parte del esquema de validación:
const formSchema = z.object({
    // Datos del estudiante
    nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    apellido: z.string().nullable(),
    fechaNacimiento: z.date().nullable(),
    genero: z.enum(TipoGenero, { message: "Selecciona un género" }),
    celular: z.string().min(8, "El celular debe tener al menos 8 dígitos"),
    pais: z.enum(spanishSpeakingCountries.map(pais => pais.code)).nonoptional(),
}
);

type FormSchema = z.infer<typeof formSchema>;


export default function DatosPersonalesClient({ estudiante }: { estudiante: estudiantes }) {
    const { openModal } = useModal();
    const router = useRouter();
    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nombre: estudiante.nombre || "",
            apellido: estudiante.apellido || "",
            fechaNacimiento: new Date(),
            genero: estudiante.genero || undefined,
            celular: estudiante.celular || "",
            pais: estudiante.pais || ""
        },
    });

    const selectedCountry = useMemo(() => {
        return spanishSpeakingCountries.find(c => c.code === form.watch('pais'));
    }, [form.watch('pais')]);
    const fechaNacimiento = form.watch("fechaNacimiento")

    return (<>
        <form onSubmit={form.handleSubmit(data => {
            openModal({
                titulo: "¿Estás Seguro?",
                content: "Tus datos personales serán modificados",
                data: { ...data, estudianteId: estudiante.id },
                url: "/api/estudiante/actualizar",
                callback() {
                    router.refresh();
                },
                showIcon: false
            })
        })} >
            <FieldContent >
                <FieldTitle className="text-xl md:text-xl text-center mx-auto md:mx-0">
                    Datos personales
                </FieldTitle>
                <FieldDescription className="text-muted-foreground text-center md:text-start text-sm md:text-md">
                    Completa tu información personal para crear tu perfil
                </FieldDescription>
                <FieldSeparator />
                <div className="max-w-md space-y-4">
                    <Field >
                        <FieldLabel htmlFor="nombre">Nombre <span className="text-destructive">*</span></FieldLabel>
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
                        <FieldLabel htmlFor="apellido">Apellido </FieldLabel>
                        <InputGroup>
                            <InputGroupInput
                                id="apellido"
                                placeholder="Ej: Pérez"
                            />
                        </InputGroup>
                    </Field>

                    <Field className="w-fit">
                        <FieldLabel>Fecha de Nacimiento </FieldLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-between bg-input font-normal",
                                        !fechaNacimiento && "text-muted-foreground"
                                    )}
                                >
                                    {fechaNacimiento ? formatDate(fechaNacimiento) : "Seleccionar fecha"}
                                    <CalendarIcon className="text-muted-foreground" />

                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align="start">
                                <Calendar
                                    mode="single"
                                    selected={fechaNacimiento || new Date()}
                                    onSelect={(date) => date && form.setValue("fechaNacimiento", date)}
                                    captionLayout="dropdown"
                                    locale={es}
                                />
                            </PopoverContent>
                        </Popover>
                    </Field>

                    <Field className="w-fit">
                        <FieldLabel htmlFor="genero">Género <span className="text-destructive">*</span></FieldLabel>
                        <Select
                            value={form.watch("genero")}
                            onValueChange={(value: any) => form.setValue("genero", value, { shouldValidate: true })}
                        >
                            <SelectTrigger aria-invalid={!!form.formState.errors.genero}>
                                <SelectValue placeholder="Selecciona una opción" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="HOMBRE">Hombre</SelectItem>
                                <SelectItem value="MUJER">Mujer</SelectItem>
                            </SelectContent>
                        </Select>
                        <FieldError>{form.formState.errors.genero?.message}</FieldError>
                    </Field>

                    <Field className="w-fit">
                        <FieldLabel htmlFor="pais">País  <span className="text-destructive">*</span></FieldLabel>
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

                    <Field className="w-fit">
                        <FieldLabel htmlFor="celular">Celular  <span className="text-destructive">*</span></FieldLabel>
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
                    <Button type='submit' className="w-fit">
                        Actualizar Datos Personales
                    </Button>
                </div>
            </FieldContent>
        </form>
    </>)
}