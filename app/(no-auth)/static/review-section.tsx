import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Marquee } from "@/components/ui/marquee"
import { cn } from "@/lib/utils"
import { reviewsCursos } from "@/prisma/generated"


interface Review extends reviewsCursos {
    usuario: {
        usuario: string
        correo: string
        avatar: string | null,
        estudiante: { nombre: string | null } | null
    } | null
}


const ReviewCard = ({ review }: { review: Review }) => {
    return (
        <figure
            className={cn(
                "relative h-full w-64 cursor-pointer overflow-hidden rounded-xl border p-4",
                // light styles
                "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
                // dark styles
                "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]"
            )}
        >
            <div className="flex flex-row items-center gap-2">
                <Avatar>
                    <AvatarImage src={review.usuario?.avatar || "/avatar.png"} />
                    <AvatarFallback>{review.usuario?.estudiante?.nombre?.charAt(0) || review.usuario?.usuario.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <figcaption className="text-sm font-medium dark:text-white">
                        {review.usuario?.estudiante?.nombre || review.usuario?.usuario}
                    </figcaption>
                    <p className="text-xs font-medium dark:text-white/40">{review.usuario?.usuario}</p>
                </div>
            </div>
            <blockquote className="mt-2 text-sm">{review.comentario}</blockquote>
        </figure>
    )
}

export function ReviewSection({ reviews }: { reviews: Review[] }) {
    const firstRow = reviews.slice(0, reviews.length / 2)
    const secondRow = reviews.slice(reviews.length / 2)


    return (
        <section >
            <h3 className="text-2xl text-center font-bold">
                Qué opinan nuestros alumnos
            </h3>
            <p className='text-center'>
                Opiniones de nuestros alumnos sobre nuestros cursos
            </p>
            <div className="relative flex w-full my-8 flex-col items-center justify-center overflow-hidden">
                <Marquee pauseOnHover className="[--duration:20s]">
                    {firstRow.map((review) => (
                        <ReviewCard key={review.id} review={review} />
                    ))}
                </Marquee>
                <Marquee reverse pauseOnHover className="[--duration:20s]">
                    {secondRow.map((review) => (
                        <ReviewCard key={review.id} review={review} />
                    ))}
                </Marquee>
                <div className="from-background pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r"></div>
                <div className="from-background pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l"></div>
            </div>
        </section>
    )
}
