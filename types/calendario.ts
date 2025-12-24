export type TEventColor = 'blue' | 'red'; // Solo azul y rojo

export interface Curso {
  id: string;
  titulo: string;
  descripcion?: string;
}

export interface EdicionCurso {
  id: string;
  codigo: string;
  curso: Curso;
  descripcion?: string;
  estado: string;
}
// En /components/interfaces.ts
export interface Clase {
  id: string;
  titulo: string;
  descripcion?: string;
  fecha: string;           // Fecha específica de la clase
  duracion?: number;
  urlYoutube?: string;
  edicion: EdicionCurso;
  startDate: string;       // Hora de inicio (debería venir de la edición o clase)
  endDate: string;         // Hora de fin (debería venir de la edición o clase)
  type: 'clase';
  color?: TEventColor;
}

export interface Examen {
  id: string;
  titulo: string;
  descripcion?: string;
  fechaDisponible: string; // Fecha y hora de inicio del examen
  fechaLimite: string;     // Fecha y hora de fin del examen
  notaMaxima: number;
  notaMinima: number;
  edicion: EdicionCurso;
  startDate: string;       // Debería ser igual a fechaDisponible
  endDate: string;         // Debería ser igual a fechaLimite
  type: 'examen';
  color?: TEventColor;
}

export type Evento = Clase | Examen;

// Interfaz extendida para eventos en el calendario
export interface CalendarClase extends Omit<Clase, 'fecha' | 'duracion' | 'urlYoutube'> {
  position: number;
  isMultiDay: boolean;
}

export interface CalendarExamen extends Omit<Examen, 'fechaDisponible' | 'fechaLimite' | 'notaMaxima' | 'notaMinima'> {
  position: number;
  isMultiDay: boolean;
}

export type CalendarEvento = CalendarClase | CalendarExamen;

export interface ICalendarCell {
  day: number;
  currentMonth: boolean;
  date: Date;
}