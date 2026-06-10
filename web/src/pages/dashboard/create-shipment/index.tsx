import Head from "next/head";
import { useTranslation } from "react-i18next";

import Container from "src/components/common/container";
import CreateShipment from "src/components/dashboard/create-shipment";
import { APP_NAME } from "src/constants";
import { AccountTypeEnum } from "src/interfaces/global";
import { useUserInfo } from "src/lib/hooks/useUserInfo";

const Shipments = () => {
  const { t } = useTranslation("dashboard");
  const { accountType } = useUserInfo();
  const isBuyer = accountType === AccountTypeEnum.BUYER;

  return (
    <>
      <Head>
        <title>{t("createShipment.pageTitle", { appName: APP_NAME })}</title>
      </Head>
      <div className="pt-3 pb-3 sm:pt-3 sm:pb-3">
        <Container>
          <header className="mb-3 max-w-4xl">
            <h1 className="text-[22px] font-bold leading-tight text-tm-black-80 sm:text-[26px]">
              {t("createShipment.title")}
            </h1>
            <p className="mt-1 text-[12px] leading-snug text-[#64748B] sm:text-[13px]">
              {t("createShipment.pageDescription", {
                party: isBuyer
                  ? t("createShipment.partySupplier")
                  : t("createShipment.partyBuyer"),
              })}
            </p>
          </header>
          <CreateShipment />
        </Container>
      </div>
    </>
  );
};

export default Shipments;
