export type PieChartData = {
    name: string
    value: number
    fill?: string
}
export type DoubleBarChartData = {
    name: string
    value: number
    value2: number
    fill?: string
}
export type LineChartData = {
    x: string
    y: number
    fill?: string

}
export interface BarChartData {
    x: string, y: number
    fill?: string
}


export interface Stat {
    titulo: string
    valor: number
    badge: string
    descripcion: string
}


export type TreeMapData = {
    name: string;
    value?: number;
    fill?: string;
    padre?: string;
    children?: TreeMapData[];
}
