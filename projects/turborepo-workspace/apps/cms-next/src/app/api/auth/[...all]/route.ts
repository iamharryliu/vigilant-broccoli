import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
console.log('findme', process.env.GOOGLE_AUTH_PROVIDER_CLIENT_ID, process.env.GOOGLE_AUTH_PROVIDER_CLIENT_SECRET

)
export const { GET, POST } = toNextJsHandler(auth);
