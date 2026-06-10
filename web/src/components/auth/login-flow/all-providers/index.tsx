import { useAuth0 } from "@auth0/auth0-react";
import { useMutation } from "@tanstack/react-query";
import { ADAPTER_STATUS, WALLET_ADAPTERS } from "@web3auth/base";
import { AxiosError } from "axios";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { toast } from "react-toastify";

import Button from "src/components/common/button";
import { useWeb3AuthContext } from "src/context/web3-auth-context";
import { AuthService } from "src/controller/AuthAPI.service";
import { checkMetaMaskExtension, uiConsole } from "src/lib/helpers";

interface AllProvidersProps { }

const AllProviders: React.FC<AllProvidersProps> = () => {
  const router = useRouter();
  const { web3authPnPInstance, setJWT, initPnP } = useWeb3AuthContext();
  const [socialProviderLoading, setSocialProviderLoading] = useState(false);
  const [externalWalletProviderLoading, setExternalWalletProviderLoading] = useState(false);
  const [chosenExternalWalletProvider, setChosenExternalWalletProvider] = useState(null);
  const { loginWithRedirect } = useAuth0();

  const handleObtainJWTToken = useMutation({
    mutationFn: (web3authToken: string) => AuthService.loginUser({ web3authToken }),
  });

  const loginWithExternalWallet = async (wallet: any) => {
    if (wallet === WALLET_ADAPTERS.METAMASK) {
      checkMetaMaskExtension();
    }

    setChosenExternalWalletProvider(wallet);
    if (!web3authPnPInstance) {
      uiConsole("web3auth not initialized yet");
      return;
    }

    if (web3authPnPInstance.status === ADAPTER_STATUS.CONNECTED) {
      await web3authPnPInstance.logout();
    }

    try {
      await web3authPnPInstance.init();
      await web3authPnPInstance.connectTo(wallet);
      setExternalWalletProviderLoading(true);
      const jwt = await web3authPnPInstance.authenticateUser();
      const user = await handleObtainJWTToken.mutateAsync(jwt.idToken);
      setJWT(user.token);

      if (web3authPnPInstance.status === ADAPTER_STATUS.CONNECTED) {
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      if (err?.code === 4001 || err?.code === 5000) {
        toast.error(err.message);
      } else {
        toast.error("Account doesn't exists! Please register");
      }
    } finally {
      setExternalWalletProviderLoading(false);
    }
  };

  const loginWithSocialProvider = async () => {
    setSocialProviderLoading(true);
    await loginWithRedirect({
      authorizationParams: {
        connection: "google-oauth2",
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/?sign_in=${Date.now()}`,
        prompt: "select_account",
      },
    });
    setSocialProviderLoading(false);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4 lg:flex-nowrap">
        {/* <Button
          onClick={() => loginWithSocialProvider()}
          loading={socialProviderLoading}
          disabled={socialProviderLoading}
          classOverrides="flex-1"
        >
          <div className="flex w-full items-center justify-between">
            <p className="text-[13px] font-semibold leading-[1.2em]">Google</p>
            <Image height={25} width={25} src="/assets/google.webp" alt="google" />
          </div>
        </Button> */}
        {/* <Button
          loading={externalWalletProviderLoading && chosenExternalWalletProvider === WALLET_ADAPTERS.METAMASK}
          disabled={externalWalletProviderLoading && chosenExternalWalletProvider === WALLET_ADAPTERS.METAMASK}
          onClick={() => loginWithExternalWallet(WALLET_ADAPTERS.METAMASK)}
          classOverrides="flex-1"
        >
          <div className="flex w-full items-center justify-between">
            <p className="text-[13px] font-semibold leading-[1.2em]">MetaMask</p>
            <Image height={25} width={25} src="/assets/metamask.png" alt="MetaMask" />
          </div>
        </Button> */}
        {/* <Button
          loading={externalWalletProviderLoading && chosenExternalWalletProvider === WALLET_ADAPTERS.WALLET_CONNECT_V2}
          disabled={externalWalletProviderLoading && chosenExternalWalletProvider === WALLET_ADAPTERS.WALLET_CONNECT_V2}
          onClick={() => loginWithExternalWallet(WALLET_ADAPTERS.WALLET_CONNECT_V2)}
          classOverrides="flex-1"
        >
          <div className="flex w-full items-center justify-between">
            <p className="text-[13px] font-semibold leading-[1.2em]">Wallet Connect</p>
            <Image height={25} width={25} src="/assets/walletconnect.png" alt="wallet-connect" />
          </div>
        </Button> */}
      </div>
    </div>
  );
};

export default AllProviders;
