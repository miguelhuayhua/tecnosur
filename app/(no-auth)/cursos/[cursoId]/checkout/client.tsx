'use client';

import React, { useState } from 'react';
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
import { notFound, useRouter } from 'next/navigation';
import { usePriceFormatter } from '@/hooks/use-price-formatter';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AvatarFallback, AvatarImage, Avatar } from '@/components/ui/avatar';
import { ButtonGroup } from '@/components/ui/button-group';
import { Separator } from '@/components/ui/separator';
import { cursos, edicionesCursos, preciosCursos } from '@/prisma/generated';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


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

interface Edicion extends edicionesCursos {
  precios: Array<preciosCursos>
}

interface Curso extends cursos {
  categorias: CategoriaCurso[];
  beneficios: BeneficioCurso[];
  objetivos: ObjetivoCurso[];
  requisitos: RequisitoCurso[];
  ediciones: Edicion[];
};

export default function CheckoutClient({ curso }: { curso: Curso }) {
  const edicion = curso.ediciones.at(0);
  const { data: token, status } = useSession();
  if (!edicion) return notFound()
  const precioDefault = edicion?.precios.at(0);
  if (!precioDefault) return notFound()
  const { formatPrice, selectedCurrency } = usePriceFormatter();
  const router = useRouter();
  const [loader, setLoader] = useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState("");

  // Formatear precios
  const precioConvertido = formatPrice(precioDefault.precio);
  const precioOriginalConvertido = formatPrice(precioDefault.precioOriginal!);
  const createOrder = async (): Promise<string> => {
    const res = await fetch("/api/paypal/create", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cursoId: curso.id,
        edicionId: edicion.id,
        monto: precioConvertido.value,
        moneda: 'USD',
        descripcion: `${curso.codigo} - ${edicion.codigo}`,
        usuarioEmail: token ? token.user.email : "guess",
        monedaLocal: selectedCurrency.code
      }),
    });

    const data = await res.json();
    return data.id;
  };

  const onApprove = async (data: { orderID: string }) => {

    const res = await fetch("/api/paypal/capture", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        orderID: data.orderID,
        cursoId: curso.id,
        edicionId: edicion.id,
        usuarioEmail: token ? token.user.email : "guess",
        monedaLocal: selectedCurrency.code
      }),
    });

    const details = await res.json();

    // Login automático para nuevo usuario
    if (details.usuarioCreado && details.loginData) {
      const signInResult = await signIn('credentials', {
        usuario: details.loginData.email,
        password: details.loginData.password,
        redirect: false,
      });
      if (signInResult?.ok) {
        router.replace(`/cursos/${curso.id}/checkout/${details.compraId}`);
      }

    }
    // Usuario existente
    else if (details.comprobado && details.success) {
      router.replace(`/cursos/${curso.id}/checkout/${details.compraId}`);
    }
  };
  return (
    <div className="min-h-screen px-2 sm:px-10 md:px-40 lg:px-0 bg-background py-8">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 ">
          {/* Información del curso */}
          <div className="space-y-8  lg:col-span-2">
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
            {token ? (
              <div className='space-y-2'>
                <h3 className='font-medium'>
                  Usuario para la compra
                </h3>
                <div className="flex gap-2 items-center">
                  <Avatar  >
                    <AvatarImage src={token.user?.image || ''} alt="Avatar" />

                    <AvatarFallback  >
                      {token.user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className='flex flex-col'>
                    <p className='text-sm font-medium'>
                      {token.user?.name}
                    </p>
                    <span className='text-xs text-muted-foreground'>
                      {token.user?.email}
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
              <div className="grid mx-auto grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2 text-center ">
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
          <div className="lg:relative col-span-1  max-w-2xl mx-auto lg:top-8">
            <Card  >
              <CardContent >
                <div className="space-y-2">
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
                                {precioConvertido?.value} {precioConvertido?.code}
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Descuento</span>
                            <span className="text-red-600 font-semibold">
                              - 0 ${precioConvertido?.code}
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
                              {precioConvertido?.value} {precioOriginalConvertido?.code}
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
                        El curso tiene un valor original de USD <b>{precioConvertido.value}</b>.
                        <br />
                        El valor a tu moneda local sirve de referencia en el caso de usarlo como pago.
                      </p>
                    </div>
                  )}

                  {/* PayPal */}
                  <Accordion
                    type="single"
                    value={paymentMethod}
                    className='space-y-3 mb-3 mt-6'
                  >
                    <AccordionItem value="asistido">
                      <Button className='w-full rounded-[.3em] ' onClick={() => setPaymentMethod("asistido")}>
                        Pago Asistido
                      </Button>
                      <AccordionContent className="flex flex-col gap-4 text-balance">
                        <p>
                          Contactos
                        </p>

                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="PLIN">
                      <Button className="w-full rounded-[.3em] bg-gradient-to-r from-[#2788f6] to-[#07e1ce]" onClick={() => setPaymentMethod("PLIN")}>
                        <Image src="/plin.png" width={48} height={48} alt="Plin" className='w-5' />
                        Pagar con Plin
                      </Button>
                      <AccordionContent>
                        QR de Plin
                      </AccordionContent>
                    </AccordionItem>
                    {/* BINANCE */}
                    <AccordionItem value="BINANCE">
                      <Button
                        className="
    w-full rounded-[.3em]
    bg-[#333333] text-[#f0b90b]
    hover:bg-[#333333]
    transition-colors duration-200
    hover:text-[#c99400]
  "
                        onClick={() => setPaymentMethod('BINANCE')}
                      >
                        <Image src="/binance.png" width={48} height={48} alt="Binance" className="w-5" />
                        Pagar con Binance
                      </Button>


                      <AccordionContent>
                        USDT · Red TRC20<br />
                        Wallet: TXxxxxxxx
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="YAPE">
                      <Button
                        className="
    w-full rounded-[.3em]
    bg-[#9519a3] text-white
    hover:bg-[#9519a3]
    transition-colors duration-200
    hover:text-[#e0b3e6]
  "
                        onClick={() => setPaymentMethod('YAPE')}
                      >
                        <Image src="/logo-yape.png" width={100} height={100} className="w-6" alt="logo yape" />
                        Pagar con Yape
                      </Button>

                      <AccordionContent className="flex flex-col gap-4 text-balance">
                        QR
                      </AccordionContent>
                    </AccordionItem>
                    {/* WESTERN UNION */}
                    <AccordionItem value="WESTER_UNION">
                      <Button
                        className="
    w-full rounded-[.3em]
    bg-[#ffdd00] text-black
    hover:bg-[#ffdd00]
    transition-colors duration-200
    hover:text-black/70
  "
                        onClick={() => setPaymentMethod('WESTER_UNION')}
                      >
                        <Image src="/wu.png" width={48} height={48} alt="Western Union" className="w-5" />
                        Western Union
                      </Button>

                      <AccordionContent>
                        Pago asistido · Datos del beneficiario
                      </AccordionContent>
                    </AccordionItem>

                    {/* TRANSFERENCIA */}
                    <AccordionItem value="TRANSFERENCIA">
                      <Button
                        className="w-full rounded-[.3em] bg-slate-700"
                        onClick={() => setPaymentMethod("TRANSFERENCIA")}
                      >
                        Transferencia Bancaria
                      </Button>
                      <AccordionContent>
                        Banco · Cuenta · Titular
                      </AccordionContent>
                    </AccordionItem>

                 
                  </Accordion>
                  <PayPalButtons
                    style={{
                      layout: 'vertical',
                      color: 'blue',
                      label: 'paypal',
                      height: 35
                    }}

                    createOrder={createOrder}
                    onApprove={onApprove}
                    disabled={!edicion}
                  />
                  <p className="text-xs text-center text-muted-foreground">
                    Al completar la compra, aceptas nuestros{' '}
                    <Link href="/terminos" className="text-primary hover:underline">
                      Términos y condiciones
                    </Link>
                  </p>


                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}