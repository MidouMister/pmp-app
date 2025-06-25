import React, { useState } from "react";

type TruncatedDescriptionProps = {
  description: string;
};

const TruncatedDescription: React.FC<TruncatedDescriptionProps> = ({
  description,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  return (
    <div className="w-full">
      {/* Description Text */}
      <p
        className={`text-sm text-muted-foreground ${
          isExpanded ? "" : "line-clamp-2"
        }`}
      >
        {description}
      </p>

      {/* Expand/Collapse Button */}
      <button
        onClick={toggleExpand}
        className="text-primary underline text-xs mt-1"
      >
        {isExpanded ? "Less" : "More..."}
      </button>
    </div>
  );
};

export default TruncatedDescription;
