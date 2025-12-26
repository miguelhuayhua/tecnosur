"use client";
import * as React from "react";
import { SessionProvider } from "next-auth/react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "sonner";


export interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange >
      <SessionProvider>

        <PayPalScriptProvider options={{
          clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
          locale: 'es_ES',
          currency: "USD"
        }} >

          {children}
          <Toaster />
        </PayPalScriptProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
