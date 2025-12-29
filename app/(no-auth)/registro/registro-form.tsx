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
import { FaGithub, FaGoogle, FaTwitch } from "react-icons/fa"

type LoginFormData = {
  usuario: string
  password: string
}

export function RegistroForm({
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
    <FieldGroup>
      <div className="flex flex-col items-center  text-center">
        <h1 className="text-2xl font-bold">Regístrate</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Usa los métodos de registro más fáciles
        </p>
      </div>


      <Field className="space-y-2">
        <Button variant="outline"
          onClick={() => signIn('google', {
            callbackUrl: params.has('callbackUrl') ?
              params.get('callbackUrl')! : '/dashboard',
            redirect: params.has('callbackUrl')
          })}
          type="button">
          <FaGoogle />
          Registrarme con Google
        </Button>
        <Button variant="outline"
          onClick={() => signIn('github', {
            callbackUrl: params.has('callbackUrl') ?
              params.get('callbackUrl')! : '/dashboard',
            redirect: params.has('callbackUrl')
          })}
          type="button">
          <FaGithub />
          Registrarme con Github
        </Button>
          <Button variant="outline"
          onClick={() => signIn('twitch', {
            callbackUrl: params.has('callbackUrl') ?
              params.get('callbackUrl')! : '/dashboard',
            redirect: params.has('callbackUrl')
          })}
          type="button">
          <FaTwitch />
          Registrarme con Twitch
        </Button>
        <FieldDescription className="text-center pt-2 ">
          ¿Ya tienes una cuenta?{" "}
          <Link href="/registro" className="underline text-foreground font-semibold">
            Inicia sesión
          </Link>
        </FieldDescription>
      </Field>
    </FieldGroup>
  )
}