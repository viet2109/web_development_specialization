import React, { useEffect, useState } from "react";
import "../navBar/NavBar.css";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import LogoutIcon from "@mui/icons-material/Logout";

import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../hook/hook";
import { logOutSuccess } from "../../redux/authSlice";
import { Modal, Box } from "@mui/material";
import MessengerUI from "../message/Messages";
import { Contact } from "../../types";
import ChatBox from "../message/Message";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { webSocketService } from "../../api/socket";


const Navbar: React.FC = () => {



  
  const navigate = useNavigate();
  const dispatch = useAppDispatch();


  const [openMessenger, setOpenMessenger] = useState(false); 
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const currentUser = useSelector((state: RootState) => state.auth.user);



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

  
  const handleOpenMessenger = () => setOpenMessenger(true);
  const handleCloseMessenger = () => setOpenMessenger(false);
  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
    setOpenMessenger(false);
  };
   useEffect(() => {
    if (currentUser?.id) {
      webSocketService.connect(currentUser.id);
    }

    return () => {
      webSocketService.disconnect();
    };
  }, [currentUser?.id]);
 


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
        
        <ChatOutlinedIcon
          onClick={handleOpenMessenger}
                      sx={{
              cursor: "pointer",
              color: openMessenger ? "#1976d2" : undefined,
            }}
        />
        <PersonOutlinedIcon sx={{ "&:hover": { cursor: "pointer" } }} />
        <EmailOutlinedIcon sx={{ "&:hover": { cursor: "pointer" } }} />
        <NotificationsOutlinedIcon sx={{ "&:hover": { cursor: "pointer" } }} />
        <div className="user"></div>
        <LogoutIcon onClick={handleClick} sx={{ "&:hover": { cursor: "pointer" } }} />
      </div>

      {/* MessengerUI bên trong Modal */}
<Modal
  open={openMessenger}
  onClose={() => setOpenMessenger(false)}
  BackdropProps={{ invisible: true }}
>
  <Box
    sx={{
      position: "fixed",
      top: 50,
      right: 0,
      width: 360,
      height: "calc(100vh - 60px)",
      bgcolor: "background.paper",
    }}
  >
    <MessengerUI onSelectContact={handleSelectContact} />
  </Box>
</Modal>

{selectedContact && (
  <Box
    sx={{
      position: "fixed",
      bottom: 0,
      right: 120,
      width: 380,
      height: 500,
      bgcolor: "background.paper",
      borderRadius: 2,
      boxShadow: 5,
      zIndex: 1500,
      overflow: "hidden",
    }}
  >
    <ChatBox contact={selectedContact} onClose={() => setSelectedContact(null)} />
  </Box>
)}

    </div>
  );
};

export default Navbar;