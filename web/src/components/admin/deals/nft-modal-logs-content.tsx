import { Chip } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import Loading from "src/components/common/loading";
import { ShipmentService } from "src/controller/ShipmentAPI.service";
import { CopyToClipBoard, truncateContractAddress } from "src/lib/helpers";
import { AdminService } from "src/controller/AdminAPI.service";

interface NftModalLogsContentProps {
  dealId: string;
}

const NftModalLogsContent: React.FC<NftModalLogsContentProps> = ({ dealId }) => {
  const {
    data: nftLog,
    isLoading: isNftLogLoading,
    refetch,
    isSuccess,
  } = useQuery({
    queryKey: ["get-ntf-log"],
    queryFn: () => AdminService.getNftLogs(dealId),
  });

  return (
    <div className="px-[30px] pb-[40px] pt-[85px]">
      {isNftLogLoading ? (
        <Loading />
      ) : (
        <div>
          <div className="flex flex-col gap-[30px]">
            {nftLog?.map((info, i) => (
              <div key={i} className="flex w-auto flex-col items-start gap-[5px]">
                <p className="font-bold capitalize">{info.message}</p>
                <Chip
                  label={info.txHash}
                  icon={<ContentCopyIcon />}
                  onClick={() =>
                    CopyToClipBoard(info.txHash, "transaction hash successfully copied on your clipboard!")
                  }
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NftModalLogsContent;
