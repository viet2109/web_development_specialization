// src/firebase-config.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Cấu hình Firebase của bạn (lấy từ Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyDZaUPbwruRIkdj_ua-7Sj81uSsxPP_CJ0",
  authDomain: "socia-app-2f1e9.firebaseapp.com",
  projectId: "socia-app-2f1e9",
  storageBucket: "socia-app-2f1e9.firebasestorage.app",
  messagingSenderId: "226916357922",
  appId: "1:226916357922:web:d0fdcdd6bef99ddc75377b",
  measurementId: "G-CVK2B3444T",
};

// Khởi tạo Firebase app
const app = initializeApp(firebaseConfig);

// Lấy instance của Messaging
const messaging = getMessaging(app);

// Hàm lấy token, lưu ý: cần có vapid key cho web push
export const requestForToken = async () => {
  try {
    const currentToken = await getToken(messaging, {
      vapidKey: "BHeH94SMv6gIZtz7KgHMfTgH445B08osW74XmzEyptfKRBhVK33iE77Vp1u41OGema3DTjezf8xfl-RBTlEDb40", // lấy từ Firebase Console > Project Settings > Cloud Messaging
    });
    if (currentToken) {
      console.log("Token nhận được:", currentToken);
      // Bạn có thể gửi token này lên backend của bạn để quản lý thông báo
      return currentToken;
    } else {
      console.log(
        "Không có token nào được sinh ra, hãy yêu cầu quyền từ người dùng."
      );
    }
  } catch (error) {
    console.error("Lỗi khi lấy token:", error);
  }
};

// Lắng nghe thông báo khi ứng dụng đang foreground
onMessage(messaging, (payload) => {
  console.log("Thông báo đến khi ứng dụng đang foreground: ", payload);
  // Xử lý thông báo (VD: hiển thị toast)
});

export { messaging };
