# Formatage des Dates et Montants

## Présentation

Ce document décrit les fonctionnalités de formatage standardisées implémentées dans l'application pour assurer une présentation cohérente des dates et des montants.

## Fonctions de Formatage

Les fonctions suivantes ont été implémentées dans `format-utils.ts` :

### Formatage des Dates

```typescript
formatDate(date: Date | string | null): string
```

Cette fonction convertit les dates au format `DD/MM/YYYY` (jour/mois/année).

Exemple d'utilisation :

```typescript
import { formatDate } from "@/lib/format-utils";

// Afficher une date
<p>{formatDate(project.createdAt)}</p>;
```

### Formatage des Montants

```typescript
formatAmount(amount: number | null, includeCurrency = true): string
```

Cette fonction formate les montants avec séparateur de milliers et ajoute la devise DA.

Exemple d'utilisation :

```typescript
import { formatAmount } from "@/lib/format-utils";

// Afficher un montant avec devise
<p>{formatAmount(project.montantHT)}</p>

// Afficher un montant sans devise
<p>{formatAmount(project.montantHT, false)}</p>
```

### Conversion de Chaîne Formatée en Nombre

```typescript
parseFormattedNumber(formattedValue: string): number
```

Cette fonction convertit une chaîne formatée avec séparateurs en nombre.

Exemple d'utilisation :

```typescript
import { parseFormattedNumber } from "@/lib/format-utils";

// Dans un gestionnaire d'événement de champ de saisie
const handleChange = (e) => {
  const inputValue = e.target.value;
  const numericValue = parseFormattedNumber(inputValue);
  // Utiliser numericValue pour les calculs
};
```

## Fichiers Modifiés

Les fonctions de formatage ont été implémentées dans les fichiers suivants :

- `src/lib/format-utils.ts` - Nouvelles fonctions de formatage
- `src/components/forms/phase-form.tsx` - Formatage des montants et dates dans le formulaire de phase
- `src/app/(main)/unite/[unitId]/projects/[projectId]/project-dashboard.tsx` - Formatage dans le tableau de bord du projet
- `src/app/(main)/unite/[unitId]/projects/columns.tsx` - Formatage dans les colonnes de tableau
- `src/app/(main)/unite/[unitId]/projects/project-card.tsx` - Formatage dans les cartes de projet
- `src/app/(main)/unite/[unitId]/projects/unit-projects.tsx` - Formatage des totaux
- `src/components/global/infobar.tsx` - Formatage des dates de notification
- `src/components/ui/chart.tsx` - Formatage des valeurs dans les graphiques
- `src/components/forms/project-form.tsx` - Formatage des montants et dates dans le formulaire de projet
