import * as React from "react";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Tooltip, { TooltipProps, tooltipClasses } from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#ffffff",
    maxWidth: 500,
    borderRadius: "10px",
    border: 0,
    padding: "20px",
    boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px;",
  },
}));

export default function MuiTooltip({
  children,
  tooltipText,
  titleHidden = false,
  hidden = false,
}: {
  children: React.ReactElement;
  tooltipText: React.ReactNode;
  hidden?: boolean;
  titleHidden?: boolean;
}) {
  return (
    <HtmlTooltip
      hidden={hidden}
      title={
        !titleHidden ? (
          <div className="text-[13px] font-medium leading-[1.2em] text-tm-black-80">{tooltipText}</div>
        ) : null
      }
    >
      {children}
    </HtmlTooltip>
  );
}
