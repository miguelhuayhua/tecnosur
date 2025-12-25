// app/api/paypal/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import paypal from "@paypal/checkout-server-sdk";
import { paypalClient } from "@/lib/paypal";
import { z } from "zod";

// Schema de validación
const createOrderSchema = z.object({
  cursoId: z.string().min(1, "ID del curso requerido"),
  edicionId: z.string().min(1, "ID de edición requerido"),
  monto: z.number().min(0.01, "Monto debe ser mayor a 0"),
  moneda: z.string().default("USD"),
  descripcion: z.string().min(1, "Descripción requerida"),
  usuarioEmail: z.string().email("Email válido requerido").optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validar datos de entrada
    const validationResult = createOrderSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          details: validationResult.error
        },
        { status: 400 }
      );
    }

    const { cursoId, edicionId, monto, moneda, descripcion, usuarioEmail } = validationResult.data;

    // Obtener la URL base de manera segura
    const baseUrl = process.env.NEXTAUTH_URL ||
      process.env.VERCEL_URL ?
      `https://${process.env.VERCEL_URL}` :
      'http://localhost:3000';

    // Crear request de PayPal
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");

    // Preparar el amount con breakdown requerido
    const amountValue = monto.toFixed(2);

    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: `${cursoId}_${edicionId}`,
          description: descripcion.substring(0, 127), // Máximo 127 caracteres
          custom_id: usuarioEmail || `guest_${Date.now()}`,
          amount: {
            currency_code: moneda,
            value: amountValue,
            breakdown: {
              item_total: {
                currency_code: moneda,
                value: amountValue
              }
            } as any
          },
          items: [
            {
              name: descripcion.length > 127 ? `${descripcion.substring(0, 124)}...` : descripcion,
              description: `Curso: ${descripcion}`.substring(0, 127),
              quantity: "1",
              unit_amount: {
                currency_code: moneda,
                value: amountValue
              },
              category: "DIGITAL_GOODS"
            }
          ]
        },
      ],
      application_context: {
        brand_name: "Tu Plataforma Educativa",
        landing_page: "BILLING",
        user_action: "PAY_NOW",
        cancel_url: `${baseUrl}/cursos/${cursoId}/checkout`,
        shipping_preference: "NO_SHIPPING"
      }
    });

    const order = await paypalClient.execute(request);

    return NextResponse.json({
      id: order.result.id,
      status: order.result.status,
      links: order.result.links
    });

  } catch (err: any) {
    console.error("Error creando orden PayPal:", err);

    // Manejar errores específicos de PayPal
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
      { error: "Error interno del servidor al crear la orden" },
      { status: 500 }
    );
  }
}