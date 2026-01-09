"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function HeroSearch() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('search') || '');

    useEffect(() => {
        setQuery(searchParams.get('search') || '');
    }, [searchParams]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams.toString());
        if (query) {
            params.set('search', query);
        } else {
            params.delete('search');
        }
        router.push(`?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="relative z-30 -mt-12 md:-mt-16 container mx-auto px-4 max-w-4xl">
            <form
                onSubmit={handleSearch}
                className="bg-background/95 backdrop-blur-xl p-2 md:p-3 rounded-2xl md:rounded-full shadow-2xl border border-primary/10 flex flex-col md:flex-row gap-2 md:items-center"
            >
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground size-5" />
                    <Input
                        placeholder="¿Qué quieres aprender hoy? Busca por título, descripción o docente..."
                        className="pl-12 bg-transparent border-none focus-visible:ring-0 text-lg h-12 rounded-full placeholder:text-muted-foreground/60"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={() => setQuery('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                        >
                            <X className="size-4" />
                        </button>
                    )}
                </div>
                <Button type="submit" size="lg" className="rounded-full px-8 h-12 text-md font-semibold md:w-auto w-full shadow-lg hover:shadow-primary/20 transition-all">
                    Buscar Cursos
                </Button>
            </form>
        </div>
    );
}
