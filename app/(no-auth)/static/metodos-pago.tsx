import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, LogInIcon } from 'lucide-react'
import Image from "next/image"
import Link from 'next/link'
export default function MetodosPago() {

    return (
        <div className="grid grid-cols-2  max-w-xl gap-8 mx-auto my-25">
            <div className="col-span-2">
                <h3 className="text-3xl text-center font-bold">
                    Maneras en las que puedes acceder a nuestra <span className='text-primary'>plataforma</span>
                </h3>
            </div>
            <Card>
                <CardContent>
                    <div className='aspect-video relative mb-8'>
                        <Image src={"/card1.svg"}
                            className='object-fill'
                            alt="Imagen sin costo" fill />

                    </div>
                    <CardTitle className='text-center text-xl mb-4'>
                        Registro Simple
                    </CardTitle>
                    <CardDescription className='text-center'>
                        Inicia sesión y obten acceso a nuestra plataforma para que puedas empezar a aprender.
                    </CardDescription>
                </CardContent>
                <CardFooter>
                    <Button asChild className='w-full text-primary' variant='outline'>
                        <Link href="/registro">
                            Registrarme <LogInIcon />
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
            <Card>
                <CardContent>
                    <div className='aspect-video relative mb-8'>
                        <Image src={"/card2.svg"}
                            className='object-fill'
                            alt="Imagen sin costo" fill />

                    </div>
                    <CardTitle className='text-center text-xl mb-4'>
                        Compra Cursos
                    </CardTitle>
                    <CardDescription className='text-center'>
                        Adquiere los cursos que desees y accede a ellos en cualquier momento.
                    </CardDescription>
                </CardContent>
                <CardFooter className='mt-auto'>
                    <Button asChild className='w-full text-secondary' variant='outline'>
                        <Link href="/precios">
                            Ver Métodos de Pago <DollarSign />
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}