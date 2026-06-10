import React from "react";

interface AgreementDetailListHeaderProps {
  text: string;
}

const AgreementDetailListHeader: React.FC<AgreementDetailListHeaderProps> = ({ text }) => {
  const heading = text.replace(/:+$/, "").trim();
  return (
    <h5 className="text-[14px] font-semibold leading-snug tracking-normal text-[#0F172A]">{heading}</h5>
  );
};

export default AgreementDetailListHeader;
