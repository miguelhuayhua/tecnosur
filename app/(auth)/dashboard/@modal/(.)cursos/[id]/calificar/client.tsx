// app/dashboard/cursos/[id]/editar/page.tsx
'use client'
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useState } from 'react';
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
import { ArrowUpIcon, Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { reviewsCursos } from "@/prisma/generated"
import { ButtonGroup } from "@/components/ui/button-group"
import { Loader } from "@/components/ui/loader"

interface Edicion {
    curso: { id: string, reviews: Array<reviewsCursos> }
}

export default function CalificarCursoModal({ edicion }: { edicion: Edicion }) {
    const router = useRouter()
    const miReview = edicion.curso.reviews[0];
    const handleClose = () => router.back()
    const [opinionText, setOpinionText] = useState(miReview ? miReview.comentario || '' : '');
    const [selectedRating, setSelectedRating] = useState(miReview ? miReview.rating : 0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const charactersLeft = 300 - opinionText.length;
    const confirmSubmit = async () => {

        setIsSubmitting(true);
        const response = await fetch('/api/reviews/crear', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cursoId: edicion.curso.id,
                reviewId: miReview ? miReview.id : "",
                rating: selectedRating,
                comentario: opinionText.trim()
            }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            toast.error(data.error);
            setShowConfirmDialog(false);
            setIsSubmitting(false);
        }
        else {
            toast.success('¡Opinión enviada!', {
                description: data.message,
                duration: 3000,
            });
            // Resetear todo
            setOpinionText('');
            setSelectedRating(5);
            setShowConfirmDialog(false);
            router.back();
        }
    };


    return (
        <>
            <Dialog open={true} onOpenChange={handleClose}>
                <DialogContent showCloseButton={false} className="p-0">
                    {
                        isSubmitting ?
                            <div className="flex justify-center py-20 items-center">
                                <Loader variant="cube" />
                            </div> :
                            <>
                                <DialogTitle className="sr-only">
                                    Comentar
                                </DialogTitle>
                                <InputGroup>
                                    <InputGroupTextarea

                                        placeholder="Comparte tu experiencia con el curso..."
                                        value={opinionText}
                                        onChange={(e) => setOpinionText(e.target.value)}
                                        maxLength={300}
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
                                                        disabled={isSubmitting}
                                                        className={`cursor-pointer hover:scale-110 transition-transform ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        <Star
                                                            className={`size-4 ${star <= selectedRating
                                                                ? 'text-yellow-500 fill-yellow-500'
                                                                : 'text-gray-300'
                                                                }`}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                            <InputGroupButton
                                                variant="default"
                                                className='ml-2'
                                                onClick={() => setShowConfirmDialog(true)}
                                                disabled={selectedRating == 0 || opinionText.trim().length < 10 || charactersLeft < 0}
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
                            </>
                    }
                </DialogContent>
            </Dialog>

            {/* Diálogo de confirmación */}
            <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogContent>

                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-center">¿{miReview ? "Modificar" : "Publicar"} reseña?</AlertDialogTitle>
                        <AlertDialogDescription className="text-center">
                            {miReview ? "Vas a modificar tu reseña anterior" : "Vas a publicar una nueva reseña"}
                            <div className="flex justify-center mt-3">
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
                                disabled={isSubmitting || selectedRating == 0}
                                className="flex-1"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className=" animate-spin" />
                                        Publicando...
                                    </>
                                ) : (
                                    'Continuar'
                                )}
                            </AlertDialogAction>

                        </ButtonGroup>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}