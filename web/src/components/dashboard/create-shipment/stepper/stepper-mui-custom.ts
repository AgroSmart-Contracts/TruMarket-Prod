import { stepContentClasses, stepLabelClasses } from "@mui/material";
import StepConnector, { stepConnectorClasses } from "@mui/material/StepConnector";
import { styled } from "@mui/material/styles";
export const ColorlibConnector = styled(StepConnector)(() => ({
  [`& .${stepConnectorClasses.line}`]: {
    width: "1px",
    position: "absolute",
    left: "52px",
    top: "-39px",
    height: "81px",
    minHeight: "81px",
    border: 0,
    backgroundColor: "#0000001a",
  },
  [`&.${stepConnectorClasses.root}`]: {
    position: "relative",
    marginLeft: 0,
  },
}));

export const stepContentStyles = {
  [`&.${stepContentClasses.root}`]: {
    borderLeft: "1px solid red",
    marginLeft: "16px",
    paddingLeft: "30px",
    // paddingRight: "8px",
    position: "relative",
    top: "-5px",
  },
};

export const stepLabelStyles = {
  [`&.${stepLabelClasses.vertical}`]: { padding: "16px 0" },
  [`& .${stepLabelClasses.iconContainer}`]: { width: "200px" },
  [`&.${stepLabelClasses.root}`]: { alignItems: "start", position: "relative" },
};
