import { ChefHat } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center justify-center mb-4">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-green-600 to-red-600 text-white shadow-md">
        <ChefHat className="w-6 h-6" />
      </div>
    </div>
  );
}
