import Head from "next/head";
import { useRouter } from "next/router";

import Container from "src/components/common/container";
import AgreementDetailsView from "src/components/dashboard/agreement-details";
import { APP_NAME } from "src/constants";

const AgreementDetails = () => {
  const { query } = useRouter();
  return (
    <>
      <Head>
        <title>{`${APP_NAME} - Agreement Details`}</title>
      </Head>
      <div className="py-[30px]">
        <Container>
          <div className="flex flex-col gap-[6px] pb-[40px]">
            <h1 className="text-[26px] font-bold leading-[1.2em] text-tm-black-80">
              Shipment Agreement <span className="font-normal">#{query.id}</span>
            </h1>
            <span className="font-tm-black-80 text-[13px] font-normal leading-[1.2em]">
              Shipment will be activated after <b className="font-bold">double-sided supplier and buyer acceptance</b>.{" "}
              <br />
              The smart contract will be created automatically and the <b>data will be locked.</b>
            </span>
          </div>
          <div>
            <AgreementDetailsView />
          </div>
        </Container>
      </div>
    </>
  );
};

export default AgreementDetails;

