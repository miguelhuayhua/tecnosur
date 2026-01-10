'use client';

import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MainNavbar } from "@/app/componentes/estatico/navbar";
import { Footer } from "@/app/componentes/estatico/footer";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from 'react';
import { Shield, Search, CheckCircle, XCircle, FileText, User, Book, Calendar, Award, Hash } from "lucide-react";
import Link from 'next/link';

// Logos de partners
const MicrosoftLogo = () => (
  <svg width="80" height="25" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.5 11.5H0V0H11.5V11.5Z" fill="#F1511B" />
    <path d="M23 11.5H11.5V0H23V11.5Z" fill="#80CC28" />
    <path d="M11.5 23H0V11.5H11.5V23Z" fill="#00ADEF" />
    <path d="M23 23H11.5V11.5H23V23Z" fill="#FBBC09" />
  </svg>
);

const GoogleLogo = () => (
  <svg width="80" height="25" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

interface CertificateData {
  id: string;
  codigoUnico: string;
  fechaEmision: string;
  estudiante: {
    id: string;
    nombre: string;
    apellido: string;
    usuario: {
      nombre: string;
      correo: string;
    };
  };
  edicion: {
    id: string;
    codigo: string;
    curso: {
      titulo: string;
      descripcion: string;
    };
  };
  notaFinal?: number;
  urlCertificado?: string;
  isValid: boolean;
}

export default function ValidarCertificadoPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationResult, setValidationResult] = useState<null | {
    isValid: boolean;
    message: string;
    certificateData?: CertificateData;
  }>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<{ codigoUnico: string }>({
  });

  const onSubmit = async (data: { codigoUnico: string }) => {
    setIsSubmitting(true);
    setValidationResult(null);

    try {
      const response = await fetch('/api/certificados/validar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ codigoUnico: data.codigoUnico }),
      });

      const result = await response.json();

      if (response.ok) {
        setValidationResult({
          isValid: true,
          message: result.message || 'Certificado válido y autenticado',
          certificateData: result.data
        });
      } else {
        setValidationResult({
          isValid: false,
          message: result.message || 'Certificado no encontrado o inválido'
        });
      }
    } catch (error) {
      setValidationResult({
        isValid: false,
        message: 'Error de conexión. Intente nuevamente.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewValidation = () => {
    setValidationResult(null);
    reset();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <MainNavbar />

      <div className="pt-20 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
                <Shield className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-3">Validar Certificado</h1>
            <p className="text-muted-foreground text-sm">
              Verifica la autenticidad de tu certificado Data School Bolivia
            </p>
          </motion.div>

          {/* Partners Banner */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-muted/30 rounded-lg p-4 mb-8"
          >
            <div className="text-center mb-3">
              <p className="text-sm text-muted-foreground font-medium">
                Certificados avalados por nuestros partners tecnológicos
              </p>
            </div>
            <div className="flex justify-center items-center gap-8">
              <MicrosoftLogo />
              <GoogleLogo />
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border rounded-lg p-6 mb-8 shadow-sm"
          >
            <form onSubmit={handleSubmit(onSubmit)}>
              <FieldGroup>
                <FieldSet>
                  <FieldLabel htmlFor="codigoUnico" className="text-sm font-medium">
                    Código Único del Certificado
                  </FieldLabel>
                  <FieldDescription className="text-sm mb-4">
                    Ingresa el código único que aparece en tu certificado. Ej: DSB-2024-ABC123XYZ
                  </FieldDescription>

                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Input
                        id="codigoUnico"
                        placeholder="DSB-2024-ABC123XYZ"
                        {...register('codigoUnico', {
                          required: 'El código único es requerido',
                          minLength: {
                            value: 5,
                            message: 'El código debe tener al menos 5 caracteres'
                          }
                        })}
                        className={errors.codigoUnico ? 'border-destructive' : ''}
                      />
                      {errors.codigoUnico && (
                        <FieldDescription className="text-destructive text-xs mt-1">
                          {errors.codigoUnico.message}
                        </FieldDescription>
                      )}
                    </div>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="whitespace-nowrap"
                    >
                      {isSubmitting ? (
                        <>
                          <Search className="h-4 w-4 mr-2 animate-spin" />
                          Validando...
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4 mr-2" />
                          Validar
                        </>
                      )}
                    </Button>
                  </div>
                </FieldSet>
              </FieldGroup>
            </form>
          </motion.div>
          {/* Resultado */}
          {/* Resultado */}
          <AnimatePresence>
            {validationResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`rounded-lg p-6 ${validationResult.isValid
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/10 dark:to-emerald-950/10 ring-1 ring-green-200 dark:ring-green-800'
                  : 'bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/10 dark:to-orange-950/10 ring-1 ring-red-200 dark:ring-red-800'
                  }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-full ${validationResult.isValid
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                    {validationResult.isValid ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <XCircle className="h-6 w-6" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className={`text-xl font-bold ${validationResult.isValid
                        ? 'text-green-900 dark:text-green-100'
                        : 'text-red-900 dark:text-red-100'
                        }`}>
                        {validationResult.isValid ? '✅ Certificado Válido' : '❌ Certificado Inválido'}
                      </h3>
                    </div>

                    <p className={`text-base mb-4 ${validationResult.isValid
                      ? 'text-green-700 dark:text-green-300'
                      : 'text-red-700 dark:text-red-300'
                      }`}>
                      {validationResult.message}
                    </p>

                    {validationResult.isValid && validationResult.certificateData && (
                      <div className="space-y-3 mb-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                            <div className="text-xs text-muted-foreground font-medium mb-1">Estudiante</div>
                            <div className="font-semibold text-foreground">
                              {validationResult.certificateData.estudiante.nombre} {validationResult.certificateData.estudiante.apellido}
                            </div>
                          </div>

                          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                            <div className="text-xs text-muted-foreground font-medium mb-1">Curso</div>
                            <div className="font-semibold text-foreground">
                              {validationResult.certificateData.edicion.curso.titulo}
                            </div>
                          </div>

                          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                            <div className="text-xs text-muted-foreground font-medium mb-1">Edición</div>
                            <div className="font-semibold text-foreground">
                              {validationResult.certificateData.edicion.codigo}
                            </div>
                          </div>

                          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                            <div className="text-xs text-muted-foreground font-medium mb-1">Fecha</div>
                            <div className="font-semibold text-foreground">
                              {formatDate(validationResult.certificateData.fechaEmision)}
                            </div>
                          </div>
                        </div>

                        {validationResult.certificateData.urlCertificado && (
                          <Button
                            asChild
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-sm"
                          >
                            <Link
                              href={`/certificados/validar/${validationResult.certificateData.codigoUnico}`}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Ver Certificado Completo
                            </Link>
                          </Button>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={handleNewValidation}
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 border-border/50"
                      >
                        <Search className="h-4 w-4 mr-2" />
                        Validar Otro
                      </Button>

                      {validationResult.isValid && validationResult.certificateData && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-white/50 dark:hover:bg-gray-800/50"
                          onClick={() => {
                            // Aquí podrías agregar funcionalidad de compartir
                            navigator.clipboard.writeText(validationResult.certificateData!.codigoUnico);
                            // Podrías agregar un toast de confirmación
                          }}
                        >
                          <Hash className="h-4 w-4 mr-2" />
                          Copiar Código
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Footer />
    </div>
  );
}