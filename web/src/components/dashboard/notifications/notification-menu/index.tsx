import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import { Envelope, EnvelopeOpen } from "@phosphor-icons/react";
import classNames from "classnames";
import { useRouter } from "next/router";
import * as React from "react";
import { ViewportList } from "react-viewport-list";

import { NotificationsService } from "src/controller/NotificationsAPI.service";
import { INotification } from "src/interfaces/notifications";
export default function NotificationMenu({
  children,
  notifications,
  refetch,
}: {
  children: React.ReactElement;
  notifications: INotification[];
  refetch: () => void;
}) {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [hasMarkedAsRead, setHasMarkedAsRead] = React.useState(false);
  const markedNotificationIdsRef = React.useRef<Set<string>>(new Set());
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
    setHasMarkedAsRead(false);
    // Clear the marked IDs when menu closes to allow re-marking if needed
    markedNotificationIdsRef.current.clear();
  };

  const markNotificationAsSeen = async (id: string, dealId: string) => {
    try {
      await NotificationsService.markNotificationAsSeen(id, dealId);
      await refetch();
    } catch (error) {
      console.error("Error marking notification as seen:", error);
    }
  };

  const handleNotificationClick = async (e: React.MouseEvent, item: INotification) => {
    e.preventDefault();
    handleClose();

    // Mark as seen (don't wait for it to complete)
    markNotificationAsSeen(item.id, item.dealId).catch(console.error);

    // Navigate to the redirect URL
    if (item.redirectUrl) {
      router.push(item.redirectUrl);
    }
  };

  // Mark all unread notifications as read when menu opens
  React.useEffect(() => {
    if (open && !hasMarkedAsRead) {
      // Filter valid unread notifications (must have both id and dealId)
      // Also exclude notifications we've already attempted to mark
      const unreadNotifications = notifications.filter(
        (n) => !n.read && n.id && n.dealId && !markedNotificationIdsRef.current.has(n.id)
      );

      if (unreadNotifications.length > 0) {
        // Track which notifications we're about to mark
        unreadNotifications.forEach((n) => markedNotificationIdsRef.current.add(n.id));

        const markAllAsRead = async () => {
          try {
            // Use allSettled to handle partial failures
            const results = await Promise.allSettled(
              unreadNotifications.map((notification) =>
                NotificationsService.markNotificationAsSeen(notification.id, notification.dealId)
              )
            );

            // Log any failures for debugging
            const failures = results
              .map((result, index) => ({ result, notification: unreadNotifications[index] }))
              .filter(({ result }) => result.status === 'rejected');

            if (failures.length > 0) {
              console.error("Some notifications failed to mark as read:", failures);
              // Remove failed notifications from the tracked set so they can be retried
              failures.forEach(({ notification }) => {
                markedNotificationIdsRef.current.delete(notification.id);
              });

              // Retry failed notifications once with a small delay
              await new Promise((resolve) => setTimeout(resolve, 200));
              const retryNotifications = failures.map(({ notification }) => notification);
              const retryResults = await Promise.allSettled(
                retryNotifications.map((notification) => {
                  markedNotificationIdsRef.current.add(notification.id);
                  return NotificationsService.markNotificationAsSeen(notification.id, notification.dealId);
                })
              );
              const retryFailures = retryResults
                .map((result, index) => ({ result, notification: retryNotifications[index] }))
                .filter(({ result }) => result.status === 'rejected');
              if (retryFailures.length > 0) {
                console.error("Retry also failed for some notifications:", retryFailures);
                // Remove permanently failed notifications from tracking
                retryFailures.forEach(({ notification }) => {
                  markedNotificationIdsRef.current.delete(notification.id);
                });
              }
            }

            setHasMarkedAsRead(true);
            // Add a small delay to ensure backend has processed all updates
            await new Promise((resolve) => setTimeout(resolve, 300));
            await refetch();
          } catch (error) {
            console.error("Error marking notifications as read:", error);
            setHasMarkedAsRead(true);
            // Still refetch even on error to get latest state
            await refetch();
          }
        };
        markAllAsRead();
      } else {
        // If there are no unread notifications, still mark as processed
        setHasMarkedAsRead(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, hasMarkedAsRead, notifications.length]);

  const ref = React.useRef<HTMLDivElement | null>(null);
  return (
    <React.Fragment>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{ ml: 2 }}
        aria-controls={open ? "account-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
      >
        {children}
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        PaperProps={{
          zIndex: 99999,
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            "&::before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <div ref={ref} className="scroll-container max-h-[400px] w-full min-w-[400px] max-w-[400px] overflow-y-auto">
          <ViewportList viewportRef={ref} items={notifications}>
            {(item) => (
              <div
                key={item.id}
                onClick={(e) => handleNotificationClick(e, item)}
                className={classNames("item cursor-pointer", {
                  "opacity-60": item.read,
                })}
              >
                <div className="flex items-start gap-[10px] border-y border-y-tm-black-20 px-[20px] py-[10px] transition-transform duration-300 hover:bg-tm-black-20">
                  <div className="flex h-[45px] w-[45px] shrink-0 items-center justify-center rounded-full border border-tm-black-20">
                    {item.read ? (
                      <EnvelopeOpen size={32} weight="duotone" />
                    ) : (
                      <Envelope size={32} weight="duotone" />
                    )}
                  </div>
                  <div className="mt-[5px] flex flex-col gap-[4px]">
                    <p className="text-[14px] font-bold leading-[0.9em] tracking-normal">{item.subject}</p>
                    <p className="text-[13px] font-medium  leading-[1.2em] tracking-normal text-tm-black-80 opacity-80">
                      {item.message}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </ViewportList>
        </div>
      </Menu>
    </React.Fragment>
  );
}
