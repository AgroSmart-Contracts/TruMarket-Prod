import React from "react";
import { useRouter } from "next/router";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import Button, { ButtonVariants } from "src/components/common/button";
import InformationRow from "src/components/common/information-row";
import InformationRowDivider from "src/components/common/information-row/information-row-divider";
import MuiTooltip from "src/components/common/mui-tooltip";
import { AccountTypeEnum } from "src/interfaces/global";
import { AgreementPartyInfo } from "src/interfaces/shipment";
import { CurrencyFormatter } from "src/lib/helpers";

interface ShipmentBoxFooterProps {
  accountType: AccountTypeEnum;
  emailInfo: AgreementPartyInfo[];
  value: number;
  contract: string;
  action: () => void;
  actionButtonText: string;
  entityId: string;
}

const ShipmentBoxFooter: React.FC<ShipmentBoxFooterProps> = ({
  accountType,
  emailInfo,
  value,
  contract,
  actionButtonText,
  action,
  entityId,
}) => {
  const router = useRouter();
  const isBuyer = accountType === AccountTypeEnum.BUYER;

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sm:gap-0">
        <div className="flex flex-col sm:flex-row w-full sm:w-[70%] items-start sm:items-center px-4 sm:px-[20px] py-4 sm:py-[19px] gap-3 sm:gap-0">
          <div className="flex-1 min-w-0 w-full sm:w-auto sm:max-w-[40%]">
          <InformationRow
            label={isBuyer ? "Supplier:" : "Buyer:"}
            underlined={false}
            value={
              <MuiTooltip
                titleHidden={emailInfo?.length === 1}
                tooltipText={emailInfo
                  ?.slice(1)
                  ?.map((user) => user.email)
                  ?.join("\n")}
              >
                  <p className="text-xs sm:text-sm truncate block max-w-full">{`${emailInfo?.[0]?.email} ${emailInfo.length > 1 ? `and ${emailInfo.length - 1} other` : ""} `}</p>
              </MuiTooltip>
            }
          />
          </div>

          <InformationRowDivider classOverrides="hidden sm:block" />
          <div className="w-full sm:w-auto pt-3 sm:pt-0 flex-shrink-0 sm:min-w-[120px]">
          <InformationRow
            label="Value:"
            value={CurrencyFormatter(value)}
            showBoldValue={false}
            underlined={false}
            labelClassOverrides="opacity-80"
          />
          </div>
          <InformationRowDivider classOverrides="hidden sm:block" />
          <div className="w-full sm:w-auto pt-3 sm:pt-0 flex-shrink-0 sm:min-w-[140px]">
          <InformationRow
            label="Identifier:"
              value={<span className="truncate block max-w-full">{`#${entityId}` || "-"}</span>}
            showBoldValue={false}
            underlined={false}
            labelClassOverrides="opacity-80"
          />
        </div>
        </div>
        <div className="flex flex-col sm:flex-row w-full sm:w-[30%] justify-end gap-2 sm:gap-[10px] px-4 sm:px-0 sm:pr-[20px] pb-4 sm:pb-0">
          <Button
            classOverrides="!py-2 sm:!py-[7px] !px-3 sm:!px-[16px] !text-xs sm:!text-[13px] !font-semibold !rounded-md !transition-all !duration-200 hover:!scale-105 active:!scale-95 w-full sm:!w-[180px] sm:!flex-shrink-0"
            variant={ButtonVariants.FILLED_BLUE}
            onClick={() => router.push("/dashboard/create-shipment?cloneShipmentId=" + entityId)}
          >
            <div className="flex items-center justify-center gap-1.5 sm:gap-[6px]">
              <span className="uppercase tracking-wide !text-tm-white whitespace-nowrap">Clone Shipment</span>
              <AddCircleIcon className="!h-4 !w-4 sm:!h-[15px] sm:!w-[15px] !fill-tm-white flex-shrink-0" />
            </div>
          </Button>
          <Button
            classOverrides="!py-2 sm:!py-[7px] !px-3 sm:!px-[16px] !text-xs sm:!text-[13px] !font-semibold !rounded-md !transition-all !duration-200 hover:!scale-105 active:!scale-95 w-full sm:!w-[120px] sm:!flex-shrink-0"
            onClick={() => action()}
          >
            <div className="flex w-full items-center justify-center gap-1.5 sm:gap-[13px]">
              <span className="uppercase tracking-wide text-tm-white whitespace-nowrap">{actionButtonText}</span>
              <ArrowForwardIcon className="!h-4 !w-4 sm:!h-[17px] sm:!w-[17px] flex-shrink-0" />
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShipmentBoxFooter;
