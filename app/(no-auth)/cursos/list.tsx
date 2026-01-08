'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import useSWR from 'swr';
import { useCursos } from '@/hooks/use-cursos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from "@/components/ui/checkbox";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSeparator,
    FieldSet,
} from "@/components/ui/field";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Search,
    FilterX,
    SlidersHorizontal,
    X,
    Check,
    Video,
    PlayCircle,
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { categorias } from '@/prisma/generated';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { CursoGeneral } from '../componentes/curso-general';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CursoGeneralSkeleton } from '../static/curso-general-skeleton';

// Componente de Filtros actualizado
function FiltersPanel({
    categorias,
    selectedCategorias,
    enVivo,
    onCategoriaChange,
    onEnVivoChange,
    onToggleAllCategorias,
    onResetFilters,
    hasActiveFilters
}: {
    categorias: categorias[];
    isLoadingCategorias: boolean;
    selectedCategorias: string[];
    enVivo: string;
    onCategoriaChange: (categoriaId: string, checked: boolean) => void;
    onEnVivoChange: (value: string) => void;
    onToggleAllCategorias: () => void;
    onResetFilters: () => void;
    hasActiveFilters: boolean;
}) {
    return (
        <div className="w-full relative">
            <FieldSet>
                <FieldLegend className="flex items-center justify-between ">
                    {selectedCategorias.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onToggleAllCategorias}
                        >
                            {selectedCategorias.length === categorias.length ? 'Deseleccionar todas' : 'Seleccionar todas'}
                        </Button>
                    )}
                </FieldLegend>

                <FieldGroup >
                    <Field>
                        <FieldLabel className="text-sm font-medium">Modalidad</FieldLabel>
                        <FieldDescription className="text-xs">
                            Selecciona la modalidad que prefieras
                        </FieldDescription>
                        <RadioGroup value={enVivo} onValueChange={onEnVivoChange}>
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    <RadioGroupItem value="" id="r0" />
                                    <Label htmlFor="r0" className="flex items-center gap-2">
                                        <span>Todos los cursos</span>
                                    </Label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <RadioGroupItem value="true" id="r1" />
                                    <Label htmlFor="r1" className="flex items-center gap-2">
                                        <span>Cursos en Vivo</span>
                                    </Label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <RadioGroupItem value="false" id="r2" />
                                    <Label htmlFor="r2" className="flex items-center gap-2">
                                        <span>Cursos Grabados</span>
                                    </Label>
                                </div>
                            </div>
                        </RadioGroup>
                    </Field>

                    <Field>
                        <FieldLabel className="text-sm font-medium">Categorías</FieldLabel>
                        <FieldDescription className="text-xs">
                            Selecciona una o más categorías
                        </FieldDescription>

                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                            {categorias.map((categoria) => (
                                <div key={categoria.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`categoria-${categoria.id}`}
                                        checked={selectedCategorias.includes(categoria.id)}
                                        onCheckedChange={(checked) =>
                                            onCategoriaChange(categoria.id, checked as boolean)
                                        }
                                    />
                                    <label
                                        htmlFor={`categoria-${categoria.id}`}
                                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1 py-1"
                                    >
                                        {categoria.nombre}
                                    </label>
                                </div>
                            ))}

                            {categorias.length === 0 && (
                                <p className="text-sm text-muted-foreground py-2">
                                    No hay categorías disponibles
                                </p>
                            )}
                        </div>
                    </Field>
                </FieldGroup>

                <FieldGroup >
                    <Button
                        size={'sm'}
                        onClick={onResetFilters}
                        disabled={!hasActiveFilters}
                    >
                        Limpiar filtros
                    </Button>
                </FieldGroup>
            </FieldSet>
        </div>
    );
}

export function ListWithFilters() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Obtener valores iniciales de los search params
    const initialSearch = searchParams.get('search') || '';
    const initialCategorias = searchParams.get('categorias')?.split(',').filter(Boolean) || [];
    const initialSortBy = searchParams.get('sortBy') || 'creadoEn';
    const initialEnVivo = searchParams.get('enVivo') || '';
    const initialSortOrder = searchParams.get('sortOrder') || 'desc';
    const [enVivo, setEnVivo] = useState(initialEnVivo);
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [selectedCategorias, setSelectedCategorias] = useState<string[]>(initialCategorias);
    const [sortBy, setSortBy] = useState(initialSortBy);
    const [sortOrder, setSortOrder] = useState(initialSortOrder);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    // Fetch categorías usando SWR
    const { data: categoriasData, isLoading: isLoadingCategorias } = useSWR<categorias[]>(
        '/api/categorias',
        (url: string) => fetch(url).then(res => res.json()),
        {
            revalidateOnFocus: false,
        }
    );

    const categorias = categoriasData || [];

    // Actualizar search params cuando cambien los filtros
    useEffect(() => {
        const params = new URLSearchParams();

        if (searchTerm) params.set('search', searchTerm);
        if (enVivo) params.set('enVivo', enVivo);
        if (selectedCategorias.length > 0) params.set('categorias', selectedCategorias.join(','));
        if (sortBy !== 'creadoEn') params.set('sortBy', sortBy);
        if (sortOrder !== 'desc') params.set('sortOrder', sortOrder);

        const newUrl = params.toString() ? `?${params.toString()}` : '';
        const currentUrl = searchParams.toString() ? `?${searchParams.toString()}` : '';

        if (currentUrl !== newUrl) {
            router.replace(`${pathname}${newUrl}`, { scroll: false });
        }
    }, [searchTerm, selectedCategorias, sortBy, enVivo, sortOrder, router, pathname, searchParams]);

    // Usar el hook con los filtros - incluyendo enVivo
    const { cursos, isLoading, error } = useCursos({
        search: searchTerm,
        categoria: selectedCategorias.length > 0 ? selectedCategorias.join(',') : undefined,
        enVivo: enVivo || undefined,
        sortBy,
        sortOrder: sortOrder as 'asc' | 'desc',
        limit: 12,
    });

    // Manejar selección/deselección de categorías
    const handleCategoriaChange = useCallback((categoriaId: string, checked: boolean) => {
        if (checked) {
            setSelectedCategorias(prev => [...prev, categoriaId]);
        } else {
            setSelectedCategorias(prev => prev.filter(id => id !== categoriaId));
        }
    }, []);

    // Manejar cambio de modalidad (enVivo)
    const handleEnVivoChange = useCallback((value: string) => {
        setEnVivo(value);
    }, []);

    // Seleccionar/deseleccionar todas las categorías
    const toggleAllCategorias = useCallback(() => {
        if (selectedCategorias.length === categorias.length) {
            setSelectedCategorias([]);
        } else {
            setSelectedCategorias(categorias.map(cat => cat.id));
        }
    }, [categorias, selectedCategorias]);

    const handleResetFilters = useCallback(() => {
        setSearchTerm('');
        setSelectedCategorias([]);
        setSortBy('creadoEn');
        setSortOrder('desc');
        setEnVivo('');
        setIsMobileFiltersOpen(false);
    }, []);

    // Limpiar búsqueda individualmente
    const handleClearSearch = useCallback(() => {
        setSearchTerm('');
    }, []);

    // Limpiar categoría individualmente
    const handleRemoveCategoria = useCallback((categoriaId: string) => {
        setSelectedCategorias(prev => prev.filter(id => id !== categoriaId));
    }, []);

    // Limpiar filtro de modalidad individualmente
    const handleRemoveEnVivo = useCallback(() => {
        setEnVivo('');
    }, []);

    const hasActiveFilters = !!searchTerm || selectedCategorias.length > 0 || !!enVivo;

    // Categorías seleccionadas para mostrar en el resumen
    const selectedCategoriasNombres = useMemo(() => {
        return (categorias || [])
            .filter(cat => selectedCategorias.includes(cat.id))
            .map(cat => cat.nombre);
    }, [categorias, selectedCategorias]);

    // Texto para mostrar filtro de modalidad
    const enVivoText = useMemo(() => {
        if (enVivo === 'true') return 'En Vivo';
        if (enVivo === 'false') return 'Grabados';
        return '';
    }, [enVivo]);

    // Icono para filtro de modalidad
    const enVivoIcon = useMemo(() => {
        if (enVivo === 'true') return <Video className="h-3 w-3" />;
        if (enVivo === 'false') return <PlayCircle className="h-3 w-3" />;
        return null;
    }, [enVivo]);

    // Contador de filtros activos para el badge
    const activeFiltersCount = (searchTerm ? 1 : 0) + selectedCategorias.length + (enVivo ? 1 : 0);

    if (error) {
        return (
            <div className="text-center py-12">
                <Card>
                    <CardContent className="py-12">
                        <p className="text-destructive font-medium">Error al cargar los cursos</p>
                        <p className="text-muted-foreground text-sm mt-2">
                            Por favor, intenta nuevamente
                        </p>
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => window.location.reload()}
                        >
                            Reintentar
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-4 gap-10 lg:container mx-auto">
            <Card className='col-span-4'>
                <CardContent className='pb-4'>
                    <div className="flex flex-col lg:flex-row gap-4 lg:items-start lg:justify-between">
                        {/* Búsqueda */}
                        <Field >
                            <FieldLabel className="text-sm">Buscar cursos</FieldLabel>
                            <InputGroup>
                                <InputGroupAddon align={'inline-start'}>
                                    <InputGroupButton >
                                        <Search></Search>
                                    </InputGroupButton>
                                </InputGroupAddon>
                                <InputGroupInput
                                    placeholder="Buscar por título, descripción o docente..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)} />
                                {searchTerm && (
                                    <InputGroupAddon align={'inline-end'}>
                                        <InputGroupButton
                                            type="button"
                                            onClick={handleClearSearch}
                                            aria-label="Limpiar búsqueda"
                                        >
                                            <X />
                                        </InputGroupButton>
                                    </InputGroupAddon>
                                )}
                            </InputGroup>
                        </Field>

                        {/* Controles de ordenamiento */}
                        <div className="flex flex-row items-center gap-3">
                            <Field className="w-50">
                                <FieldLabel className="text-sm">Ordenar por</FieldLabel>
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="w-full sm:w-[140px]">
                                        <SelectValue placeholder="Ordenar por" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="creadoEn">Fecha creación</SelectItem>
                                        <SelectItem value="titulo">Título A-Z</SelectItem>
                                        <SelectItem value="actualizadoEn">Última actualización</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>

                            <Field className="w-50">
                                <FieldLabel className="text-sm">Orden</FieldLabel>
                                <Select value={sortOrder} onValueChange={setSortOrder}>
                                    <SelectTrigger className="w-full sm:w-[120px]">
                                        <SelectValue placeholder="Orden" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="desc">Más reciente</SelectItem>
                                        <SelectItem value="asc">Más antiguo</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>

                            {/* Botón filtros para móvil con Sheet */}
                            <Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
                                <SheetTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="lg:hidden relative self-end"
                                    >
                                        <SlidersHorizontal />
                                        Filtros
                                        {activeFiltersCount > 0 && (
                                            <Badge
                                                variant="secondary"
                                                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                                            >
                                                {activeFiltersCount}
                                            </Badge>
                                        )}
                                    </Button>
                                </SheetTrigger>
                                <SheetContent className="w-full ">
                                    <SheetHeader>
                                        <SheetTitle>Filtros</SheetTitle>
                                    </SheetHeader>
                                    <div className='px-4' >
                                        <FiltersPanel
                                            categorias={categorias}
                                            isLoadingCategorias={isLoadingCategorias}
                                            selectedCategorias={selectedCategorias}
                                            enVivo={enVivo}
                                            onCategoriaChange={handleCategoriaChange}
                                            onEnVivoChange={handleEnVivoChange}
                                            onToggleAllCategorias={toggleAllCategorias}
                                            onResetFilters={handleResetFilters}
                                            hasActiveFilters={hasActiveFilters}
                                        />
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>

                    {/* Resumen de filtros activos */}
                    {hasActiveFilters && (
                        <div className="bg-muted/50 mt-2 rounded-lg">
                            <div className="flex flex-wrap items-center gap-2 p-2 text-sm">
                                <span className="font-medium text-xs">Filtros activos:</span>

                                {searchTerm && (
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                        <Search className="h-3 w-3" />
                                        <span className="truncate max-w-[150px]">"{searchTerm}"</span>
                                        <button
                                            onClick={handleClearSearch}
                                            className="hover:bg-secondary-foreground/20 rounded-full w-4 h-4 flex items-center justify-center ml-1"
                                            aria-label="Remover búsqueda"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                )}

                                {enVivo && (
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                        <span>{enVivoText}</span>
                                        <button
                                            onClick={handleRemoveEnVivo}
                                            className="hover:bg-secondary-foreground/20 rounded-full w-4 h-4 flex items-center justify-center ml-1"
                                            aria-label={`Remover filtro ${enVivoText}`}
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                )}

                                {selectedCategoriasNombres.map((nombre, index) => {
                                    const categoriaId = categorias.find(cat => cat.nombre === nombre)?.id;
                                    return (
                                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                            <span>{nombre}</span>
                                            <button
                                                onClick={() => categoriaId && handleRemoveCategoria(categoriaId)}
                                                className="hover:bg-secondary-foreground/20 rounded-full w-4 h-4 flex items-center justify-center ml-1"
                                                aria-label={`Remover categoría ${nombre}`}
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    );
                                })}

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleResetFilters}
                                    className="ml-auto flex items-center gap-1 h-7 text-xs"
                                >
                                    <FilterX className="h-3 w-3" />
                                    Limpiar todo
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Panel de filtros - Desktop */}
            <div className="hidden lg:block flex-shrink-0 col-span-1">
                <FiltersPanel
                    categorias={categorias}
                    isLoadingCategorias={isLoadingCategorias}
                    selectedCategorias={selectedCategorias}
                    enVivo={enVivo}
                    onCategoriaChange={handleCategoriaChange}
                    onEnVivoChange={handleEnVivoChange}
                    onToggleAllCategorias={toggleAllCategorias}
                    onResetFilters={handleResetFilters}
                    hasActiveFilters={hasActiveFilters}
                />
            </div>

            {/* Contenido principal */}
            <div className="col-span-4 lg:col-span-3 space-y-6">
                {/* Información de resultados */}
                <div className="flex flex-col">
                    <h2 className="text-2xl font-bold">
                        {enVivo === 'true' ? 'Cursos en Vivo' :
                            enVivo === 'false' ? 'Cursos Grabados' :
                                'Cursos Disponibles'}
                    </h2>
                    {!isLoading && (
                        <p className="text-sm text-muted-foreground mt-1">
                            {cursos.length > 0
                                ? `${cursos.length} curso${cursos.length !== 1 ? 's' : ''} encontrado${cursos.length !== 1 ? 's' : ''}`
                                : 'No se encontraron cursos'
                            }
                            {hasActiveFilters && ' con los filtros aplicados'}
                        </p>
                    )}
                </div>

                {/* Lista de cursos */}
                {isLoading ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                        {[...Array(6)].map((_, index) => (
                            <CursoGeneralSkeleton key={index} />
                        ))}
                    </div>
                ) : (
                    <>
                        {cursos.length > 0 ? (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                                {cursos.map((curso) => (
                                    <CursoGeneral
                                        key={curso.id}
                                        curso={curso}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className='flex flex-col items-center'>
                                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                    <Search className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">
                                    No se encontraron cursos
                                </h3>
                                <p className="text-muted-foreground text-center text-sm mb-6 max-w-md mx-auto">
                                    {hasActiveFilters
                                        ? 'No hay cursos que coincidan con los filtros aplicados. Intenta con otros criterios.'
                                        : 'Actualmente no hay cursos disponibles. Vuelve pronto para nuevas ediciones.'
                                    }
                                </p>
                                {hasActiveFilters && (
                                    <Button
                                        variant="default"
                                        onClick={handleResetFilters}
                                    >
                                        Ver todos los cursos
                                    </Button>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}