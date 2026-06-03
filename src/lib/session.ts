import { auth } from "@/lib/auth";
import { UnauthorizedError } from "@/lib/errors";

export { UnauthorizedError };

/** For use inside API route handlers. Returns the user id or throws. */
export async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError();
  return session.user.id;
}
