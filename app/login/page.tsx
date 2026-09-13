import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth, devLoginEnabled, googleEnabled } from "@/lib/auth";
import { Login } from "@/components/login";

export default async function Page() {
  if (await auth.api.getSession({ headers: await headers() })) redirect("/");
  return <Login development={devLoginEnabled} google={googleEnabled} />;
}
