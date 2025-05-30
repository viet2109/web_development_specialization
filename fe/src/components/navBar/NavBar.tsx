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
import { useAppDispatch, useAppSelector } from "../../hook/hook";
import { logOutSuccess } from "../../redux/authSlice";
import { fetchMessages } from "../../redux/messageSlice";
import { Modal, Box, TextField, Button, Typography, List, ListItem, ListItemText, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { ClipLoader } from "react-spinners";
import ChatBox from "../chatBox/ChatBox";

// Define Sender interface
interface Sender {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
  lastActive: string;
  activeStatus: string;
  gender: string;
  phone: string;
  birthDate: string;
  bio: string;
  avatar: string;
}

interface Message {
  id: number;
  sender: Sender;
  content: string;
}

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [openCreateRoom, setOpenCreateRoom] = useState(false);
  const [openMessages, setOpenMessages] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [roomMemberId, setRoomMemberId] = useState("");
  const [roomType, setRoomType] = useState("private");
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedSender, setSelectedSender] = useState<Sender | null>(null); // Track selected conversation
  const { isLoading, error } = useAppSelector((state) => state.message);

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

  const handleOpenMessages = () => {
    setOpenMessages(true);
    dispatch(fetchMessages({ page: 0, size: 10, sort: "createdAt,asc", paged: true }))
      .unwrap()
      .then((data) => {
        console.log("Fetched messages:", data);
        setMessages(data);
      })
      .catch((err) => console.error("Error fetching messages:", err));
  };

  const handleCloseMessages = () => {
    setOpenMessages(false);
    setMessages([]);
  };

  // Handle clicking a message to open ChatBox
  const handleSelectConversation = (sender: Sender) => {
    setSelectedSender(sender);
    setOpenMessages(false); // Close Messages Modal
  };

  const handleCloseChatBox = () => {
    setSelectedSender(null);
  };

  const handleCreateRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Creating room:", { roomName, roomMemberId, roomType });
    setRoomName("");
    setRoomMemberId("");
    setRoomType("private");
    handleCloseCreateRoom();
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
              label="Member ID"
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
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <ClipLoader size={20} color="#3b82f6" />
            </Box>
          ) : error ? (
            <Box sx={{ color: "#ef4444", textAlign: "center", py: 2 }}>
              <Typography>{typeof error === "string" ? error : "An error occurred"}</Typography>
              <Button
                onClick={() => setMessages([])}
                variant="contained"
                color="primary"
                sx={{ mt: 1 }}
              >
                Dismiss
              </Button>
            </Box>
          ) : messages.length === 0 ? (
            <Typography>No messages available.</Typography>
          ) : (
            <List>
              {messages.map((message) => (
                <ListItem
                  key={message.id}
                  onClick={() => handleSelectConversation(message.sender)} // Open ChatBox
                  sx={{ "&:hover": { cursor: "pointer", backgroundColor: "#f5f5f5" } }}
                >
                  <ListItemText
                    primary={
                      message.sender?.firstName
                        ? `${message.sender.firstName} ${message.sender.lastName || ""}`
                        : "Unknown Sender"
                    }
                    secondary={message.content || "No content"}
                  />
                </ListItem>
              ))}
            </List>
          )}
          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={handleCloseMessages} variant="contained" color="primary">
              Close
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Render ChatBox when a sender is selected */}
      {selectedSender && (
        <ChatBox
    username={`${selectedSender.firstName} ${selectedSender.lastName || ""}`}
    senderId={selectedSender.id} // Pass senderId for fetching messages
    roomId={selectedSender.id} // Use senderId as roomId for this example
    onClose={handleCloseChatBox}
  />
      )}
    </div>
  );
};

export default Navbar;