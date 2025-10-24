import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { bonDeCommandeApi, BonDeCommande } from "@/api/bon-de-commande";
import { useToast } from "@/components/ui/use-toast";
import { AxiosError } from "axios";
import { BonDeCommandeTable } from "../../components/bondecommande/BonDeCommandeTable";
import { BonDeCommandeDetailModal } from "../../components/bondecommande/BonDeCommandeDetailModal";
import { Button } from "@/components/ui/button";
import { FileDown, Clock, Plus } from "lucide-react";
import { exportBonDeCommandeToPDF } from "../../utils/pdfExport";
import { useAuth } from "../../contexts/AuthContext";
import NewBonDeCommandeModal from "@/components/bondecommande/NewBonDeCommandeModal";

export function ListesBonnesCommandePage() {
  const [bonDeCommandes, setBonDeCommandes] = useState<BonDeCommande[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBonDeCommande, setSelectedBonDeCommande] =
    useState<BonDeCommande | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
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
      console.log(
        `[Frontend] Updating status for bon de commande ${bonDeCommande.id} to ${newStatus}`
      );
      const updatedBonDeCommande = await bonDeCommandeApi.updateStatus(
        bonDeCommande.id,
        newStatus
      );
      console.log(`[Frontend] Updated bon de commande:`, updatedBonDeCommande);
      console.log(
        `[Frontend] Updated bon de commande has ${updatedBonDeCommande.categories.length} categories`
      );

      // Update the local state with the complete updated data
      setBonDeCommandes((prevBonDeCommandes) =>
        prevBonDeCommandes.map((bdc) =>
          bdc.id === bonDeCommande.id ? updatedBonDeCommande : bdc
        )
      );

      // If the detail modal is open for this bon de commande, update it too
      if (
        selectedBonDeCommande &&
        selectedBonDeCommande.id === bonDeCommande.id
      ) {
        console.log(
          `[Frontend] Updating selected bon de commande in detail modal`
        );
        setSelectedBonDeCommande(updatedBonDeCommande);
      }

      toast({
        title: "Succès",
        description: `Statut mis à jour vers "${newStatus}"`,
      });
    } catch (error) {
      console.error(`[Frontend] Error updating status:`, error);
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
        Liste des bons de commande
      </h1>
      <p className="text-gray-600 mb-4">
        Consultez et gérez toutes les bons de commande
      </p>

      <div className="flex items-center justify-end">
        <Button
          onClick={() => setCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau bon de commande
        </Button>
      </div>

      {/* Notice for Gerant only (48-hour window) */}
      {user && user.role && user.role.name === "Gerant" && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-blue-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-blue-800">
                Limitation de visibilité
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                En tant que Gérant, vous ne pouvez voir que les bons de
                commande de vos employés assignés des dernières 48 heures.
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

      {/* New Bon De Commande Modal */}
      <NewBonDeCommandeModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={() => {
          // Refresh list after creation
          fetchBonDeCommandes();
        }}
      />
    </div>
  );
}
