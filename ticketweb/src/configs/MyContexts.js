// src/configs/MyContexts.js
import { createContext, useReducer, useEffect } from "react";
import MyUserReducer from "../reducers/MyUserReducer";
import { authApis, endpoints } from "./Apis";

export const MyUserContext = createContext();
export const MyDispatchContext = createContext();

export const MyUserProvider = ({ children }) => {
  // Lấy user từ localStorage nếu có
  const savedUser = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  const [user, dispatch] = useReducer(MyUserReducer, savedUser);

  useEffect(() => {
    const loadUserFromToken = async () => {
      const accessToken = localStorage.getItem("access_token");
      if (accessToken) {
        try {
          // 2. Gọi API để xác thực token và lấy profile mới nhất
          const res = await authApis().get(endpoints.profile);
          // 3. Dispatch action để cập nhật user state
          dispatch({ type: "login", payload: res.data });
        } catch (error) {
          console.error("Token is invalid or expired. Logging out...", error);
          // 4. Nếu token hết hạn, đăng xuất người dùng
          dispatch({ type: "logout" });
        }
      }
    };

    // Chạy hàm này khi component được mount lần đầu
    loadUserFromToken();
  }, [dispatch]); // Chỉ chạy lại khi dispatch thay đổi

  return (
    <MyUserContext.Provider value={user}>
      <MyDispatchContext.Provider value={dispatch}>
        {children}
      </MyDispatchContext.Provider>
    </MyUserContext.Provider>
  );
};
