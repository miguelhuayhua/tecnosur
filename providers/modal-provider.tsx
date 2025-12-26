'use client';
import React, { ReactElement, createContext, useContext, useState } from 'react';
import { toast, Toaster } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { Loader } from '@/components/ui/loader';

// Tipos para los diferentes estados y tipos de mensaje
type MessageType = 'success' | 'error' | 'warning' | 'info';
type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';

interface ModalParams {
    content: ReactElement | string;
    url: string;
    data?: any;
    titulo: string;
    ButtonText?: {
        yes: string;
        no: string;
    };
    hasBack?: boolean;
    callback: (data: { success: boolean, message: string, data: any }) => void,
    messageType?: MessageType;
    confirmButtonVariant?: ButtonVariant;
    showIcon?: boolean;
    customIcon?: ReactElement;
}

interface ModalContextType {
    openModal: (params: ModalParams) => void;
}

// Creamos el contexto
const ModalContext = createContext<ModalContextType>({
    openModal: () => { }
});

// Componente para mostrar iconos según el tipo de mensaje
const MessageIcon = ({ type, customIcon }: { type: MessageType, customIcon?: ReactElement }) => {
    if (customIcon) return customIcon;

    const iconConfig = {
        success: { icon: CheckCircle, color: 'text-green-500' },
        error: { icon: XCircle, color: 'text-red-500' },
        warning: { icon: AlertTriangle, color: 'text-yellow-500' },
        info: { icon: Info, color: 'text-blue-500' }
    };

    const { icon: Icon, color } = iconConfig[type];
    return <Icon className={`h-6 w-6 ${color}`} />;
};

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [action, setAction] = useState<{ params: ModalParams }>({
        params: {
            content: <></>,
            url: '',
            data: {},
            titulo: '',
            ButtonText: { yes: 'Aceptar', no: 'Cancelar' },
            hasBack: false,
            callback: (data: { success: boolean, message: string, data: any }) => { },
            messageType: 'info',
            confirmButtonVariant: 'default',
            showIcon: true
        }
    });

    const openModal = (params: ModalParams) => {
        setAction({
            params: {
                ...action.params,
                ...params,
                messageType: params.messageType || 'info',
                confirmButtonVariant: params.confirmButtonVariant || 'default',
                showIcon: params.showIcon !== false
            }
        });
        setOpen(true);
    };

    const handleConfirm = async () => {
        const { data, url, callback, messageType = 'info' } = action.params;
        setIsLoading(true);
        // Usar sonner.promise para mostrar carga y resultado
        const promise = toast.promise(
            async () => {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                const responseData = await response.json();

                if (!response.ok) {
                    // Lanzar error con mensaje específico
                    const errorMessage = responseData.message ||
                        responseData.error ||
                        `Error ${response.status}: ${response.statusText}`;
                    throw new Error(errorMessage);
                }

                return responseData;
            },
            {
                success: (responseData) => {
                    // Cerrar el modal después del éxito
                    setOpen(false);

                    // Ejecutar callback si existe
                    if (callback) {
                        callback(responseData);
                    }

                    // Retornar mensaje de éxito
                    const successMessages = {
                        success: responseData.message || "Operación completada con éxito",
                        info: responseData.message || "Información procesada correctamente",
                        warning: responseData.message || "Acción completada con advertencias",
                        error: responseData.message || "Acción completada"
                    };

                    return successMessages[messageType];
                },
                error: (error) => {
                    // Cerrar el modal también en caso de error
                    setOpen(false);

                    // Retornar mensaje de error
                    return error.message || "Ha ocurrido un error inesperado";
                },
                finally: () => {
                    setIsLoading(false)
                }
            }
        );

        // Manejar el promise para logging adicional si es necesario
        try {
            await promise;
        } catch (error) {
            // El error ya fue manejado por sonner.promise
            console.error('Error en la petición:', error);
        }
    };

    const getConfirmButtonStyle = (variant: ButtonVariant): string => {
        const baseStyle = "flex items-center gap-2";
        const variants = {
            default: "bg-primary text-primary-foreground hover:bg-primary/90",
            destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
            secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            ghost: "hover:bg-accent hover:text-accent-foreground",
            link: "text-primary underline-offset-4 hover:underline"
        };
        return `${baseStyle} ${variants[variant]}`;
    };

    return (
        <ModalContext.Provider value={{ openModal }}>
            {
                isLoading && (
                    <div className='fixed z-100 bg-background/50 backdrop-blur-md flex items-center justify-center  h-screen w-screen'>
                        <Loader variant="dual-ring">
                            <span className="text-foreground font-semibold">Procesando solicitud...</span>
                        </Loader>
                    </div>
                )
            }
            {children}

            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent className="sm:max-w-md">
                    <AlertDialogHeader>
                        <div className="flex items-center justify-center gap-3">
                            {action.params.showIcon && (
                                <MessageIcon
                                    type={action.params.messageType!}
                                    customIcon={action.params.customIcon}
                                />
                            )}
                            <AlertDialogTitle className="text-lg text-center font-semibold">
                                {action.params.titulo}
                            </AlertDialogTitle>
                        </div>

                        <AlertDialogDescription className="text-center pt-3 pb-2">
                            <div className={`space-y-2 ${typeof action.params.content === 'string'
                                ? ' leading-relaxed'
                                : ''
                                }`}>
                                {action.params.content}
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter className="flex gap-3 ">
                        <AlertDialogCancel
                            disabled={isLoading}
                            className="flex-1 sm:flex-none"
                        >
                            {action.params.ButtonText?.no}
                        </AlertDialogCancel>

                        <AlertDialogAction
                            onClick={handleConfirm}
                            className={getConfirmButtonStyle(action.params.confirmButtonVariant!)}
                        >
                            {action.params.ButtonText?.yes}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </ModalContext.Provider>
    );
};

// Hook para usar el modal
export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal debe ser usado dentro de un ModalProvider');
    }
    return context;
};