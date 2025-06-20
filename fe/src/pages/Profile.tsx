import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MessageCircle,
  UserPlus,
  Clock,
  Edit3,
  Save,
  X,
  MapPin,
  Heart,
  Star,
  Award,
  Camera,
  Settings,
  AlertCircle,
  UserCheck
} from "lucide-react";
import Input from "@mui/material/Input/Input";
import Button from "@mui/material/Button/Button";
import { getMyProfile, getUserProfileById, updateUser, updateUserAvatar, uploadFile } from "../api/user";
import { UpdateUserRequest, UserProfileResponse } from "../types";
import dayjs from "dayjs";
import { sendFriendRequest } from "../api/friendsRequest";

const Profile: React.FC = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [formData, setFormData] = useState<UpdateUserRequest | null>(null);
  const [errors, setErrors] = useState<Partial<UpdateUserRequest>>({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
 useEffect(() => {
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = userId
        ? await getUserProfileById(Number(userId))
        : await getMyProfile();

      

      const hasMissingFields =
        !data.firstName || !data.lastName || !data.phone || !data.birthDate;

      setProfile(data);
      setFormData({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        phone: data.phone || "",
        birthDate: data.birthDate || "",
      });

      if (data.isMe && hasMissingFields) {
        setEditing(true);
        alert("Một số thông tin hồ sơ của bạn chưa đầy đủ. Vui lòng cập nhật.");
      }
    } catch (error) {
      console.error("❌ Không thể tải profile:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchProfile();
}, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev!,
      [e.target.name]: e.target.value,
    }));
  };

  const validateFormData = (): boolean => {
    if (!formData) return false;
    const newErrors: Partial<UpdateUserRequest> = {};

    if (!formData.firstName?.trim()) newErrors.firstName = "Họ không được để trống";
    if (!formData.lastName?.trim()) newErrors.lastName = "Tên không được để trống";
    if (!formData.phone?.trim()) newErrors.phone = "Số điện thoại không được để trống";
    if (!formData.birthDate?.trim()) newErrors.birthDate = "Ngày sinh không được để trống";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleAddFriend = async () => {
    if (!userId) {
      alert("Không xác định được người dùng.");
      return;
    }
    try {
      await sendFriendRequest(Number(userId)); // đảm bảo truyền vào số
      alert("Đã gửi lời mời kết bạn!");
    } catch (error) {
      console.error("Lỗi khi gửi lời mời kết bạn:", error);
      alert("Không thể gửi lời mời kết bạn.");
    }
  };
  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarFile(file); // lưu file để sau upload
    setAvatarPreview(URL.createObjectURL(file)); // hiển thị preview ngay
  };
  const handleSaveAvatar = async () => {
    if (!avatarFile) return;
    try {
      const { id } = await uploadFile(avatarFile);
      await updateUserAvatar(id);
      setProfile((prev) =>
        prev ? { ...prev, avatar: avatarPreview! } : prev
      );
      setAvatarFile(null);       // clear sau khi lưu
      setAvatarPreview(null);    // clear preview
      alert("Cập nhật ảnh đại diện thành công!");
    } catch (error) {
      alert("Không thể cập nhật ảnh đại diện.");
      console.error(error);
    }
  };


  const handleUpdate = async () => {
    if (!formData) return;
    if (!validateFormData()) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      await updateUser(formData);
      setProfile((prev) => ({
        ...prev!,
        ...formData,
      }) as UserProfileResponse);
      setEditing(false);
      alert("Cập nhật thành công!");
    } catch (error) {
      alert("Cập nhật thất bại.");
    }
  };

  if (loading) return <div className="p-4 text-center">Đang tải dữ liệu...</div>;
  if (!profile) return <div className="p-4 text-center">Không tìm thấy hồ sơ.</div>;

  const renderMissing = (text: string) => (
    <span className="text-red-500 flex items-center gap-1">
      <AlertCircle size={16} /> {text}
    </span>
  );

  const formatDate = (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm");

  return (
    <div className="max-w-7xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 h-3/4">
      {/* Cover Image Section */}
      <div className="relative h-80 bg-gradient-to-r from-blue-400 via-blue-300 to-indigo-400 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-48 translate-x-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32"></div>

      </div>

      {/* Profile Header */}
      <div className="relative -mt-32 px-8">
        <div className="flex items-end gap-8 mb-8">
          <div className="relative group">
            <img
              src={
                avatarPreview ||
                profile.avatar ||
                `https://ui-avatars.com/api/?name=${profile.firstName}+${profile.lastName}&background=ffffff&color=3b82f6&size=200&bold=true`
              }
              alt="avatar"
              className="w-48 h-48 rounded-3xl object-cover border-8 border-white shadow-2xl"
            />

            {profile.isMe && (
              <>
                <div className="absolute bottom-0 right-0">
                  <label htmlFor="avatar-upload" className="cursor-pointer">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl border-4 border-white flex items-center justify-center shadow-lg hover:bg-blue-700 transition">
                      <Camera className="w-5 h-5" />
                    </div>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarSelect}
                  />
                </div>

                {avatarFile && (
                  <button
                    onClick={async () => {
                      try {
                        const { id } = await uploadFile(avatarFile);
                        await updateUserAvatar(id);
                        setProfile((prev) =>
                          prev ? { ...prev, avatar: avatarPreview! } : prev
                        );
                        setAvatarFile(null); // reset lại sau khi upload
                        alert("Cập nhật ảnh đại diện thành công!");
                      } catch (error) {
                        alert("Không thể tải ảnh lên.");
                        console.error(error);
                      }
                    }}
                    className="absolute bottom-0 left-0 bg-green-600 text-white px-4 py-2 rounded-xl text-sm shadow-lg hover:bg-green-700 transition"
                  >
                    Lưu ảnh
                  </button>
                )}
              </>
            )}
          </div>



          <div className="flex-1 pb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-4xl font-bold text-gray-800">
                  {profile.firstName || "Không có tên"} {profile.lastName || ""}
                </h1>
                {!editing && profile.isMe && (
                  <button
                    onClick={() => setEditing(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    <Edit3 className="w-5 h-5" />
                    Chỉnh sửa hồ sơ
                  </button>
                )}

             {!editing && !profile.isMe && (
  <>
    {profile.isfriend ? (
      <span className="bg-blue-500 text-white px-6 py-3 rounded-xl font-medium shadow flex items-center gap-2">
        <UserCheck className="w-5 h-5 text-white" />
        Bạn bè
      </span>
    ) : profile.isfriendSended ? (
      <span className="bg-yellow-100 text-yellow-700 px-6 py-3 rounded-xl font-medium shadow flex items-center gap-2">
        <Clock className="w-5 h-5 text-yellow-600" />
        Đã gửi lời mời
      </span>
    ) : (
      <button
        onClick={handleAddFriend}
        className="cursor-pointer bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
      >
        <UserPlus className="w-5 h-5" />
        Thêm bạn bè
      </button>
    )}
  </>
)}




              </div>

              <p className="text-gray-600 mb-6 flex items-center gap-2 text-lg">
                <Mail className="w-5 h-5 text-blue-600" />
                {profile.email}
              </p>

              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-2xl">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mx-auto mb-3">
                    <MessageCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{profile.postCount}</p>
                  <p className="text-sm text-gray-600">Bài viết</p>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-2xl">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mx-auto mb-3">
                    <UserPlus className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{profile.friendsCount}</p>
                  <p className="text-sm text-gray-600">Bạn bè</p>
                </div>


              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-3 gap-8 pb-12">
          {/* Left Column - Personal Info */}
          <div className="col-span-2 space-y-6">
            {editing ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <Edit3 className="w-6 h-6 text-blue-600" />
                  Chỉnh sửa thông tin
                </h2>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Họ</label>
                    <input
                      name="firstName"
                      value={formData?.firstName || ""}
                      onChange={handleChange}
                      placeholder="Nhập họ"
                      className="w-full px-4 py-4 border-2 border-blue-100 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-white/70 text-lg"
                    />
                    {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Tên</label>
                    <input
                      name="lastName"
                      value={formData?.lastName || ""}
                      onChange={handleChange}
                      placeholder="Nhập tên"
                      className="w-full px-4 py-4 border-2 border-blue-100 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-white/70 text-lg"
                    />
                    {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Số điện thoại</label>
                    <input
                      name="phone"
                      value={formData?.phone || ""}
                      onChange={handleChange}
                      placeholder="Nhập số điện thoại"
                      className="w-full px-4 py-4 border-2 border-blue-100 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-white/70 text-lg"
                    />
                    {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Ngày sinh</label>
                    <input
                      name="birthDate"
                      type="date"
                      value={formData?.birthDate || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-4 border-2 border-blue-100 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-white/70 text-lg"
                    />
                    {errors.birthDate && <p className="text-sm text-red-500">{errors.birthDate}</p>}
                  </div>
                </div>

                <div className="flex gap-4 pt-8">
                  <button
                    onClick={handleUpdate}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 text-lg"
                  >
                    <Save className="w-6 h-6" />
                    Lưu thay đổi
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 text-lg"
                  >
                    <X className="w-6 h-6" />
                    Hủy bỏ
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <User className="w-6 h-6 text-blue-600" />
                  Thông tin cá nhân
                </h2>

                <div className="grid grid-cols-3 gap-6">
                  <div className="flex items-center gap-4 p-5 bg-blue-50 rounded-2xl">
                    <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
                      <Phone className="w-7 h-7 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Điện thoại</p>
                      <p className="font-semibold text-gray-800 text-lg">
                        {profile.phone || renderMissing("Chưa cập nhật")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-5 bg-purple-50 rounded-2xl">
                    <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center">
                      <Calendar className="w-7 h-7 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Ngày sinh</p>
                      <p className="font-semibold text-gray-800 text-lg">
                        {profile.birthDate || renderMissing("Chưa cập nhật")}
                      </p>
                    </div>
                  </div>

                  <div className=" flex items-center gap-4 p-5 bg-pink-50 rounded-2xl">
                    <div className="w-14 h-14 bg-pink-100 rounded-2xl flex items-center justify-center">
                      <Heart className="w-7 h-7 text-pink-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Giới tính</p>
                      <p className="font-semibold text-gray-800 text-lg">
                        {profile.gender || renderMissing("Không xác định")}
                      </p>
                    </div>
                  </div>


                </div>
              </div>
            )}
          </div>

          {/* Right Column - System Info */}
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <Clock className="w-6 h-6 text-blue-600" />
                Thông tin hệ thống
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Tham gia từ
                  </span>
                  <span className="font-semibold text-gray-800">{formatDate(profile.createdAt)}</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Cập nhật lần cuối
                  </span>
                  <span className="font-semibold text-gray-800">{formatDate(profile.updatedAt)}</span>
                </div>
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
