import { useAuth0 } from "@auth0/auth0-react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { toast } from "react-toastify";

import RegisterFlow from "src/components/auth/register-flow";
import Loading from "src/components/common/loading";
import { useWeb3AuthContext } from "src/context/web3-auth-context";
import { AuthService } from "src/controller/AuthAPI.service";
import { checkWeb3AuthInstance, parseToken } from "src/lib/helpers";

export default function SocialGoogle() {
  const { web3authSfa, setIsLoggingIn, setJWT, init } = useWeb3AuthContext();
  const { getIdTokenClaims } = useAuth0();
  const router = useRouter();
  const isSignIn = router.query.type === "sign_in";

  const prepareRegistrationAccount = async () => {
    await init();

    try {
      checkWeb3AuthInstance(web3authSfa);
      const auth0SocialAuthToken = await getIdTokenClaims();
      const auth0JwtToken = auth0SocialAuthToken?.__raw.toString() as string;
      const { email } = parseToken(auth0SocialAuthToken?.__raw);

      const subVerifierInfoArray = [
        {
          verifier: "auth0-google",
          idToken: auth0JwtToken,
        },
      ];
      
      if (!process.env.NEXT_PUBLIC_WEB3AUTH_CONNECTION_ID) {
        throw new Error("Web3Auth connection ID is not set");
      }

      await web3authSfa.connect({
        verifier: "trumarket-w3a-auth0-2",
        verifierId: email,
        idToken: auth0JwtToken,
        subVerifierInfoArray,
      });

      const web3auth = await web3authSfa.authenticateUser();

      if (web3auth.idToken && !isSignIn) {
        router.push(`/account-type?web3authToken=${web3auth.idToken}&auth0Token=${auth0JwtToken}`);
      }

      if (web3auth.idToken && isSignIn) {
        try {
          const user = await AuthService.loginUser({ web3authToken: web3auth.idToken });
          setJWT(user.token);
          window.location.href = "/dashboard";
        } catch (err) {
          //if account not found start user registration process
          router.push(`/account-type?web3authToken=${web3auth.idToken}&auth0Token=${auth0JwtToken}`);
        }
      }
    } catch (err) {
      // Single Factor Auth SDK throws an error if the user has already enabled MFA
      // One can use the Web3AuthNoModal SDK to handle this case
      setIsLoggingIn(false);
      console.error(err);
    }
  };

  useEffect(() => {
    prepareRegistrationAccount();
  }, []);

  return (
    <div className="flex justify-center pt-[300px]">
      <div className="flex flex-col items-center gap-[24px]">
        <Loading classOverrides="!h-[30px] !w-[30px]" />
        <div className="flex flex-col gap-[10px]">
          <h3 className="text-center text-[26px] font-bold leading-[1.2em] tracking-normal text-tm-theme-text">
            {isSignIn ? "You will be logged in a few seconds…" : "Your account will be created in a few seconds…"}
          </h3>
          <p className="text-center text-[13px] leading-[1.2em] text-tm-theme-text">Don&apos;t close this window</p>
        </div>
      </div>
    </div>
  );
}
