import ImageIcon from "@mui/icons-material/Image";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { ParsedUrlQuery } from "querystring";
import { useState } from "react";
import { Grains, Basket, Coins } from "@phosphor-icons/react";

import RegisterFlow from "src/components/auth/register-flow";
import Button from "src/components/common/button";
import { AccountTypeEnum } from "src/interfaces/global";
import StepCounter from "src/components/common/step-counter";
import Container from "src/components/common/container";
import { AuthService } from "src/controller/AuthAPI.service";
import { useWeb3AuthContext } from "src/context/web3-auth-context";

const accountTypes = [
  {
    id: AccountTypeEnum.SUPPLIER,
    title: "Supplier",
    icon: <Grains size={20} color="#ffffff" weight="duotone" />,
  },
  {
    id: AccountTypeEnum.BUYER,
    title: "Buyer",
    icon: <Basket size={20} color="#ffffff" weight="duotone" />,
  },
  {
    id: AccountTypeEnum.INVESTOR,
    title: "Investor",
    icon: <Coins size={20} color="#ffffff" weight="duotone" />,
  },
];

interface RouterQuery {
  web3authToken: string;
  auth0Token: string;
}

function AccountType() {
  const { push, query } = useRouter();
  const { web3authToken, auth0Token } = query;
  const { setJWT } = useWeb3AuthContext();
  const [loading, setLoading] = useState<{ option: null | AccountTypeEnum; status: boolean }>({
    option: null,
    status: false,
  });

  const finishSignUpProcess = async (accountType: AccountTypeEnum) => {
    try {
      setLoading({ option: accountType, status: true });
      const user = await AuthService.saveUser({
        web3authToken: web3authToken as string,
        auth0Token: auth0Token as string,
        accountType: accountType,
      });
      setJWT(user.token);
      push("/welcome");
    } catch (err) {
      toast.error("You already have account associated to email address! please login");
      push("/sign-in");
    } finally {
      setLoading({ option: accountType, status: false });
    }
  };

  return (
    <div>
      <div>
        <div className="pt-[120px]">
          <div className="pb-[80px]">
            <h1 className="text-tm-theme-text text-center text-[26px] font-bold leading-[1.2em] tracking-normal">
              Create an account
            </h1>
          </div>
          <div className="relative -left-[20px] -top-[40px] w-full">
            <div className="absolute left-1/2">
              <StepCounter
                currentStep={2}
                totalSteps={2}
                classOverrides="!bg-tm-white border border-tm-black-20 !h-[38px] !w-[46px]"
                invert
              />
            </div>
            <div className="absolute left-0  top-[18px] -z-20 h-[1px]  w-1/2 bg-tm-black-20"></div>
          </div>
          <Container>
            <div className="mx-auto max-w-[200px]">
              <p className="text-tm-theme-text pb-[20px] pt-[40px] text-center text-[15px] font-bold leading-[1.2em]">
                Select Account Type
              </p>
              <div className="flex flex-col gap-[10px]">
                {accountTypes.map((accountType) => (
                  <Button
                    loading={loading.status && loading.option === accountType.id}
                    disabled={loading.status && loading.option === accountType.id}
                    key={accountType.id}
                    onClick={() => finishSignUpProcess(accountType.id)}
                  >
                    <div className="flex w-full items-center justify-between">
                      <p className="text-[14px] font-bold leading-[1.2em]">{accountType.title}</p>
                      {accountType.icon}
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </Container>
        </div>
      </div>
    </div>
  );
}

export default AccountType;
