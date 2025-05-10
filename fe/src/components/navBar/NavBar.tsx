import React, { useContext } from "react";
import "../navBar/NavBar.css"
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";

import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import { Link, useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { logOutSuccess } from "../../redux/authSlice";


const Navbar: React.FC = () => {
 
  const navigate = useNavigate();
  const  dispatch = useDispatch();

  const handleClick = async (e: React.MouseEvent<SVGSVGElement>) => {
    e.preventDefault();

    try {
     
      localStorage.removeItem("token");
      
      navigate("/login");
      dispatch(logOutSuccess());


      
    } catch (err) {
      console.error("Logout failed with error:", err);
    }
  };

  return (
    <div className="navbar">
      <div className="left">
        <Link to="/" style={{ textDecoration: "none" }}>
          <span>Buckety</span>
        </Link>
        <HomeOutlinedIcon />
       
        <GridViewOutlinedIcon />
        <div className="search">
          <SearchOutlinedIcon />
          <input type="text" placeholder="Search..." />
        </div>
      </div>
      <div className="right">
        <PersonOutlinedIcon />
        <EmailOutlinedIcon />
        <NotificationsOutlinedIcon />
        <div className="user">
         
        </div>
        <LogoutIcon onClick={handleClick} />
      </div>
    </div>
  );
};

export default Navbar;