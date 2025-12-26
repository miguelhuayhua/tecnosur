import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Navbar } from '@/app/(no-auth)/static/navbar';
import { Footer } from '@/app/(no-auth)/static/footer';
import ReviewsClient from './client';

interface PageProps {
    params: Promise<{ cursoId: string }>;
}

export default async function CheckoutPage({ params }: PageProps) {
    const { cursoId } = await params;

    try {
        // Obtener el curso con todas sus relaciones necesarias
        const reviews = await prisma.reviewsCursos.findMany({
            where: { id: cursoId },
            include: {
                curso: true
            },
        });


        return (
            <>
                <Navbar />
                <ReviewsClient reviews={reviews || []} />
                <Footer />
            </>
        );
    } catch (error) {
        console.error('Error loading checkout page:', error);
        notFound();
    }
}