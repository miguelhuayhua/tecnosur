'use client';

import { QRCode } from '@/components/ui/shadcn-io/qr-code';
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
    CheckCircle,
    Share2,
    User,
    Book,
    Calendar,
    Award,
    Hash,
    Building,
    Shield
} from "lucide-react";

interface CertificadoData {
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
            urlMiniatura?: string;
        };
    };
    urlCertificado?: string;
    isValid: boolean;
}

interface ValidarCertificadoClientProps {
    certificado: CertificadoData;
}

const MicrosoftLogo = () => (
    <svg width="20" height="20" viewBox="0 0 23 23">
        <path fill="#f1511b" d="M0 0h11v11H0V0z" />
        <path fill="#80cc28" d="M12 0h11v11H12V0z" />
        <path fill="#00adef" d="M0 12h11v11H0V12z" />
        <path fill="#fbbc09" d="M12 12h11v11H12V12z" />
    </svg>
);

const GoogleLogo = () => (
    <svg width="20" height="20" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
);

export default function ValidarCertificadoClient({ certificado }: ValidarCertificadoClientProps) {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Certificado - ${certificado.edicion.curso.titulo}`,
                    text: `Verifica mi certificado de ${certificado.edicion.curso.titulo}`,
                    url: currentUrl,
                });
            } catch (error) {
            }
        } else {
            navigator.clipboard.writeText(currentUrl);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header con Logos */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <div className="flex justify-center items-center gap-4 mb-8">
                        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2.5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <MicrosoftLogo />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Microsoft</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2.5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <GoogleLogo />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Google</span>
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 mb-6">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                            Certificado Verificado
                        </span>
                    </div>

                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
                        Validación Exitosa
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Este certificado ha sido autenticado y verificado en nuestro sistema
                    </p>
                </motion.div>

                {/* Card Principal Unificada */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                    {/* Header del Card */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-8 py-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-center gap-3">
                            <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800 shadow-sm">
                                <Award className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Certificado de Finalización
                                </h2>
                            </div>
                        </div>
                    </div>

                    {/* Contenido Principal */}
                    <div className="p-8">
                        {/* Información del Estudiante y Curso */}
                        <div className="grid md:grid-cols-2 gap-8 mb-8">
                            <div className="text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                                    <User className="h-4 w-4" />
                                    <span>Otorgado a</span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                    {certificado.estudiante.nombre} {certificado.estudiante.apellido}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {certificado.estudiante.usuario.correo}
                                </p>
                            </div>

                            <div className="text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                                    <Book className="h-4 w-4" />
                                    <span>Curso completado</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                    {certificado.edicion.curso.titulo}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                    {certificado.edicion.curso.descripcion}
                                </p>
                            </div>
                        </div>

                        {/* Detalles del Certificado */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl">
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                                    <Building className="h-3.5 w-3.5" />
                                    <span>Edición</span>
                                </div>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                    {certificado.edicion.codigo}
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>Fecha de emisión</span>
                                </div>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                    {formatDate(certificado.fechaEmision)}
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                                    <Hash className="h-3.5 w-3.5" />
                                    <span>Código único</span>
                                </div>
                                <p className="font-mono font-bold text-gray-900 dark:text-white">
                                    {certificado.codigoUnico}
                                </p>
                            </div>
                        </div>

                        {/* QR Code */}
                        <div className="flex justify-center mb-8">
                            <div className="text-center">
                                <div className="inline-flex p-4 bg-white rounded-2xl border-2 border-gray-200 shadow-sm mb-3">
                                    <QRCode 
                                        data={currentUrl}
                                        foreground="#000000"
                                        background="#FFFFFF"
                                        robustness="H"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Escanear para verificar autenticidad
                                </p>
                            </div>
                        </div>

                        {/* Información de Seguridad */}
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                            <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                            <p className="text-center">
                                Emitido y verificado por <span className="font-semibold text-gray-900 dark:text-white">Data School Bolivia</span> • Verificación disponible 24/7
                            </p>
                        </div>

                        {/* Botón de Compartir */}
                        <div className="flex justify-center">
                            <Button
                                onClick={handleShare}
                                size="lg"
                                className="px-8"
                            >
                                <Share2 className="h-5 w-5 mr-2" />
                                Compartir Certificado
                            </Button>
                        </div>
                    </div>
                </motion.div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400"
                >
                    <p>Verificado el {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </motion.div>
            </div>
        </div>
    );
}