import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { bonDeCommandeApi, BonDeCommande } from "@/api/bon-de-commande";
import { useToast } from "@/components/ui/use-toast";
import { AxiosError } from "axios";
import { BonDeCommandeTable } from "../../components/bondecommande/BonDeCommandeTable";
import { BonDeCommandeDetailModal } from "../../components/bondecommande/BonDeCommandeDetailModal";
import { Button } from "@/components/ui/button";
import { FileDown, Clock } from "lucide-react";
import { exportBonDeCommandeToPDF } from "../../utils/pdfExport";
import { useAuth } from "../../contexts/AuthContext";

export function ListesBonnesCommandePage() {
  const [bonDeCommandes, setBonDeCommandes] = useState<BonDeCommande[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBonDeCommande, setSelectedBonDeCommande] =
    useState<BonDeCommande | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchBonDeCommandes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bonDeCommandeApi.getBonDeCommande();
      setBonDeCommandes(data);
    } catch (err: unknown) {
      const message =
        err instanceof AxiosError
          ? err.response?.data?.error || "Failed to load bon de commande"
          : "Failed to load bon de commande";
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBonDeCommandes();
  }, []);

  const handleBonDeCommandeClick = (bonDeCommande: BonDeCommande) => {
    setSelectedBonDeCommande(bonDeCommande);
    setDetailModalOpen(true);
  };

  const handleExportPDF = (bonDeCommande: BonDeCommande) => {
    try {
      exportBonDeCommandeToPDF(bonDeCommande);
      toast({
        title: "Succès",
        description: "PDF exporté avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'export PDF",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (
    bonDeCommande: BonDeCommande,
    newStatus: string
  ) => {
    try {
      await bonDeCommandeApi.updateStatus(bonDeCommande.id, newStatus);

      // Update the local state
      setBonDeCommandes((prevBonDeCommandes) =>
        prevBonDeCommandes.map((bdc) =>
          bdc.id === bonDeCommande.id ? { ...bdc, status: newStatus } : bdc
        )
      );

      toast({
        title: "Succès",
        description: `Statut mis à jour vers "${newStatus}"`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour du statut",
        variant: "destructive",
      });
    }
  };

  const handleBonDeCommandeUpdate = (updatedBonDeCommande: BonDeCommande) => {
    setBonDeCommandes((prevBonDeCommandes) =>
      prevBonDeCommandes.map((bdc) =>
        bdc.id === updatedBonDeCommande.id ? updatedBonDeCommande : bdc
      )
    );
    setSelectedBonDeCommande(updatedBonDeCommande);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">
        Liste des bonnes de commande
      </h1>
      <p className="text-gray-600 mb-4">
        Consultez et gérez toutes les bonnes de commande
      </p>

      {/* 48-hour notice for employees and Gerant */}
      {user &&
        user.role &&
        user.role.name !== "Admin" &&
        user.role.name !== "Responsible" && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">
                  Limitation de visibilité
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  {user.role.name === "Gerant"
                    ? "En tant que Gérant, vous ne pouvez voir que les bonnes de commande de vos employés assignés des dernières 48 heures."
                    : "En tant qu'employé, vous ne pouvez voir que les bonnes de commande des dernières 48 heures."}
                </p>
              </div>
            </div>
          </div>
        )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-red-600 text-center">
              <p className="font-semibold">Erreur</p>
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <BonDeCommandeTable
            bonDeCommandes={bonDeCommandes}
            loading={loading}
            onBonDeCommandeClick={handleBonDeCommandeClick}
            onExportPDF={handleExportPDF}
            onStatusChange={handleStatusChange}
          />
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <BonDeCommandeDetailModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedBonDeCommande(null);
        }}
        bonDeCommande={selectedBonDeCommande}
        onUpdate={handleBonDeCommandeUpdate}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
