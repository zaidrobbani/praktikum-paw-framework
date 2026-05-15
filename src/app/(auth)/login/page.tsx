import { Metadata } from "next";
import LoginContainer from "@/frontend/feataure/(auth)/login/container/LoginContainer";

export const metadata: Metadata = {
  title: "Login | PAW Application",
  description: "Sign in to your account",
};

export default function Page() {
  return <LoginContainer />;
}
