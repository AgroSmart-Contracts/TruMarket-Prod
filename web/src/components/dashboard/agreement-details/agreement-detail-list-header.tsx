import React from "react";

interface AgreementDetailListHeaderProps {
  text: string;
}

const AgreementDetailListHeader: React.FC<AgreementDetailListHeaderProps> = ({ text }) => {
  return <h5 className="text-[13px] font-bold leading-[1.2em] tracking-normal text-tm-black-80">{text}</h5>;
};

export default AgreementDetailListHeader;
