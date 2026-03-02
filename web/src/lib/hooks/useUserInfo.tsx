import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { useWeb3AuthContext } from "src/context/web3-auth-context";

export const useUserInfo = () => {
  const router = useRouter();
  const { getUserInfo, web3authSfa, web3authPnPInstance } = useWeb3AuthContext();
  const [accountInfoLoading, setAccountInfoLoading] = useState<any>(null);
  const [userInfo, setUserInfo] = useState<any>({ jwt: "", user: { email: "" } });
  const [account, setAccount] = useState("");

  useEffect(() => {
    setAccountInfoLoading(true);
    const userInfo = getUserInfo();
    setUserInfo((prevUserInfo: any) => userInfo);
    setAccountInfoLoading(false);
  }, [router.asPath]);

  const accountType = userInfo?.user ? userInfo.user.accountType : "";

  return { userInfo, setUserInfo, account, accountInfoLoading, accountType };
};
