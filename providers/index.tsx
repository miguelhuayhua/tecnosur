"use client";
import * as React from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "./theme-provider";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";


export interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {

  return (
    <SessionProvider>

      <PayPalScriptProvider options={{
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
        locale: 'es_ES',
        currency: "USD"
      }} >

        {children}
      </PayPalScriptProvider>
    </SessionProvider>
  );
}
