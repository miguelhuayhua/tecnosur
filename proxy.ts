import { getToken } from "next-auth/jwt";
import { NextRequestWithAuth, withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
export default withAuth(
    async function proxy(request: NextRequestWithAuth) {
        let pathname = request.nextUrl.pathname;
        const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
        if (!token && pathname.includes("/dashboard")) {
            return NextResponse.redirect(new URL("/login", request.url));

        }
    }
)
export const config = {
    matcher: ["/dashboard/:path*"]
}
