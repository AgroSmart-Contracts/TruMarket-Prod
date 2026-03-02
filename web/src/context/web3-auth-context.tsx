import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { Web3Auth } from "@web3auth/single-factor-auth";
import Cookies from "js-cookie";
import {
  CHAIN_NAMESPACES,
  WEB3AUTH_NETWORK,
  WALLET_ADAPTERS,
  ADAPTER_EVENTS,
  IProvider,
  ADAPTER_STATUS,
} from "@web3auth/base";
import { EthereumPrivateKeyProvider, WalletConnectV2Provider } from "@web3auth/ethereum-provider";
import { Web3AuthNoModal } from "@web3auth/no-modal";
import { MetamaskAdapter } from "@web3auth/metamask-adapter";
import { WalletConnectModal } from "@walletconnect/modal";
import { getWalletConnectV2Settings, WalletConnectV2Adapter } from "@web3auth/wallet-connect-v2-adapter";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

import { chainConfigEth } from "src/lib/web3/chain-configs";
import { parseToken, uiConsole } from "../lib/helpers";
import EthereumRpc from "../lib/web3/evm.web3";

export interface web3AuthContextState { }

interface web3AuthContextType {
  init: () => Promise<void>;
  isLoggingIn: boolean;
  setIsLoggingIn: React.Dispatch<React.SetStateAction<boolean>>;
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  userInfo: any;
  setUserInfo: React.Dispatch<React.SetStateAction<any>>;
  web3authSfa: Web3Auth;
  getUserInfo: () => { jwt: string; user: any } | undefined;
  setJWT: (token: string) => void;
  web3authPnPInstance: Web3AuthNoModal;
  logout: () => void;
  initPnP: () => void;
  privateKeyProvider: EthereumPrivateKeyProvider;
  isPnPInitialized: boolean;
}

const web3AuthContext = createContext<web3AuthContextType | undefined>(undefined);

const ethereumPrivateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig: chainConfigEth },
});

//use web3auth Corekit
const web3authSfa = new Web3Auth({
  clientId: process.env.NEXT_PUBLIC_WEB3_AUTH_CLIENT_ID as string,
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  usePnPKey: false,
});

//create web3Auth instance PnP for only external wallet login
const web3authPnPInstance = new Web3AuthNoModal({
  clientId: process.env.NEXT_PUBLIC_WEB3_AUTH_CLIENT_ID as string,
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  privateKeyProvider: ethereumPrivateKeyProvider as any,
  useCoreKitKey: true,
});

export const Web3AuthContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const [isPnPInitialized, setIsPnPInitialized] = useState(false);

  const init = async () => {
    try {
      // Initialising Web3Auth Single Factor Auth SDK
      await web3authSfa.init(ethereumPrivateKeyProvider);
    } catch (error) {
      uiConsole(error);
    }
  };

  //used for external wallet login, by default coreKit does't supports external wallets
  const initPnP = async () => {
    try {
      const metamaskAdapter = new MetamaskAdapter({ sessionTime: 86400 });

      //currently only ETH chain
      const defaultWcSettings = await getWalletConnectV2Settings(
        "eip155",
        ["1"],
        process.env.NEXT_PUBLIC_PROJECT_ID as string,
      );
      const walletConnectModal = new WalletConnectModal({
        projectId: process.env.NEXT_PUBLIC_PROJECT_ID as string,
      });
      const walletConnectV2Adapter = new WalletConnectV2Adapter({
        sessionTime: 86400,
        adapterSettings: {
          qrcodeModal: walletConnectModal,
          ...defaultWcSettings.adapterSettings,
        },
        loginSettings: { ...defaultWcSettings.loginSettings },
      });

      //add properties to instance
      web3authPnPInstance.configureAdapter(metamaskAdapter);
      web3authPnPInstance.configureAdapter(walletConnectV2Adapter);
      await web3authPnPInstance.init();

      if (web3authPnPInstance.status === ADAPTER_STATUS.CONNECTED) {
        EthereumRpc.setGlobalProvider(web3authPnPInstance.provider as IProvider);
      }
      setIsPnPInitialized(true);
      console.log("Web3Auth PnP initialized successfully");
    } catch (err) {
      console.error("Failed to initialize Web3Auth PnP:", err);
      uiConsole(err);
      setIsPnPInitialized(false);
    }
  };

  //init on mount
  useEffect(() => {
    init();
    initPnP()
  }, []);

  useEffect(() => {
    if (web3authPnPInstance.status === ADAPTER_STATUS.CONNECTED) {
      EthereumRpc.setGlobalProvider(web3authPnPInstance.provider as IProvider);
    }

    if (web3authSfa.status === ADAPTER_STATUS.CONNECTED) {
      EthereumRpc.setGlobalProvider(web3authSfa.provider as IProvider);
    }
  }, [web3authPnPInstance.status, web3authSfa.status]);

  // init();
  // initPnP();

  const setJWT = (token: string) => {
    Cookies.set("jwt", token, { expires: 365 });
  };

  const getUserInfo = () => {
    const cookie = Cookies.get("jwt") ?? null;
    if (cookie) {
      return {
        jwt: cookie,
        user: parseToken(cookie),
      };
    }
  };

  const logout = async () => {
    Cookies.remove("jwt");

    router.push("/");

    if (web3authSfa.status === ADAPTER_STATUS.CONNECTED) {
      await web3authSfa.logout();
    }

    if (web3authPnPInstance.status === ADAPTER_STATUS.CONNECTED) {
      await web3authPnPInstance.logout();
    }
  };

  const contextValue = {
    init,
    initPnP,
    isLoggingIn,
    isLoggedIn,
    userInfo,
    setIsLoggingIn,
    setIsLoggedIn,
    setUserInfo,
    web3authSfa,
    web3authPnPInstance,
    getUserInfo,
    setJWT,
    logout,
    privateKeyProvider: ethereumPrivateKeyProvider,
    isPnPInitialized,
  };

  return <web3AuthContext.Provider value={contextValue}>{children}</web3AuthContext.Provider>;
};

//export context as hook
export const useWeb3AuthContext = (): web3AuthContextType => {
  const context = useContext(web3AuthContext);
  if (!context) {
    throw new Error("useWeb3AuthContent must be used within a web3AuthContextProvider");
  }
  return context;
};
