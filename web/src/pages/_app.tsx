import "react-toastify/dist/ReactToastify.css";
import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";

import { Inter } from "next/font/google";
import "src/styles/globals.css";
import type { AppProps } from "next/app";
import { ToastContainer } from "react-toastify";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Auth0Provider } from "@auth0/auth0-react";
import { useEffect } from "react";

import { Web3AuthContextProvider } from "src/context/web3-auth-context";
import { wrapper } from "src/lib/store";
import { ModalProvider } from "src/context/modal-context";
import { Provider } from "react-redux";

import Layout from "./layout";

// Fix for Web3 libraries trying to set window.ethereum when it's read-only
if (typeof window !== "undefined") {
  try {
    // Make window.ethereum writable if it exists and is read-only
    const ethereumDescriptor = Object.getOwnPropertyDescriptor(window, "ethereum");
    if (ethereumDescriptor && !ethereumDescriptor.writable && !ethereumDescriptor.configurable) {
      // If ethereum is read-only, create a proxy or make it configurable
      const originalEthereum = (window as any).ethereum;
      try {
        Object.defineProperty(window, "ethereum", {
          value: originalEthereum,
          writable: true,
          configurable: true,
        });
      } catch (e) {
        // If we can't make it writable, suppress the error
        console.warn("Could not make window.ethereum writable:", e);
      }
    }
  } catch (e) {
    // Suppress errors related to window.ethereum
    console.warn("Error handling window.ethereum:", e);
  }

  // Global error handler to catch window.ethereum assignment errors
  window.addEventListener("error", (event) => {
    if (
      event.message?.includes("Cannot set property ethereum") ||
      event.message?.includes("which has only a getter")
    ) {
      event.preventDefault();
      console.warn("Suppressed window.ethereum assignment error (this is expected in some environments)");
      return false;
    }
  });
}

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

function App({ Component, ...rest }: AppProps) {
  const { store, props } = wrapper.useWrappedStore(rest);
  const { pageProps } = props;
  
  // Create a client
  const queryClient = new QueryClient();

  // useCheckNotificationPermission();

  return (
    <>
      {/* eslint-disable-next-line */}
      <style jsx global>{`
        html {
          font-family: ${inter.style.fontFamily};
        }
      `}</style>
      <Provider store={store}>
        <Auth0Provider
          domain={process.env.NEXT_PUBLIC_AUTH0_BASE_URL as string}
          clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID_SOCIAL as string}
          authorizationParams={{
            redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/`,
          }}
        >
          <QueryClientProvider client={queryClient}>
            <Web3AuthContextProvider>
              <ModalProvider>
                <div className={`font-sans`}>
                  <Layout>
                    <Component {...pageProps} />
                  </Layout>
                  <ToastContainer
                    position="bottom-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                    icon={false}
                    style={{ zIndex: 999999999 }}
                  />
                </div>
              </ModalProvider>
            </Web3AuthContextProvider>
          </QueryClientProvider>
        </Auth0Provider>
      </Provider>
    </>
  );
}

export default App;
