import Head from "next/head";

import LoginFlow from "src/components/auth/login-flow";
import { APP_NAME } from "src/constants";

export default function SignIn() {
  return (
    <>
      <Head>
        <title>{`${APP_NAME} - Sign In`}</title>
      </Head>
      <div>
        <LoginFlow />
      </div>
    </>
  );
}

