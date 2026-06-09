import axiosClient from "../api/axiosClient";

export const login = async (data) => {
  return axiosClient.post("/api/accounts/api/auth/login", {
    username: data.username,
    password: data.password
  });
};

export const register = async (data) => {
  const parts = data.fullName.trim().split(" ");
  const firstName = parts[0] || "Phụ";
  const lastName = parts.slice(1).join(" ") || "Huynh";

  return axiosClient.post("/api/accounts/registration", {
    userName: data.username,
    userPassword: data.password,
    userDetails: {
      firstName: firstName,
      lastName: lastName,
      email: data.email
    }
  });
};

export const logout = () => {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("role");
  sessionStorage.removeItem("userId");
  sessionStorage.removeItem("email");
};

export const getUserProfile = async (userId) => {
  return axiosClient.get(`/api/accounts/users/${userId}`);
};
