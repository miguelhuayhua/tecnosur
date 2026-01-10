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
import { useCurrency } from '@/hooks/use-currency';
import { usePriceFormatter } from '@/hooks/use-price-formatter';

export default function InputSearchMobile({ onClose }: { onClose: () => void }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [showResults, setShowResults] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const { convertAndFormatPrice } = useCurrency();

    const { cursos, isLoading, error } = useCursosSearch(searchQuery);

    useEffect(() => {
        if (searchQuery.trim().length >= 2) {
            setShowResults(true);
        } else {
            setShowResults(false);
        }
    }, [searchQuery]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleCursoClick = (cursoId: string) => {
        router.push(`/cursos/${cursoId}`);
        onClose();
    };

    const handleSearch = () => {
        if (searchQuery.trim()) {
            router.push(`/cursos?search=${encodeURIComponent(searchQuery)}`);
            onClose();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
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
        <div className="flex flex-col h-full gap-4 p-3">
            <InputGroup className='rounded-xl border shadow-sm px-2 bg-background'>
                <InputGroupInput
                    ref={inputRef}
                    autoFocus
                    placeholder='¿Qué estás buscando?'
                    className='h-12 text-base border-none focus-visible:ring-0 focus-visible:ring-offset-0 px-2'
                    value={searchQuery}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                />
                <InputGroupAddon align={'inline-end'}>
                    <InputGroupButton onClick={handleSearch} className="h-12 px-4">
                        {isLoading ? (
                            <Loader2 className="animate-spin size-5" />
                        ) : (
                            <Search className="size-5" />
                        )}
                    </InputGroupButton>
                </InputGroupAddon>
            </InputGroup>

            <div className="flex-1 min-h-0">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center gap-6 py-20">
                        <Loader variant='cube' />
                        <p className="text-sm text-muted-foreground animate-pulse">Buscando cursos increíbles...</p>
                    </div>
                ) : error ? (
                    <div className="p-6 text-center bg-destructive/5 rounded-xl border border-destructive/10">
                        <p className="text-sm text-destructive font-medium">No pudimos conectar con la búsqueda</p>
                    </div>
                ) : cursos.length > 0 ? (
                    <ScrollArea className="h-full pr-4">
                        <div className="space-y-3 pb-20">
                            {cursos.map((curso) => {
                                const edicion = curso.ediciones[0];
                                const precio = edicion?.precios[0];

                                return (
                                    <div
                                        key={curso.id}
                                        className="group relative bg-card hover:bg-accent/50 border rounded-2xl p-3 transition-all duration-300 cursor-pointer active:scale-[0.98]"
                                        onClick={() => handleCursoClick(curso.id)}
                                    >
                                        <div className="flex gap-4">
                                            {curso.urlMiniatura ? (
                                                <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 shadow-sm">
                                                    <img
                                                        src={curso.urlMiniatura}
                                                        alt={curso.titulo}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-20 h-20 bg-muted rounded-xl flex items-center justify-center shrink-0">
                                                    <BookOpen className="w-8 h-8 text-muted-foreground/50" />
                                                </div>
                                            )}

                                            <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h3 className="font-bold text-sm leading-tight line-clamp-2">
                                                        {curso.titulo} <Badge variant='outline'>

                                                            {curso.enVivo ? "En Vivo" : "Grabado"}
                                                        </Badge>
                                                    </h3>

                                                </div>

                                                {edicion && (
                                                    <div className="flex items-center gap-4 mt-1">
                                                        {precio && (() => {
                                                            const price = convertAndFormatPrice(precio.precio);
                                                            return (
                                                                <div className="flex items-center gap-1.5 text-primary text-sm font-bold">
                                                                    <span>{price.value} {price.code}</span>
                                                                </div>
                                                            )
                                                        })()}
                                                        <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                                                            <Calendar className="w-3 h-3 opacity-70" />
                                                            <span>{formatDate(edicion.fechaInicio)}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="self-center">
                                                <ArrowRight className="size-4 text-muted-foreground/30" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                ) : searchQuery.trim().length >= 2 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                        <div className="rounded-full bg-muted/50 p-6 mb-4">
                            <Search className="h-10 w-10 text-muted-foreground/30" />
                        </div>
                        <h3 className="font-bold text-lg mb-1">Sin resultados</h3>
                        <p className="text-sm text-muted-foreground">
                            No encontramos nada para <span className="text-foreground font-semibold">"{searchQuery}"</span>. Intenta con algo más general.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 px-10 text-center opacity-50">
                        <Search className="h-12 w-12 mb-4 text-muted-foreground/20" />
                        <p className="text-sm font-medium">Escribe al menos 2 letras para empezar a buscar</p>
                    </div>
                )}
            </div>
        </div>
    );
}
