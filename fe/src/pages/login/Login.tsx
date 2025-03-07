import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./login.css";

const Login = () => {
  

  

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
          <form >
            <input
              type="text"
              placeholder="Username"
              name="username"
          
              required
            />
            <input
              type="password"
              placeholder="Password"
              name="password"
            
              required
            />
          
            <button type="submit">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
