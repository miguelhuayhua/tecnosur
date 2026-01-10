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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';


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

const COUNTRIES = [
  { code: 'PE', name: 'Perú' },
  { code: 'BO', name: 'Bolivia' },
  { code: 'MX', name: 'México' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'CO', name: 'Colombia' },
  { code: 'US', name: 'EE.UU.' },
];

const METHODS_BY_COUNTRY: Record<string, string[]> = {
  PE: ['INTERBANK', 'YAPE', 'PLIN', 'LIGO'],
  BO: ['BANCO_UNION', 'YAPE', 'ALTOKE'],
  MX: ['PAYPAL', 'WESTERN_UNION', 'BINANCE'],
  EC: ['PAYPAL', 'WESTERN_UNION', 'BINANCE'],
  CO: ['PAYPAL', 'WESTERN_UNION', 'BINANCE'],
  US: ['ZELLE', 'PAYPAL'],
};

const PAYMENT_DETAILS: Record<string, { name: string; logo?: string; color: string; textColor: string; content: React.ReactNode }> = {
  INTERBANK: {
    name: 'Interbank',
    logo: '/interbank.png',
    color: 'bg-[#04be4f]',
    textColor: 'text-white',
    content: (
      <div className="space-y-1">
        <p className="font-semibold text-foreground">Transferencia Interbank</p>
        <p className="text-xs text-muted-foreground">Número de cuenta: 200-3001234567</p>
        <p className="text-xs text-muted-foreground">CCI: 003-200-003001234567-33</p>
      </div>
    ),
  },
  YAPE: {
    name: 'Yape',
    logo: '/logo-yape.png',
    color: 'bg-[#9519a3]',
    textColor: 'text-white',
    content: (
      <div className="space-y-2">
        <p className="font-semibold text-foreground">Paga con Yape</p>
        <p className="text-xs text-muted-foreground">Escanea el QR o yapea al número: 999 888 777</p>
        <p className="text-xs text-muted-foreground font-medium">Titular: TECNOSUR</p>
      </div>
    ),
  },
  PLIN: {
    name: 'Plin',
    logo: '/plin.png',
    color: 'bg-gradient-to-r from-[#2788f6] to-[#07e1ce]',
    textColor: 'text-white',
    content: (
      <div className="space-y-2">
        <p className="font-semibold text-foreground">Paga con Plin</p>
        <p className="text-xs text-muted-foreground">Escanea el QR o plinea al número: 999 888 777</p>
        <p className="text-xs text-muted-foreground font-medium">Titular: TECNOSUR</p>
      </div>
    ),
  },
  LIGO: {
    name: 'Ligo',
    logo: '/ligo.png',
    color: 'bg-[#8613da]',
    textColor: 'text-white',
    content: (
      <div className="space-y-1">
        <p className="font-semibold text-foreground">Transferencia Ligo</p>
        <p className="text-xs text-muted-foreground">Número de tarjeta: 4557 XXXX XXXX 1234</p>
        <p className="text-xs text-muted-foreground">Titular: TECNOSUR</p>
      </div>
    ),
  },
  BANCO_UNION: {
    name: 'Banco Unión',
    logo: '/banco-union.jpg',
    color: 'bg-[#0a285f]',
    textColor: 'text-white',
    content: (
      <div className="space-y-1">
        <p className="font-semibold text-foreground">Banco Unión Bolivia</p>
        <p className="text-xs text-muted-foreground">Número de cuenta: 1-12345678</p>
        <p className="text-xs text-muted-foreground">Titular: TECNOSUR</p>
      </div>
    ),
  },
  ALTOKE: {
    name: 'Altoke',
    logo: '/altoke.png',
    color: 'bg-[#FF5A00]',
    textColor: 'text-white',
    content: (
      <div className="space-y-2">
        <p className="font-semibold text-foreground">Paga con Altoke</p>
        <p className="text-xs text-muted-foreground">Escanea el código QR desde tu app Banco Unión o Yape Bolivia.</p>
      </div>
    ),
  },
  ZELLE: {
    name: 'Zelle',
    logo: '/zelle.png',
    color: 'bg-[#7714dc]',
    textColor: 'text-white',
    content: (
      <div className="space-y-1">
        <p className="font-semibold text-foreground">Pago por Zelle</p>
        <p className="text-sm font-medium text-foreground">pagos@tecnosur.com</p>
        <p className="text-xs text-muted-foreground">Titular: TECNOSUR LLC</p>
      </div>
    ),
  },
  PAYPAL: {
    name: 'PayPal',
    logo: '/paypal.jpg',
    color: 'bg-[#003087]',
    textColor: 'text-white',
    content: (
      <p className="text-xs text-muted-foreground">Usa el botón azul de PayPal para completar tu compra de forma instantánea.</p>
    ),
  },
  BINANCE: {
    name: 'Binance (USDT)',
    logo: '/binance.png',
    color: 'bg-[#333333]',
    textColor: 'text-white',
    content: (
      <div className="space-y-1">
        <p className="font-semibold text-foreground">Binance Pay / USDT</p>
        <p className="text-xs text-muted-foreground">Red: TRC20</p>
        <p className="text-[10px] break-all opacity-80 p-2 bg-muted/50 rounded text-foreground">TXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</p>
      </div>
    ),
  },
  WESTERN_UNION: {
    name: 'Western Union',
    logo: '/wu.png',
    color: 'bg-[#ffdd00]',
    textColor: 'text-black',
    content: (
      <div className="space-y-1 text-black">
        <p className="font-semibold">Western Union</p>
        <p className="text-xs opacity-90">Solicita los datos del beneficiario actual a nuestro equipo de soporte.</p>
      </div>
    ),
  },
};

export default function CheckoutClient({ curso }: { curso: Curso }) {
  const { theme } = useTheme();
  const edicion = curso.ediciones.at(0);
  const { data: token, status } = useSession();
  if (!edicion) return notFound()
  const precioDefault = edicion?.precios.at(0);
  if (!precioDefault) return notFound()
  const { formatPrice, selectedCurrency } = usePriceFormatter();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = React.useState("");
  const [selectedCountry, setSelectedCountry] = React.useState("PE");
  const [isPaypalActive, setIsPaypalActive] = React.useState(false);

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
    <div className="min-h-screen px-2 sm:px-10 pt-30 md:px-40 lg:px-0 bg-background py-8">
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
                              - 0 {precioConvertido?.code}
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

                  {/* Selector de País */}
                  <div className="space-y-2 mt-6">
                    <label className="text-xs  font-bold text-muted-foreground/60 ml-1">
                      Tu ubicación
                    </label>
                    <Select value={selectedCountry} onValueChange={(v) => {
                      setSelectedCountry(v);
                      setPaymentMethod(""); // Reset payment method when country changes
                    }}>
                      <SelectTrigger className="w-full  mt-1 rounded-xl border-muted-foreground/20 focus:ring-1 focus:ring-primary/20 bg-muted/30">
                        <SelectValue>
                          <div className="flex items-center gap-2">
                            <span className="font-medium leading-none">{COUNTRIES.find(c => c.code === selectedCountry)?.name}</span>
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-muted-foreground/20">
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country.code} value={country.code} className="cursor-pointer">
                            <div className="flex items-center gap-2">
                              <span className="font-medium leading-none">{country.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Accordion
                    type="single"
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    className='space-y-3 mb-3 mt-4'
                  >
                    {METHODS_BY_COUNTRY[selectedCountry]?.map((methodKey) => {
                      const method = PAYMENT_DETAILS[methodKey];
                      if (!method || methodKey === 'PAYPAL') return null; // PayPal handled separately via buttons

                      return (
                        <AccordionItem key={methodKey} value={methodKey} className="border-none">
                          <AccordionTrigger
                            className={cn(
                              "w-full h-12 px-4 rounded-xl flex items-center gap-3 transition-colors duration-200 hover:no-underline cursor-pointer",
                              method.color,
                              method.textColor,
                              paymentMethod === methodKey ? "ring-2 ring-offset-2 ring-primary/20" : ""
                            )}
                            hideArrow
                          >
                            <div className="flex items-center gap-3 w-full">
                              {method.logo && (
                                <div className="p-1 rounded-md">
                                  <Image
                                    src={method.logo}
                                    width={48}
                                    height={48}
                                    alt={method.name}
                                    className="size-8 object-contain"
                                    onError={(e) => {
                                      // @ts-ignore
                                      e.target.style.display = 'none';
                                      // @ts-ignore
                                      e.target.parentElement.style.display = 'none';
                                    }}
                                  />
                                </div>
                              )}
                              <span className="font-bold text-sm tracking-wide">{method.name}</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="mt-2 p-4 rounded-xl bg-muted/50 border border-muted-foreground/10 text-sm">
                            {method.content}
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>

                  {/* PayPal Buttons (Only if country supports it) */}
                  {METHODS_BY_COUNTRY[selectedCountry]?.includes('PAYPAL') && (
                    <div className="space-y-4 mt-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <div className="relative">

                        <div className="relative flex justify-center text-xs">
                          <span className=" px-2 text-muted-foreground font-semibold">O paga ahora con</span>
                        </div>
                      </div>

                      {!isPaypalActive ? (
                        <div className="group relative">
                          <Button
                            onClick={() => setIsPaypalActive(true)}
                            className="w-full h-11 rounded-full bg-white hover:bg-white text-black font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-blue-500/10 cursor-pointer overflow-hidden border"
                          >
                            <Image src="/paypal.jpg" width={48} height={48} alt="PayPal" className="size-8 object-contain" />
                            PayPal / Tarjetas
                          </Button>
                        </div>
                      ) : (
                        <div className="bg-white rounded-2xl p-4 duration-300 border relative animate-in zoom-in-95">
                          <button
                            onClick={() => setIsPaypalActive(false)}
                            className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors cursor-pointer p-1"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                          </button>

                          <div className="flex items-center justify-between mb-4 pr-6">
                            <div className="flex items-center gap-2">
                              <div className="bg-white rounded-lg">
                                <Image src="/paypal.jpg" width={48} height={48} alt="PayPal" className="size-8 object-contain" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-black font-bold text-[13px] leading-tight">Checkout Seguro</span>
                                <span className="text-[10px] text-gray-500 leading-tight">Procesado por PayPal</span>
                              </div>
                            </div>
                            <Lock className="size-4 text-gray-300" />
                          </div>

                          <div className="space-y-3">
                            <PayPalButtons
                              style={{
                                layout: 'vertical',
                                color: 'blue',
                                label: 'paypal',
                                height: 40,
                                shape: 'rect'
                              }}
                              createOrder={createOrder}
                              onApprove={onApprove}
                              disabled={!edicion}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
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