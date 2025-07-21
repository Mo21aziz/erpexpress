import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";

interface EmailInputProps {
  id: string;
  placeholder?: string;
  required?: boolean;
}

export function EmailInput({
  id,
  placeholder = "votre@email.com",
  required = false,
}: EmailInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-gray-700">
        Email
      </Label>
      <div className="relative">
        <Mail className="absolute left-3 top-3 h-4 w-4 text-green-600" />
        <Input
          id={id}
          type="email"
          placeholder={placeholder}
          className="pl-10 border-gray-200 focus:border-green-500 focus:ring-green-500/20"
          required={required}
        />
      </div>
    </div>
  );
}
