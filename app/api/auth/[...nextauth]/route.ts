import NextAuth from "next-auth";
import bcrypt from "bcrypt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { TipoGenero } from "@/prisma/generated";

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_ID!,
            clientSecret: process.env.GOOGLE_SECRET!,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            },
        }),
        CredentialsProvider({
            name: 'credenciales',
            credentials: {
                usuario: { label: "Usuario", type: "text", placeholder: "" },
                password: { label: "Contraseña", type: "password", placeholder: "" },
            },
            async authorize(credentials) {
                try {
                    const { usuario, password } = credentials as { usuario: string, password: string };

                    const data = await prisma.usuariosEstudiantes.findFirst({
                        where: {
                            OR: [
                                { usuario },
                                { correo: usuario }
                            ]
                        }
                    });

                    if (data && bcrypt.compareSync(password, data.contrasena)) {
                        return {
                            email: data.correo,
                            name: data.usuario,
                            id: data.id,
                            image: data.avatar || "",
                            registrado: data.registrado
                        }
                    }
                    else {
                        throw new Error('redirect')
                    }
                } catch (error) {
                    console.error('🚨 Error completo:', error);
                    throw new Error('redirect')
                }
            },
        }),
    ],

    callbacks: {
        async signIn({ account, profile, user }) {
            if (account?.provider === "google") {
                // Verificar si el usuario ya existe en tu base de datos
                let existingUser = await prisma.usuariosEstudiantes.findFirst({
                    where: {
                        correo: profile?.email!,
                    },
                });

                // Si no existe, crearlo
                if (!existingUser) {
                    existingUser = await prisma.usuariosEstudiantes.create({
                        data: {
                            correo: profile?.email!,
                            usuario: profile?.email?.split('@')[0] || "Usuario",
                            contrasena: await bcrypt.hash(Math.random().toString(36), 10),
                            avatar: profile?.image,
                            estudiante: {
                                create: {
                                    nombre: profile?.name || '',
                                    genero: TipoGenero.HOMBRE
                                }
                            }
                        },
                    });
                }

                // ✅ Agregar los datos del usuario al objeto user
                // Esto permite que estén disponibles en el callback jwt
                if (user) {
                    user.id = existingUser.id;
                    user.registrado = existingUser.registrado;
                    user.email = existingUser.correo;
                    user.name = existingUser.usuario;
                }

                return true;
            }

            // Para Credentials provider, ya viene con los datos correctos desde authorize()
            return true;
        },

        jwt: async ({ session, token, trigger, user }) => {
            // ✅ Primera vez que se crea el token (login)
            if (user) {
                token.id = user.id;
                token.registrado = user.registrado;
            }

            // ✅ Cuando se actualiza la sesión manualmente
            if (trigger === "update" && session) {
                console.log('actualizando')
                console.log('sesion', session)
                token.name = session.name;
                token.email = session.email;
                // Nota: user.registrado no está disponible en update
                // Si necesitas actualizar registrado, debes incluirlo en session
                if (session.registrado !== undefined) {
                    token.registrado = session.registrado;
                }
            }

            return token;
        },

        async session({ session, token }) {
            if (session?.user) {
                session.user.id = token.id as string;
                session.user.registrado = token.registrado as boolean;
            }
            return session;
        }
    },

    pages: {
        signIn: '/login',
        newUser: '/registro',
        error: "/login",
    },
});

export { handler as GET, handler as POST };