import React from "react";

import AgreementDetailListHeader from "./agreement-detail-list-header";

interface AgreementDetailSectionProps {
  title: string;
  children: React.ReactNode;
  showDivider?: boolean;
}

const AgreementDetailSection: React.FC<AgreementDetailSectionProps> = ({
  title,
  children,
  showDivider = true,
}) => {
  return (
    <>
      {showDivider ? <div className="mx-6 my-4 h-px bg-[#E2E8F0] sm:mx-8" aria-hidden /> : null}
      <section className="px-6 pb-1 sm:px-8">
        <AgreementDetailListHeader text={title} />
        <div className="mt-2 divide-y divide-[#E2E8F0]">{children}</div>
      </section>
    </>
  );
};

export default AgreementDetailSection;
