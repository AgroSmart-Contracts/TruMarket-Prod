import React from "react";
import LaunchIcon from "@mui/icons-material/Launch";

import InformationRow from "src/components/common/information-row";
import { AccountTypeEnum } from "src/interfaces/global";
import { CurrencyFormatter, truncateContractAddress } from "src/lib/helpers";
import InformationRowDivider from "src/components/common/information-row/information-row-divider";
import MuiTooltip from "src/components/common/mui-tooltip";
import { AgreementPartyInfo } from "src/interfaces/shipment";
interface ShipmentBaseInfoProps {
  accountType: AccountTypeEnum;
  emailInfo?: AgreementPartyInfo[];
  value: number;
  identifier: string;
  handleShowAgreement: () => void;
}

const ShipmentBaseInfo: React.FC<ShipmentBaseInfoProps> = ({
  accountType,
  emailInfo,
  value,
  identifier,
  handleShowAgreement,
}) => {
  const isBuyer = accountType === AccountTypeEnum.BUYER;
  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center rounded-[4px] border border-tm-black-20 bg-[#ffffff80] px-4 sm:px-[26px] py-3 sm:py-0 gap-3 sm:gap-0">
        <div className="flex-1 min-w-0 sm:max-w-[40%]">
        <InformationRow
          label={isBuyer ? "Supplier:" : "Buyer:"}
          value={
            <MuiTooltip
              titleHidden={emailInfo?.length === 1}
              tooltipText={emailInfo
                ?.slice(1)
                .map((user) => user.email)
                .join("\n")}
            >
              {emailInfo?.length ? (
                  <p className="text-xs sm:text-sm truncate block max-w-full">{`${emailInfo[0].email} ${emailInfo.length > 1 ? `and ${emailInfo!.length! - 1} other` : ""}`}</p>
              ) : (
                <></>
              )}
            </MuiTooltip>
          }
          underlined={false}
          showBoldValue={false}
          containerClassOverrides="py-[10px]"
        />
        </div>
        <InformationRowDivider classOverrides="hidden sm:block h-[30px]" />
        <div className="w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 flex-shrink-0 sm:min-w-[120px]">
        <InformationRow
          underlined={false}
          label="Value:"
          value={CurrencyFormatter(value)}
          showBoldValue={false}
          containerClassOverrides="py-[10px]"
        />
        </div>
        <InformationRowDivider classOverrides="hidden sm:block h-[30px]" />
        <div className="w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 flex-shrink-0 sm:min-w-[140px]">
        <InformationRow
          label="Identifier:"
            value={<span className="truncate block max-w-full">{`#${identifier}`}</span>}
          underlined={false}
          showBoldValue={false}
          containerClassOverrides="py-[10px]"
        />
        </div>
        <InformationRowDivider classOverrides="hidden sm:block h-[30px]" />

        <div
          onClick={handleShowAgreement}
          className="flex cursor-pointer items-center gap-[1px] w-full sm:w-auto justify-center sm:justify-start border-t sm:border-t-0 pt-3 sm:pt-0 mt-auto sm:mt-0"
        >
          <p className="text-xs sm:text-[13px] font-medium capitalize leading-[1em] text-tm-black-80">Show Agreement</p>
          <LaunchIcon className="!h-[16px] sm:!h-[18px]" />
        </div>
      </div>
    </div>
  );
};

export default ShipmentBaseInfo;
