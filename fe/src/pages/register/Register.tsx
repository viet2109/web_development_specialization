
import { Link, useNavigate } from "react-router-dom";

import "../register/Register.css"
import { useState } from "react";
import { register } from "../../api/api";
import { ToastContainer, toast } from "react-toastify";
import { ClipLoader } from 'react-spinners';

type Gender = "MALE" | "FEMALE" | "OTHER";
const Register = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [firstName, setfirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [gender, setGender] = useState<Gender>("MALE");
  
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register(email, password, firstName, lastName, gender);
      toast.success(
        `🎉 Registration successful! Please check your email (${email}) to verify your account.`,
        {
          position: 'top-center',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: 'colored',
        }
      );
      navigate("/login");
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error('❌ Registration failed. Please try again.', {
        position: 'top-center',
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="register">
      <div className="card">
        <div className="left">
          <h1>Buckety Social.</h1>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Libero cum,
            alias totam numquam ipsa exercitationem dignissimos, error nam,
            consequatur.
          </p>
          <span>Do you have an account?</span>
          <Link to="/login">
            <button>Login</button>
          </Link>
        </div>
        <div className="right">
          <h1>Register</h1>
          <form onSubmit={handleRegister}>
           
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
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
           
            />
            <input
              type="text"
              placeholder="firstName"
              value={firstName}
              name="firstName"
              onChange={(e) => setfirstName(e.target.value)}
              required
              
            />
             <input
              type="text"
              placeholder="lastName"
              value={lastName}
              name="lastName"
              onChange={(e) => setLastName(e.target.value)}
              required
              
            />
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender)}
              required
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
            
            <button type="submit" disabled={loading}>
        {loading ? (
          <>
            <ClipLoader size={16} color="#000" /> 
          </>
        ) : (
          'Register'
        )}
      </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
