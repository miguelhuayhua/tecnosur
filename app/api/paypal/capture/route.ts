// app/api/paypal/capture/route.ts
import { NextRequest, NextResponse } from "next/server";
import paypal from "@paypal/checkout-server-sdk";
import { paypalClient } from "@/lib/paypal";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

// Schema de validación
const captureOrderSchema = z.object({
    orderID: z.string().min(1, "orderID requerido"),
    cursoId: z.string().min(1, "ID del curso requerido"),
    edicionId: z.string().min(1, "ID de edición requerido"),
    usuarioEmail: z.email("Email válido requerido").optional(),
});

// Función para generar contraseña temporal
function generarPasswordTemporal(): string {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
        password += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return password;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Validar datos de entrada
        const validationResult = captureOrderSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: "Datos inválidos",
                    details: validationResult.error
                },
                { status: 400 }
            );
        }

        const { orderID, cursoId, edicionId, usuarioEmail } = validationResult.data;

        // Capturar la orden en PayPal
        const request = new paypal.orders.OrdersCaptureRequest(orderID);
        request.requestBody({} as any);

        const capture = await paypalClient.execute(request);


        // Verificar que la respuesta de PayPal tiene la estructura esperada
        if (!capture.result) {
            throw new Error("Respuesta vacía de PayPal");
        }

        if (capture.result.status !== "COMPLETED") {
            throw new Error(`Estado de orden no completado: ${capture.result.status || 'DESCONOCIDO'}`);
        }

        // Obtener información del pagador de PayPal
        const payer = capture.result.payer;
        const payerEmail = payer?.email_address || usuarioEmail;
        const payerNombre = payer?.name?.given_name || 'Cliente';
        const payerApellido = payer?.name?.surname || 'PayPal';

     
        if (!payerEmail) {
            throw new Error("No se pudo obtener el email del pagador de PayPal");
        }

        // Buscar el monto
        let monto = 0;
        let moneda = 'USD';

        if (capture.result.purchase_units && capture.result.purchase_units.length > 0) {
            const purchaseUnit = capture.result.purchase_units[0];
            const captureData = purchaseUnit.payments?.captures?.[0];

            if (captureData?.amount) {
                monto = parseFloat(captureData.amount.value) || 0;
                moneda = captureData.amount.currency_code || 'USD';
            }
        }


        let usuarioId = null;
        let comprobado = false;
        let usuarioCreado = false;
        let passwordTemporal = null;
        let estudianteId = null;

        // Verificar si el usuario ya existe con el email de PayPal
        const usuarioExistente = await prisma.usuariosEstudiantes.findUnique({
            where: { correo: payerEmail },
            include: {
                estudiante: true
            }
        });

        if (usuarioExistente) {
            // Usuario existente
            usuarioId = usuarioExistente.id;
            estudianteId = usuarioExistente.estudiante?.id;
            comprobado = true;
        } else {
            // Crear nuevo usuario con datos de PayPal
            passwordTemporal = generarPasswordTemporal();
            const hashedPassword = await bcrypt.hash(passwordTemporal, 12);

            // Usar nombre y apellido reales de PayPal o valores por defecto
            const nombreUsuario = payerNombre !== 'Cliente' ? payerNombre : 'Usuario';
            const apellidoUsuario = payerApellido !== 'PayPal' ? payerApellido : 'Temporal';

            const usuarioTemporal = await prisma.usuariosEstudiantes.create({
                data: {
                    usuario: nombreUsuario,
                    correo: payerEmail,
                    contrasena: hashedPassword,
                    estaActivo: true
                }
            });

            // Crear estudiante con datos de PayPal
            const estudianteTemporal = await prisma.estudiantes.create({
                data: {
                    nombre: nombreUsuario,
                    apellido: apellidoUsuario,
                    usuarioId: usuarioTemporal.id,
                    celular: ''
                }
            });

            usuarioId = usuarioTemporal.id;
            estudianteId = estudianteTemporal.id;
            usuarioCreado = true;
            comprobado = false; // Ahora está comprobado porque usamos datos reales de PayPal
        }

        // Verificar si ya existe una compra con este orderID (evitar duplicados)
        const compraExistente = await prisma.compras.findFirst({
            where: { providerId: orderID }
        });

        if (compraExistente) {
            return NextResponse.json(
                { error: "Esta compra ya fue procesada" },
                { status: 409 }
            );
        }

        // Crear registro de compra en la base de datos
        const compra = await prisma.compras.create({
            data: {
                providerId: orderID,
                edicionId: edicionId,
                usuarioId: usuarioId,
                monto: monto,
                moneda: moneda,
                comprobado: comprobado,
                nombre: payerNombre,
                apellido: payerApellido,
                fechaCompra: new Date(),
            },
            include: {
                edicion: {
                    include: {
                        curso: true
                    }
                }
            }
        });


        // Crear inscripción (verificar si ya existe primero)
        if (estudianteId) {
            const inscripcionExistente = await prisma.inscripciones.findFirst({
                where: {
                    estudianteId: estudianteId,
                    edicionId: edicionId
                }
            });

            if (!inscripcionExistente) {
                await prisma.inscripciones.create({
                    data: {
                        edicionId: edicionId,
                        estudianteId: estudianteId,
                        estaActivo: true,
                        inscritoEn: new Date()
                    }
                });
            } else {
                // Reactivar la inscripción si estaba inactiva
                await prisma.inscripciones.update({
                    where: { id: inscripcionExistente.id },
                    data: { estado: true }
                });
            }
        }

        const responseData = {
            success: true,
            status: capture.result.status,
            orderID: orderID,
            compraId: compra.id,
            monto: monto,
            moneda: moneda,
            usuarioExistente: !usuarioCreado,
            usuarioCreado: usuarioCreado,
            necesitaCompletarRegistro: false, // Ya no necesita completar registro porque usamos datos de PayPal
            comprobado: comprobado,
            passwordTemporal: usuarioCreado ? passwordTemporal : null,
            payer: {
                nombre: payerNombre,
                apellido: payerApellido,
                email: payerEmail
            },
            loginData: usuarioCreado ? {
                email: payerEmail,
                password: passwordTemporal
            } : null,
            curso: compra.edicion.curso
        };


        return NextResponse.json(responseData);

    } catch (err: any) {
        
        if (err.statusCode) {
            return NextResponse.json(
                {
                    error: "Error de PayPal",
                    details: err.message,
                    statusCode: err.statusCode
                },
                { status: err.statusCode }
            );
        }

        return NextResponse.json(
            { error: "Error interno del servidor al capturar el pago: " + err.message },
            { status: 500 }
        );
    }
}