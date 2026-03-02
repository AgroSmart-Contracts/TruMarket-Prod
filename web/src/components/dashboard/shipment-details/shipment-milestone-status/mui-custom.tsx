import StepConnector, { stepConnectorClasses } from "@mui/material/StepConnector";
import { styled } from "@mui/material/styles";
import * as React from "react";

export const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: -12,
    left: 3,
    zIndex: -1,
  },
  [`& .${stepConnectorClasses.line}`]: {
    width: "2px",
    position: "absolute",
    right: "124px",
    top: "-3px",
    height: "8px",
    minHeight: "8px",
    borderColor: "#bdbdbd00",
    backgroundColor: "#0000001a",
    // Add a pseudo-element for the arrow
    "&::after": {
      content: '""',
      position: "absolute",
      rotate: "90deg", // Rotate the arrow 90 degrees to point it correctly
      top: "9px",
      right: "0px", // Adjust this value to position the arrow correctly
      transform: "translateY(-50%)",
      border: "5px solid transparent",
      borderLeft: "7px solid #0000001a", // Increase the borderLeft size for a sharper arrow
    },
  },
  [`&.${stepConnectorClasses.root}`]: {
    position: "relative",
    marginLeft: 0,
  },
}));

export const ColorlibStepIconRoot = styled("div")<{
  ownerState: { completed?: boolean; active?: boolean };
}>(({ theme, ownerState }) => ({
  zIndex: 1,
  color: "#fff",
  border: "2px solid #00000033",
  display: "flex",
  backgroundColor: "#ffffff",
  borderRadius: "50%",
  justifyContent: "center",
  alignItems: "center",
  // ...(ownerState.active && {
  //   backgroundColor: "#4ea4d90",
  // }),
  // ...(ownerState.completed && {
  //   backgroundColor: "#5CA12F",
  // }),
}));
