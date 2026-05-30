// src/reducers/MyUserReducer.js

const MyUserReducer = (state, action) => {

  switch (action.type) {
    case "login":
      // Lưu user info vào localStorage
      localStorage.setItem("user", JSON.stringify(action.payload));
      return action.payload;

    case "logout":
      localStorage.removeItem("user");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      return null;

    case "update":
      const updatedUser = { ...state, ...action.payload };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return updatedUser;

    default:
      return state;
  }
};

export default MyUserReducer;
