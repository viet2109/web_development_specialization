import { useState } from "react";
import {
  FaChevronDown,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaUser,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { ToastContainer, toast } from "react-toastify";
import { api } from "../../api/api";

type Gender = "MALE" | "FEMALE" | "OTHER";

const Register = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [firstName, setfirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [gender, setGender] = useState<Gender>("MALE");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/auth/signup", {
        email,
        password,
        firstName,
        lastName,
        gender,
      });

      toast.success(
        `🎉 Registration successful! Please check your email (${email}) to verify your account.`,
        {
          position: "top-center",
          autoClose: 5000,
          theme: "colored",
        }
      );

      navigate("/login");
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error("❌ Registration failed. Please try again.", {
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row-reverse min-h-[600px]">
          {/* Left side - Welcome section */}
          <div className="lg:flex-1 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 lg:p-12 flex flex-col justify-center text-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white"></div>
              <div className="absolute bottom-20 right-10 w-24 h-24 rounded-full bg-white"></div>
              <div className="absolute top-1/2 left-1/3 w-16 h-16 rounded-full bg-white"></div>
            </div>

            <div className="relative z-10">
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                Buckety
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
                  Social
                </span>
              </h1>
              <p className="text-lg lg:text-xl mb-8 opacity-90 leading-relaxed">
                Join our amazing community and connect with people who share
                your interests. Start your journey today!
              </p>

              <div className="flex items-center gap-3 mb-8">
                <span className="text-sm lg:text-base opacity-80">
                  Already have an account?
                </span>
              </div>

              <Link to="/login">
                <button className="bg-white text-indigo-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg">
                  Sign In
                </button>
              </Link>
            </div>
          </div>

          {/* Right side - Registration form */}
          <div className="lg:flex-1 p-8 lg:p-12 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                Create Account
              </h2>
              <p className="text-gray-600 mb-8">
                Fill in your details to get started
              </p>

              <form onSubmit={handleRegister} className="space-y-6">
                {/* Name inputs row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setfirstName(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white"
                    />
                  </div>

                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Email input */}
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white"
                  />
                </div>

                {/* Password input */}
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-12 pr-12 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="w-5 h-5" />
                    ) : (
                      <FaEye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Gender select */}
                <div className="relative">
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as Gender)}
                    required
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white appearance-none cursor-pointer"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <FaChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <ClipLoader size={20} color="#ffffff" />
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>

              {/* Mobile login link */}
              <div className="mt-8 text-center lg:hidden">
                <span className="text-gray-600">Already have an account? </span>
                <Link
                  to="/login"
                  className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default Register;
