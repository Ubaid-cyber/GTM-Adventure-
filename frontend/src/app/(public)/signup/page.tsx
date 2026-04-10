import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import SignupClient from './SignupClient';

export const metadata: Metadata = {
  title: "Join the Expedition | Signup GTM Adventures",
  description: "Create your GTM Adventures account and start planning your next Himalayan trek. Join a community of thousands of explorers.",
};

export default async function SignupPage() {
  const session = await auth();

  // 🛡️ Bouncing authenticated users away from signup
  if (session) {
    redirect("/dashboard");
  }

  return <SignupClient />;
}
