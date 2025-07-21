"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
  id: string;
  placeholder?: string;
  required?: boolean;
}

export function PasswordInput({
  id,
  placeholder = "••••••••",
  required = false,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-gray-700">
        Mot de passe
      </Label>
      <div className="relative">
        <Lock className="absolute left-3 top-3 h-4 w-4 text-red-600" />
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          className="pl-10 pr-10 border-gray-200 focus:border-red-500 focus:ring-red-500/20"
          required={required}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-gray-500 hover:text-red-600" />
          ) : (
            <Eye className="h-4 w-4 text-gray-500 hover:text-red-600" />
          )}
        </Button>
      </div>
    </div>
  );
}
