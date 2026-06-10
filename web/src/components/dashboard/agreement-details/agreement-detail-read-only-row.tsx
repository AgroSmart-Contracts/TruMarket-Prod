import React from "react";

interface AgreementDetailReadOnlyRowProps {
  label?: string;
  value: React.ReactNode;
}

/** Single label/value row for view-only agreement preview. */
const AgreementDetailReadOnlyRow: React.FC<AgreementDetailReadOnlyRowProps> = ({ label, value }) => {
  const displayValue = value === undefined || value === null || value === "" ? "—" : value;

  return (
    <div className="grid grid-cols-1 gap-1 py-2.5 sm:grid-cols-[minmax(10rem,38%)_minmax(0,1fr)] sm:items-start sm:gap-4">
      {label ? (
        <span className="text-[13px] font-normal leading-snug text-[#64748B]">{label}</span>
      ) : null}
      <span className="text-[13px] font-medium leading-snug text-[#0F172A] break-words">{displayValue}</span>
    </div>
  );
};

export default AgreementDetailReadOnlyRow;
