import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth0 } from "@auth0/auth0-react";
import Link from "next/link";

import StepCounter from "src/components/common/step-counter";

import AuthLayout from "../auth-layout";
import RegisterTabs from "./register-tabs";

interface RegisterFlowProps { }

const RegisterFlow: React.FC<RegisterFlowProps> = () => {
  const { push, query } = useRouter();
  const { getIdTokenClaims } = useAuth0();
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  const checkSocial = async () => {
    const resp = await getIdTokenClaims();

    if (resp?.__raw) {
      if (query.sign_in) {
        push(`/social/google?code=${resp?.__raw}&type=sign_in`);
      } else {
        push(`/social/google?code=${resp?.__raw}`);
      }
    }
  };

  useEffect(() => {
    if (query.code) {
      checkSocial();
    }
  }, [checkSocial, query]);

  return (
    <AuthLayout title="Create Account">
      <div className="space-y-6">
        {/* Step Counter */}
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-4">
            <StepCounter currentStep={selectedTabIndex + 1} totalSteps={2} classOverrides="!bg-tm-white border-2 border-tm-primary !h-[40px] !w-[50px]" invert />
            <span className="text-lg font-semibold text-tm-text">{selectedTabIndex + 2}/2</span>
          </div>
        </div>

        {/* Register Tabs */}
        <div className="bg-tm-white rounded-tm-lg pt-8 px-8 pb-4 shadow-tm-md">
          <RegisterTabs selectedIndex={selectedTabIndex} onTabChange={setSelectedTabIndex} />
        </div>

        {/* Login Link */}
        <div className="text-center text-sm text-tm-text-light">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-semibold text-tm-primary hover:text-tm-primary-dark transition-colors">
            Log in
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default RegisterFlow;
