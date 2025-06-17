import { ErrorMessage, Field, Form, Formik } from "formik";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { api } from "../api/api";
import routers from "../configs/router";
import { requestForTokenWithAuth } from "../firebase-config";
import { loginSuccess, loginSuccessWithFcmToken } from "../redux/authSlice";

// Validation schema với Yup
const validationSchema = Yup.object({
  email: Yup.string().required("Email là bắt buộc"),
  password: Yup.string().required("Mật khẩu là bắt buộc"),
});

// Initial values
const initialValues = {
  email: "",
  password: "",
  rememberMe: false,
};

const Login = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (values: typeof initialValues) => {
    setLoading(true);
    try {
      console.log("📦 Login request:", values);
      const response = await api.post("/auth/login", {
        email: values.email,
        password: values.password,
      });
      console.log("🖥️ Response received:", response.data);

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      const { accessToken, user } = response.data;
      if (!accessToken || !user) {
        throw new Error("Missing accessToken or user in response");
      }
      dispatch(loginSuccess({ user, token: accessToken }));
      const token = await requestForTokenWithAuth();
      if (token) dispatch(loginSuccessWithFcmToken(token));
      navigate(routers.home);
      toast.success("🎉 Đăng nhập thành công!", {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: true,
        theme: "colored",
      });
    } catch (error: any) {
      console.error("Login failed:", error.message, error.response?.data);
      toast.error("❌ Email hoặc mật khẩu không chính xác. Vui lòng thử lại.", {
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-900 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl dark:shadow-gray-900/50 overflow-hidden transition-colors duration-300">
        <div className="flex flex-col lg:flex-row min-h-[600px]">
          {/* Left Side - Welcome Section */}
          <div className="flex-1 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 dark:from-indigo-700 dark:via-purple-700 dark:to-blue-700 p-8 lg:p-12 flex flex-col justify-center text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 dark:opacity-5">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white dark:bg-gray-200 rounded-full -translate-x-20 -translate-y-20"></div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-white dark:bg-gray-200 rounded-full translate-x-16 translate-y-16"></div>
              <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white dark:bg-gray-200 rounded-full -translate-x-12 -translate-y-12"></div>
            </div>

            <div className="relative z-10">
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                Chào mừng đến với
                <span className="block text-yellow-300 dark:text-yellow-400">
                  Buckety
                </span>
              </h1>
              <p className="text-lg lg:text-xl mb-8 text-blue-100 dark:text-blue-200 leading-relaxed">
                Nền tảng đáng tin cậy của bạn cho những trải nghiệm số liền
                mạch. Tham gia cùng hàng nghìn người dùng tin tưởng chúng tôi
                hàng ngày.
              </p>
              <div className="space-y-4">
                <p className="text-blue-200 dark:text-blue-300">
                  Chưa có tài khoản?
                </p>
                <Link to="/register">
                  <button className="bg-white dark:bg-gray-100 text-indigo-600 dark:text-indigo-700 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 dark:hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 shadow-lg dark:shadow-gray-900/30">
                    Tạo tài khoản
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center bg-white dark:bg-gray-800 transition-colors duration-300">
            <div className="w-full max-w-md mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2 transition-colors duration-300">
                  Đăng nhập
                </h2>
                <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
                  Nhập thông tin đăng nhập để truy cập tài khoản
                </p>
              </div>

              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ errors, touched, isValid, dirty }) => (
                  <Form className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300"
                        >
                          Địa chỉ Email
                        </label>
                        <Field
                          id="email"
                          name="email"
                          type="email"
                          placeholder="Nhập email của bạn"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors duration-200 bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
                            errors.email && touched.email
                              ? "border-red-500 dark:border-red-400"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                        />
                        <ErrorMessage
                          name="email"
                          component="div"
                          className="mt-1 text-sm text-red-600 dark:text-red-400"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="password"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300"
                        >
                          Mật khẩu
                        </label>
                        <Field
                          id="password"
                          name="password"
                          type="password"
                          placeholder="Nhập mật khẩu của bạn"
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors duration-200 bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
                            errors.password && touched.password
                              ? "border-red-500 dark:border-red-400"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                        />
                        <ErrorMessage
                          name="password"
                          component="div"
                          className="mt-1 text-sm text-red-600 dark:text-red-400"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <Field
                          name="rememberMe"
                          type="checkbox"
                          className="w-4 h-4 text-indigo-600 dark:text-indigo-400 border-gray-300 dark:border-gray-600 rounded focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-700"
                        />
                        <span className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
                          Ghi nhớ đăng nhập
                        </span>
                      </label>
                      <a
                        href="#"
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors duration-300"
                      >
                        Quên mật khẩu?
                      </a>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !isValid || !dirty}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] shadow-lg dark:shadow-gray-900/30"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <ClipLoader size={16} color="#ffffff" />
                          <span>Đang đăng nhập...</span>
                        </div>
                      ) : (
                        "Đăng nhập"
                      )}
                    </button>
                  </Form>
                )}
              </Formik>

              <div className="mt-8 text-center">
                <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
                  Bằng cách đăng nhập, bạn đồng ý với{" "}
                  <a
                    href="#"
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors duration-300"
                  >
                    Điều khoản dịch vụ
                  </a>{" "}
                  và{" "}
                  <a
                    href="#"
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors duration-300"
                  >
                    Chính sách bảo mật
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
