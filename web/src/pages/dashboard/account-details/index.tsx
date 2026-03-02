import React, { useState, useCallback, useEffect } from "react";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import Link from "next/link";
import Head from "next/head";
import { useQuery } from "@tanstack/react-query";
import { ADAPTER_STATUS } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import Image from "next/image";

import Button, { ButtonVariants, ButtonSizes } from "src/components/common/button";
import Container from "src/components/common/container";
import UserInfo from "src/components/dashboard/account-details";
import Notifications from "src/components/dashboard/account-details/notifications";
import { BankDetailsForm } from "src/components/dashboard/account-details/BankDetailsForm";
import { AuthService as AuthApiService } from "src/controller/AuthAPI.service";
import { toast } from "react-toastify";
import WithdrawDialog from "src/components/dashboard/account-details/WithdrawDialog";
import DepositDialog from "src/components/dashboard/account-details/deposit-flow/DepositDialog";
import { useWeb3AuthContext } from "src/context/web3-auth-context";
import { useUserInfo } from "src/lib/hooks/useUserInfo";
import { IUserRole, UserProfileInfo } from "src/interfaces/auth";
import { AccountTypeEnum } from "src/interfaces/global";
import { APP_NAME } from "src/constants";
import Loading from "src/components/common/loading";
import { AuthService } from "src/controller/AuthAPI.service";
import EthereumRpc from "src/lib/web3/evm.web3";

const AccountDetails = () => {
  const { logout, web3authPnPInstance, web3authSfa, isPnPInitialized, initPnP } = useWeb3AuthContext();
  const { userInfo, accountType } = useUserInfo();
  const isAdmin = userInfo?.user?.role === IUserRole.ADMIN;
  const isSupplier = accountType === AccountTypeEnum.SUPPLIER;
  const isBuyer = accountType === AccountTypeEnum.BUYER;
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<string>("0");
  const [savingBankDetails, setSavingBankDetails] = useState(false);
  const [isEditingBankDetails, setIsEditingBankDetails] = useState(false);
  const [bankForm, setBankForm] = useState<NonNullable<UserProfileInfo["bankDetails"]>>({
    beneficiaryName: "",
    country: "",
    addressLine1: "",
    city: "",
    postalCode: "",
    bankName: "",
    accountNumber: "",
    swiftCode: "",
  });

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

  // Initialize bank form from loaded profile
  useEffect(() => {
    if (userProfileInfo?.bankDetails) {
      setBankForm((prev) => ({
        ...prev,
        ...userProfileInfo.bankDetails,
      }));
    }
  }, [userProfileInfo?.bankDetails]);

  // Decide editing mode based purely on status:
  // - If status is "linked" (isBankLinked === true), default to view mode.
  // - Otherwise (not linked or undefined), default to editing so they can add details.
  useEffect(() => {
    if (userProfileInfo?.isBankLinked) {
      setIsEditingBankDetails(false);
    } else {
      setIsEditingBankDetails(true);
    }
  }, [userProfileInfo?.isBankLinked]);

  const handleSaveBankDetails = async () => {
    if (!isSupplier) return;

    const {
      beneficiaryName,
      country,
      accountNumber,
      swiftCode,
    } = bankForm;

    if (!beneficiaryName.trim()) {
      toast.error("Beneficiary name is required.");
      return;
    }

    if (!accountNumber?.trim()) {
      toast.error("Account number is required.");
      return;
    }

    if (!swiftCode?.trim()) {
      toast.error("SWIFT/BIC is required.");
      return;
    }

    try {
      setSavingBankDetails(true);
      // Clean up the bank details: remove empty strings for optional fields
      const cleanedBankDetails: NonNullable<UserProfileInfo["bankDetails"]> = {
        beneficiaryName: bankForm.beneficiaryName.trim(),
        country: bankForm.country.trim(),
        accountNumber: (accountNumber || "").trim(),
        swiftCode: (swiftCode || "").trim(),
        ...(bankForm.bankName?.trim() && { bankName: bankForm.bankName.trim() }),
        ...(bankForm.addressLine1?.trim() && { addressLine1: bankForm.addressLine1.trim() }),
        ...(bankForm.city?.trim() && { city: bankForm.city.trim() }),
        ...(bankForm.postalCode?.trim() && { postalCode: bankForm.postalCode.trim() }),
      };

      console.log("Saving bank details:", cleanedBankDetails);
      await AuthApiService.updateBankDetails({ bankDetails: cleanedBankDetails });
      toast.success("Bank account details saved.");
      await refetch();
      setIsEditingBankDetails(false);
    } catch (err: any) {
      console.error("Failed to save bank details", err);
      toast.error("Failed to save bank account details. Please try again.");
    } finally {
      setSavingBankDetails(false);
    }
  };

  const handleToggleBankDetailsEdit = () => {
    // If cancelling (currently editing), reset form to last saved values
    if (isEditingBankDetails) {
      if (userProfileInfo?.bankDetails) {
        setBankForm(userProfileInfo.bankDetails as NonNullable<UserProfileInfo["bankDetails"]>);
      }
      setIsEditingBankDetails(false);
    } else {
      setIsEditingBankDetails(true);
    }
  };


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
              {isBuyer && (
                <div className="w-auto">
                  <Button
                    onClick={() => setIsDepositDialogOpen(true)}
                    variant={ButtonVariants.FILLED_GREEN}
                    size={ButtonSizes.MD}
                  >
                    <div className="flex items-center gap-[8px]">
                      <Image
                        src="/assets/logo.svg"
                        alt="TruMarket logo"
                        width={20}
                        height={20}
                        className="h-5 w-auto"
                      />
                      <p className="text-[13px] font-bold leading-[1.2em]">AgroPay</p>
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

          {isSupplier && (
            <div className="tm-card flex flex-col gap-[20px]">
              <h2 className="text-[18px] font-semibold leading-[1.2em] tracking-normal text-tm-black-80">
                Bank account for payouts
              </h2>
              <BankDetailsForm
                value={bankForm}
                isLinked={userProfileInfo?.isBankLinked}
                saving={savingBankDetails}
                isEditing={isEditingBankDetails}
                onChange={(patch) => setBankForm((prev) => ({ ...prev, ...patch }))}
                onSave={handleSaveBankDetails}
                onToggleEdit={handleToggleBankDetailsEdit}
              />
            </div>
          )}

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
      {isBuyer && (
        <DepositDialog
          isOpen={isDepositDialogOpen}
          onClose={() => setIsDepositDialogOpen(false)}
          onDepositComplete={() => {
            fetchTokenBalance();
            refetch();
          }}
        />
      )}
    </>
  );
};

export default AccountDetails;

