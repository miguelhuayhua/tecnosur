'use client';

import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  Calendar,
  User,
  Mail,
  Lock,
  ArrowLeft,
  Monitor,
  CheckSquare,
  LogIn,
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
  const { data: clientSession, status } = useSession();
  const { formatPrice, selectedCurrency } = usePriceFormatter();
  const router = useRouter();
  const [loader, setLoader] = useState(false);

  // Usar session del cliente si está disponible, sino del servidor
  const session = clientSession || serverSession;

  // Obtener la primera edición (ya viene filtrada del servidor)
  const edicion = curso.ediciones[0];

  // Obtener precios
  const precios = edicion?.precios || [];
  const precioDefault = precios.find(p => p.esPrecioDefault);
  const precioDescuento = precios.find(p => p.esDescuento);
  const precioActual = precioDescuento || precioDefault;

  // Formatear precios
  const precioLocal = precioActual ? formatPrice(precioActual.precio) : null;
  const precioUSD = precioActual?.precio || 0;

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
          usuarioEmail: session?.user?.email,
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
          usuarioEmail: session?.user?.email,
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

  const formatDate = (date: Date) => {
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: es });
  };

  const formatTime = (date: Date) => {
    return format(date, 'HH:mm');
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

  if (!edicion) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Edición no disponible</h1>
          <p className="text-muted-foreground mb-6">
            No hay ediciones activas para este curso en este momento.
          </p>
          <Link href={`/cursos/${curso.id}`}>
            <Button>Volver al curso</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      {loader && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">

          <p className="mt-4 text-lg font-medium">Procesando tu compra...</p>
          <p className="text-sm text-muted-foreground mt-2">
            Por favor no cierres esta página
          </p>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4">
        {/* Navegación */}
        <div className="mb-8">
          <Link
            href={`/cursos/${curso.id}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            Volver al curso
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Información del curso */}
          <div className="space-y-8">
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
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Edición Vigente
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl font-bold tracking-tight">{curso.titulo}</h1>

              <p className="text-muted-foreground leading-relaxed">
                {curso.descripcion}
              </p>

              {curso.urlMiniatura && (
                <div className="relative h-64 w-full overflow-hidden rounded-lg">
                  <Image
                    src={curso.urlMiniatura}
                    alt={curso.titulo}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              )}
            </div>

            {/* Información del usuario */}
            <Card>
              <CardContent >
                <h3 className="font-semibold flex items-center gap-2 mb-4">
                  <User className="size-5" />
                  {session ? 'Tus datos' : 'Inicio de sesión'}
                </h3>

                {session ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Nombre:</span>
                      <span className="font-medium">{session.user?.name || 'No especificado'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Email:</span>
                      <span className="font-medium">{session.user?.email}</span>
                    </div>
                    <p className="text-sm text-muted-foreground pt-2 border-t">
                      Usaremos estos datos para tu acceso a la plataforma
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <LogIn className="size-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">¿Ya tienes cuenta?</p>
                        <p className="text-sm text-muted-foreground">
                          Inicia sesión si ya has comprado con nosotros antes
                        </p>
                      </div>
                    </div>
                    <Link href="/auth/signin" className="block">
                      <Button className="w-full">Iniciar sesión</Button>
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      Si es tu primera compra, te crearemos una cuenta automáticamente.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Información de la edición */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Calendar className="size-5" />
                Edición {edicion.codigo}
              </h3>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Fecha de inicio</p>
                  <p className="font-medium">{formatDate(edicion.fechaInicio)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatTime(edicion.fechaInicio)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Fecha de fin</p>
                  <p className="font-medium">{formatDate(edicion.fechaFin)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatTime(edicion.fechaFin)}
                  </p>
                </div>
              </div>
            </div>

            {/* Beneficios */}
            {curso.beneficios && curso.beneficios.length > 0 && (
              <Card>
                <CardContent >
                  <h3 className="font-semibold flex items-center gap-2 mb-4">
                    <CheckSquare className="size-5" />
                    Lo que obtendrás
                  </h3>
                  <div className="space-y-3">
                    {curso.beneficios.map((beneficio) => (
                      <div key={beneficio.id} className="flex items-start gap-3">
                        <CheckCircle2 className="size-4 text-primary mt-1 flex-shrink-0" />
                        <span className="text-sm">{beneficio.descripcion}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Proceso de acceso */}
            <div className="space-y-4">
              <h3 className="font-semibold">Tu proceso de acceso</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <DollarSign className="size-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium">Pago confirmado</p>
                  <p className="text-xs text-muted-foreground">
                    Recibirás confirmación inmediata
                  </p>
                </div>
                <div className="space-y-2 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="size-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium">Credenciales</p>
                  <p className="text-xs text-muted-foreground">
                    Envío automático por email
                  </p>
                </div>
                <div className="space-y-2 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Monitor className="size-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium">Acceso inmediato</p>
                  <p className="text-xs text-muted-foreground">
                    Ingresa a la plataforma
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Panel de pago */}
          <div className="lg:sticky lg:top-8">
            <Card >
              <CardContent >
                <div className="space-y-6">
                  {/* Resumen */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Resumen del pedido</h3>

                    <div className="space-y-3">
                      {/* Precio */}
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Inversión</span>
                        <div className="text-right">
                          <div className="font-semibold text-xl">
                            {precioLocal?.code} {precioLocal?.value}
                          </div>
                          {selectedCurrency.code !== 'USD' && (
                            <div className="text-xs text-muted-foreground mt-1">
                              ≈ USD {precioUSD.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Descuento */}
                      {precioDescuento?.porcentajeDescuento && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Descuento</span>
                          <span className="text-green-600 font-semibold">
                            -{precioDescuento.porcentajeDescuento}%
                          </span>
                        </div>
                      )}

                      {/* Total */}
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">Total a pagar</span>
                          <div className="text-right">
                            <div className="font-bold text-2xl text-primary">
                              {precioLocal?.code} {precioLocal?.value}
                            </div>
                            {selectedCurrency.code !== 'USD' && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Se cobrará en USD
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Información de conversión */}
                  {selectedCurrency.code !== 'USD' && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                        <Clock className="size-4" />
                        <span className="text-sm font-medium">Conversión automática</span>
                      </div>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                        El pago se procesa en USD ({precioUSD.toFixed(2)}).
                        Tu banco realizará la conversión a tu moneda local.
                      </p>
                    </div>
                  )}

                  {/* PayPal */}
                  <div className="space-y-4">
                    <Button className='w-full rounded-sm h-14 text-xl ' size={'lg'} >
                      Pago Asistido
                    </Button>
                    <Button className='w-full rounded-sm h-14 text-xl bg-[#9519a3]' size={'lg'} >
                      <Image src={'/logo-yape.png'} width={100} height={100} className='w-20' alt='logo yape' />
                      Pagar con Yape
                    </Button>
                    <PayPalButtons
                      style={{
                        layout: 'vertical',
                        color: 'blue',
                        label: 'paypal',
                      }}
                      
                      createOrder={createOrder}
                      onApprove={onApprove}
                      onError={onError}
                      disabled={!edicion || !precioActual}
                    />

                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Lock className="size-4" />
                      <span>Pago 100% seguro con PayPal</span>
                    </div>

                    <p className="text-xs text-center text-muted-foreground">
                      Al completar la compra, aceptas nuestros{' '}
                      <Link href="/terminos" className="text-primary hover:underline">
                        Términos y condiciones
                      </Link>
                    </p>
                  </div>

                  {/* Mensaje de error */}
                  {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}