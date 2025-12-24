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

                    // Ir directo a la query sin test
                    const data = await prisma.usuariosEstudiantes.findFirst({
                        where: {
                            OR: [
                                { nombre: usuario }, { correo: usuario }
                            ]
                        }
                    });

                    if (data && bcrypt.compareSync(password, data.contrasena)) {
                        return {
                            email: data.correo,
                            name: data.usuario,
                            id: data.id,
                            image: ""
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
        async signIn({ account, profile }) {
            if (account?.provider === "google") {
                // Verificar si el usuario ya existe en tu base de datos
                const existingUser = await prisma.usuariosEstudiantes.findFirst({
                    where: {
                        correo: profile?.email!,
                    },
                });

                // Si no existe, crearlo
                if (!existingUser) {
                    await prisma.usuariosEstudiantes.create({
                        data: {
                            correo: profile?.email!,
                            usuario: profile?.email?.split('@')[0] || "Usuario",
                            // Para Google users, puedes generar una contraseña aleatoria o usar null
                            contrasena: await bcrypt.hash(Math.random().toString(36), 10),
                            // Guardar la referencia al proveedor OAuth
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

                return true;
            }
            return false
        },
        jwt: async ({ session, token, trigger }) => {
            if (trigger === "update") {
                token.name = session.name;
                token.email = session.email;
            }
            return token;
        },
    },

    pages: {
        signIn: '/login',
        newUser: '/registro',
        error: "/login",

    },

});

export { handler as GET, handler as POST };