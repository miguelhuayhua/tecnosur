// schemas/curso.ts
import { z } from "zod"

// Schema base para cursos
export const cursoSchema = z.object({
    // Campos obligatorios
    titulo: z.string()
        .min(3, "Mínimo 3 caracteres")
        .max(200, "Máximo 200 caracteres"),

    descripcion: z.string()
        .min(10, "Mínimo 10 caracteres")
        .max(1000, "Máximo 1000 caracteres"),

    // Campos opcionales con validaciones solo si tienen valor
    descripcionCorta: z.string()
        .max(200, "Máximo 200 caracteres")
        .optional(),

    urlMiniatura: z.string()
        .url("Debe ser una URL válida")
        .regex(/\.(jpg|jpeg|png|webp|gif)$/i, "Debe ser una imagen (jpg, png, webp, gif)")
        .optional()
        .or(z.literal("")),

    urlCurso: z.string()
        .url("Debe ser una URL válida")
        .optional()
        .or(z.literal("")),

    enVivo: z.boolean().default(false)
})

// Schema para ediciones (corregido)
export const edicionSchema = z.object({
    codigo: z.string()
        .regex(/^[A-Z]{3}-\d{4}$/, "Formato: MAR-2025 (3 letras mayúsculas, guión, 4 dígitos)"),

    descripcion: z.string().max(500, "Máximo 500 caracteres").optional(),

    fechaInicio: z.coerce
        .date()
        .refine((date) => date > new Date(), {
            message: "Debe ser una fecha futura"
        }),

    fechaFin: z.coerce
        .date()
        .refine((date) => date > new Date(), {
            message: "Debe ser una fecha futura"
        }),

    notaMinima: z.coerce
        .number()
        .min(0, "Mínimo 0")
        .max(100, "Máximo 100"),

    notaMaxima: z.coerce
        .number()
        .min(1, "Mínimo 1")
        .max(100, "Máximo 100"),

    urlWhatsapp: z.string()
        .url("Debe ser una URL válida")
        .optional()
        .or(z.literal("")),

    docenteId: z.string().uuid("Debe seleccionar un docente válido"),

    vigente: z.boolean().default(true)
})
    // Validación cruzada para fechaFin > fechaInicio y notaMaxima > notaMinima
    .refine((data) => data.fechaFin > data.fechaInicio, {
        message: "La fecha fin debe ser posterior a la fecha de inicio",
        path: ["fechaFin"]
    })
    .refine((data) => data.notaMaxima > data.notaMinima, {
        message: "La nota máxima debe ser mayor que la nota mínima",
        path: ["notaMaxima"]
    })

// Schema para arrays (beneficios, objetivos, requisitos)
export const beneficioSchema = z.object({
    descripcion: z.string()
        .min(5, "Mínimo 5 caracteres")
        .max(200, "Máximo 200 caracteres"),
    orden: z.coerce.number().int().min(1, "El orden debe ser mayor a 0")
})

export const objetivoSchema = z.object({
    descripcion: z.string()
        .min(5, "Mínimo 5 caracteres")
        .max(200, "Máximo 200 caracteres"),
    orden: z.coerce.number().int().min(1, "El orden debe ser mayor a 0")
})

export const requisitoSchema = z.object({
    descripcion: z.string()
        .min(5, "Mínimo 5 caracteres")
        .max(200, "Máximo 200 caracteres"),
    orden: z.coerce.number().int().min(1, "El orden debe ser mayor a 0")
})

// Tipos inferidos
export type CursoFormData = z.infer<typeof cursoSchema>
export type EdicionFormData = z.infer<typeof edicionSchema>
export type BeneficioFormData = z.infer<typeof beneficioSchema>
export type ObjetivoFormData = z.infer<typeof objetivoSchema>
export type RequisitoFormData = z.infer<typeof requisitoSchema>