import { ErrorMessage, Field, Form, Formik } from "formik";
import { useState } from "react";
import { FaChevronDown, FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { ToastContainer, toast } from "react-toastify";
import * as yup from "yup";
import { api } from "../api/api";

type Gender = "MALE" | "FEMALE" | "OTHER";

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  gender: Gender;
  phone: string;
  birthDate: string;
}

const validationSchema = yup.object({
  firstName: yup
    .string()
    .required("Họ là bắt buộc")
    .min(2, "Họ phải có ít nhất 2 ký tự")
    .max(50, "Họ phải ít hơn 50 ký tự")
    .trim(),
  lastName: yup
    .string()
    .required("Tên là bắt buộc")
    .min(2, "Tên phải có ít nhất 2 ký tự")
    .max(50, "Tên phải ít hơn 50 ký tự")
    .trim(),
  email: yup
    .string()
    .required("Email là bắt buộc")
    .email("Vui lòng nhập địa chỉ email hợp lệ")
    .trim()
    .lowercase(),
  password: yup
    .string()
    .required("Mật khẩu là bắt buộc")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  confirmPassword: yup
    .string()
    .required("Vui lòng xác nhận mật khẩu")
    .oneOf([yup.ref("password")], "Mật khẩu không khớp"),
  gender: yup
    .string()
    .required("Vui lòng chọn giới tính")
    .oneOf(["MALE", "FEMALE", "OTHER"], "Vui lòng chọn giới tính hợp lệ"),
  phone: yup
    .string()
    .matches(
      /^(03|05|07|08|09|01[2689])[0-9]{8}$/,
      "Định dạng số điện thoại không hợp lệ"
    ),
  birthDate: yup
    .date()
    .max(new Date(), "Ngày sinh không thể là ngày trong tương lai")
    .test("age", "Bạn phải ít nhất 13 tuổi", function (value) {
      if (!value) return true;
      const today = new Date();
      const birthDate = new Date(value);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        return age - 1 >= 13;
      }
      return age >= 13;
    }),
});

// Initial form values
const initialValues: FormValues = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  gender: "MALE",
  phone: "",
  birthDate: "",
};

const Register = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (values: FormValues, { setSubmitting }: any) => {
    try {
      await api.post("/auth/signup", {
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        gender: values.gender,
        phone: values.phone,
        birthDate: values.birthDate,
      });

      toast.success(
        `🎉 Đăng ký thành công! Vui lòng kiểm tra email (${values.email}) để xác thực tài khoản.`,
        {
          position: "top-right",
          autoClose: 1500,
          hideProgressBar: true,
          theme: "colored",
        }
      );

      navigate("/login");
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error("Đăng ký thất bại. Vui lòng thử lại.", {
        position: "top-center",
      });
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-6xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl dark:shadow-gray-900/50 overflow-hidden transition-colors duration-300">
        <div className="flex flex-col lg:flex-row-reverse min-h-[700px]">
          {/* Left side - Welcome section */}
          <div className="lg:flex-1 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-700 dark:via-purple-700 dark:to-pink-700 p-8 lg:p-12 flex flex-col justify-center text-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10 dark:opacity-5">
              <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white dark:bg-gray-200"></div>
              <div className="absolute bottom-20 right-10 w-24 h-24 rounded-full bg-white dark:bg-gray-200"></div>
              <div className="absolute top-1/2 left-1/3 w-16 h-16 rounded-full bg-white dark:bg-gray-200"></div>
            </div>

            <div className="relative z-10">
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                Buckety
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300 dark:from-yellow-200 dark:to-pink-200">
                  Social
                </span>
              </h1>
              <p className="text-lg lg:text-xl mb-8 opacity-90 dark:opacity-80 leading-relaxed">
                Tham gia cộng đồng tuyệt vời của chúng tôi và kết nối với những
                người có cùng sở thích. Bắt đầu hành trình của bạn ngay hôm nay!
              </p>

              <div className="flex items-center gap-3 mb-8">
                <span className="text-sm lg:text-base opacity-80 dark:opacity-70">
                  Đã có tài khoản?
                </span>
              </div>

              <Link to="/login">
                <button className="bg-white dark:bg-gray-100 text-indigo-600 dark:text-indigo-700 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 dark:hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 shadow-lg dark:shadow-gray-900/30">
                  Đăng Nhập
                </button>
              </Link>
            </div>
          </div>

          {/* Right side - Registration form */}
          <div className="lg:flex-1 p-8 lg:p-12 flex flex-col justify-center bg-white dark:bg-gray-800 transition-colors duration-300 overflow-y-auto">
            <div className="max-w-md mx-auto w-full">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2 transition-colors duration-300">
                Tạo Tài Khoản
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8 transition-colors duration-300">
                Điền thông tin của bạn để bắt đầu
              </p>

              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ errors, touched, isSubmitting }) => (
                  <Form className="space-y-6">
                    {/* Name inputs row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Họ
                        </label>
                        <Field name="firstName">
                          {({ field }: any) => (
                            <input
                              {...field}
                              type="text"
                              placeholder="Nhập họ của bạn"
                              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-300 bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
                                errors.firstName && touched.firstName
                                  ? "border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400"
                                  : "border-gray-300 dark:border-gray-600 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                              }`}
                            />
                          )}
                        </Field>
                        <ErrorMessage
                          name="firstName"
                          component="p"
                          className="text-sm text-red-600 dark:text-red-400 min-h-[1.25rem]"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Tên
                        </label>
                        <Field name="lastName">
                          {({ field }: any) => (
                            <input
                              {...field}
                              type="text"
                              placeholder="Nhập tên của bạn"
                              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-300 bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
                                errors.lastName && touched.lastName
                                  ? "border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400"
                                  : "border-gray-300 dark:border-gray-600 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                              }`}
                            />
                          )}
                        </Field>
                        <ErrorMessage
                          name="lastName"
                          component="p"
                          className="text-sm text-red-600 dark:text-red-400 min-h-[1.25rem]"
                        />
                      </div>
                    </div>

                    {/* Email input */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email
                      </label>
                      <Field name="email">
                        {({ field }: any) => (
                          <input
                            {...field}
                            type="email"
                            placeholder="Nhập địa chỉ email của bạn"
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-300 bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
                              errors.email && touched.email
                                ? "border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400"
                                : "border-gray-300 dark:border-gray-600 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                            }`}
                          />
                        )}
                      </Field>
                      <ErrorMessage
                        name="email"
                        component="p"
                        className="text-sm text-red-600 dark:text-red-400 min-h-[1.25rem]"
                      />
                    </div>

                    {/* Phone and Birth Date row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Số điện thoại
                        </label>
                        <Field name="phone">
                          {({ field }: any) => (
                            <input
                              {...field}
                              type="tel"
                              placeholder="Nhập số điện thoại"
                              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-300 bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
                                errors.phone && touched.phone
                                  ? "border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400"
                                  : "border-gray-300 dark:border-gray-600 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                              }`}
                            />
                          )}
                        </Field>
                        <ErrorMessage
                          name="phone"
                          component="p"
                          className="text-sm text-red-600 dark:text-red-400 min-h-[1.25rem]"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Ngày sinh
                        </label>
                        <Field name="birthDate">
                          {({ field }: any) => (
                            <input
                              {...field}
                              type="date"
                              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-300 bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
                                errors.birthDate && touched.birthDate
                                  ? "border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400"
                                  : "border-gray-300 dark:border-gray-600 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                              }`}
                            />
                          )}
                        </Field>
                        <ErrorMessage
                          name="birthDate"
                          component="p"
                          className="text-sm text-red-600 dark:text-red-400 min-h-[1.25rem]"
                        />
                      </div>
                    </div>

                    {/* Gender select */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Giới tính
                      </label>
                      <div className="relative">
                        <Field name="gender">
                          {({ field }: any) => (
                            <select
                              {...field}
                              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-300 bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 appearance-none cursor-pointer text-gray-900 dark:text-gray-100 ${
                                errors.gender && touched.gender
                                  ? "border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400"
                                  : "border-gray-300 dark:border-gray-600 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                              }`}
                            >
                              <option value="MALE">Nam</option>
                              <option value="FEMALE">Nữ</option>
                              <option value="OTHER">Khác</option>
                            </select>
                          )}
                        </Field>
                        <div className="absolute right-3 top-4 pointer-events-none">
                          <FaChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500 transition-colors duration-300" />
                        </div>
                      </div>
                      <ErrorMessage
                        name="gender"
                        component="p"
                        className="text-sm text-red-600 dark:text-red-400 min-h-[1.25rem]"
                      />
                    </div>

                    {/* Password input */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Mật khẩu
                      </label>
                      <div className="relative">
                        <Field name="password">
                          {({ field }: any) => (
                            <input
                              {...field}
                              type={showPassword ? "text" : "password"}
                              placeholder="Nhập mật khẩu"
                              className={`w-full px-4 pr-12 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-300 bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
                                errors.password && touched.password
                                  ? "border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400"
                                  : "border-gray-300 dark:border-gray-600 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                              }`}
                            />
                          )}
                        </Field>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300 z-10"
                        >
                          {showPassword ? (
                            <FaEyeSlash className="w-5 h-5" />
                          ) : (
                            <FaEye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      <ErrorMessage
                        name="password"
                        component="p"
                        className="text-sm text-red-600 dark:text-red-400 min-h-[1.25rem]"
                      />
                    </div>

                    {/* Confirm Password input */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Xác nhận mật khẩu
                      </label>
                      <div className="relative">
                        <Field name="confirmPassword">
                          {({ field }: any) => (
                            <input
                              {...field}
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Nhập lại mật khẩu"
                              className={`w-full px-4 pr-12 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-300 bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
                                errors.confirmPassword &&
                                touched.confirmPassword
                                  ? "border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400"
                                  : "border-gray-300 dark:border-gray-600 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                              }`}
                            />
                          )}
                        </Field>
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300 z-10"
                        >
                          {showConfirmPassword ? (
                            <FaEyeSlash className="w-5 h-5" />
                          ) : (
                            <FaEye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      <ErrorMessage
                        name="confirmPassword"
                        component="p"
                        className="text-sm text-red-600 dark:text-red-400 min-h-[1.25rem]"
                      />
                    </div>

                    {/* Submit button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg dark:shadow-gray-900/50"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center gap-2">
                          <ClipLoader size={20} color="#ffffff" />
                          <span>Đang tạo tài khoản...</span>
                        </div>
                      ) : (
                        "Tạo Tài Khoản"
                      )}
                    </button>
                  </Form>
                )}
              </Formik>

              {/* Mobile login link */}
              <div className="mt-8 text-center lg:hidden">
                <span className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                  Đã có tài khoản?{" "}
                </span>
                <Link
                  to="/login"
                  className="text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors duration-300"
                >
                  Đăng Nhập
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer
        theme="colored"
        toastClassName="dark:bg-gray-800 dark:text-gray-100"
      />
    </div>
  );
};

export default Register;
