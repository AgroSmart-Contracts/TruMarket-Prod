import React from "react";
import { Alert, AlertTitle } from "@mui/material";
import { Info } from "@phosphor-icons/react";

const ErrorMessage: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => {
  return (
    <div className={`flex items-center text-xs text-tm-red ${className}`}>
      <Info size={16} />
      {children}
    </div>
  );
};

export default ErrorMessage;
