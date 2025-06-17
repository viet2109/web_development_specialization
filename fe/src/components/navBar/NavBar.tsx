import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import LightModeIcon from "@mui/icons-material/LightMode";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { api } from "../../api/api";
import { useAppDispatch, useAppSelector } from "../../hook/hook";
import { logOutSuccess } from "../../redux/authSlice";
import { fetchMessages } from "../../redux/messageSlice";
import { RootState } from "../../redux/store";
import ChatBox from "../chatBox/ChatBox";
import routers from "../../configs/router";

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

interface NavbarProps {
  onMenuToggle?: () => void;
  showMenuButton?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({
  onMenuToggle,
  showMenuButton = false,
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [openCreateRoom, setOpenCreateRoom] = useState(false);
  const [openMessages, setOpenMessages] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [roomMemberId, setRoomMemberId] = useState("");
  const [roomType, setRoomType] = useState("private");
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedSender, setSelectedSender] = useState<Sender | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const { isLoading, error } = useAppSelector((state) => state.message);
  const fcmToken = useSelector((state: RootState) => state.auth.fcmToken);
  // Initialize dark mode from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);

    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();

    try {
      await api.delete(`/fcm-tokens/${fcmToken}`);
      navigate(routers.login);
      dispatch(logOutSuccess());
    } catch (err) {
      console.error("Logout failed with error:", err);
      return Promise.reject(err);
    }
  };

  const handleOpenCreateRoom = () => {
    setOpenCreateRoom(true);
    setMobileMenuAnchor(null);
  };

  const handleCloseCreateRoom = () => setOpenCreateRoom(false);

  const handleOpenMessages = () => {
    setOpenMessages(true);
    setMobileMenuAnchor(null);
    dispatch(
      fetchMessages({ page: 0, size: 10, sort: "createdAt,asc", paged: true })
    )
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

  const handleSelectConversation = (sender: Sender) => {
    setSelectedSender(sender);
    setOpenMessages(false);
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

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  return (
    <>
      <div className="flex items-center justify-between w-full">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Menu button for sidebar toggle (only show if provided) */}
          {showMenuButton && onMenuToggle && (
            <IconButton
              onClick={onMenuToggle}
              className="lg:hidden"
              sx={{ color: isDarkMode ? "#ffffff" : "#374151" }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Link to="/" className="no-underline">
            <span className="font-bold text-xl text-gray-900 dark:text-white">
              Buckety
            </span>
          </Link>

          {/* Desktop Navigation Icons */}
          <div className="hidden md:flex items-center gap-4">
            <HomeOutlinedIcon className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors" />
            <GridViewOutlinedIcon className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors" />
          </div>

          {/* Search Bar - Hide on mobile */}
          <div className="hidden lg:flex items-center gap-2.5 rounded-lg p-2 bg-gray-50 dark:bg-gray-800 ml-4">
            <SearchOutlinedIcon className="text-gray-500 dark:text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="border-none w-64 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none text-sm"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <IconButton
              onClick={toggleDarkMode}
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
              size="small"
            >
              {isDarkMode ? (
                <LightModeIcon className="text-yellow-500" />
              ) : (
                <DarkModeIcon className="text-gray-700 dark:text-gray-300" />
              )}
            </IconButton>

            <IconButton
              onClick={handleOpenCreateRoom}
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
              size="small"
            >
              <AddCircleOutlineIcon className="text-gray-700 dark:text-gray-300" />
            </IconButton>

            <IconButton
              onClick={handleOpenMessages}
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
              size="small"
            >
              <Badge badgeContent={0} color="error">
                <ChatOutlinedIcon className="text-gray-700 dark:text-gray-300" />
              </Badge>
            </IconButton>

            <IconButton
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
              size="small"
            >
              <Badge badgeContent={3} color="error">
                <NotificationsOutlinedIcon className="text-gray-700 dark:text-gray-300" />
              </Badge>
            </IconButton>

            <IconButton
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
              size="small"
            >
              <Badge badgeContent={2} color="primary">
                <EmailOutlinedIcon className="text-gray-700 dark:text-gray-300" />
              </Badge>
            </IconButton>
          </div>

          {/* User Avatar */}
          <IconButton
            onClick={handleUserMenuOpen}
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
            size="small"
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: isDarkMode ? "#4f46e5" : "#3b82f6",
                fontSize: "0.875rem",
              }}
            >
              U
            </Avatar>
          </IconButton>

          {/* Mobile Menu Button */}
          <IconButton
            onClick={handleMobileMenuOpen}
            className="md:hidden hover:bg-gray-100 dark:hover:bg-gray-800"
            size="small"
          >
            <MenuIcon className="text-gray-700 dark:text-gray-300" />
          </IconButton>
        </div>
      </div>

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          sx: {
            bgcolor: isDarkMode ? "#1f2937" : "#ffffff",
            color: isDarkMode ? "#ffffff" : "inherit",
            mt: 1,
            minWidth: 200,
          },
        }}
      >
        <MenuItem onClick={handleUserMenuClose}>
          <PersonOutlinedIcon className="mr-2" />
          Hồ sơ
        </MenuItem>
        <Divider sx={{ bgcolor: isDarkMode ? "#374151" : "inherit" }} />
        <MenuItem
          onClick={(e) => {
            handleLogout(e);
            handleUserMenuClose();
          }}
          sx={{ color: "#ef4444" }}
        >
          <LogoutIcon className="mr-2" />
          Đăng xuất
        </MenuItem>
      </Menu>

      {/* Mobile Menu */}
      <Menu
        anchorEl={mobileMenuAnchor}
        open={Boolean(mobileMenuAnchor)}
        onClose={handleMobileMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        className="md:hidden"
        PaperProps={{
          sx: {
            bgcolor: isDarkMode ? "#1f2937" : "#ffffff",
            color: isDarkMode ? "#ffffff" : "inherit",
            mt: 1,
            minWidth: 250,
          },
        }}
      >
        <MenuItem onClick={toggleDarkMode}>
          {isDarkMode ? (
            <LightModeIcon className="mr-2" />
          ) : (
            <DarkModeIcon className="mr-2" />
          )}
          {isDarkMode ? "Chế độ sáng" : "Chế độ tối"}
        </MenuItem>
        <Divider sx={{ bgcolor: isDarkMode ? "#374151" : "inherit" }} />
        <MenuItem onClick={handleOpenCreateRoom}>
          <AddCircleOutlineIcon className="mr-2" />
          Tạo phòng
        </MenuItem>
        <MenuItem onClick={handleOpenMessages}>
          <Badge badgeContent={0} color="error">
            <ChatOutlinedIcon className="mr-2" />
          </Badge>
          <span className="ml-2">Tin nhắn</span>
        </MenuItem>
        <MenuItem onClick={handleMobileMenuClose}>
          <Badge badgeContent={3} color="error">
            <NotificationsOutlinedIcon className="mr-2" />
          </Badge>
          <span className="ml-2">Thông báo</span>
        </MenuItem>
        <MenuItem onClick={handleMobileMenuClose}>
          <Badge badgeContent={2} color="primary">
            <EmailOutlinedIcon className="mr-2" />
          </Badge>
          <span className="ml-2">Email</span>
        </MenuItem>
      </Menu>

      {/* Create Room Modal */}
      <Modal open={openCreateRoom} onClose={handleCloseCreateRoom}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: 400 },
            maxWidth: 400,
            bgcolor: isDarkMode ? "#1f2937" : "background.paper",
            color: isDarkMode ? "#ffffff" : "inherit",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" component="h2" gutterBottom>
            Tạo phòng mới
          </Typography>
          <form onSubmit={handleCreateRoomSubmit}>
            <TextField
              fullWidth
              label="Tên phòng"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              margin="normal"
              required
              sx={{
                "& .MuiInputLabel-root": {
                  color: isDarkMode ? "#9ca3af" : "inherit",
                },
                "& .MuiOutlinedInput-root": {
                  color: isDarkMode ? "#ffffff" : "inherit",
                  "& fieldset": {
                    borderColor: isDarkMode ? "#4b5563" : "inherit",
                  },
                  "&:hover fieldset": {
                    borderColor: isDarkMode ? "#6b7280" : "inherit",
                  },
                },
              }}
            />
            <TextField
              fullWidth
              label="ID thành viên"
              value={roomMemberId}
              onChange={(e) => setRoomMemberId(e.target.value)}
              margin="normal"
              required
              sx={{
                "& .MuiInputLabel-root": {
                  color: isDarkMode ? "#9ca3af" : "inherit",
                },
                "& .MuiOutlinedInput-root": {
                  color: isDarkMode ? "#ffffff" : "inherit",
                  "& fieldset": {
                    borderColor: isDarkMode ? "#4b5563" : "inherit",
                  },
                  "&:hover fieldset": {
                    borderColor: isDarkMode ? "#6b7280" : "inherit",
                  },
                },
              }}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel sx={{ color: isDarkMode ? "#9ca3af" : "inherit" }}>
                Loại phòng
              </InputLabel>
              <Select
                value={roomType}
                label="Loại phòng"
                onChange={(e) => setRoomType(e.target.value as string)}
                sx={{
                  color: isDarkMode ? "#ffffff" : "inherit",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: isDarkMode ? "#4b5563" : "inherit",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: isDarkMode ? "#6b7280" : "inherit",
                  },
                  "& .MuiSvgIcon-root": {
                    color: isDarkMode ? "#9ca3af" : "inherit",
                  },
                }}
              >
                <MenuItem value="private">Riêng tư</MenuItem>
                <MenuItem value="group">Nhóm</MenuItem>
              </Select>
            </FormControl>
            <Box
              sx={{
                mt: 2,
                display: "flex",
                justifyContent: "flex-end",
                gap: 1,
              }}
            >
              <Button
                onClick={handleCloseCreateRoom}
                sx={{ color: isDarkMode ? "#9ca3af" : "inherit" }}
              >
                Hủy
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Tạo
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
          style: { backgroundColor: "rgba(0,0,0,0.5)" },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: 400 },
            maxWidth: 400,
            bgcolor: isDarkMode ? "#1f2937" : "background.paper",
            color: isDarkMode ? "#ffffff" : "inherit",
            boxShadow: 24,
            p: 3,
            borderRadius: 2,
            maxHeight: "70vh",
            overflowY: "auto",
          }}
        >
          <Typography variant="h6" component="h2" gutterBottom>
            Tin nhắn
          </Typography>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <ClipLoader size={30} color="#3b82f6" />
            </Box>
          ) : error ? (
            <Box sx={{ color: "#ef4444", textAlign: "center", py: 2 }}>
              <Typography>
                {typeof error === "string" ? error : "Đã xảy ra lỗi"}
              </Typography>
              <Button
                onClick={() => setMessages([])}
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
              >
                Đóng
              </Button>
            </Box>
          ) : messages.length === 0 ? (
            <Typography
              sx={{
                textAlign: "center",
                py: 4,
                color: isDarkMode ? "#9ca3af" : "#6b7280",
              }}
            >
              Không có tin nhắn nào.
            </Typography>
          ) : (
            <List sx={{ p: 0 }}>
              {messages.map((message) => (
                <ListItem
                  key={message.id}
                  onClick={() => handleSelectConversation(message.sender)}
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    "&:hover": {
                      cursor: "pointer",
                      backgroundColor: isDarkMode ? "#374151" : "#f8fafc",
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      message.sender?.firstName
                        ? `${message.sender.firstName} ${
                            message.sender.lastName || ""
                          }`
                        : "Người gửi không xác định"
                    }
                    secondary={message.content || "Không có nội dung"}
                    sx={{
                      "& .MuiListItemText-primary": {
                        color: isDarkMode ? "#ffffff" : "inherit",
                        fontWeight: 500,
                      },
                      "& .MuiListItemText-secondary": {
                        color: isDarkMode ? "#9ca3af" : "#6b7280",
                      },
                    }}
                  />
                </ListItem>
              ))}
            </List>
          )}
          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button
              onClick={handleCloseMessages}
              variant="contained"
              color="primary"
            >
              Đóng
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Render ChatBox when a sender is selected */}
      {selectedSender && (
        <ChatBox
          username={`${selectedSender.firstName} ${
            selectedSender.lastName || ""
          }`}
          senderId={selectedSender.id}
          roomId={selectedSender.id}
          onClose={handleCloseChatBox}
        />
      )}
    </>
  );
};

export default Navbar;
