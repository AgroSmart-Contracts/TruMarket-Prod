import Head from "next/head";

import Container from "src/components/common/container";
import ShipmentTabView from "src/components/dashboard/shipment-tab-view";
import { APP_NAME } from "src/constants";

const DashboardMain = () => {
  return (
    <>
      <Head>
        <title>{`${APP_NAME} - Dashboard`}</title>
      </Head>
      <Container>
        <ShipmentTabView />
      </Container>
    </>
  );
};

export default DashboardMain;

