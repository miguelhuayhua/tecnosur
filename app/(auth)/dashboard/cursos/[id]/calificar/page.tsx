"use client";
import { redirect, useParams } from "next/navigation";

export default function Page() {
    const { id } = useParams();
    return redirect('/dashboard/cursos/' + id)
}