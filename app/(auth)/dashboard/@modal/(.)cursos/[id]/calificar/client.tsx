// app/dashboard/cursos/[id]/editar/page.tsx
'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cursoSchema } from "@/schemas/curso"
import { ScrollArea } from "@/components/ui/scroll-area"

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
import { useRouter } from 'next/navigation';
import { useModal } from "@/providers/modal-provider"
import { cursos, edicionesCursos, estudiantes, reviewsCursos, usuariosEstudiantes } from "@/prisma/generated"
import { ButtonGroup } from "@/components/ui/button-group"

// Fetcher para SWR
interface Props {
    edicion: edicionesCursos & { curso: cursos & { reviews: Array<reviewsCursos> } }
}
interface Review extends reviewsCursos {
    usuario: usuariosEstudiantes & { estudiante: estudiantes }
}

interface Curso {
    id: string;
    reviews: Review[];
}

interface Compra {
    usuariosEstudiantesId: string;
}

interface EdicionPrincipal {
    compras: Compra[];
}

interface OpinionesCursoProps {
    curso: Curso;
    edicionPrincipal: EdicionPrincipal;
}
export default function CalificarCursoModal({ edicion }: Props) {
    const router = useRouter()
    const { openModal } = useModal()

    const handleClose = () => router.back()

    const { data: session } = useSession();
    const [showOpinion, setShowOpinion] = useState(false);
    const [opinionText, setOpinionText] = useState('');
    const [selectedRating, setSelectedRating] = useState(5);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    // Verificar si el usuario ya opinó
    const userAlreadyReviewed = edicion.curso.reviews.some(
        review => review.usuariosEstudiantesId === session?.user?.id
    );


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
                    cursoId: edicion.curso.id,
                    rating: selectedRating,
                    comentario: opinionText.trim()
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                toast.error(data.error);
                setShowConfirmDialog(false);
            }
            else {
                toast.success('¡Opinión enviada!', {
                    description: 'Tu opinión ha sido publicada exitosamente.',
                    duration: 3000,
                });
                // Resetear todo
                setOpinionText('');
                setSelectedRating(5);
                setShowOpinion(false);
                setShowConfirmDialog(false);
                router.back();
            }




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
            <Dialog open={true} onOpenChange={handleClose}>
                <DialogContent showCloseButton={false} className="p-0">
                    <DialogTitle className="sr-only">
                        Comentar
                    </DialogTitle>
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
                </DialogContent>
            </Dialog>

            {/* Diálogo de confirmación */}
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
    )
}