"use client"

import { Button } from "@/components/ui/button"
import { NoiseBackground } from "@/components/ui/noise-background"
import Link from "next/link"
import { FaWhatsapp } from "react-icons/fa"

export default function WhatsAppButton() {
    return (
        <div className="fixed right-5 bottom-5 z-100">
            <NoiseBackground
                containerClassName="w-fit p-2 rounded-full mx-auto"
                gradientColors={[
                    "rgba(23, 197, 13, 1)",
                    "rgba(1, 129, 8, 1)",
                    "rgba(11, 168, 0, 1)",
                ]}
            >
                <Button asChild className=" size-20 pulse cursor-pointer rounded-full  bg-green-600 p-4  text-black shadow-[0px_2px_0px_0px_var(--color-green-500)_inset,0px_0.5px_1px_0px_var(--color-neutral-400)] transition-all duration-100 active:scale-98 dark:from-black hover:bg-green-700 dark:via-black dark:to-neutral-900 dark:text-white dark:shadow-[0px_1px_0px_0px_var(--color-neutral-950)_inset,0px_1px_0px_0px_var(--color-neutral-800)]">
                    <Link href={"https://wa.link/qpuq92"} target="_blank">
                    <FaWhatsapp className="size-10 text-white" />
                    </Link>
                </Button>
            </NoiseBackground>
        </div>
    )
}