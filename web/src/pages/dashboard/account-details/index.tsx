import React, { useState, useCallback, useEffect } from "react";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import Link from "next/link";
import Head from "next/head";
import { useQuery } from "@tanstack/react-query";
import { ADAPTER_STATUS } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";

import Button, { ButtonVariants, ButtonSizes } from "src/components/common/button";
import Container from "src/components/common/container";
import UserInfo from "src/components/dashboard/account-details";
import Notifications from "src/components/dashboard/account-details/notifications";
import WithdrawDialog from "src/components/dashboard/account-details/WithdrawDialog";
import { useWeb3AuthContext } from "src/context/web3-auth-context";
import { useUserInfo } from "src/lib/hooks/useUserInfo";
import { IUserRole, UserProfileInfo } from "src/interfaces/auth";
import { AccountTypeEnum } from "src/interfaces/global";
import { APP_NAME } from "src/constants";
import Loading from "src/components/common/loading";
import { AuthService } from "src/controller/AuthAPI.service";
import EthereumRpc from "src/lib/web3/evm.web3";
import { BankAccountsSection } from "src/components/dashboard/account-details/bank-accounts/BankAccountsSection";
import { SupplierBankDetailsForm } from "src/components/dashboard/account-details/SupplierBankDetailsForm";
import { CompanyDetailsForm } from "src/components/dashboard/account-details/CompanyDetailsForm";

const AccountDetails = () => {
  const { logout, web3authPnPInstance, web3authSfa, isPnPInitialized, initPnP } = useWeb3AuthContext();
  const { userInfo, accountType } = useUserInfo();
  const isAdmin = userInfo?.user?.role === IUserRole.ADMIN;
  const isSupplier = accountType === AccountTypeEnum.SUPPLIER;
  const isBuyer = accountType === AccountTypeEnum.BUYER;
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<string>("0");

  const {
    data: userProfileInfo,
    isLoading: userProfileInfoLoading,
    refetch,
    isError,
  } = useQuery({
    queryKey: ["get-user-profile-info"],
    queryFn: () => AuthService.getUserProfileInfo(),
  });

  const fetchTokenBalance = useCallback(async () => {
    try {
      if (web3authSfa.status !== ADAPTER_STATUS.CONNECTED || !web3authPnPInstance.provider) {
        return;
      }

      const ethereumRpc = new EthereumRpc();
      const provider = web3authPnPInstance.provider as EthereumPrivateKeyProvider;
      const accounts = await ethereumRpc.getAccounts();
      const tokenAddress = process.env.NEXT_PUBLIC_INVESTMENT_TOKEN_CONTRACT_ADDRESS;

      if (tokenAddress) {
        const data = `0x70a08231000000000000000000000000${(accounts as string[])[0].slice(2)}`;
        const result = await provider.request({
          method: "eth_call",
          params: [
            {
              to: tokenAddress,
              data: data,
            },
            "latest",
          ],
        });
        if (result != '0x') {
          const tokenBalanceInWei = parseInt(result as string, 16);
          const tokenBalanceFormatted = (tokenBalanceInWei / Math.pow(10, +(process.env.NEXT_PUBLIC_INVESTMENT_TOKEN_DECIMALS || 18))).toFixed(6);
          setTokenBalance(tokenBalanceFormatted);
        } else {
          setTokenBalance("0");
        }
      }
    } catch (error) {
      console.error("Error fetching token balance:", error);
    }
  }, [web3authPnPInstance.provider, web3authSfa.status]);

  useEffect(() => {
    if (isPnPInitialized) {
      fetchTokenBalance();
    } else {
      initPnP();
    }
  }, [isPnPInitialized, fetchTokenBalance, initPnP]);

  if (userProfileInfoLoading && !isError) {
    return (
      <div className="absolute left-1/2 top-1/2 translate-y-1/2">
        <Loading />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{`${APP_NAME} - Account Details`}</title>
      </Head>
      <Container>
        <div className="space-y-6 py-6">
          <div className="tm-card flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-4">
              <h1 className="text-[20px] font-bold leading-[1.2em] tracking-normal text-tm-black-80">
                Account details
              </h1>
              <div>
                <UserInfo userProfileInfo={userProfileInfo} />
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3 lg:gap-[10px]">
              {isSupplier && (
                <div className="w-auto">
                  <Button
                    onClick={() => setIsWithdrawModalOpen(true)}
                    variant={ButtonVariants.SECONDARY}
                    size={ButtonSizes.MD}
                  >
                    <div className="flex items-center gap-[6px]">
                      <p className="text-[13px] font-bold leading-[1.2em]">Withdraw</p>
                    </div>
                  </Button>
                </div>
              )}
              <div className="w-auto">
                <Button
                  onClick={logout}
                  variant={ButtonVariants.FILLED_GREEN}
                  size={ButtonSizes.MD}
                >
                  <div className="flex items-center gap-[6px]">
                    <p className="text-[13px] font-bold leading-[1.2em]">Sign out</p>
                    <PowerSettingsNewIcon className="!h-[20px] !w-[20px]" />
                  </div>
                </Button>
              </div>
              {isAdmin && !isSupplier && (
                <div className="w-auto">
                  <Link href="/admin">
                    <Button variant={ButtonVariants.PRIMARY} size={ButtonSizes.MD}>
                      <div className="flex items-center gap-[6px]">
                        <p className="text-[13px] font-bold leading-[1.2em]">Admin Dashboard</p>
                        <AdminPanelSettingsIcon className="!h-[20px] !w-[20px]" />
                      </div>
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-[20px]">
            <CompanyDetailsForm company={userProfileInfo?.company} onRefetch={refetch} />
            {isBuyer ? <BankAccountsSection ownerType="buyer" /> : null}
            {isSupplier ? (
              <SupplierBankDetailsForm bankAccounts={userProfileInfo?.bankAccounts} onRefetch={refetch} />
            ) : null}
          </div>

          <div className="tm-card flex flex-col gap-[20px]">
            <h2 className="text-[18px] font-semibold leading-[1.2em] tracking-normal text-tm-black-80">
              Notifications
            </h2>
            <div>
              <Notifications userProfileInfo={userProfileInfo} refetch={refetch} />
            </div>
          </div>
        </div>
      </Container>

      {/* Modals */}
      {isSupplier && (
        <WithdrawDialog
          isOpen={isWithdrawModalOpen}
          onClose={() => setIsWithdrawModalOpen(false)}
          maxAmount={tokenBalance}
          onWithdrawComplete={() => {
            fetchTokenBalance();
            refetch();
          }}
        />
      )}
    </>
  );
};

export default AccountDetails;

