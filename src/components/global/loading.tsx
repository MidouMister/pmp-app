import type React from "react";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  variant?: "spinner" | "dots" | "pulse";
  text?: string;
}

const Loading: React.FC<LoadingProps> = ({
  size = "md",
  variant = "spinner",
  text,
}) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  if (variant === "dots") {
    return (
      <div
        className="flex flex-col items-center gap-4"
        role="status"
        aria-label="Loading"
      >
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`${
                size === "sm"
                  ? "w-2 h-2"
                  : size === "lg"
                  ? "w-4 h-4"
                  : "w-3 h-3"
              } bg-primary rounded-full animate-pulse`}
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: "1.4s",
              }}
            />
          ))}
        </div>
        {text && (
          <p
            className={`${textSizeClasses[size]} text-muted-foreground font-medium animate-pulse`}
          >
            {text}
          </p>
        )}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div
        className="flex flex-col items-center gap-4"
        role="status"
        aria-label="Loading"
      >
        <div
          className={`${sizeClasses[size]} bg-primary/20 rounded-full flex items-center justify-center`}
        >
          <div
            className={`${
              size === "sm" ? "w-3 h-3" : size === "lg" ? "w-8 h-8" : "w-5 h-5"
            } bg-primary rounded-full animate-ping`}
          />
        </div>
        {text && (
          <p
            className={`${textSizeClasses[size]} text-muted-foreground font-medium animate-pulse`}
          >
            {text}
          </p>
        )}
      </div>
    );
  }

  // Default spinner variant
  return (
    <div
      className="flex flex-col items-center gap-4"
      role="status"
      aria-label="Loading"
    >
      <div className="relative">
        {/* Outer ring */}
        <div
          className={`${sizeClasses[size]} border-4 border-muted rounded-full`}
        />

        <div
          className={`${sizeClasses[size]} absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin`}
        />

        <div
          className={`${sizeClasses[size]} absolute inset-0 border-2 border-transparent border-t-primary/50 rounded-full animate-spin`}
          style={{ animationDuration: "0.8s" }}
        />
      </div>

      {text && (
        <p
          className={`${textSizeClasses[size]} text-muted-foreground font-medium animate-pulse`}
        >
          {text}
        </p>
      )}
    </div>
  );
};

export default Loading;
