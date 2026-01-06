"use client";

import { useState, useRef, useEffect } from 'react';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Loader2, BookOpen, Calendar, DollarSign, Video, ArrowRight } from "lucide-react";
import { useCursosSearch } from '@/hooks/use-cursos-search';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Loader } from '@/components/ui/loader';

export default function InputSearch() {
    const [searchQuery, setSearchQuery] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const { cursos, isLoading, error } = useCursosSearch(searchQuery);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                inputRef.current &&
                !inputRef.current.contains(event.target as Node) &&
                resultsRef.current &&
                !resultsRef.current.contains(event.target as Node)
            ) {
                setShowResults(false);
                setIsInputFocused(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (searchQuery.trim().length >= 2 && isInputFocused) {
            setShowResults(true);
        } else {
            setShowResults(false);
        }
    }, [searchQuery, isInputFocused]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleInputFocus = () => {
        setIsInputFocused(true);
        if (searchQuery.trim().length >= 2) {
            setShowResults(true);
        }
    };

    const handleInputBlur = (e: React.FocusEvent) => {
        // Solo perder el foco si el clic fue fuera del input y del panel de resultados
        if (!e.relatedTarget ||
            (resultsRef.current && !resultsRef.current.contains(e.relatedTarget as Node))) {
            // El timeout permite que los clics en los resultados se procesen primero
            setTimeout(() => {
                setIsInputFocused(false);
                setShowResults(false);
            }, 100);
        }
    };

    const handleCursoClick = (cursoId: string) => {
        router.push(`/cursos/${cursoId}`);
        setShowResults(false);
        setSearchQuery('');
        if (inputRef.current) {
            inputRef.current.blur();
        }
    };

    const handleSearch = () => {
        if (searchQuery.trim()) {
            router.push(`/cursos?search=${encodeURIComponent(searchQuery)}`);
            setShowResults(false);
            if (inputRef.current) {
                inputRef.current.blur();
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
        if (e.key === 'Escape') {
            setShowResults(false);
            if (inputRef.current) {
                inputRef.current.blur();
            }
        }
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="relative hidden lg:block" ref={inputRef}>
            <InputGroup className='rounded-full'>
                <InputGroupInput
                    ref={inputRef}
                    placeholder='¿Qué estás buscando?'
                    className='w-xs xl:w-md'
                    value={searchQuery}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                />
                <InputGroupAddon align={'inline-end'}>
                    <InputGroupButton onClick={handleSearch}>
                        {isLoading ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            <Search />
                        )}
                    </InputGroupButton>
                </InputGroupAddon>
            </InputGroup>

            {/* Panel de resultados */}
            {showResults && (
                <div
                    ref={resultsRef}
                    className="absolute top-full left-0 right-0 mt-2 w-[400px] max-w-full bg-background border rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                    style={{ minWidth: inputRef.current?.offsetWidth }}
                >
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center gap-6 py-10 p-6">
                            <Loader variant='cube' />

                            <p className="text-sm text-muted-foreground">Buscando cursos...</p>
                        </div>
                    ) : error ? (
                        <div className="p-6 text-center">
                            <p className="text-sm text-destructive">Error al buscar cursos</p>
                        </div>
                    ) : cursos.length > 0 ? (
                        <>
                            <div className="px-4 py-3 border-b bg-muted/50 rounded-t-lg">
                                <p className="text-xs text-muted-foreground">
                                    {cursos.length} resultado{cursos.length !== 1 ? 's' : ''} encontrado{cursos.length !== 1 ? 's' : ''}
                                </p>
                            </div>

                            <ScrollArea className="max-h-[400px]">
                                <div className="p-2 space-y-1">
                                    {cursos.map((curso) => {
                                        const edicion = curso.ediciones[0];
                                        const precio = edicion?.precios[0];

                                        return (
                                            <Card
                                                key={curso.id}
                                                className="hover:bg-accent transition-colors cursor-pointer"
                                                onClick={() => handleCursoClick(curso.id)}
                                                onMouseDown={(e) => e.preventDefault()} // Previene el blur del input
                                            >
                                                <CardContent>
                                                    <div className="flex items-start gap-3">
                                                        {curso.urlMiniatura ? (
                                                            <img
                                                                src={curso.urlMiniatura}
                                                                alt={curso.titulo}
                                                                className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                                                            />
                                                        ) : (
                                                            <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                                                                <BookOpen className="w-6 h-6 text-muted-foreground" />
                                                            </div>
                                                        )}

                                                        <div className="flex-1 min-w-0 space-y-1.5">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <h3 className="font-semibold text-sm line-clamp-1 flex-1">
                                                                    {curso.titulo}
                                                                </h3>
                                                                {curso.enVivo && (
                                                                    <Badge variant="destructive" className="flex items-center gap-1 px-2 py-0 text-xs shrink-0">
                                                                        <Video className="w-3 h-3" />
                                                                        En vivo
                                                                    </Badge>
                                                                )}
                                                            </div>

                                                            <p className="text-xs text-muted-foreground  line-clamp-1">
                                                                {curso.descripcion}
                                                            </p>

                                                            {edicion && (
                                                                <div className="flex items-center gap-3 pt-0.5">
                                                                    {precio && (
                                                                        <div className="flex items-center gap-1 text-xs font-semibold">
                                                                            <DollarSign className="w-3 h-3" />
                                                                            <span>{precio.precio} {precio.moneda}</span>
                                                                        </div>
                                                                    )}
                                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                        <Calendar className="w-3 h-3" />
                                                                        <span>{formatDate(edicion.fechaInicio)}</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </ScrollArea>

                        </>
                    ) : searchQuery.trim().length >= 2 ? (
                        <div className="flex flex-col items-center justify-center p-8 rounded-lg">
                            <div className="rounded-full bg-muted p-3 mb-3">
                                <BookOpen className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground text-center">
                                No se encontraron cursos para <span className="font-semibold">"{searchQuery}"</span>
                            </p>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
}