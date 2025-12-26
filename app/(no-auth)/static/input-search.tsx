"use client";

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Search } from "lucide-react";

export default function InputSearch() {
    return (
        <>
            <InputGroup className='rounded-full hidden lg:flex'>
                <InputGroupInput placeholder='¿Qué estás buscando?' className='w-xs' />
                <InputGroupAddon align={'inline-end'}>
                    <InputGroupButton >
                        <Search />
                    </InputGroupButton>
                </InputGroupAddon>
            </InputGroup>

        </>
    )
}