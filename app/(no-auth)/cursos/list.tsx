'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import useSWR from 'swr';
import { useCursos } from '@/hooks/use-cursos';
import { Button } from '@/components/ui/button';
import { Checkbox } from "@/components/ui/checkbox";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSet,
} from "@/components/ui/field";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Search,
    FilterX,
    Video,
    PlayCircle,
    X,
} from 'lucide-react';
import { categorias } from '@/prisma/generated';
import { CursoGeneral } from '../componentes/curso-general';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CursoGeneralSkeleton } from '../static/curso-general-skeleton';

// Componente de Filtros lateral para Desktop sugerido por el usuario
function FiltersPanel({
    categorias,
    selectedCategorias,
    enVivo,
    descuento,
    onCategoriaChange,
    onEnVivoChange,
    onDescuentoChange,
    onToggleAllCategorias,
    onResetFilters,
    hasActiveFilters
}: {
    categorias: categorias[];
    selectedCategorias: string[];
    enVivo: string;
    descuento: string;
    onCategoriaChange: (categoriaId: string, checked: boolean) => void;
    onEnVivoChange: (value: string) => void;
    onDescuentoChange: (value: string) => void;
    onToggleAllCategorias: () => void;
    onResetFilters: () => void;
    hasActiveFilters: boolean;
}) {
    return (
        <div className="w-full space-y-8">
            <FieldSet>
                <FieldLegend className="flex items-center justify-between border-b pb-2 mb-6">
                    <span className="text-sm font-bold uppercase tracking-widest text-primary">Filtros Avanzados</span>
                    {hasActiveFilters && (
                        <button onClick={onResetFilters} className="text-[10px] text-muted-foreground hover:text-primary transition-colors uppercase font-bold">
                            Limpiar
                        </button>
                    )}
                </FieldLegend>

                <FieldGroup className="space-y-6">
                    {/* Modalidad */}
                    <Field>
                        <FieldLabel className="text-sm font-bold mb-3 block">Modalidad</FieldLabel>
                        <RadioGroup value={enVivo} onValueChange={onEnVivoChange}>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 group">
                                    <RadioGroupItem value="all" id="side-r0" className="border-primary/20" />
                                    <Label htmlFor="side-r0" className="text-sm cursor-pointer group-hover:text-primary transition-colors">Todos los cursos</Label>
                                </div>
                                <div className="flex items-center gap-3 group">
                                    <RadioGroupItem value="true" id="side-r1" className="border-primary/20" />
                                    <Label htmlFor="side-r1" className="text-sm cursor-pointer flex items-center gap-2 group-hover:text-primary transition-colors">
                                        <Video className="size-3 text-primary/60" /> En Vivo
                                    </Label>
                                </div>
                                <div className="flex items-center gap-3 group">
                                    <RadioGroupItem value="false" id="side-r2" className="border-primary/20" />
                                    <Label htmlFor="side-r2" className="text-sm cursor-pointer flex items-center gap-2 group-hover:text-primary transition-colors">
                                        <PlayCircle className="size-3 text-primary/60" /> Grabados
                                    </Label>
                                </div>
                            </div>
                        </RadioGroup>
                    </Field>

                    {/* Descuentos */}
                    <Field>
                        <FieldLabel className="text-sm font-bold mb-3 block">Ofertas</FieldLabel>
                        <RadioGroup value={descuento} onValueChange={onDescuentoChange}>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 group">
                                    <RadioGroupItem value="all" id="side-d0" className="border-primary/20" />
                                    <Label htmlFor="side-d0" className="text-sm cursor-pointer group-hover:text-primary transition-colors">Cualquier precio</Label>
                                </div>
                                <div className="flex items-center gap-3 group">
                                    <RadioGroupItem value="true" id="side-d1" className="border-primary/20" />
                                    <Label htmlFor="side-d1" className="text-sm cursor-pointer group-hover:text-primary transition-colors">Solo en oferta</Label>
                                </div>
                                <div className="flex items-center gap-3 group">
                                    <RadioGroupItem value="false" id="side-d2" className="border-primary/20" />
                                    <Label htmlFor="side-d2" className="text-sm cursor-pointer group-hover:text-primary transition-colors">Precio normal</Label>
                                </div>
                            </div>
                        </RadioGroup>
                    </Field>

                    {/* Categorías */}
                    <Field>
                        <div className="flex items-center justify-between mb-3">
                            <FieldLabel className="text-sm font-bold">Categorías</FieldLabel>
                            {categorias.length > 0 && (
                                <button
                                    type="button"
                                    className="text-[10px] uppercase font-bold text-primary/60 hover:text-primary transition-colors hover:underline"
                                    onClick={onToggleAllCategorias}
                                >
                                    {selectedCategorias.length === categorias.length ? 'Ninguna' : 'Todas'}
                                </button>
                            )}
                        </div>

                        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                            {categorias.map((categoria) => (
                                <div key={categoria.id} className="flex items-center space-x-3 group">
                                    <Checkbox
                                        id={`side-cat-${categoria.id}`}
                                        checked={selectedCategorias.includes(categoria.id)}
                                        onCheckedChange={(checked) => onCategoriaChange(categoria.id, checked as boolean)}
                                        className="border-primary/20 data-[state=checked]:bg-primary"
                                    />
                                    <label
                                        htmlFor={`side-cat-${categoria.id}`}
                                        className="text-sm cursor-pointer flex-1 group-hover:text-primary transition-colors"
                                    >
                                        {categoria.nombre}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </Field>
                </FieldGroup>
            </FieldSet>
        </div>
    );
}

export function ListWithFilters() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Sincronización de estados con URL
    const searchTerm = searchParams.get('search') || '';
    const selectedCategorias = useMemo(() => searchParams.get('categorias')?.split(',').filter(Boolean) || [], [searchParams]);
    const enVivo = searchParams.get('enVivo') || 'all';
    const descuento = searchParams.get('descuento') || 'all';
    const sortBy = searchParams.get('sortBy') || 'creadoEn';
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

    // Fetch categorías
    const { data: categoriasData } = useSWR<categorias[]>(
        '/api/categorias',
        (url: string) => fetch(url).then(res => res.json()),
        { revalidateOnFocus: false }
    );
    const categorias = categoriasData || [];

    // Hook de obtención de datos
    const { cursos, isLoading, error } = useCursos({
        search: searchTerm,
        categoria: selectedCategorias.length > 0 ? selectedCategorias.join(',') : undefined,
        enVivo: enVivo === 'all' ? undefined : enVivo,
        descuento: descuento === 'true' ? true : descuento === 'false' ? false : undefined,
        sortBy,
        sortOrder,
        limit: 12,
    });

    const updateURL = useCallback((updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value && value !== 'all') {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        });
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, [pathname, router, searchParams]);

    const handleCategoriaChange = (id: string, checked: boolean) => {
        let newCats = [...selectedCategorias];
        if (checked) {
            newCats.push(id);
        } else {
            newCats = newCats.filter(catId => catId !== id);
        }
        updateURL({ categorias: newCats.join(',') });
    };

    const toggleAllCategorias = () => {
        if (selectedCategorias.length === categorias.length) {
            updateURL({ categorias: null });
        } else {
            updateURL({ categorias: categorias.map(c => c.id).join(',') });
        }
    };

    const handleResetFilters = () => {
        router.push(pathname, { scroll: false });
    };

    const hasActiveFilters = !!searchTerm || selectedCategorias.length > 0 || enVivo !== 'all' || descuento !== 'all';

    if (error) {
        return (
            <div className="text-center py-12">
                <Card>
                    <CardContent className="py-12">
                        <p className="text-destructive font-medium">Error al cargar los cursos</p>
                        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Reintentar</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-12 w-full lg:container mx-auto">
            {/* Sidebar de filtros visible solo en desktop */}
            <aside className="hidden lg:block w-70 shrink-0">
                <div className="sticky top-28 bg-muted/20 p-6 rounded-3xl border border-primary/5">
                    <FiltersPanel
                        categorias={categorias}
                        selectedCategorias={selectedCategorias}
                        enVivo={enVivo}
                        descuento={descuento}
                        onCategoriaChange={handleCategoriaChange}
                        onEnVivoChange={(v) => updateURL({ enVivo: v })}
                        onDescuentoChange={(v) => updateURL({ descuento: v })}
                        onToggleAllCategorias={toggleAllCategorias}
                        onResetFilters={handleResetFilters}
                        hasActiveFilters={hasActiveFilters}
                    />
                </div>
            </aside>

            {/* Grid de Resultados */}
            <div className="flex-1 space-y-8">
                {/* Info y Reset rápido en móvil */}
                <div className="flex items-center justify-between px-3 md:px-0">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Cursos Disponibles</h2>
                        <p className="text-sm text-muted-foreground">
                            {isLoading ? 'Cargando cursos...' : `${cursos?.length || 0} resultados encontrados`}
                        </p>
                    </div>
                    {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={handleResetFilters} className="text-xs text-muted-foreground hover:text-primary lg:hidden">
                            <X className="size-3 mr-1" /> Limpiar
                        </Button>
                    )}
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => <CursoGeneralSkeleton key={i} />)}
                    </div>
                ) : (
                    <>
                        {cursos && cursos.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {cursos.map((c) => <CursoGeneral key={c.id} curso={c} />)}
                            </div>
                        ) : (
                            <div className="text-center py-24 bg-muted/10 rounded-3xl border-2 border-dashed border-primary/10">
                                <Search className="size-12 text-muted-foreground mx-auto opacity-10 mb-4" />
                                <h3 className="text-xl font-bold">Sin resultados</h3>
                                <p className="text-muted-foreground max-w-xs mx-auto mb-6">No encontramos cursos que coincidan con tu búsqueda. Prueba ajustando los filtros.</p>
                                <Button variant="outline" onClick={handleResetFilters} className="rounded-full">Ver todos los cursos</Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}