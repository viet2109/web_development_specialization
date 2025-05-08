import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage  } from "firebase/messaging";
import { subscribeAllUser, subscribeUserTopic } from "./api/fcm";

const firebaseConfig = {
  apiKey: "AIzaSyDZaUPbwruRIkdj_ua-7Sj81uSsxPP_CJ0",
  authDomain: "socia-app-2f1e9.firebaseapp.com",
  projectId: "socia-app-2f1e9",
  storageBucket: "socia-app-2f1e9.firebasestorage.app",
  messagingSenderId: "226916357922",
  appId: "1:226916357922:web:d0fdcdd6bef99ddc75377b",
  measurementId: "G-CVK2B3444T",
};

const app = initializeApp(firebaseConfig);

const messaging = getMessaging(app);

export const requestForTokenWithAuth = async () => {
  try {
    const currentToken = await getToken(messaging, {
      vapidKey:
        "BEy5aUd2u9ahARX-RneKnP1p1UAJlmFFCO6YYBARgdRqjIn4bjOH49d-di_rYoVjrS2n8xm7ShDv6xM1VtSlruA",
    });
    if (currentToken) {
      console.log("Token nhận được:", currentToken);
      subscribeUserTopic(currentToken);
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

export const requestForToken = async () => {
  try {
    const currentToken = await getToken(messaging, {
      vapidKey:
        "BEy5aUd2u9ahARX-RneKnP1p1UAJlmFFCO6YYBARgdRqjIn4bjOH49d-di_rYoVjrS2n8xm7ShDv6xM1VtSlruA",
    });
    if (currentToken) {
      console.log("Token nhận được:", currentToken);
      subscribeAllUser(currentToken);
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


onMessage(messaging, (payload) => {
  console.log("Thông báo đến khi ứng dụng đang foreground: ", payload);
});

export { messaging };
