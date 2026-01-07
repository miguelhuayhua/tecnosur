import { getToken } from "next-auth/jwt";
import { NextRequestWithAuth, withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
export default withAuth(
    async function proxy(request: NextRequestWithAuth) {
        const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
        let pathname = request.nextUrl.pathname;
        console.log(token, 'token mio')
        if (!token) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
        if (!token.registrado && !pathname.startsWith('/formulario')) {
            return NextResponse.redirect(new URL('/formulario', request.url));
        }

        return NextResponse.next();
    }
)
export const config = {
    matcher: ["/dashboard/:path*", "/formulario"]
}
