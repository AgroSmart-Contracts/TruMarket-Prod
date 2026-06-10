import React from "react";
import Link from "next/link";
import { Bell, User, SignOut } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import LanguageSwitcher from "src/components/common/language-switcher";
import NotificationMenu from "src/components/dashboard/notifications/notification-menu";
import { useWeb3AuthContext } from "src/context/web3-auth-context";
import { NotificationsService } from "src/controller/NotificationsAPI.service";
import { INotification } from "src/interfaces/notifications";
import { useUserInfo } from "src/lib/hooks/useUserInfo";

const Header: React.FC = () => {
  const { t } = useTranslation("common");
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
      className="fixed top-0 z-[100] w-full border-b border-[#E2E8F0] bg-[#FFFFFF]"
      style={{
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)",
      }}
    >
      <div className="mx-auto max-w-7xl px-3 sm:px-6">
        <div className="flex min-h-14 items-center gap-2 py-2 sm:min-h-16 sm:gap-3 sm:py-0">
          <Link
            href={isLoggedIn ? "/dashboard" : "/"}
            className="shrink-0"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            {/* Native img avoids Next/Image fetchPriority React DOM warning for SVG */}
            <img
              src="/assets/logo.svg"
              alt={t("logoAlt")}
              width={96}
              height={48}
              className="h-7 w-auto cursor-pointer sm:h-10 lg:h-12"
            />
          </Link>

          <div className="hidden min-w-0 flex-col sm:flex">
            <h1
              className="truncate text-base font-medium leading-6 text-[#0F172B]"
              style={{ letterSpacing: "-0.3125px" }}
            >
              {t("appName")}
            </h1>
            <p
              className="mt-0.5 truncate text-sm font-normal leading-5 text-[#62748E]"
              style={{ letterSpacing: "-0.150391px" }}
            >
              {t("tagline")}
            </p>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-3">
            {isLoggedIn && (
              <>
                <NotificationMenu notifications={notifications || []} refetch={refetchNotifications}>
                  <button
                    type="button"
                    aria-label={t("notifications")}
                    className="relative flex h-8 w-8 items-center justify-center rounded-full border border-[#E2E8F0] bg-white text-[#62748E] shadow-sm transition-colors hover:bg-gray-50 sm:h-9 sm:w-9"
                  >
                    <Bell size={18} weight="bold" className="sm:hidden" />
                    <Bell size={20} weight="bold" className="hidden sm:block" />
                    {unreadCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#DC2626] px-[3px] text-[10px] font-semibold text-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>
                </NotificationMenu>

                <Link
                  href="/dashboard/account-details"
                  className="hidden h-9 items-center gap-2 rounded-md border border-[#E2E8F0] bg-white px-3 text-sm font-medium leading-none text-[#0F172B] shadow-sm transition-colors hover:bg-gray-50 lg:flex"
                >
                  <User size={18} weight="bold" />
                  <span className="max-w-[180px] truncate tracking-tight">{userInfo.user.email}</span>
                </Link>

                <button
                  type="button"
                  onClick={logout}
                  aria-label={t("logout")}
                  className="flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm font-normal leading-none text-white shadow-sm transition-all duration-200 hover:shadow-md sm:h-9 sm:gap-2 sm:px-4"
                  style={{
                    backgroundColor: "#4E8C37",
                    letterSpacing: "-0.01em",
                  }}
                >
                  <SignOut size={16} weight="bold" />
                  <span className="hidden sm:inline">{t("logout")}</span>
                </button>
              </>
            )}

            {!isLoggedIn && (
              <Link
                href="/sign-in"
                className="flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm font-normal leading-none text-white shadow-sm transition-all duration-200 hover:shadow-md sm:h-9 sm:gap-2 sm:px-4"
                style={{
                  backgroundColor: "#4E8C37",
                  letterSpacing: "-0.01em",
                }}
              >
                <SignOut size={16} weight="bold" />
                <span className="hidden sm:inline">{t("login")}</span>
              </Link>
            )}

            <LanguageSwitcher className="h-8 sm:h-9" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

