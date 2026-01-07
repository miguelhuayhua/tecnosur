'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupText,
    InputGroupTextarea,
} from '@/components/ui/input-group';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ArrowUpIcon, Heart, MessageCircleCode, Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useParams, useRouter } from 'next/navigation';
import { estudiantes, reviewsCursos, usuariosEstudiantes } from '@/prisma/generated';
import ReviewComponent from './review';
import { ButtonGroup } from '@/components/ui/button-group';
import Link from 'next/link';
import { Curso, Edicion } from './client';


export function OpinionesCurso({ curso, edicionPrincipal }: { curso: Curso, edicionPrincipal: Edicion }) {
    const { data: session } = useSession();
    const { cursoId } = useParams();
    const [showOpinion, setShowOpinion] = useState(false);
    const [opinionText, setOpinionText] = useState('');
    const [selectedRating, setSelectedRating] = useState(5);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const router = useRouter();

    // Verificar si el usuario ya opinó
    const userAlreadyReviewed = curso.reviews.some(
        review => review.usuariosEstudiantesId === session?.user?.id
    );

    const hasPurchased = session?.user?.id &&
        edicionPrincipal.compras.find(value => value.usuariosEstudiantesId === session.user.id);

    const totalRating = curso.reviews.reduce((total, value) => total + value.rating, 0);
    const averageRating = curso.reviews.length > 0
        ? (totalRating / curso.reviews.length).toPrecision(2)
        : '0.0';

    const charactersLeft = 300 - opinionText.length;

    const openConfirmDialog = () => {
        if (!session?.user?.id) {
            toast.error('Debes iniciar sesión');
            return;
        }

        if (!opinionText.trim() || opinionText.length < 10) {
            toast.error('Escribe al menos 10 caracteres');
            return;
        }

        if (userAlreadyReviewed) {
            toast.error('Ya has opinado este curso. Solo puedes opinar una vez.');
            return;
        }

        setShowConfirmDialog(true);
    };

    const confirmSubmit = async () => {
        if (userAlreadyReviewed) {
            toast.error('Ya has opinado este curso');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/reviews/crear', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    cursoId: curso.id,
                    rating: selectedRating,
                    comentario: opinionText.trim()
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || data.message || 'Error al enviar');
            }

            toast.success('¡Opinión enviada!', {
                description: 'Tu opinión ha sido publicada exitosamente.',
                duration: 3000,
            });

            // Resetear todo
            setOpinionText('');
            setSelectedRating(5);
            setShowOpinion(false);
            setShowConfirmDialog(false);

            // Recargar la página para mostrar la nueva opinión
            setTimeout(() => {
                router.refresh();
            }, 1000);

        } catch (error: any) {
            console.error('Error:', error);

            if (error.message.includes('Ya opinaste')) {
                toast.error('Error', {
                    description: 'Ya has opinado este curso. Solo puedes opinar una vez.',
                    duration: 4000,
                });
            } else {
                toast.error('Error', {
                    description: error.message || 'No se pudo enviar tu opinión',
                    duration: 4000,
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <section className="max-w-6xl mx-auto space-y-5">
                {/* Encabezado */}
                <div className="flex items-center justify-between">
                    <Badge variant={'outline'} className="text-green-600 border-green-600">
                        <Heart className="h-3.5 w-3.5 mr-1.5" />
                        Opiniones del curso
                    </Badge>

                    {session && hasPurchased  && (
                        <Button
                            variant={'outline'}
                            size="sm"
                            onClick={() => setShowOpinion(!showOpinion)}
                        >
                            <MessageCircleCode />
                            {showOpinion ? 'Cancelar' : `${userAlreadyReviewed?"Cambiar mi reseña":"Publicar nueva reseña"}`}

                        </Button>
                    )}

                  
                </div>

                {/* Formulario de opinión */}
                {showOpinion && !userAlreadyReviewed && (
                    <div className="space-y-3">
                        <p className="text-md font-medium">Tu calificación</p>
                        <InputGroup>
                            <InputGroupTextarea
                                placeholder="Comparte tu experiencia con el curso..."
                                value={opinionText}
                                onChange={(e) => setOpinionText(e.target.value)}
                                maxLength={300}
                                disabled={isSubmitting || userAlreadyReviewed}
                            />
                            <InputGroupAddon align="block-end">
                                <InputGroupText className={`text-xs ${charactersLeft < 30 ? 'text-destructive' : 'text-muted-foreground'}`}>
                                    {charactersLeft} caracteres restantes
                                </InputGroupText>
                                <div className='ml-auto flex gap-2 items-center'>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setSelectedRating(star)}
                                                disabled={isSubmitting || userAlreadyReviewed}
                                                className={`cursor-pointer hover:scale-110 transition-transform ${isSubmitting || userAlreadyReviewed ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <Star
                                                    className={`size-4 ${star <= selectedRating
                                                        ? 'text-yellow-500 fill-yellow-500'
                                                        : 'text-gray-300 fill-gray-300'
                                                        }`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                    <InputGroupButton
                                        variant="default"
                                        className='ml-2'
                                        onClick={openConfirmDialog}
                                        disabled={isSubmitting || opinionText.trim().length < 10 || charactersLeft < 0 || userAlreadyReviewed}
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="animate-spin" />
                                        ) : (
                                            <ArrowUpIcon />
                                        )}
                                        Enviar
                                    </InputGroupButton>
                                </div>
                            </InputGroupAddon>
                        </InputGroup>

                        {/* Mensaje informativo */}
                        <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-md border border-blue-100">
                            <p className="font-medium text-blue-800 mb-1">Importante:</p>
                            <ul className="list-disc ml-4 space-y-1">
                                <li>Solo puedes opinar una vez por curso</li>
                                <li>No podrás editar ni eliminar tu opinión después de publicarla</li>
                                <li>Tu opinión será visible para todos los usuarios</li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* Calificación promedio */}
                <div className="flex items-center">
                    <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={`h-5 w-5 ${star <= parseFloat(averageRating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300 fill-gray-300'
                                    }`}
                            />
                        ))}
                    </div>
                    <span className="font-bold text-lg ml-2">
                        {averageRating} -
                    </span>
                    <span className="font-bold text-lg ml-2">
                        {curso.reviews.length} opiniones
                    </span>
                </div>

                {/* Lista de opiniones */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                    {curso.reviews.length > 0 ? (
                        <>
                            {
                                curso.reviews.map((review) => (
                                    <ReviewComponent
                                        key={review.id}
                                        review={review}
                                        userId={session ? session.user.id : ''}
                                    />
                                ))
                            }
                        </>
                    ) : (
                        <p className="text-muted-foreground text-sm col-span-full">
                            Aún sin opiniones
                        </p>
                    )}
                </div>
                <Link className='underline text-sm font-semibold' href={`/cursos/${cursoId}/reviews`}>
                    Ver todas las opiniones
                </Link>
            </section>

            <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogContent>

                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-center">¿Confirmar opinión?</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-3">
                            <ul className="list-disc  text-muted-foreground ml-4 text-sm space-y-1">
                                <li>Solo puedes opinar <strong>una vez</strong> por curso</li>
                                <li><strong>No podrás editar ni eliminar</strong> tu opinión después de publicarla</li>

                            </ul>
                            <div className="flex justify-center">
                                {Array.from({ length: selectedRating }).map((i, index) => (<Star className="size-5 fill-yellow-500 text-yellow-500" key={index} />))}
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <ButtonGroup className="w-full">
                            <AlertDialogCancel
                                disabled={isSubmitting}
                                onClick={() => setShowConfirmDialog(false)}
                                className="flex-1"
                            >
                                Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={confirmSubmit}
                                disabled={isSubmitting}
                                className="flex-1"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className=" animate-spin" />
                                        Publicando...
                                    </>
                                ) : (
                                    'Sí, publicar mi opinión'
                                )}
                            </AlertDialogAction>

                        </ButtonGroup>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}