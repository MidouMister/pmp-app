import React from "react";
import clsx from "clsx";

interface TagComponentProps {
  title: string;
  colorName: string;
  selectedColor?: (color: string) => void;
}

const TagComponent: React.FC<TagComponentProps> = ({
  colorName,
  title,
  selectedColor,
}) => {
  const isEmptyTag = !title;

  return (
    <div
      className={clsx(
        "relative inline-flex items-center justify-center transition-all duration-200 ease-in-out",
        "rounded-lg font-medium text-xs cursor-pointer select-none",
        "hover:scale-105 active:scale-95",
        {
          // Tags avec contenu - style plein avec transparence
          "px-3 py-1.5 min-h-[28px]": !isEmptyTag,

          // Tags vides (sélecteurs de couleur) - style outline
          "w-7 h-7 border-2 border-dashed hover:border-solid": isEmptyTag,

          // Couleurs BLUE
          "bg-blue-500/10 text-blue-400 border border-blue-400 shadow-sm   hover:shadow-md  ":
            colorName === "BLUE" && !isEmptyTag,
          "border-blue-300 hover:border-blue-500 hover:bg-blue-50 dark:border-blue-600 dark:hover:border-blue-400 dark:hover:bg-blue-950/30":
            colorName === "BLUE" && isEmptyTag,

          // Couleurs ORANGE
          "bg-orange-500/10 text-orange-400 border border-orange-400 shadow-sm hover:shadow-md ":
            colorName === "ORANGE" && !isEmptyTag,
          "border-orange-300 hover:border-orange-500 hover:bg-orange-50 dark:border-orange-600 dark:hover:border-orange-400 dark:hover:bg-orange-950/30":
            colorName === "ORANGE" && isEmptyTag,

          // Couleurs ROSE
          "bg-rose-500/10 text-rose-400 border border-rose-400 shadow-sm hover:shadow-md ":
            colorName === "ROSE" && !isEmptyTag,
          "border-rose-300 hover:border-rose-500 hover:bg-rose-50 dark:border-rose-600 dark:hover:border-rose-400 dark:hover:bg-rose-950/30":
            colorName === "ROSE" && isEmptyTag,

          // Couleurs GREEN
          "bg-emerald-700/10 text-emerald-600 border border-emerald-600 shadow-sm hover:shadow-md ":
            colorName === "GREEN" && !isEmptyTag,
          "border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50 dark:border-emerald-600 dark:hover:border-emerald-400 dark:hover:bg-emerald-950/30":
            colorName === "GREEN" && isEmptyTag,

          // Couleurs PURPLE
          "bg-purple-500/10 text-purple-600 border border-purple-600 shadow-sm hover:shadow-md ":
            colorName === "PURPLE" && !isEmptyTag,
          "border-purple-300 hover:border-purple-500 hover:bg-purple-50 dark:border-purple-600 dark:hover:border-purple-400 dark:hover:bg-purple-950/30":
            colorName === "PURPLE" && isEmptyTag,
        }
      )}
      onClick={() => {
        if (selectedColor) selectedColor(colorName);
      }}
    >
      {/* Indicateur visuel pour les sélecteurs de couleur vides */}
      {isEmptyTag && (
        <div
          className={clsx("w-3 h-3 rounded-full", {
            "bg-blue-400 dark:bg-blue-500": colorName === "BLUE",
            "bg-chart-2": colorName === "ORANGE",
            "bg-orange-400 dark:bg-orange-500": colorName === "ORANGE",
            "bg-rose-400 dark:bg-rose-500": colorName === "ROSE",
            "bg-emerald-400 dark:bg-emerald-500": colorName === "GREEN",
            "bg-purple-400 dark:bg-purple-500": colorName === "PURPLE",
          })}
        />
      )}

      {/* Texte du tag */}
      {title && <span className="leading-none whitespace-nowrap">{title}</span>}
    </div>
  );
};

export default TagComponent;
