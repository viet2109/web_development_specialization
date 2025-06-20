import {
    CheckCircle,
    Loader2,
    LogIn,
    Mail,
    RefreshCw,
    XCircle,
} from "lucide-react";
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useLocation, useNavigate } from "react-router";
import { api } from "../api/api";
import routers from "../configs/router";

const EmailVerificationPage: React.FC = () => {
  const [verificationStatus, setVerificationStatus] = useState<
    "loading" | "success" | "error" | "idle"
  >("idle");
  const [message, setMessage] = useState<string>("");
  const [isRetrying, setIsRetrying] = useState<boolean>(false);

  const location = useLocation();
  const navigate = useNavigate();
  const abortControllerRef = useRef<AbortController | null>(null);

  // Memoize token để tránh re-computation không cần thiết
  const token = useMemo(() => {
    return new URLSearchParams(location.search).get("token");
  }, [location.search]);

  // Cleanup function để hủy các request đang pending
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Memoize verifyEmail function để tránh tạo lại mỗi render
  const verifyEmail = useCallback(
    async (retryAttempt = false) => {
      if (!token) return;

      // Cleanup previous request
      cleanup();

      // Create new AbortController for this request
      abortControllerRef.current = new AbortController();

      if (retryAttempt) {
        setIsRetrying(true);
      } else {
        setVerificationStatus("loading");
      }

      try {
        await api.put<void>(`/auth/verify?token=${token}`, {
          signal: abortControllerRef.current.signal,
        });

        setVerificationStatus("success");
        setMessage("Email đã được xác nhận thành công!");
      } catch (error: any) {
        // Ignore aborted requests
        if (error.name === "AbortError") {
          return;
        }

        setVerificationStatus("error");
        setMessage("Có lỗi xảy ra khi xác nhận email. Vui lòng thử lại.");
      } finally {
        setIsRetrying(false);
        abortControllerRef.current = null;
      }
    },
    [token, cleanup]
  );

  // Memoize handleRetry function
  const handleRetry = useCallback(() => {
    verifyEmail(true);
  }, [verifyEmail]);

  // Navigate to login page
  const handleGoToLogin = useCallback(() => {
    navigate(routers.login);
  }, [navigate]);

  useEffect(() => {
    if (token) {
      verifyEmail();
    }

    // Cleanup on unmount
    return cleanup;
  }, [token, verifyEmail, cleanup]);

  // Memoize render content để tránh re-render không cần thiết
  const renderContent = useMemo(() => {
    switch (verificationStatus) {
      case "loading":
        return (
          <div className="text-center">
            <Loader2 className="h-16 w-16 text-blue-500 dark:text-blue-400 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Đang xác nhận email...
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Vui lòng chờ trong giây lát
            </p>
          </div>
        );

      case "success":
        return (
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 dark:text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Xác nhận thành công!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-800 dark:text-green-200">
                Email đã được xác nhận thành công. Bạn có thể đăng nhập để sử
                dụng dịch vụ.
              </p>
            </div>
            <button
              onClick={handleGoToLogin}
              className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white font-medium rounded-lg transition-colors duration-200"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Đăng nhập ngay
            </button>
          </div>
        );

      case "error":
        return (
          <div className="text-center">
            <XCircle className="h-16 w-16 text-red-500 dark:text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Xác nhận thất bại
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800 dark:text-red-200">
                Không thể xác nhận email. Vui lòng kiểm tra lại liên kết hoặc
                liên hệ hỗ trợ.
              </p>
            </div>
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200"
            >
              {isRetrying ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {isRetrying ? "Đang thử lại..." : "Thử lại"}
            </button>
          </div>
        );

      default:
        return (
          <div className="text-center">
            <Mail className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Xác nhận Email
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Đang chuẩn bị xác nhận email...
            </p>
          </div>
        );
    }
  }, [verificationStatus, message, isRetrying, handleRetry, handleGoToLogin]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 md:p-8">
          {renderContent}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Nếu bạn gặp vấn đề, vui lòng liên hệ{" "}
            <a
              href="mailto:support@example.com"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              hỗ trợ khách hàng
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
