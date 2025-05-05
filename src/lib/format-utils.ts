/**
 * Utilitaires de formatage pour les dates et les montants
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
