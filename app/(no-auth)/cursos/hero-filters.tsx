"use client";

import { Search, X, Clock, SortAsc, SortDesc, SlidersHorizontal, LayoutGrid, Video, PlayCircle } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import useSWR from "swr";
import { categorias } from "@/prisma/generated";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Field, FieldLabel, FieldLegend, FieldGroup, FieldSet } from "@/components/ui/field";

// Reusing FiltersPanel logic for the mobile sheet
function MobileFilters({
    categorias,
    selectedCategorias,
    enVivo,
    descuento,
    updateURL,
    onReset
}: any) {
    return (
        <div className="space-y-8 pt-6 pb-10">
            <FieldSet>
                <FieldLegend className="text-sm font-bold uppercase tracking-widest text-primary mb-4">Modalidad</FieldLegend>
                <RadioGroup value={enVivo} onValueChange={(v) => updateURL({ enVivo: v })}>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <RadioGroupItem value="all" id="mob-r0" />
                            <Label htmlFor="mob-r0">Todos</Label>
                        </div>
                        <div className="flex items-center gap-3">
                            <RadioGroupItem value="true" id="mob-r1" />
                            <Label htmlFor="mob-r1" className="flex items-center gap-2">
                                <Video className="size-4" /> En Vivo
                            </Label>
                        </div>
                        <div className="flex items-center gap-3">
                            <RadioGroupItem value="false" id="mob-r2" />
                            <Label htmlFor="mob-r2" className="flex items-center gap-2">
                                <PlayCircle className="size-4" /> Grabados
                            </Label>
                        </div>
                    </div>
                </RadioGroup>
            </FieldSet>

            <FieldSet>
                <FieldLegend className="text-sm font-bold uppercase tracking-widest text-primary mb-4">Ofertas</FieldLegend>
                <RadioGroup value={descuento} onValueChange={(v) => updateURL({ descuento: v })}>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <RadioGroupItem value="all" id="mob-d0" />
                            <Label htmlFor="mob-d0">Todo</Label>
                        </div>
                        <div className="flex items-center gap-3">
                            <RadioGroupItem value="true" id="mob-d1" />
                            <Label htmlFor="mob-d1">En oferta</Label>
                        </div>
                    </div>
                </RadioGroup>
            </FieldSet>

            <FieldSet>
                <FieldLegend className="text-sm font-bold uppercase tracking-widest text-primary mb-4">Categorías</FieldLegend>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {categorias.map((cat: any) => (
                        <div key={cat.id} className="flex items-center gap-3">
                            <Checkbox
                                id={`mob-cat-${cat.id}`}
                                checked={selectedCategorias.includes(cat.id)}
                                onCheckedChange={(checked) => {
                                    let newCats = checked
                                        ? [...selectedCategorias, cat.id]
                                        : selectedCategorias.filter((id: string) => id !== cat.id);
                                    updateURL({ categorias: newCats.join(',') });
                                }}
                            />
                            <Label htmlFor={`mob-cat-${cat.id}`}>{cat.nombre}</Label>
                        </div>
                    ))}
                </div>
            </FieldSet>

            <Button onClick={onReset} variant="outline" className="w-full">Limpiar Todo</Button>
        </div>
    );
}

export function HeroFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const isFirstRender = useRef(true);

    const [query, setQuery] = useState(searchParams.get('search') || '');
    const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'creadoEn');
    const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc');
    const [enVivo, setEnVivo] = useState(searchParams.get('enVivo') || 'all');
    const [descuento, setDescuento] = useState(searchParams.get('descuento') || 'all');
    const [selectedCategorias, setSelectedCategorias] = useState<string[]>(searchParams.get('categorias')?.split(',').filter(Boolean) || []);

    const { data: categoriasData } = useSWR<categorias[]>(
        '/api/categorias',
        (url: string) => fetch(url).then(res => res.json()),
        { revalidateOnFocus: false }
    );

    const updateFilters = useCallback((updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());

        Object.entries(updates).forEach(([key, value]) => {
            if (value && value !== 'all') {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        });

        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, [router, searchParams, pathname]);

    useEffect(() => {
        setQuery(searchParams.get('search') || '');
        setSortBy(searchParams.get('sortBy') || 'creadoEn');
        setSortOrder(searchParams.get('sortOrder') || 'desc');
        setEnVivo(searchParams.get('enVivo') || 'all');
        setDescuento(searchParams.get('descuento') || 'all');
        setSelectedCategorias(searchParams.get('categorias')?.split(',').filter(Boolean) || []);
    }, [searchParams]);

    // Handle search debounce
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        const timer = setTimeout(() => {
            updateFilters({ search: query });
        }, 500);
        return () => clearTimeout(timer);
    }, [query, updateFilters]);

    return (
        <div className="relative z-30 -mt-20 md:-mt-24 container mx-auto px-4 max-w-5xl">
            <div className="bg-background/95 backdrop-blur-xl p-1.5 md:p-2 rounded-2xl md:rounded-full border border-primary/20 shadow-2xl">
                <div className="flex flex-col md:flex-row items-stretch md:items-center">

                    {/* Search Field */}
                    <div className="relative flex-1 group px-4 py-1.5">
                        <Input
                            placeholder="Buscar cursos por título o docente..."
                            className="h-11 md:h-12 bg-transparent border-none shadow-none focus-visible:ring-0 text-sm md:text-base placeholder:text-muted-foreground/60 w-full"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        {query && (
                            <button
                                type="button"
                                onClick={() => setQuery('')}
                                className="absolute right-8 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                            >
                                <X className="size-4" />
                            </button>
                        )}
                    </div>

                    <div className=" flex items-center gap-2 px-4 lg:border-l border-primary/10 py-1.5 md:py-0">
                        {/* Improved Sorting Section - Together, no internal borders, filling space */}
                        <div className="flex flex-1 items-center gap-2 md:gap-4 w-fit">
                            <Select value={sortBy} onValueChange={(v) => updateFilters({ sortBy: v })}>
                                <SelectTrigger className="flex-1 h-14 shadow-none bg-transparent border-none focus:ring-1 focus:ring-primary/10 hover:bg-muted/30 transition-colors py-8 flex-1 rounded-2xl w-full md:rounded-full">
                                    <div className="flex flex-col items-start justify-center text-left">
                                        <span className="text-[10px] md:text-xs uppercase font-bold text-primary/60 shadow-none leading-none mb-4 ml-3">Ordenar por</span>
                                        <div className="px-3 text-sm md:text-base font-medium leading-none">
                                            <SelectValue placeholder="Recientes" />
                                        </div>
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-primary/10">
                                    <SelectItem value="creadoEn">Recientes</SelectItem>
                                    <SelectItem value="titulo">Título A-Z</SelectItem>
                                    <SelectItem value="actualizadoEn">Actualizados</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={sortOrder} onValueChange={(v) => updateFilters({ sortOrder: v })}>
                                <SelectTrigger className=" h-14 shadow-none bg-transparent border-none focus:ring-1 focus:ring-primary/10 hover:bg-muted/30 transition-colors py-8  rounded-2xl flex-1 w-full md:rounded-full">
                                    <div className="flex flex-col items-start justify-center text-left">
                                        <span className="text-[10px] md:text-[11px] uppercase font-bold text-primary/60 shadow-none leading-none mb-4 ml-3">Orden</span>
                                        <div className="px-3 text-sm md:text-base font-medium leading-none">
                                            <SelectValue placeholder="Desc" />
                                        </div>
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-primary/10">
                                    <SelectItem value="desc">Descendente</SelectItem>
                                    <SelectItem value="asc">Ascendente</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Restore Advanced Filters Button (Notorious only on mobile, but available) */}
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-11 w-11 shrink-0 rounded-full hover:bg-primary/10 lg:hidden ml-1"
                                >
                                    <SlidersHorizontal className="size-5 text-primary" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[300px] sm:w-[400px] rounded-l-3xl overflow-y-auto p-6">
                                <SheetHeader className="mb-2">
                                    <SheetTitle className="text-xl font-bold">Filtros Avanzados</SheetTitle>
                                </SheetHeader>
                                <MobileFilters
                                    categorias={categoriasData || []}
                                    selectedCategorias={selectedCategorias}
                                    enVivo={enVivo}
                                    descuento={descuento}
                                    updateURL={updateFilters}
                                    onReset={() => updateFilters({ categorias: null, enVivo: 'all', descuento: 'all' })}
                                />
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </div>
    );
}
