import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
/**
 * Utilitaires de formatage pour les dates, les montants et la gestion des productions
 */

/**
 * Formate une date au format DD/MM/YYYY
 * @param date Date à formater (Date ou string)
 * @returns Date formatée en DD/MM/YYYY
 */
export const formatDate = (date: Date | string | null): string => {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  // Vérifier si la date est valide
  if (isNaN(dateObj.getTime())) return "";

  const day = dateObj.getDate().toString().padStart(2, "0");
  const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
  const year = dateObj.getFullYear();

  return `${day}/${month}/${year}`;
};
/**
 * Utilitaires de formatage pour les dates
 */

/**
 * Formate une date au format Mois AAAA (ex: Mars 2025)
 * @param date Date à formater (Date ou string)
 * @returns Date formatée en Mois AAAA
 */
export const formatMonthYear = (date: Date | string | null): string => {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  // Vérifier si la date est valide
  if (isNaN(dateObj.getTime())) return "";

  // Tableau des noms de mois en français
  const months = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];

  const month = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();

  return `${month} ${year}`;
};

/**
 * Formate un montant avec séparateur de milliers et devise DA
 * @param amount Montant à formater
 * @param includeCurrency Inclure la devise DA (true par défaut)
 * @returns Montant formaté (ex: 20 000 000,00 DA)
 */
export const formatAmount = (
  amount: number | null,
  includeCurrency = true
): string => {
  if (amount === null || amount === undefined) return "";

  // Formater le nombre avec séparateur de milliers et 2 décimales
  const formatter = new Intl.NumberFormat("fr-DZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formattedAmount = formatter.format(amount);

  return includeCurrency ? `${formattedAmount} DA` : formattedAmount;
};

/**
 * Convertit une chaîne formatée avec séparateurs en nombre
 * @param formattedValue Valeur formatée (ex: "20 000,50")
 * @returns Valeur numérique
 */
export const parseFormattedNumber = (formattedValue: string): number => {
  if (!formattedValue) return 0;

  // Supprimer la devise et les espaces, remplacer la virgule par un point
  const cleanValue = formattedValue
    .replace(/DA/gi, "")
    .replace(/\s/g, "")
    .replace(/,/g, ".");

  return parseFloat(cleanValue) || 0;
};

import { db } from "./db";

/**
 * Met à jour le taux total et le montant produit d'un Product
 * @param productId ID du produit à mettre à jour
 * @returns Le produit mis à jour ou null en cas d'erreur
 */
export const updateProductTaux = async (productId: string) => {
  try {
    // Récupérer toutes les productions associées au produit
    const productions = await db.production.findMany({
      where: { productId },
    });

    // Calculer le taux total et le montant total
    const tauxTotal = productions.reduce((sum, prod) => sum + prod.taux, 0);
    const montantTotal = productions.reduce(
      (sum, prod) => sum + prod.mntProd,
      0
    );

    // Mettre à jour le produit
    const updatedProduct = await db.product.update({
      where: { id: productId },
      data: {
        taux: tauxTotal,
        montantProd: montantTotal,
      },
    });

    return updatedProduct;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du taux du produit:", error);
    return null;
  }
};

/**
 * Valide que l'ajout ou la modification d'une Production reste dans les limites autorisées
 * @param productId ID du produit
 * @param newTaux Nouveau taux à ajouter ou différence de taux en cas de modification
 * @param productionId ID de la production en cas de modification (pour l'exclure du calcul)
 * @returns Objet indiquant si le taux est valide et le montant produit calculé
 */
export const validateProductionTaux = async (
  productId: string,
  newTaux: number,
  productionId?: string
) => {
  try {
    // Récupérer le produit et la phase associée
    const product = await db.product.findUnique({
      where: { id: productId },
      include: {
        Phase: true,
        Productions: true,
      },
    });

    if (!product || !product.Phase) {
      return {
        valid: false,
        message: "Produit ou phase non trouvé",
      };
    }

    // Calculer le taux actuel en excluant la production en cours de modification
    let tauxActuel = 0;
    if (productionId) {
      // Si on modifie une production existante, exclure son taux actuel du calcul
      tauxActuel = product.Productions.filter(
        (p) => p.id !== productionId
      ).reduce((sum, p) => sum + p.taux, 0);
    } else {
      // Si on ajoute une nouvelle production, prendre le taux total actuel
      tauxActuel = product.taux;
    }

    // Vérifier que le nouveau taux total ne dépasse pas 100%
    const tauxTotal = tauxActuel + newTaux;
    if (tauxTotal > 100) {
      return {
        valid: false,
        message: `Le taux total (${tauxTotal.toFixed(2)}%) dépasserait 100%`,
      };
    }

    // Calculer le montant produit en fonction du taux et du montant HT de la phase
    const montantHT = product.Phase.montantHT;
    const montantProduit = (montantHT * newTaux) / 100;

    // Vérifier que le montant total produit ne dépasse pas le montant HT de la phase
    const montantActuel = product.Productions.filter(
      (p) => p.id !== productionId
    ).reduce((sum, p) => sum + p.mntProd, 0);
    const montantTotal = montantActuel + montantProduit;

    if (montantTotal > montantHT) {
      return {
        valid: false,
        message: `Le montant total produit (${formatAmount(
          montantTotal
        )}) dépasserait le montant HT de la phase (${formatAmount(montantHT)})`,
      };
    }

    return {
      valid: true,
      montantProduit,
    };
  } catch (error) {
    console.error("Erreur lors de la validation du taux:", error);
    return {
      valid: false,
      message: "Erreur lors de la validation du taux",
    };
  }
};
