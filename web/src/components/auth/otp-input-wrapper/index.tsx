import { ArrowsClockwise, ArrowLeft } from "@phosphor-icons/react";
import classNames from "classnames";
import React from "react";

import VerificationInputComponent from "src/components/common/verification-input";
import { EmailSteps } from "src/interfaces/global";

interface OTPInputWrapperProps {
  email: string;
  setVerificationCode: React.Dispatch<React.SetStateAction<string>>;
  handleConfirm: (code: string) => Promise<void>;
  resend: () => Promise<void>;
  resendLoading: boolean;
  setEmailRegisterStep: React.Dispatch<React.SetStateAction<EmailSteps>>;
}

const OTPInputWrapper: React.FC<OTPInputWrapperProps> = ({
  email,
  setVerificationCode,
  handleConfirm,
  resend,
  resendLoading,
  setEmailRegisterStep,
}) => {
  return (
    <>
      <div className="flex flex-col gap-[6px]">
        <p className="text-tm-theme-text text-center text-[13px] font-bold leading-[1.2em]">
          Confirm your e-mail address
        </p>
        <p className="text-tm-theme-text text-center text-[13px]  font-normal leading-[1.2em] tracking-normal">
          Below enter the code you received on <br className="notranslate" /> {email}
        </p>
      </div>
      <div className="flex justify-center">
        <VerificationInputComponent
          onComplete={(code) => {
            setVerificationCode(code);
            handleConfirm(code);
          }}
        />
      </div>
      <div className="flex items-center gap-[10px]">
        <p
          onClick={resend}
          className={classNames(
            "text-tm-theme-text flex cursor-pointer items-center gap-[5px] text-center text-[13px] font-normal  leading-[1.2em] underline",
            { "pointer-events-none opacity-50": resendLoading },
          )}
        >
          Resend
          <ArrowsClockwise className={classNames({ "animate-spin": resendLoading })} size={18} weight="duotone" />
        </p>
        <p
          onClick={() => setEmailRegisterStep(EmailSteps.STEP_1)}
          className={classNames(
            "text-tm-theme-text flex cursor-pointer items-center gap-[5px] text-center text-[13px] font-normal  leading-[1.2em] underline",
          )}
        >
          Go back
          <ArrowLeft size={18} weight="duotone" />
        </p>
      </div>
    </>
  );
};

export default OTPInputWrapper;
