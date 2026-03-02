import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { Bell, User, SignOut, ArrowLeft } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";

import NotificationMenu from "src/components/dashboard/notifications/notification-menu";
import { useWeb3AuthContext } from "src/context/web3-auth-context";
import { NotificationsService } from "src/controller/NotificationsAPI.service";
import { INotification } from "src/interfaces/notifications";
import { useUserInfo } from "src/lib/hooks/useUserInfo";

const Header: React.FC = () => {
    const router = useRouter();
    const { logout } = useWeb3AuthContext();
    const { userInfo } = useUserInfo();

    const { data: notifications, refetch: refetchNotifications } = useQuery({
        queryKey: ["notifications"],
        queryFn: () => NotificationsService.getNotificationsList(),
        enabled: !!userInfo?.user?.email,
        initialData: [],
    });

    const unreadCount = notifications?.filter((n: INotification) => !n.read).length || 0;
  const isLoggedIn = !!userInfo?.user?.email;

    return (
    <header
      className="fixed top-0 w-full z-[100] bg-[#FFFFFF] border-b border-[#E2E8F0]"
      style={{
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)",
      }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between">
        {/* Left Section: Back button + Logo and Branding */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-[#314158] hover:bg-[#FAFAFA] rounded-md h-8 -ml-2 transition-colors"
          >
          </button>
          <Link href={isLoggedIn ? "/dashboard" : "/"} className="flex-shrink-0">
            <Image
              src="/assets/logo.svg"
              alt="TruMarket Logo"
              width={96}
              height={48}
              className="h-8 sm:h-10 lg:h-12 w-auto cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            />
                    </Link>
          <div className="flex flex-col">
            <h1
              className="text-base leading-6 font-medium text-[#0F172B]"
              style={{ letterSpacing: '-0.3125px' }}
                        >
              TruMarket
            </h1>
            <p
              className="text-sm leading-5 font-normal text-[#62748E] mt-0.5"
              style={{ letterSpacing: '-0.150391px' }}
            >
              Institutional Deal Dashboard
            </p>
          </div>
        </div>
        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {isLoggedIn && (
            <>
                        {/* Notifications */}
                            <NotificationMenu notifications={notifications || []} refetch={refetchNotifications}>
                <button className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#E2E8F0] bg-white text-[#62748E] hover:bg-gray-50 transition-colors shadow-sm">
                  <Bell size={20} weight="bold" />
                                    {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#DC2626] px-[3px] text-[10px] font-semibold text-white">
                                            {unreadCount > 9 ? "9+" : unreadCount}
                                        </span>
                                    )}
                                </button>
                            </NotificationMenu>

              {/* User pill */}
                            <Link
                                href="/dashboard/account-details"
                className="hidden items-center gap-2 rounded-md border border-[#E2E8F0] bg-white px-3 py-1.5 text-sm font-medium text-[#0F172B] hover:bg-gray-50 md:flex transition-colors shadow-sm"
                            >
                <User size={18} weight="bold" />
                <span className="max-w-[180px] truncate tracking-tight">{userInfo.user.email}</span>
                            </Link>

                            {/* Logout */}
                            <button
                                onClick={logout}
                className="rounded-md px-4 py-2 text-sm font-normal text-white shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
                style={{
                  backgroundColor: "#4E8C37",
                  letterSpacing: "-0.01em",
                }}
                            >
                <SignOut size={16} weight="bold" />
                <span>Logout</span>
                            </button>
            </>
          )}

          {!isLoggedIn && (
            <Link
              href="/sign-in"
              className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-normal text-white shadow-sm hover:shadow-md transition-all duration-200"
              style={{
                backgroundColor: "#4E8C37",
                letterSpacing: "-0.01em",
              }}
            >
              <SignOut size={16} weight="bold" />
              <span>Login</span>
            </Link>
          )}
                </div>
            </div>
        </header>
    );
};

export default Header;

