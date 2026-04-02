import { Metadata } from 'next';
import SignupClient from './SignupClient';

export const metadata: Metadata = {
  title: "Join the Expedition | Signup GTM Adventures",
  description: "Create your GTM Adventures account and start planning your next Himalayan trek. Join a community of thousands of explorers.",
};

export default function SignupPage() {
  return <SignupClient />;
}
