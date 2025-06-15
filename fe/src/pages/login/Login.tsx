import { FormEvent, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader";
import { toast } from "react-toastify";
import { api } from "../../api/api";
import { loginSuccess } from "../../redux/authSlice";
import routers from "../../configs/router";

const Login = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log("📦 Login request:", { email, password });
      const response = await api.post("/auth/login", { email, password });
      console.log("🖥️ Response received:", response.data);

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      const { accessToken, user } = response.data;
      if (!accessToken || !user) {
        throw new Error("Missing accessToken or user in response");
      }

      dispatch(loginSuccess({ user, token: accessToken }));
      navigate(routers.home);
      toast.success("🎉 Login successful!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
      });
    } catch (error: any) {
      console.error("Login failed:", error.message, error.response?.data);
      toast.error("❌ Invalid email or password. Please try again.", {
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-[600px]">
          {/* Left Side - Welcome Section */}
          <div className="flex-1 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 p-8 lg:p-12 flex flex-col justify-center text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-20 -translate-y-20"></div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full translate-x-16 translate-y-16"></div>
              <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white rounded-full -translate-x-12 -translate-y-12"></div>
            </div>

            <div className="relative z-10">
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                Welcome to
                <span className="block text-yellow-300">Buckety</span>
              </h1>
              <p className="text-lg lg:text-xl mb-8 text-blue-100 leading-relaxed">
                Your trusted platform for seamless digital experiences. Join
                thousands of users who trust us daily.
              </p>
              <div className="space-y-4">
                <p className="text-blue-200">Don't have an account yet?</p>
                <Link to="/register">
                  <button className="bg-white text-indigo-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg">
                    Create Account
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center">
            <div className="w-full max-w-md mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Sign In
                </h2>
                <p className="text-gray-600">
                  Enter your credentials to access your account
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 bg-gray-50 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-gray-600">Remember me</span>
                  </label>
                  <a
                    href="#"
                    className="text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Forgot password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <ClipLoader size={16} color="#ffffff" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-gray-600">
                  By signing in, you agree to our{" "}
                  <a
                    href="#"
                    className="text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Privacy Policy
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
