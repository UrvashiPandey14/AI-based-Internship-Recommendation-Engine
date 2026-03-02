import { createContext, useState } from "react";

export const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [profilePic, setProfilePic] = useState(
    localStorage.getItem("profilePic")
  );

  return (
    <ProfileContext.Provider value={{ profilePic, setProfilePic }}>
      {children}
    </ProfileContext.Provider>
  );
};
