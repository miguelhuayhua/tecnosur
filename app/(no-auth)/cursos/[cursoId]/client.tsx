'use client';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Clock, Star, CheckCircle, Home, Book, TextAlignStart, Calendar, CreditCard, Info, Check, Heart, MessageCircleCode } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Status, StatusIndicator } from '@/components/ui/shadcn-io/status';

import Image from 'next/image';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Separator } from '@/components/ui/separator';
import { useCursos } from "@/hooks/use-cursos";
import Link from "next/link";
import { usePriceFormatter } from '@/hooks/use-price-formatter';
import { beneficiosCursos, categorias, categoriasCursos, clases, cursos, docente, edicionesCursos, estudiantes, objetivosCursos, preciosCursos, requisitosCursos, reviewsCursos, usuariosEstudiantes } from "@/prisma/generated";
import { FaWhatsapp } from "react-icons/fa";
import { CursoCard } from "@/app/(auth)/(componentes)/curso-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { OpinionesCurso } from "./review-section";
import { ButtonGroup } from "@/components/ui/button-group";
import { notFound } from "next/navigation";
import { YouTubePlayer } from "@/components/ui/youtube-video-player";
const faqs = [
    {
        question: "¿Qué es TecSur y qué tipos de cursos ofrecen?",
        answer: "TecSur es una plataforma educativa en línea que ofrece cursos prácticos y especializados en diversas áreas como tecnología, negocios, diseño, marketing digital, habilidades blandas, idiomas y más. Todos nuestros cursos están diseñados por expertos en activo."
    },
    {
        question: "¿Cómo me registro en la plataforma?",
        answer: "Puedes crear una cuenta gratuita registrándote con tu cuenta de Google. Una vez registrado, podrás explorar nuestro catálogo completo de cursos y adquirir aquellos que sean de tu interés."
    },
    {
        question: "¿Cómo funcionan los cursos? ¿Puedo estudiar a mi ritmo?",
        answer: "Sí, todos nuestros cursos son 100% online y asíncronos. Compra un curso una vez y tendrás acceso permanente a: videos grabados, materiales descargables, ejercicios prácticos, y foros para consultas. Puedes avanzar según tu disponibilidad de tiempo."
    },
    {
        question: "¿Qué métodos de pago aceptan?",
        answer: "Aceptamos pagos con tarjetas de crédito/débito, transferencias bancarias, y ofrecemos la opción de pagar en cuotas para mayor flexibilidad. Puedes dividir el costo del curso en varios pagos según tu conveniencia."
    },
    {
        question: "¿Ofrecen certificados al finalizar?",
        answer: "Sí, al completar satisfactoriamente un curso, recibirás un certificado digital de participación que podrás compartir en tus redes profesionales como LinkedIn. Estamos trabajando para ofrecer certificación oficial próximamente."
    },
    {
        question: "¿Qué pasa si tengo dudas durante el curso?",
        answer: "Cada curso cuenta con foros de discusión donde puedes hacer preguntas a los instructores y otros estudiantes. También ofrecemos sesiones de consulta en vivo según la programación de cada curso."
    },
    {
        question: "¿Puedo acceder desde cualquier dispositivo?",
        answer: "Sí, nuestra plataforma es completamente responsive. Puedes estudiar desde tu computadora, tablet o smartphone, solo necesitas conexión a internet para acceder a los contenidos."
    }
];
export interface Edicion extends edicionesCursos {
    clases: clases[]; precios: preciosCursos[]; docente: docente, compras: Array<{ usuariosEstudiantesId: string | null }>

}

export interface Review extends reviewsCursos {
    usuario: { usuario: string, avatar: string | null, estudiante: estudiantes | null } | null
}
export interface Curso extends cursos {
    objetivos: objetivosCursos[];
    requisitos: requisitosCursos[];
    beneficios: beneficiosCursos[];
    reviews: Array<Review>;
    categorias: Array<categoriasCursos & { categoria: categorias }>
    ediciones: Array<Edicion>
}
export default function CursoDetailClient({ curso }: { curso: Curso }) {
    const edicionPrincipal = curso.ediciones?.[0];
    if (!edicionPrincipal) return notFound();
    const [searchTerm, setSearchTerm] = useState('');
    const { formatPrice, selectedCurrency } = usePriceFormatter();
    // Extraer datos con nombres correctos de la estructura del servidor
    const categorias = curso.categorias || [];
    const objetivos = curso.objetivos || [];
    const beneficios = curso.beneficios || [];
    const requisitos = curso.requisitos || [];
    // Obtener la edición principal
    // Usar datos de la edición o del curso base
    const fechaInicio = edicionPrincipal?.fechaInicio;
    const fechaFin = edicionPrincipal?.fechaFin;
    const clases = edicionPrincipal?.clases || [];
    const presentacion = clases.find(clase => clase.urlPresentacion && clase.orden == 1);
    // Precios: primero de la edición, luego del curso base
    let precios: preciosCursos[] = [];
    if (edicionPrincipal?.precios?.length > 0) {
        precios = edicionPrincipal.precios;
    }
    const precioDefault = precios.find(p => p.esPrecioDefault) || precios[0];
    // Obtener cursos recomendados usando IDs de categorías
    const { cursos: cursosRecomendados, isLoading } = useCursos({
        categoria: categorias.map((cat: any) => cat.categoria.id).join('&'),
        limit: 4
    });
    // Filtrar clases por búsqueda
    const clasesFiltradas = clases.filter((clase: any) =>
        clase.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clase.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    );
    // Convertir precios a la moneda seleccionada
    const precioConvertido = precioDefault ? formatPrice(precioDefault.precio) : null;
    const precioOriginalConvertido = precioDefault?.precioOriginal ? formatPrice(precioDefault.precioOriginal) : null;
    return (
        <div className="space-y-6  pt-35  px-5">
            <div className="max-w-6xl mx-auto space-y-3">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/"><Home className='size-4' /></BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage className='font-semibold text-muted-foreground text-xs'>
                                {curso.titulo}
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={'outline'} >
                        {categorias[0]?.categoria.nombre || 'Curso'}
                    </Badge>
                    <Badge variant={curso.enVivo ? "secondary" : "default"}>
                        {curso.enVivo ? "En Vivo" : "Grabado"}
                    </Badge>
                </div>

                <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold">
                    Curso: {curso.titulo}
                </h1>

                {/* Mostrar código de edición si está disponible */}
                {edicionPrincipal && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Edición: {edicionPrincipal.codigo}</span> <p className="text-xs border-l pl-2">{edicionPrincipal.descripcion}</p>
                    </div>
                )}
            </div>

            <div className='max-w-6xl mx-auto grid md:grid-cols-2 mb-10 gap-8'>
                {/* Contenido principal del curso */}
                <div className="space-y-6 md:mt-0 order-1 md:order-0 md:pr-8">
                    <h3 className='font-semibold text-muted-foreground'>
                        ¿Qué aprenderás?
                    </h3>
                    <ul className="space-y-4">
                        {objetivos.map((objetivo: any) => (
                            <li key={objetivo.id} className="flex text-muted-foreground text-sm items-center gap-4">
                                <CheckCircle className="size-3.5" />
                                {objetivo.descripcion}
                            </li>
                        ))}
                    </ul>

                    <div className='flex justify-between gap-4'>
                        <div className="flex items-start gap-2">
                            {precioDefault?.esDescuento && (
                                <Badge className="mt-1" variant={'outline'}>
                                    Antes
                                </Badge>
                            )}
                            <span className="font-medium mt-0.5">
                                {selectedCurrency.code}
                            </span>
                            <b className={`text-xl lg:text-4xl ${precioDefault?.esDescuento ? 'line-through decoration-primary mr-4' : ''}`}>
                                {precioDefault?.esDescuento ? precioOriginalConvertido?.value : precioConvertido?.value || '0'}
                            </b>
                        </div>
                        {precioDefault?.esDescuento && (
                            <div className="space-y-2">
                                <div className='flex items-start rounded shadow px-2 bg-primary gap-4 text-white'>
                                    <span className='mt-1'>
                                        {selectedCurrency.code}
                                    </span>
                                    <b className='text-2xl lg:text-4xl'>
                                        {precioConvertido?.value}
                                    </b>
                                </div>
                                <Badge variant={'outline'}>
                                    {precioDefault.porcentajeDescuento}% de descuento
                                </Badge>
                            </div>
                        )}
                    </div>

                    <ButtonGroup className=' w-full'>
                        <Button className="flex-1" asChild>
                            <Link href={`/cursos/${curso.id}/checkout`}>
                                <CreditCard />
                                Comprar Curso
                            </Link>
                        </Button>
                        <Button variant={'outline'} className="flex-1 text-secondary">
                            <FaWhatsapp />
                            Más información
                        </Button>
                    </ButtonGroup>

                    <div>
                        <small className='text-muted-foreground text-xs'>
                            Obtén acceso al curso  y al material dentro de nuestra plataforma
                        </small>
                    </div>
                </div>

                {/* Imagen y detalles del curso */}
                <div className='space-y-4'>
                    {
                        presentacion && presentacion.urlPresentacion ?
                            <div className="relative aspect-video rounded-lg overflow-hidden">
                                <YouTubePlayer expandButtonClassName="hidden"
                                    playButtonClassName="!size-10"
                                    videoId={presentacion.urlPresentacion} customThumbnail={curso.urlMiniatura!} />
                            </div> :
                            <div className="relative aspect-video rounded-lg overflow-hidden">
                                <Image
                                    fill
                                    alt={curso.titulo}
                                    className='object-cover'
                                    src={curso.urlMiniatura || '/placeholder.svg'}
                                    priority
                                />
                            </div>
                    }


                    <div className="flex flex-wrap gap-2 divide-x text-sm">


                        <div className="pr-2">
                            <Status status={curso.enVivo ? 'online' : 'offline'}>
                                <StatusIndicator />
                                {curso.enVivo ? "Clase en vivo" : "Clases grabadas"}
                            </Status>
                        </div>
                        <div className="flex items-center text-xs gap-2 pr-2">
                            <Calendar className='size-4' />
                            {fechaInicio && fechaFin ?
                                `Del ${format(new Date(fechaInicio), 'dd MMM', { locale: es })} al ${format(new Date(fechaFin), 'dd MMM yyyy', { locale: es })}` :
                                'Fechas por definir'}
                        </div>

                        <div className="flex items-center text-xs gap-2">
                            <Clock className='size-4' />
                            {fechaInicio && fechaFin ?
                                `Horario: ${format(new Date(fechaInicio), 'HH:mm')} - ${format(new Date(fechaFin), 'HH:mm')}` :
                                'Horario por definir'}
                        </div>
                    </div>


                </div>
            </div>

            <div className="max-w-6xl mx-auto ">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Columna principal (izquierda) */}
                    <div className="lg:w-2/3 space-y-10 md:pr-8">
                        <h3 className="text-lg md:text-2xl font-bold flex items-center gap-2">
                            <Book /> Contenido del curso
                        </h3>

                        {clasesFiltradas.length > 0 ? (
                            <Accordion type="multiple">
                                {clasesFiltradas.map((clase: any) => (
                                    <AccordionItem key={clase.id} value={clase.id}>
                                        <AccordionTrigger>
                                            {clase.titulo}
                                        </AccordionTrigger>
                                        <AccordionContent className="flex flex-col gap-4 text-balance">
                                            <div className="flex items-center gap-3">
                                                <p>{clase.descripcion}</p>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {clase.duracion ? `${clase.duracion}m` : '--'}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        ) : (
                            <p className="text-muted-foreground">
                                Aún no se cuenta con un temario establecido
                            </p>
                        )}

                        <h3 className="text-lg md:text-2xl font-bold flex items-center gap-2">
                            <TextAlignStart /> Sobre el curso
                        </h3>
                        <p className="text-muted-foreground">
                            {curso.descripcion || 'No cuenta con una descripción'}
                        </p>


                    </div>

                    {/* Barra lateral sticky (derecha) */}
                    <div className="lg:w-1/3">
                        <div className="space-y-5 sticky top-20">
                            <Separator className="block md:hidden" />

                            <div className="hidden lg:block">
                                <div className='flex justify-between items-start pb-4 gap-6'>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between gap-3">
                                            {precioDefault?.esDescuento && (
                                                <div className="flex flex-col gap-1">
                                                    <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                                                        Precio regular
                                                    </Badge>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-sm font-medium text-muted-foreground">
                                                            {selectedCurrency.code}
                                                        </span>
                                                        <span className="text-2xl line-through text-muted-foreground decoration-2">
                                                            {precioOriginalConvertido?.value || '0'}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            <div className={`flex flex-col ${precioDefault?.esDescuento ? 'gap-2' : 'gap-1'}`}>
                                                {!precioDefault?.esDescuento && (
                                                    <span className="text-sm font-medium text-muted-foreground">Precio actual</span>
                                                )}
                                                <div className="flex items-baseline rounded px-2 justify-center bg-primary text-primary-foreground gap-2">
                                                    <span className={`font-medium ${precioDefault?.esDescuento ? 'text-lg' : 'text-sm'}`}>
                                                        {selectedCurrency.code}
                                                    </span>
                                                    <span className={`font-bold ${precioDefault?.esDescuento ? 'text-3xl ' : 'text-3xl'}`}>
                                                        {precioConvertido?.value || '0'}
                                                    </span>
                                                </div>
                                                {precioDefault?.esDescuento && (
                                                    <Badge variant={'outline'}>
                                                        {precioDefault?.porcentajeDescuento}% de descuento
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>


                                    </div>
                                </div>
                                <Separator />

                            </div>

                            <div className="space-y-2">
                                <h3 className="font-medium">
                                    Requisitos
                                </h3>
                                <ul className="space-y-1 list-disc">
                                    {requisitos.length > 0 ? (
                                        requisitos.map((requisito) => (
                                            <li key={requisito.id} className="text-muted-foreground ml-4 text-sm">
                                                {requisito.descripcion}
                                            </li>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            No cuenta aún con requisitos
                                        </p>
                                    )}
                                </ul>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-medium">
                                    ¿Qué obtendrás?
                                </h3>
                                <ul className="space-y-1 list-disc">
                                    {beneficios.length > 0 ? (
                                        beneficios.map((beneficio) => (
                                            <li key={beneficio.id} className="text-muted-foreground ml-4 text-sm">
                                                {beneficio.descripcion}
                                            </li>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            No cuenta aún con requisitos
                                        </p>
                                    )}
                                </ul>
                            </div>
                            <Separator />

                            <h3 className="font-medium">
                                Profesor del curso
                            </h3>
                            <div className="flex items-center gap-2">
                                <Avatar >
                                    <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                                    <AvatarFallback>CN</AvatarFallback>

                                </Avatar>
                                <div className="flex flex-col">
                                    <p className="text-sm font-medium">
                                        {edicionPrincipal.docente.nombre_completo}
                                    </p>
                                    <div className="space-x-2">
                                        <small className="text-muted-foreground">
                                            {edicionPrincipal.docente.especialidad}
                                        </small>
                                        <Badge variant={'outline'}>
                                            {edicionPrincipal.docente.experiencia} años experiencia <Check />
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Separator />
            <OpinionesCurso curso={curso} edicionPrincipal={edicionPrincipal} />
            {/* Cursos Recomendados */}
            <div className="space-y-10 border-t p-10 ">
                <h3 className="text-3xl font-bold text-center tracking-tight">
                    Cursos recomendados
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-6 mx-auto">
                    {cursosRecomendados && cursosRecomendados.length > 0 ? (
                        cursosRecomendados.map((cursoRec: any) => <CursoCard key={cursoRec.id} curso={cursoRec} />)
                    ) : (
                        <p className="text-center text-muted-foreground w-full col-span-5">
                            No hay cursos relacionados
                        </p>
                    )}
                </div>
            </div>
            {/* FAQ Section */}
            <div className="px-5 ">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center space-y-4 mb-12">
                        <h2 className="text-3xl font-bold tracking-tight">
                            Preguntas Frecuentes
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Encuentra respuestas a las dudas más comunes sobre nuestra plataforma estudiantil
                        </p>
                    </div>

                    <Accordion type="single" collapsible className="w-full mb-10">
                        {faqs.map((faq, index) => (
                            <AccordionItem key={index} value={`item-${index}`}>
                                <AccordionTrigger className="text-left">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </div>
    );
}