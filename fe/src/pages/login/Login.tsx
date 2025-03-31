import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./login.css";
import { useDispatch } from "react-redux";
import { login } from "../../api/api";
import { loginSuccess } from "../../redux/authSlice";
import ClipLoader from "react-spinners/ClipLoader";
import { toast } from "react-toastify";

const Login = () => {

  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    setLoading(true);
    try {
      const data = await login(email, password);
      
      dispatch(loginSuccess({ token: data.accessToken, user: data.user }));
      
      navigate("/"); 
    } catch (error) {
      console.error("Login failed:", error);
      toast.error('❌ Invalid your email or password. Please check your-email', {
              position: 'top-center',
            })
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="card">
        <div className="left">
          <h1>Buckety Login.</h1>
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
          <form  onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
           <button type="submit" disabled={loading}>
        {loading ? (
          <>
            <ClipLoader size={16} color="#000" /> 
          </>
        ) : (
          'Login'
        )}
      </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;


