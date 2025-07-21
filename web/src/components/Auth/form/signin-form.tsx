import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { EmailInput } from "./email-input";
import { PasswordInput } from "./password-input";

export function SigninForm() {
  return (
    <div className="space-y-4">
      <form className="space-y-4">
        <EmailInput id="email" required />
        <PasswordInput id="password" required />

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <input
              id="remember"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <Label
              htmlFor="remember"
              className="text-sm font-normal text-gray-600"
            >
              Se souvenir de moi
            </Label>
          </div>
          <Button
            variant="link"
            className="px-0 font-normal text-red-600 hover:text-red-700"
          >
            Mot de passe oublié ?
          </Button>
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-green-600 to-red-600 hover:from-green-700 hover:to-red-700 text-white shadow-md transition-all duration-200"
        >
          Se connecter
        </Button>
      </form>

      <div className="relative">
        <Separator className="bg-gradient-to-r from-green-200 via-gray-200 to-red-200" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="bg-white px-2 text-xs text-gray-500">ou</span>
        </div>
      </div>

      <div className="text-center text-sm">
        <span className="text-gray-600">Pas encore de compte ? </span>
        <Button
          variant="link"
          className="px-0 font-normal text-green-600 hover:text-green-700"
        >
          S'inscrire
        </Button>
      </div>
    </div>
  );
}
