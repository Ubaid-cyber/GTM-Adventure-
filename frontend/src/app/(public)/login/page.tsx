import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: "Sign In | GTM Adventures",
  description: "Securely access your GTM Adventures account to manage your upcoming treks and expeditions.",
};

export default async function LoginPage() {
  const session = await auth();

  // 🛡️ SERVER-SIDE AUTH GUARD: Point to the dashboard instantly if already logged in
  // This eliminates the "Flash of Unauthenticated Content" (flicker)
  if (session) {
    redirect("/dashboard");
  }

  return <LoginClient />;
}
