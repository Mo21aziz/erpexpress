import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChefHat } from "lucide-react";

function Logo() {
  return (
    <div className="flex items-center justify-center mb-4">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-green-600 to-red-600 text-white shadow-md">
        <ChefHat className="w-8 h-8" />
      </div>
    </div>
  );
}

export function ComingSoon() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1 text-center">
          <Logo />
          <CardTitle className="text-3xl">Di Napoli ERP</CardTitle>
          <CardDescription className="text-xl">
            Bientôt disponible...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-center">
            <p className="text-gray-600">
              Notre système de gestion est en cours de développement.
            </p>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-gray-300 rounded-full animate-pulse delay-100"></div>
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse delay-200"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
