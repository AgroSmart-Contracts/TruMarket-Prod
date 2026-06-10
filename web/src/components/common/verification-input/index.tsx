import React from "react";
import VerificationInput from "react-verification-input";

interface VerificationInputComponentProps {
  onComplete: (confirmationNumber: string) => void;
}

const VerificationInputComponent: React.FC<VerificationInputComponentProps> = ({ onComplete }) => {
  return (
    <VerificationInput
      length={6}
      placeholder=" "
      onComplete={onComplete}
      classNames={{
        container: "vi-container",
        character: "vi-character",
        //   characterInactive: "character--inactive",
        characterSelected: "vi-character-selected",
      }}
    />
  );
};

export default VerificationInputComponent;
