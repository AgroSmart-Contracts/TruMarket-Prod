import React from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import AuthLayout from "../auth-layout";
import LoginEmail from "./login-email";
import AllProviders from "./all-providers";

interface LoginFlowProps { }

const LoginFlow: React.FC<LoginFlowProps> = () => {
  const { t } = useTranslation("auth");

  return (
    <AuthLayout title={t("signIn")}>
      <div className="space-y-6">
        {/* Email Login Form */}
        <div className="bg-tm-white rounded-tm-lg p-8 shadow-tm-md">
          <LoginEmail />
        </div>

        {/* Divider */}
        {/* <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-tm-neutral-dark"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-tm-neutral-light text-tm-text-light">Or sign in with</span>
          </div>
        </div> */}

        {/* Social Login */}
        {/* <div className="bg-tm-white rounded-tm-lg p-8 shadow-tm-md">
          <AllProviders />
        </div> */}

        {/* Register Link */}
        <div className="text-center text-sm text-tm-text-light">
          {t("noAccount")}{" "}
          <Link href="/" className="font-semibold text-tm-primary hover:text-tm-primary-dark transition-colors">
            {t("createAccount")}
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginFlow;
