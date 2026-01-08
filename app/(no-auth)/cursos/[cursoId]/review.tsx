import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { estudiantes, reviewsCursos, usuariosEstudiantes } from "@/prisma/generated"
import { Star, User } from "lucide-react";
import { Review } from "./client";
import Image from "next/image";
import { spanishSpeakingCountries } from "@/lib/countries";
interface Props {
    review: Review;
    userId: string | undefined
}


export default function ReviewComponent({ review, userId }: Props) {
    const usuario = review.usuario;
    if (!usuario || !usuario.estudiante) return null;
    return (
        <div className="bg-muted relative p-4 space-y-4 rounded-lg">
            {
                review.usuariosEstudiantesId == userId && (
                    <Badge className='absolute top-2 right-2'>
                        <User />
                    </Badge>
                )
            }
            <div className="flex items-center gap-3">
                <Avatar >
                    <span
                        className='absolute -bottom-2  rounded-full size-5 rounded-full overflow-hidden  -right-2'>
                        <Image alt="bandera" src={spanishSpeakingCountries.find(pais => pais.code == usuario.estudiante?.pais)?.flag!} fill className="object-cover" />
                    </span>
                    <AvatarImage src={usuario.avatar || ""} />
                    <AvatarFallback>
                        {usuario.usuario.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-bold text-sm">
                        {usuario.estudiante.nombre} {usuario.estudiante.apellido}
                    </p>
                    <div className='flex items-center gap-3'>
                        <span className='text-muted-foreground text-xs'>
                            @{usuario.usuario}
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