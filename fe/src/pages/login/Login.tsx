import { FormEvent, useState } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../redux/authSlice";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader";
import "./Login.css";
import { api } from "../../api/api";


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
      console.log('📦 Login request:', { email, password });
      const response = await api.post('/auth/login', { email, password });
      console.log('🖥️ Response received:', response.data);

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      const { accessToken, user } = response.data;
      if (!accessToken || !user) {
        throw new Error('Missing accessToken or user in response');
      }

      localStorage.setItem('token', accessToken);
      console.log('Token stored:', localStorage.getItem('token'));

      dispatch(loginSuccess({ user, token: accessToken }));
      navigate('/home');

      toast.success('🎉 Login successful!', {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: false,
      });
    } catch (error: any) {
      console.error('Login failed:', error.message, error.response?.data);
      toast.error('❌ Invalid email or password. Please try again.', {
        position: 'top-center',
      });
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="login">
      <div className="card">
        <div className="left">
          <h1>Buckety Login</h1>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Libero cum,
            alias totam numquam ipsa exercitationem dignissimos, error nam,
            consequatur.
          </p>
          <span>Don't have an account?</span>
          <Link to="/register">
            <button>Register</button>
          </Link>
        </div>
        <div className="right">
          <h1>Login</h1>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? (
                <ClipLoader size={16} color="#000" />
              ) : (
                "Login"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;


