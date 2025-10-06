import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, FilePlus2, X, AlertTriangle } from "lucide-react";
import { articles as articlesApi } from "@/api/articles";
import { bonDeCommandeApi } from "@/api/bon-de-commande";
import type { Article } from "@/types/database";

interface NewBonDeCommandeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

type QuantityStrings = Record<string, { stock: string; demand: string }>;
type QuantityNumbers = Record<string, { stock: number; demand: number }>;

const getTomorrowYMD = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const NewBonDeCommandeModal: React.FC<NewBonDeCommandeModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [targetDate, setTargetDate] = useState<string>(getTomorrowYMD());
  const [quantitiesText, setQuantitiesText] = useState<QuantityStrings>({});
  const [quantitiesNum, setQuantitiesNum] = useState<QuantityNumbers>({});
  const [confirmFillZeros, setConfirmFillZeros] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    (async () => {
      try {
        const arts = await articlesApi.getArticles();
        const ordered = [...arts].sort(
          (a, b) => (a.numero || 0) - (b.numero || 0)
        );
        setAllArticles(ordered);
        // initialize empty strings
        const initText: QuantityStrings = {};
        const initNum: QuantityNumbers = {};
        for (const a of ordered) {
          initText[a.id] = { stock: "", demand: "" };
          initNum[a.id] = { stock: 0, demand: 0 };
        }
        setQuantitiesText(initText);
        setQuantitiesNum(initNum);
        setTargetDate(getTomorrowYMD());
        setConfirmFillZeros(false);
      } finally {
        setLoading(false);
      }
    })();
  }, [isOpen]);

  const hasEmptyInputs = useMemo(() => {
    return allArticles.some((a) => {
      const q = quantitiesText[a.id];
      return !q || q.stock.trim() === "" || q.demand.trim() === "";
    });
  }, [allArticles, quantitiesText]);

  const handleChange = (
    articleId: string,
    field: "stock" | "demand",
    value: string
  ) => {
    setQuantitiesText((prev) => ({
      ...prev,
      [articleId]: { ...prev[articleId], [field]: value },
    }));

    const cleaned = value.replace(/,/g, ".");
    const num = cleaned.trim() === "" ? 0 : Number.parseFloat(cleaned);
    setQuantitiesNum((prev) => ({
      ...prev,
      [articleId]: {
        ...prev[articleId],
        [field]: Number.isFinite(num) ? num : 0,
      },
    }));
  };

  const fillEmptyWithZeros = () => {
    const t: QuantityStrings = { ...quantitiesText };
    const n: QuantityNumbers = { ...quantitiesNum };
    for (const a of allArticles) {
      const q = t[a.id] || { stock: "", demand: "" };
      if (q.stock.trim() === "") {
        q.stock = "0";
        n[a.id] = { ...(n[a.id] || { stock: 0, demand: 0 }), stock: 0 };
      }
      if (q.demand.trim() === "") {
        q.demand = "0";
        n[a.id] = { ...(n[a.id] || { stock: 0, demand: 0 }), demand: 0 };
      }
      t[a.id] = q;
    }
    setQuantitiesText(t);
    setQuantitiesNum(n);
  };

  const handleCreate = async () => {
    if (hasEmptyInputs) {
      setConfirmFillZeros(true);
      return;
    }
    await submitCreation();
  };

  const submitCreation = async () => {
    setSaving(true);
    try {
      // Create entries for all articles
      for (const a of allArticles) {
        const qn = quantitiesNum[a.id] || { stock: 0, demand: 0 };
        await bonDeCommandeApi.createBonDeCommande({
          description: `Bon de commande du ${targetDate}`,
          category_id: a.category_id,
          article_id: a.id,
          quantite_a_stocker: qn.stock,
          quantite_a_demander: qn.demand,
          article_name: a.name,
          target_date: targetDate,
        });
      }
      if (onCreated) onCreated();
      onClose();
    } catch (e) {
      // Swallow errors here; page toasts elsewhere if needed
      console.error("Failed to create bon de commande:", e);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4">
      <div className="bg-card text-foreground rounded-lg w-full max-w-full sm:max-w-3xl lg:max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-border">
        {/* Sticky Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b bg-card sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-md">
              <FilePlus2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold">
                Nouveau bon de commande
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Date pour le: {targetDate}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Date row */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Date pour le</span>
            <Input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full sm:w-44 h-9 focus-visible:ring-2 focus-visible:ring-primary/30"
            />
          </div>

          {/* Articles table */}
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full border-collapse border border-border">
              <thead className="bg-muted">
                <tr>
                  <th className="border border-border px-3 sm:px-4 py-2 text-left font-semibold text-xs sm:text-sm w-[40%] sm:w-auto">
                    Article
                  </th>
                  <th className="border border-border px-3 sm:px-4 py-2 text-center font-semibold text-xs sm:text-sm w-16 sm:w-24">
                    Collisage
                  </th>
                  <th className="border border-border px-3 sm:px-4 py-2 text-center font-semibold text-xs sm:text-sm">
                    Stock
                  </th>
                  <th className="border border-border px-3 sm:px-4 py-2 text-center font-semibold text-xs sm:text-sm">
                    Demand
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-6 text-muted-foreground text-sm"
                    >
                      Chargement des articles...
                    </td>
                  </tr>
                ) : (
                  allArticles.map((a) => (
                    <tr key={a.id} className="hover:bg-muted/50">
                      <td className="border border-border px-3 sm:px-4 py-2 align-top">
                        <div
                          className="text-xs sm:text-sm font-medium max-w-[120px] sm:max-w-none truncate"
                          title={a.name}
                        >
                          {a.name}
                        </div>
                        {a.description && (
                          <div className="hidden sm:block text-[10px] sm:text-xs text-muted-foreground">
                            {a.description}
                          </div>
                        )}
                      </td>
                      <td className="border border-border px-3 sm:px-4 py-2 text-center w-16 sm:w-24">
                        <span className="text-xs sm:text-sm font-medium">
                          {a.collisage}
                        </span>
                      </td>
                      <td className="border border-border px-3 sm:px-4 py-2 text-center">
                        <Input
                          type="text"
                          inputMode="decimal"
                          value={quantitiesText[a.id]?.stock ?? ""}
                          onChange={(e) =>
                            handleChange(a.id, "stock", e.target.value)
                          }
                          className="w-20 sm:w-24 h-8 text-xs focus-visible:ring-2 focus-visible:ring-primary/30"
                        />
                      </td>
                      <td className="border border-border px-3 sm:px-4 py-2 text-center">
                        <Input
                          type="text"
                          inputMode="decimal"
                          value={quantitiesText[a.id]?.demand ?? ""}
                          onChange={(e) =>
                            handleChange(a.id, "demand", e.target.value)
                          }
                          className="w-20 sm:w-24 h-8 text-xs focus-visible:ring-2 focus-visible:ring-primary/30"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t bg-card sticky bottom-0 z-10 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground w-full sm:w-auto"
          >
            Annuler
          </Button>
          <Button
            onClick={handleCreate}
            disabled={saving}
            className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
          >
            {saving ? "Création..." : "Créer bon de commande"}
          </Button>
        </div>

        {/* Confirmation Card for empty inputs */}
        {confirmFillZeros && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <Card className="w-full max-w-md">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <CardTitle className="text-lg">
                    Certains articles n’ont pas été remplis
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmFillZeros(false)}
                  className="ml-auto text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Voulez-vous remplir les champs vides avec 0 et continuer ?
                </p>
                <div className="flex flex-col sm:flex-row justify-end gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => setConfirmFillZeros(false)}
                    className="text-muted-foreground hover:text-foreground w-full sm:w-auto"
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={async () => {
                      fillEmptyWithZeros();
                      setConfirmFillZeros(false);
                      await submitCreation();
                    }}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
                  >
                    Remplir avec 0
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewBonDeCommandeModal;
