import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface NullValuesWarningCardProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  bonDeCommandeCode: string;
  nullCategories: Array<{
    id: string;
    name: string;
    stock: number | null;
    demand: number | null;
  }>;
}

export function NullValuesWarningCard({
  isOpen,
  onClose,
  onConfirm,
  bonDeCommandeCode,
  nullCategories,
}: NullValuesWarningCardProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <AlertDialogTitle>Valeurs nulles détectées</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left">
            <p className="mb-3">
              Certains articles ont des quantités nulles ou vides pour le bon de
              commande <strong>"{bonDeCommandeCode}"</strong>.
            </p>
            <div className="space-y-2">
              <p className="font-medium text-sm">Articles concernés :</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {nullCategories.map((item) => (
                  <li key={item.id} className="text-gray-600">
                    <strong>{item.name}</strong> - Stock: {item.stock || "N/A"},
                    Demande: {item.demand || "N/A"}
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-3 text-sm">
              Voulez-vous continuer malgré ces valeurs nulles ?
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            Continuer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
