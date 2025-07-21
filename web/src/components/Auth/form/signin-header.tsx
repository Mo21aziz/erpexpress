import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "./logo";

export function SigninHeader() {
  return (
    <CardHeader className="space-y-1 text-center">
      <Logo />
      <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-green-700 via-gray-800 to-red-700 bg-clip-text text-transparent">
        Di Napoli
      </CardTitle>
      <CardDescription className="text-gray-600">
        Connectez-vous à votre compte
      </CardDescription>
    </CardHeader>
  );
}
