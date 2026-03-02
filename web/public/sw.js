const notificationDelay = 500;

const showNotification = (title, options) =>
  new Promise((resolve) => {
    setTimeout(() => {
      self.registration.showNotification(title, options).then(() => resolve());
    }, notificationDelay);
  });

self.addEventListener("push", async (event) => {
  const res = JSON.parse(event.data.text());

  const { subject, redirectUrl, message, dealId, id } = res;
  const options = {
    body: message,
    vibrate: [100],
    data: { url: redirectUrl, notificationId: id, dealId: dealId },
  };
  event.waitUntil(showNotification(subject, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const { url, notificationId, dealId } = event.notification.data;
  if (url) event.waitUntil(clients.openWindow(url));
});
