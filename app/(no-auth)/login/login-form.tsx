"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { Loader2 } from "lucide-react"
import Link from "next/link"

type LoginFormData = {
  usuario: string
  password: string
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      usuario: "",
      password: "",
    },
  })
  const params = useSearchParams();
  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        usuario: data.usuario,
        password: data.password,
        callbackUrl: params.has('callbackUrl') ? params.get('callbackUrl')! : '/dashboard',
        redirect: params.has('callbackUrl')
      })

      if (result?.error) {
        setError("Credenciales inválidas. Por favor, inténtalo de nuevo.")
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch (error) {
      setError("Ocurrió un error. Por favor, inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form
      className={cn("flex flex-col", className)}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center  text-center">
          <h1 className="text-2xl font-bold">Iniciar sesión</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Ingresa tu email para acceder a tu cuenta
          </p>
        </div>



        <Field>
          <FieldLabel htmlFor="email">Usuario o Correo electrónico.</FieldLabel>
          <Controller
            rules={{ required: "El usuario o correo es requerido" }}
            name="usuario"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="email"
                disabled={isLoading}
                aria-invalid={!!errors.usuario}
              />
            )}
          />
          {errors.usuario && (
            <FieldError>{errors.usuario.message}</FieldError>
          )}
        </Field>

        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Contraseña</FieldLabel>
            <a
              href="/forgot-password"
              className="ml-auto text-xs underline-offset-4 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>
          <Controller
            name="password"
            control={control}
            rules={{
              required: "La contraseña es requerida",
              minLength: {
                value: 6,
                message: "La contraseña debe tener al menos 6 caracteres",
              },
            }}
            render={({ field }) => (
              <PasswordInput
                {...field}
                disabled={isLoading}
                aria-invalid={!!errors.password}
              />
            )}
          />
          {errors.password && (
            <FieldError >
              {errors.password.message}
            </FieldError>
          )}
        </Field>
        {error && (
          <p className="text-center text-xs text-destructive">
            {error}
          </p>
        )}
        <Field>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              "Iniciar sesión"
            )}
          </Button>
        </Field>


        <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
          O inicia sesión con
        </FieldSeparator>
        <Field>
          <Button variant="outline"
            onClick={() => signIn('google', {
              callbackUrl: params.has('callbackUrl') ?
                params.get('callbackUrl')! : '/dashboard',
              redirect: params.has('callbackUrl')
            })}
            type="button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                fill="currentColor"
              />
            </svg>
            Iniciar sesión con Google
          </Button>
          <FieldDescription className="text-center pt-2 ">
            ¿No tienes una cuenta?{" "}
            <Link href="/registro" className="underline underline-offset-4">
              Regístrate
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}