"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ChefHat, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { auth } from "../../api/auth";
import { useAuth } from "../../contexts/AuthContext";

function Logo() {
  return (
    <div className="flex items-center justify-center mb-4">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-green-600 to-red-600 text-white shadow-md">
        <ChefHat className="w-6 h-6" />
      </div>
    </div>
  );
}

function ItalianFlagIndicator() {
  return (
    <div className="text-center pt-2">
      <div className="flex items-center justify-center space-x-1 text-xs text-gray-400">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
      </div>
    </div>
  );
}

function UsernameInput({
  id,
  placeholder = "Entrez votre nom d'utilisateur",
  required = false,
}: {
  id: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-gray-700">
        Nom d'utilisateur
      </Label>
      <div className="relative">
        <Mail className="absolute left-3 top-3 h-4 w-4 text-green-600" />
        <Input
          id={id}
          type="text"
          placeholder={placeholder}
          className="pl-10 border-gray-200 focus:border-green-500 focus:ring-green-500/20"
          required={required}
        />
      </div>
    </div>
  );
}

function PasswordInput({
  id,
  placeholder = "••••••••",
  required = false,
}: {
  id: string;
  placeholder?: string;
  required?: boolean;
}) {
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

function SigninHeader() {
  return (
    <CardHeader className="space-y-1 text-center">
      <Logo />
      <CardTitle>Di Napoli</CardTitle>
      <CardDescription>Connectez-vous à votre compte</CardDescription>
    </CardHeader>
  );
}

function SigninForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await auth.connect({ username, password });

      // Store user data and token using the auth context
      login(response);

      setSuccess(true);
      // Add a slight delay before redirecting to show the success message
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err: any) {
      console.error("Login error:", err);
      console.error("Error response:", err?.response);
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          "Erreur de connexion"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="username" className="text-gray-700">
            Nom d'utilisateur
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-green-600" />
            <Input
              id="username"
              type="text"
              placeholder="Entrez votre nom d'utilisateur"
              className="pl-10 border-gray-200 focus:border-green-500 focus:ring-green-500/20"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-700">
            Mot de passe
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-red-600" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="pl-10 pr-10 border-gray-200 focus:border-red-500 focus:ring-red-500/20"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
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
            type="button"
          >
            Mot de passe oublié ?
          </Button>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Connexion..." : "Se connecter"}
        </Button>
        {error && (
          <div className="text-red-600 text-sm text-center">{error}</div>
        )}
        {success && (
          <div className="text-green-600 text-sm text-center">
            Connexion réussie !
          </div>
        )}
      </form>
      <div className="relative">
        <Separator />
        <div className="absolute inset-0 flex items-center justify-center"></div>
      </div>
      <div className="text-center text-sm"></div>
    </div>
  );
}

export function Signin() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <SigninHeader />
        <CardContent className="space-y-4">
          <SigninForm />
          <ItalianFlagIndicator />
        </CardContent>
      </Card>
    </div>
  );
}
