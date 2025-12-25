'use client';

import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  User,
  Mail,
  Lock,
  Monitor,
  Clock,
  DollarSign
} from 'lucide-react';
import Link from 'next/link';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { usePriceFormatter } from '@/hooks/use-price-formatter';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AvatarFallback, AvatarImage, Avatar } from '@/components/ui/avatar';
import { ButtonGroup } from '@/components/ui/button-group';
import { Separator } from '@/components/ui/separator';


// Tipos basados en el esquema de Prisma
type CategoriaCurso = {
  categoria: {
    id: string;
    nombre: string;
    descripcion: string | null;
  };
};

type BeneficioCurso = {
  id: string;
  descripcion: string;
  orden: number;
};

type ObjetivoCurso = {
  id: string;
  descripcion: string;
  orden: number;
};

type RequisitoCurso = {
  id: string;
  descripcion: string;
  orden: number;
};

type PrecioCurso = {
  id: string;
  precio: number;
  moneda: string;
  esDescuento: boolean;
  esPrecioDefault: boolean;
  porcentajeDescuento: number | null;
  precioOriginal: number | null;
  nombre: string;
};

type EdicionCurso = {
  id: string;
  codigo: string;
  fechaInicio: Date;
  fechaFin: Date;
  estado: string;
  vigente: boolean;
  descripcion: string | null;
  precios: PrecioCurso[];
};

type Curso = {
  id: string;
  titulo: string;
  descripcion: string;
  descripcionCorta: string | null;
  urlMiniatura: string | null;
  urlCurso: string | null;
  categorias: CategoriaCurso[];
  beneficios: BeneficioCurso[];
  objetivos: ObjetivoCurso[];
  requisitos: RequisitoCurso[];
  ediciones: EdicionCurso[];
};

interface CheckoutClientProps {
  curso: Curso;
  session: any;
}

export default function CheckoutClient({ curso, session: serverSession }: CheckoutClientProps) {
  const [error, setError] = useState<string | null>(null);
  const { data: user, status } = useSession();
  const { formatPrice, selectedCurrency } = usePriceFormatter();
  const router = useRouter();
  const [loader, setLoader] = useState(false);

  // Obtener la primera edición (ya viene filtrada del servidor)
  const edicion = curso.ediciones[0];

  // Obtener precios
  const precios = edicion?.precios || [];
  const precioDefault = precios.find(p => p.esPrecioDefault);
  const precioDescuento = precios.find(p => p.esDescuento);
  const precioActual = precioDescuento || precioDefault;

  // Formatear precios
  const precioUSD = precioActual?.precio || 0;
  const precioConvertido = precioDefault ? formatPrice(precioDefault.precio) : null;
  const precioOriginalConvertido = precioDefault?.precioOriginal ? formatPrice(precioDefault.precioOriginal) : null;

  const createOrder = async (): Promise<string> => {
    if (!edicion) {
      throw new Error('No hay edición disponible para este curso');
    }

    try {
      const res = await fetch("/api/paypal/create", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cursoId: curso.id,
          edicionId: edicion.id,
          monto: precioUSD,
          moneda: 'USD',
          descripcion: `${curso.titulo} - ${edicion.codigo}`,
          usuarioEmail: user?.user?.email,
          monedaLocal: selectedCurrency.code
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al crear la orden de pago');
      }

      const data = await res.json();
      return data.id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    }
  };

  const onApprove = async (data: { orderID: string }) => {
    try {
      setLoader(true);

      const res = await fetch("/api/paypal/capture", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderID: data.orderID,
          cursoId: curso.id,
          edicionId: edicion.id,
          usuarioEmail: user?.user?.email,
          monedaLocal: selectedCurrency.code
        }),
      });

      const details = await res.json();

      if (!res.ok) {
        throw new Error(details.error || 'Error al procesar el pago');
      }

      // Login automático para nuevo usuario
      if (details.usuarioCreado && details.loginData) {
        try {
          const signInResult = await signIn('credentials', {
            usuario: details.loginData.email,
            password: details.loginData.password,
            redirect: false,
          });

          if (signInResult?.ok) {
            router.replace(`/cursos/${curso.id}/checkout/${details.compraId}`);
          }
        } catch (loginError) {
          console.error('Error en login automático:', loginError);
        } finally {
          setLoader(false);
        }
      }
      // Usuario existente
      else if (details.comprobado && details.success) {
        router.replace(`/cursos/${curso.id}/checkout/${details.compraId}`);
        setLoader(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al procesar el pago';
      setError(errorMessage);
      setLoader(false);
    }
  };

  const onError = (err: any) => {
    setError(`Error de PayPal: ${err.message || 'Error desconocido'}`);
  };



  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse space-y-8">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="h-48 bg-muted rounded-lg"></div>
                <div className="h-24 bg-muted rounded"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
              <div className="h-64 bg-muted rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen px-2 sm:px-10 md:px-40 lg:px-0 bg-background py-8">
      {loader && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">

          <p className="mt-4 text-lg font-medium">Procesando tu compra...</p>
          <p className="text-sm text-muted-foreground mt-2">
            Por favor no cierres esta página
          </p>
        </div>
      )}

      <div className="max-w-5xl mx-auto">


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 ">
          {/* Información del curso */}
          <div className="space-y-8 col-span-2">
            {/* Cabecera */}
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {curso.categorias.map((categoria) => (
                  <Badge
                    key={categoria.categoria.id}
                    variant="secondary"
                    className="text-xs"
                  >
                    {categoria.categoria.nombre}
                  </Badge>
                ))}
                {edicion.vigente && (
                  <Badge variant='outline' className="text-green-600">
                    Edición Vigente
                  </Badge>
                )}
              </div>
              <div className='flex items-center gap-2'>
                <Avatar  >
                  <AvatarImage src={curso.urlMiniatura || ''} />
                  <AvatarFallback />
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">{curso.titulo}</h1>
                  <Badge>
                    Edición {edicion.codigo}
                  </Badge>
                </div>
              </div>
              <p className="text-muted-foreground text-sm">
                {curso.descripcionCorta}
              </p>
              <p className='text-xs text-muted-foreground flex items-center gap-2'>
                <Calendar className="size-4" />
                Del {format(edicion.fechaInicio, "dd/MMM/yyyy", { locale: es })} al  {format(edicion.fechaFin, "dd/MMM/yyyy", { locale: es })}
              </p>
              <p className='text-xs text-muted-foreground flex items-center gap-2'>
                <Clock className="size-4" />
                {format(edicion.fechaInicio, "HH:mm")} -  {format(edicion.fechaFin, "HH:mm")}
              </p>
            </div>
            {user ? (
              <div className='space-y-2'>
                <h3 className='font-medium'>
                  Usuario para la compra
                </h3>
                <div className="flex gap-2 items-center">
                  <Avatar  >
                    <AvatarImage src={user.user?.image || ''} alt="Avatar" />

                    <AvatarFallback  >
                      {user.user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className='flex flex-col'>
                    <p className='text-sm font-medium'>
                      {user.user?.name}
                    </p>
                    <span className='text-xs text-muted-foreground'>
                      {user.user?.email}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <div>
                    <p className="font-medium">Accede sin problemas</p>
                    <p className="text-sm text-muted-foreground">
                      Inicia sesión si ya tienes una cuenta
                    </p>
                  </div>
                </div>
                <ButtonGroup className='w-full'>
                  <Button className="flex-1" asChild>
                    <Link href="/login" className="block">
                      Iniciar sesión
                    </Link>
                  </Button>
                  <Button className='flex-1' variant={'outline'}>
                    <Link href={`/registrarse`}>
                      Regístrate
                    </Link>
                  </Button>
                </ButtonGroup>
                <p className="text-xs text-muted-foreground">
                  Si eres nuevo y tu compra usa cualquier método de pago, nosotros crearemos tu cuenta. <span className='text-blue-600'>
                    Usa Paypal para hacerlo en segundos.
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Puedes crear tu usuario antes comprar un curso. <span className='text-green-600'>
                    Esos datos serán usados para registrar tu compra.
                  </span>
                </p>
              </div>
            )}



            {/* Beneficios */}
            {curso.beneficios && curso.beneficios.length > 0 && (

              <div className='space-y-2'>
                <h3 className='font-medium'>
                  Lo que obtendrás
                </h3>
                <ul className="list-disc ml-5">
                  {curso.beneficios.map((beneficio) => (
                    <li key={beneficio.id} >
                      <span className="text-xs">{beneficio.descripcion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Proceso de acceso */}
            <div className="space-y-4">
              <h3 className="font-medium">Tu proceso de acceso</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <DollarSign className="size-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium">Pago confirmado</p>
                  <p className="text-xs text-muted-foreground">
                    Cualquier método de pago, será confirmado.
                  </p>
                </div>
                <div className="space-y-2 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="size-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium">Credenciales</p>
                  <p className="text-xs text-muted-foreground">
                    Se te creará un perfil de usuario
                  </p>
                </div>
                <div className="space-y-2 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Monitor className="size-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium">Acceso inmediato</p>
                  <p className="text-xs text-muted-foreground">
                    Tu curso aparecerá en tu panel de estudiante.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Panel de pago */}
          <div className="lg:relative col-span-3 lg:col-span-1 max-w-2xl mx-auto lg:top-8">
            <Card  >
              <CardContent >
                <div className="space-y-4">
                  {/* Resumen */}
                  <div className='flex justify-between'>
                    <h3 className="font-medium text-sm">Detalles de compra</h3>
                    {precioDefault?.esDescuento && (

                      <Badge variant={'outline'}>
                        {precioDefault.porcentajeDescuento}% de descuento
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-3">
                    {/* Precio */}
                    {
                      precioDefault?.esDescuento ? (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Valor original</span>
                            <div className="flex gap-2 items-center">
                              <div className="font-semibold text-md">
                                {precioOriginalConvertido?.value} {precioOriginalConvertido?.code}
                              </div>

                            </div>

                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Descuento</span>
                            <span className="text-red-600 font-semibold">
                              -{+(precioOriginalConvertido?.value!) - (+precioConvertido?.value!)} {precioConvertido?.code}
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Valor original</span>
                            <div className="flex gap-2 items-center">
                              <div className="font-semibold text-md">
                                {precioOriginalConvertido?.value} {precioOriginalConvertido?.code}
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Descuento</span>
                            <span className="text-red-600 font-semibold">
                              - 0 ${precioOriginalConvertido?.code}
                            </span>
                          </div>
                        </>
                      )
                    }
                    <Separator />
                    {
                      precioDefault?.esDescuento ? (<div className="flex justify-between items-center ">
                        <span className="text-sm font-medium">Total</span>
                        <div className="flex gap-2 items-center">
                          <div className="font-semibold text-md">
                            {precioConvertido?.value} {precioConvertido?.code}
                          </div>
                        </div>
                      </div>
                      ) :
                        <div className="flex justify-between items-center ">
                          <span className="text-sm font-medium">Total</span>
                          <div className="flex gap-2 items-center">
                            <div className="font-semibold text-md">
                              {precioOriginalConvertido?.value} {precioOriginalConvertido?.code}
                            </div>
                          </div>
                        </div>
                    }
                  </div>

                  {/* Información de conversión */}
                  {selectedCurrency.code !== 'USD' && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-2">
                      <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                        <DollarSign className="size-4" />
                        <span className="text-sm font-medium">Conversión de referencia</span>
                      </div>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                        El curso tiene un valor original de USD <b>{precioUSD.toFixed(2)}</b>.
                        <br />
                        El valor a tu moneda local sirve de referencia en el caso de usarlo como pago.
                      </p>
                    </div>
                  )}

                  {/* PayPal */}
                  <div className="space-y-4">
                    <Button className='w-full rounded-[.3em] ' >
                      Pago Asistido
                    </Button>
                    <Button className='w-full rounded-[.3em]  bg-[#9519a3]'  >
                      <Image src={'/logo-yape.png'} width={100} height={100} className='w-12' alt='logo yape' />
                      Pagar con Yape
                    </Button>
                    <PayPalButtons
                      style={{
                        layout: 'vertical',
                        color: 'blue',
                        label: 'paypal',
                        height: 35
                      }}

                      createOrder={createOrder}
                      onApprove={onApprove}
                      onError={onError}
                      disabled={!edicion || !precioActual}
                    />


                    <p className="text-xs text-center text-muted-foreground">
                      Al completar la compra, aceptas nuestros{' '}
                      <Link href="/terminos" className="text-primary hover:underline">
                        Términos y condiciones
                      </Link>
                    </p>
                  </div>

                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}