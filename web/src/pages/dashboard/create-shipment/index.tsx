import Head from "next/head";

import Container from "src/components/common/container";
import CreateShipment from "src/components/dashboard/create-shipment";
import { APP_NAME } from "src/constants";
import { AccountTypeEnum } from "src/interfaces/global";
import { useUserInfo } from "src/lib/hooks/useUserInfo";

const Shipments = () => {
  const { accountType } = useUserInfo();
  const isBuyer = accountType === AccountTypeEnum.BUYER;
  return (
    <>
      <Head>
        <title>{`${APP_NAME} - Create Agreement`}</title>
      </Head>
      <div className="overflow-x-hidden pt-[30px]">
        <Container>
          <div className="flex flex-col gap-[6px] pb-[40px]">
            <h1 className="text-[26px] font-bold leading-[1.2em] text-tm-black-80">Create shipment agreement</h1>
            <span className="font-tm-black-80 text-[13px] font-light leading-[1.2em]">
              Submitted agreement will be sent to selected the {isBuyer ? "supplier" : "buyer"}. <br /> After his
              confirmation, the smart contract will be created and you will be able to track the shipment.
            </span>
          </div>
          <CreateShipment />
        </Container>
      </div>
    </>
  );
};

export default Shipments;

