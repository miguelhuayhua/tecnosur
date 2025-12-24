// types/cursos.ts
export interface CursoFormData {
  titulo: string
  descripcion: string
  descripcionCorta?: string
  urlMiniatura?: string
  urlCurso?: string
  enVivo?: boolean
}

export interface EdicionFormData {
  codigo: string
  descripcion?: string
  fechaInicio: Date
  fechaFin: Date
  notaMinima: number
  notaMaxima: number
  urlWhatsapp?: string
  docenteId: string
}

export interface BeneficioFormData {
  descripcion: string
  orden: number
}

export interface ObjetivoFormData {
  descripcion: string
  orden: number
}

export interface RequisitoFormData {
  descripcion: string
  orden: number
}