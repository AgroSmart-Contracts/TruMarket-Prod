import React, { useEffect } from "react";
import { useRouter } from "next/router";

import { register } from "src/lib/push-notification-register";
import Header from "src/components/common/header";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const isDashboard = router.pathname.startsWith("/dashboard");

  useEffect(() => {
    const initializePushNotifications = async () => {
      try {
        await register();
      } catch (error) {
        console.error("Error during registration:", error);
      }
    };

    initializePushNotifications();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-tm-neutral-light">
      {isDashboard && <Header />}
      <div className={`flex-1 ${isDashboard ? 'pt-16 sm:pt-20' : ''}`}>{children}</div>
    </div>
  );
};

export default Layout;
