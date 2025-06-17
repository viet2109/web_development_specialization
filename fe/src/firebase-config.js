import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";
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
const vapidKey =
  "BKuu7YlsHPnTsYo2ZRvccaMl61xNl8ENMFg6gau-YBnGrJ_EVfxTCpcQxrNOefvgojMlyCx7eOfDnkeHsINErSo";
export const requestForTokenWithAuth = async () => {
  try {
    const currentToken = await getToken(messaging, {
      vapidKey: vapidKey,
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
      vapidKey: vapidKey,
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

export { messaging };

