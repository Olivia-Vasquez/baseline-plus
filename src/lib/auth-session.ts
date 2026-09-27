import "server-only";

import { auth } from "@/lib/auth";

export const getRequestSession = (headers: Headers) => auth.api.getSession({ headers });