"use client";
import {
  CheckCircle2,
  FileWarning,
  Loader2,
  UploadCloud,
  X,
} from "lucide-react";
import Image from "next/image";
import { Button } from "../ui/button";
import { UploadDropzone } from "@/lib/uploadthing";
import { useCallback, useEffect, useReducer } from "react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { cn } from "@/lib/utils";

type Props = {
  apiEndpoint: "companyLogo" | "userAvatar"; // Point d'API pour le téléchargement
  onChange: (url?: string) => void; // Fonction appelée avec l'URL du fichier téléchargé
  value?: string; // URL du fichier déjà téléchargé (optionnel)
  className?: string; // Classes CSS additionnelles
  imageSize?: "sm" | "md" | "lg"; // Taille de l'image prévisualisée
};

// Définition du state initial et du reducer pour une meilleure gestion d'état
type State = {
  isUploading: boolean;
  error: string | null;
  success: boolean;
  progress: number;
};

type Action =
  | { type: "UPLOAD_START" }
  | { type: "UPLOAD_COMPLETE"; url: string }
  | { type: "UPLOAD_ERROR"; message: string }
  | { type: "UPLOAD_PROGRESS"; progress: number }
  | { type: "RESET" };

const initialState: State = {
  isUploading: false,
  error: null,
  success: false,
  progress: 0,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "UPLOAD_START":
      return { ...initialState, isUploading: true };
    case "UPLOAD_COMPLETE":
      return { ...state, isUploading: false, success: true, progress: 100 };
    case "UPLOAD_ERROR":
      return {
        ...state,
        isUploading: false,
        error: action.message,
        progress: 0,
      };
    case "UPLOAD_PROGRESS":
      return { ...state, progress: action.progress };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

const FileUpload = ({
  apiEndpoint,
  onChange,
  value,
  className,
  imageSize = "md",
}: Props) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleUploadStart = useCallback(() => {
    dispatch({ type: "UPLOAD_START" });
  }, []);

  const handleUploadComplete = useCallback(
    (res: { ufsUrl: string }[]) => {
      if (res?.[0]?.ufsUrl) {
        onChange(res[0].ufsUrl);
        dispatch({ type: "UPLOAD_COMPLETE", url: res[0].ufsUrl });
      }
    },
    [onChange]
  );

  // Simuler la progression du téléchargement
  useEffect(() => {
    let progressInterval: NodeJS.Timeout;

    if (state.isUploading) {
      progressInterval = setInterval(() => {
        dispatch({
          type: "UPLOAD_PROGRESS",
          progress: Math.min(state.progress + Math.random() * 10, 95),
        });
      }, 300);
    }

    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [state.isUploading, state.progress]);

  // Masquer le message de succès après 3 secondes
  useEffect(() => {
    let successTimeout: NodeJS.Timeout;

    if (state.success) {
      successTimeout = setTimeout(() => {
        dispatch({ type: "RESET" });
      }, 3000);
    }

    return () => {
      if (successTimeout) clearTimeout(successTimeout);
    };
  }, [state.success]);

  const handleUploadError = useCallback((error: Error) => {
    dispatch({
      type: "UPLOAD_ERROR",
      message:
        error.message || "Une erreur est survenue lors du téléchargement",
    });
    console.error("Erreur de téléchargement:", error);
  }, []);

  const handleRemove = useCallback(() => {
    onChange("");
    dispatch({ type: "RESET" });
  }, [onChange]);

  // Déterminer la taille de l'image en fonction de la prop imageSize
  const getImageSize = () => {
    switch (imageSize) {
      case "sm":
        return "w-24 h-24";
      case "lg":
        return "w-56 h-56";
      case "md":
      default:
        return "w-40 h-40";
    }
  };

  if (value) {
    return (
      <div
        className={cn("flex flex-col justify-center items-center", className)}
      >
        <div
          className={cn(
            "relative rounded-md overflow-hidden border-2 border-muted transition-all hover:border-muted-foreground/50",
            getImageSize()
          )}
        >
          <Image
            src={value || "/placeholder.svg"}
            alt="Image téléchargée"
            className="object-contain"
            fill
          />
        </div>
        <Button
          onClick={handleRemove}
          variant="outline"
          type="button"
          className="mt-3 text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
          size="sm"
        >
          <X className="h-4 w-4 mr-2" />
          Supprimer
        </Button>
      </div>
    );
  }
  return (
    <div className={cn("w-full", className)}>
      {state.error && (
        <Alert
          variant="destructive"
          className="mb-4 animate-in fade-in-50 slide-in-from-top-5 duration-300"
        >
          <FileWarning className="h-4 w-4" />
          <AlertTitle className="ml-2">Erreur</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {state.success && (
        <Alert className="mb-4 bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800/30 animate-in fade-in-50 slide-in-from-top-5 duration-300">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle className="ml-2">Succès</AlertTitle>
          <AlertDescription>Image téléchargée avec succès!</AlertDescription>
        </Alert>
      )}

      <div
        className={cn(
          "w-full bg-muted/30 rounded-lg border-2 border-dashed border-muted transition-all hover:border-muted-foreground/50",
          state.isUploading && "opacity-70"
        )}
      >
        {/* Indicateur de progression */}
        {state.isUploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-background/80 backdrop-blur-sm rounded-lg">
            <div className="flex flex-col items-center max-w-xs w-full px-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <span className="text-sm font-medium text-foreground mb-2">
                Téléchargement en cours...
              </span>

              {/* Barre de progression */}
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: `${state.progress}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground mt-1">
                {Math.round(state.progress)}%
              </span>
            </div>
          </div>
        )}

        <UploadDropzone
          endpoint={apiEndpoint}
          onUploadBegin={handleUploadStart}
          onClientUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
          config={{
            mode: "auto",
          }}
          appearance={{
            button: {
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
              padding: "8px 16px",
              borderRadius: "6px",
              fontWeight: "500",
            },
            container: {
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            },
            label: {
              fontSize: "16px",
              fontWeight: "500",
              color: "var(--muted-foreground)",
            },
          }}
          content={{
            button: "Télécharger",
            allowedContent: "Images jusqu'à 4Mo",
            label: (
              <div className="flex flex-col items-center text-center">
                <UploadCloud className="h-10 w-10 text-muted-foreground mb-2" />
                <span>Déposez votre image ici ou cliquez pour parcourir</span>
              </div>
            ),
          }}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-2 text-center">
        Formats acceptés: JPG, PNG, GIF, SVG. Taille maximale: 4Mo.
      </p>
    </div>
  );
};

export default FileUpload;
