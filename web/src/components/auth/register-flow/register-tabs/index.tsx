/* eslint-disable*/
import React from "react";
import TabView from "src/components/common/tab-view";

import WithEmail from "./with-email";
import WithWeb3Wallet from "./with-web3-wallet";

interface RegisterTabProps {
  selectedIndex?: number;
  onTabChange?: (index: number) => void;
}

const RegisterTab: React.FC<RegisterTabProps> = ({ selectedIndex, onTabChange }) => {
  const tabHeaders = ["Email Code", "Web3 Wallet"];

  return (
    <div className="w-full">
      <TabView tabHeaders={tabHeaders} tabContent={[<WithEmail />, <WithWeb3Wallet />]} selectedIndex={selectedIndex} onTabChange={onTabChange} />
    </div>
  );
};

export default RegisterTab;
