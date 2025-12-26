import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { estudiantes, reviewsCursos, usuariosEstudiantes } from "@/prisma/generated"
import { Star } from "lucide-react";

interface Props {
    review: reviewsCursos & { usuario: usuariosEstudiantes & { estudiante: estudiantes } };
    userId: string
}


export default function ReviewComponent({ review, userId }: Props) {
    return (
        <div className="bg-muted relative p-4 space-y-4 rounded-lg">
            {
                review.usuariosEstudiantesId == userId && (
                    <Badge className='absolute top-2 right-2'>
                        Tu comentario
                    </Badge>
                )
            }
            <div className="flex items-center gap-3">
                <Avatar >
                    <span
                        className='absolute -top-2 bg-foreground text-background font-bold rounded-full text-[.6em] p-1 -right-2'>
                        {review.usuario.estudiante.pais}
                    </span>
                    <AvatarImage src={review.usuario.avatar || ""} />
                    <AvatarFallback>
                        {review.usuario.usuario.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-bold text-sm">
                        {review.usuario.estudiante.nombre} {review.usuario.estudiante.apellido}
                    </p>
                    <div className='flex items-center gap-3'>
                        <span className='text-muted-foreground text-xs'>
                            @{review.usuario.usuario}
                        </span>
                        <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`h-3 w-3 ${star <= review.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <p className='font-semibold text-sm text-muted-foreground'>
                {review.comentario}
            </p>
        </div>
    )
}