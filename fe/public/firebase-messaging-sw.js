// firebase-messaging-sw.js
// Import scripts của Firebase (đảm bảo URL luôn cập nhật với phiên bản mới nhất)
importScripts(
  "https://www.gstatic.com/firebasejs/11.5.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/11.5.0/firebase-messaging-compat.js"
);

// Cấu hình Firebase (đảm bảo giống với file cấu hình phía client)
const firebaseConfig = {
  apiKey: "AIzaSyDZaUPbwruRIkdj_ua-7Sj81uSsxPP_CJ0",
  authDomain: "socia-app-2f1e9.firebaseapp.com",
  projectId: "socia-app-2f1e9",
  storageBucket: "socia-app-2f1e9.firebasestorage.app",
  messagingSenderId: "226916357922",
  appId: "1:226916357922:web:d0fdcdd6bef99ddc75377b",
  measurementId: "G-CVK2B3444T"
};

// Khởi tạo Firebase app trong service worker
firebase.initializeApp(firebaseConfig);

// Lấy instance của messaging
const messaging = firebase.messaging();

// Xử lý background message
messaging.onBackgroundMessage(function (payload) {
  console.log("[firebase-messaging-sw.js] Nhận thông báo background ", payload);
  const notificationTitle =  payload.data.title || "Thông báo mới";
  const notificationOptions = {
    body: payload.data.body || "content body",
    icon: payload.data.icon || "/firebase-logo.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
