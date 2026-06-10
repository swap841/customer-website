importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

// NOTE: Firebase config values are public by design (identifiers, not secrets).
// Security is enforced via Firebase Security Rules + App Check.
firebase.initializeApp({
  apiKey: "AIzaSyBqp4ioSFI1D97hdixZmRo_h7Z6wiu2SeA",
  authDomain: "my-store-51b02.firebaseapp.com",
  projectId: "my-store-51b02",
  storageBucket: "my-store-51b02.firebasestorage.app",
  messagingSenderId: "240390353694",
  appId: "1:240390353694:web:70110e5cc4e44c3991cf0f",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.data || {};
  if (title) {
    self.registration.showNotification(title, {
      body: body || "",
      icon: "/icon.png",
      badge: "/icon.png",
      tag: payload.data?.type === "otp_verification" ? "otp-verification" : undefined,
    });
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  let url = "/";
  if (data.type === "otp_verification") {
    url = "/checkout";
  } else if (data.type === "ticket_reply" || data.type === "new_ticket") {
    url = "/profile";
  }
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
