import { createContext, useEffect, useState } from "react";
import axiosInstance from "./services/axiosInstance";

export const Authcontext = createContext();
export const AuthContextProvider =({children})=>{
    const [currentUser, setCurrentUser] = useState(null)
    const [collectUser, setCollectUser] = useState(null)
    const [loading, setLoading] = useState(true);
    const [currentAudio, setCurrentAudio] = useState({})
    const [currentLiveStream, setCurrentLiveStream] = useState({});
    const [currentRemoteAudio, setCurrentRemoteAudio] = useState(null)
    const [audioElement] = useState(new Audio()); 

    useEffect(() => {
        const fetchLatestUserData = async () => {
          try {
            const response = await axiosInstance.post(`/users/current-user`, {
            });
            const updatedUser = response.data.message;
      
            // Update local storage with the latest user data
            localStorage.setItem(
              "userData",
              JSON.stringify(
                updatedUser
              )
            );
      
            // Update the current user in state
            setCurrentUser(updatedUser);
            setLoading(false);
          } catch (error) {
            console.error("Error fetching latest user data:", error);
            localStorage.removeItem("userData");
            setCurrentUser(null);
            setLoading(false);
          }
        };
        fetchLatestUserData();
      }, []);      
      

    return(
        <Authcontext.Provider value={{currentUser, setCurrentUser, loading, currentAudio, setCurrentAudio, audioElement, collectUser, setCollectUser, currentLiveStream, setCurrentLiveStream, currentRemoteAudio, setCurrentRemoteAudio}}>
            {children}
        </Authcontext.Provider>
    )
};