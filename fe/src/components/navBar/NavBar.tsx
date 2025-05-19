import React, { useState } from "react";
import "../navBar/NavBar.css";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logOutSuccess } from "../../redux/authSlice";
import { Modal, Box, TextField, Button, Typography, List, ListItem, ListItemText, Select, MenuItem, FormControl, InputLabel } from "@mui/material";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [openCreateRoom, setOpenCreateRoom] = useState(false);
  const [openMessages, setOpenMessages] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [roomMemberId, setRoomMemberId] = useState("");
  const [roomType, setRoomType] = useState("private"); 

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

  const handleOpenCreateRoom = () => setOpenCreateRoom(true);
  const handleCloseCreateRoom = () => setOpenCreateRoom(false);
  const handleOpenMessages = () => setOpenMessages(true);
  const handleCloseMessages = () => setOpenMessages(false);

  const handleCreateRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Creating room:", { roomName, roomMemberId, roomType });
    setRoomName("");
    setRoomMemberId("");
    setRoomType("private"); // Reset to default
    handleCloseCreateRoom();
  };

  const messages = [
    { id: 1, sender: "User1", content: "Hello!" },
    { id: 2, sender: "User2", content: "Hi there!" },
  ];

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
        <AddCircleOutlineIcon
          onClick={handleOpenCreateRoom}
          sx={{ "&:hover": { cursor: "pointer" } }}
        />
        <ChatOutlinedIcon
          onClick={handleOpenMessages}
          sx={{ "&:hover": { cursor: "pointer" } }}
        />
        <PersonOutlinedIcon sx={{ "&:hover": { cursor: "pointer" } }} />
        <EmailOutlinedIcon sx={{ "&:hover": { cursor: "pointer" } }} />
        <NotificationsOutlinedIcon sx={{ "&:hover": { cursor: "pointer" } }} />
        <div className="user"></div>
        <LogoutIcon onClick={handleClick} sx={{ "&:hover": { cursor: "pointer" } }} />
      </div>

      {/* Create Room Modal */}
      <Modal open={openCreateRoom} onClose={handleCloseCreateRoom}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" component="h2" gutterBottom>
            Create New Room
          </Typography>
          <form onSubmit={handleCreateRoomSubmit}>
            <TextField
              fullWidth
              label="Room Name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="MemberId"
              value={roomMemberId}
              onChange={(e) => setRoomMemberId(e.target.value)}
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Room Type</InputLabel>
              <Select
                value={roomType}
                label="Room Type"
                onChange={(e) => setRoomType(e.target.value as string)}
              >
                <MenuItem value="private">Private</MenuItem>
                <MenuItem value="group">Group</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
              <Button onClick={handleCloseCreateRoom} sx={{ mr: 1 }}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Create
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>

      {/* Messages Modal */}
      <Modal
        open={openMessages}
        onClose={handleCloseMessages}
        BackdropProps={{
          style: { backgroundColor: "transparent" },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "19%",
            left: "89%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 14,
            p: 4,
            borderRadius: 2,
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          <Typography variant="h6" component="h2" gutterBottom>
            Messages
          </Typography>
          <List>
            {messages.length > 0 ? (
              messages.map((message) => (
                <ListItem key={message.id}>
                  <ListItemText primary={message.sender} secondary={message.content} />
                </ListItem>
              ))
            ) : (
              <Typography>No messages available.</Typography>
            )}
          </List>
          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={handleCloseMessages} variant="contained" color="primary">
              Close
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default Navbar;