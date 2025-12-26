"use client";

import { useState, useRef, useEffect } from 'react';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Loader2, BookOpen, Calendar, DollarSign } from "lucide-react";
import { useCursosSearch } from '@/hooks/use-cursos-search';
import { useRouter } from 'next/navigation';

export default function InputSearch() {
    const [searchQuery, setSearchQuery] = useState('');
    const [open, setOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const { cursos, isLoading, error } = useCursosSearch(searchQuery);

    // Cerrar popover cuando se hace clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Abrir popover cuando hay query válido
    useEffect(() => {
        if (searchQuery.trim().length >= 2) {
            setOpen(true);
        } else {
            setOpen(false);
        }
    }, [searchQuery]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleCursoClick = (cursoId: number) => {
        router.push(`/cursos/${cursoId}`);
        setOpen(false);
        setSearchQuery('');
    };

    const handleSearch = () => {
        if (searchQuery.trim()) {
            router.push(`/cursos?search=${encodeURIComponent(searchQuery)}`);
            setOpen(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
        if (e.key === 'Escape') {
            setOpen(false);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div ref={inputRef}>
                    <InputGroup className='rounded-full hidden lg:flex'>
                        <InputGroupInput
                            placeholder='¿Qué estás buscando?'
                            className='w-xs'
                            value={searchQuery}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
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
                </div>
            </PopoverTrigger>

            <PopoverContent
                className="w-[400px] p-0"
                align="start"
                sideOffset={8}
            >
                {isLoading ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                        <Loader2 className="animate-spin mx-auto mb-2" />
                        Buscando cursos...
                    </div>
                ) : error ? (
                    <div className="p-4 text-center text-sm text-red-500">
                        Error al buscar cursos
                    </div>
                ) : cursos.length > 0 ? (
                    <div className="max-h-[400px] overflow-y-auto">
                        <div className="p-2">
                            <p className="text-xs text-gray-500 px-2 py-1 mb-1">
                                {cursos.length} resultado{cursos.length !== 1 ? 's' : ''} encontrado{cursos.length !== 1 ? 's' : ''}
                            </p>
                            {cursos.map((curso) => (
                                <button
                                    key={curso.id}
                                    onClick={() => handleCursoClick(curso.id)}
                                    className="w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-start gap-3">
                                        {curso.imagenUrl && (
                                            <img
                                                src={curso.imagenUrl}
                                                alt={curso.titulo}
                                                className="w-16 h-16 object-cover rounded"
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-sm line-clamp-1">
                                                {curso.titulo}
                                            </h3>
                                            <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                                                {curso.descripcion}
                                            </p>
                                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                                {curso.ediciones?.[0] && (
                                                    <>
                                                        <span className="flex items-center gap-1">
                                                            <DollarSign className="w-3 h-3" />
                                                            {curso.ediciones[0].precios?.[0]?.precio || 'Consultar'}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {curso.ediciones[0].modalidad}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div className="border-t p-2">
                            <button
                                onClick={handleSearch}
                                className="w-full text-center text-sm text-blue-600 hover:text-blue-700 py-2"
                            >
                                Ver todos los resultados →
                            </button>
                        </div>
                    </div>
                ) : searchQuery.trim().length >= 2 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                        <BookOpen className="mx-auto mb-2 text-gray-400" />
                        No se encontraron cursos para "{searchQuery}"
                    </div>
                ) : null}
            </PopoverContent>
        </Popover>
    );
}