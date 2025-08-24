import { useContext, useEffect, useState } from 'react';
import '../App.css'
import logout from '../services/logout';
import axiosInstance from '../services/axiosInstance';
import Navbar from '../components/navbar';
import Sidebar from '../components/sidebar';
import MusicPlayer from '../components/currentPlayer';
import { Authcontext } from '../contextProvider';
import AudioCard from '../components/audioCard';
import StreamCard from '../components/liveAudioCard';
import Subscribers from '../components/subscriberFormatter';
import { useParams } from 'react-router-dom';
import defaultCoverImage from '../assets/default-cover.png'
import defaultAvatar from '../assets/default-avatar.jpg' 

function UserProfile() {
  const { currentUser, setCurrentUser, currentAudio, collectUser } = useContext(Authcontext);
  const { username } = useParams(); // 👈 get username from URL params
  const [userAudioData, setUserAudioData] = useState([]);
  const [userProfileData, setUserProfileData] = useState({});
  const [liveStreams, setLiveStreams] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", checkScreenSize);
    checkScreenSize();

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    const fetchUserProfileData = async () => {
      try {
        // ✅ Use collectUser if available, else fallback to username from URL
        const targetUsername = collectUser?.username || username;

        if (!targetUsername) return;

        const result = await axiosInstance.get(`/users/c/${targetUsername}`);

        const profile = result.data.message[0];
        setUserProfileData(profile);
        setUserAudioData(profile.videos || []);
        setLiveStreams(profile.liveStreams || []);
      } catch (err) {
        console.log(err);
      }
    };

    fetchUserProfileData();
  }, [collectUser, username]);

  const handleSubscription = async () => {
    try {
      const res = await axiosInstance.post(`/subscriptions/c/${collectUser?._id || userProfileData._id}`);
      setUserProfileData((prevState) => ({
        ...prevState,
        isSubscribed: true,
        subscribersCount: prevState.subscribersCount + 1,
      }));
    } catch (err) {
      console.log(err);
    }
  };

  const handleUnSubscription = async () => {
    try {
      const res = await axiosInstance.delete(`/subscriptions/c/${collectUser?._id || userProfileData._id}`);
      setUserProfileData((prevState) => ({
        ...prevState,
        isSubscribed: false,
        subscribersCount: prevState.subscribersCount - 1,
      }));
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className='fixed top-0 left-0 w-screen h-screen overflow-y-scroll scrollbar-thin scrollbar-thumb-scrollbar scrollbar-track-transparent z-10'
      style={{
        backgroundImage: 'linear-gradient(to bottom, #515151, #3d3d3d, #2a2a2a, #191919, #000000)',
      }}
    >
      <Navbar/>
      <Sidebar/>

      <div className="min-h-screen bg-transparent text-white container mx-auto px-4">
      {/* Cover Image Section */}
      <div className="relative w-full h-64 bg-transparent">
      {/* Cover Image */}
      <img
        src={userProfileData?.coverImage || defaultCoverImage}
        alt="Cover"
        className="object-cover w-full h-full rounded-lg cursor-pointer z-0 opacity-50"
      />

      {/* User Name */}
      <div className="absolute bottom-4 left-4 text-white">
        <h2 className="text-3xl font-semibold ml-4 text-white">
          @{userProfileData?.username}
        </h2>
      </div>
    </div>

      {/* User Info Section */}
      <div className="max-w-7xl mx-auto px-4 py-8 bg-transparent text-white">
      {/* Profile Section */}
      <div className="flex flex-col md:flex-row md:items-center md:space-x-8">
        {/* Profile Picture */}
        <div className="flex-shrink-0 mb-4 md:mb-0">
          <img
            src={userProfileData?.avatar ? userProfileData?.avatar : defaultAvatar}
            alt="Profile"
            className="w-36 h-36 rounded-full border-4 border-white shadow-lg cursor-pointer"
          />
        </div>

        <div className="flex flex-col items-center text-center space-y-3 p-4 bg-transparent rounded-xl w-full sm:w-[80%] mx-auto">
          <h2 className="text-2xl font-semibold text-white">{userProfileData.fullName}</h2>
          <Subscribers subscribers={userProfileData.subscribersCount} />
          <p className="text-sm text-gray-400">Description or bio about the user goes here.</p>

          <div className="flex gap-3">
            <button
                  className="flex items-center gap-2 bg-gray-800 text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-700 transition"
                  onClick={userProfileData?.isSubscribed? handleUnSubscription : handleSubscription}
              >
                  {userProfileData?.isSubscribed? "Unsubscribe" : "Subscribe"}
            </button>
          </div>
        </div>
      </div>
    </div>

    <section
      className="relative bg-cover bg-center bg-no-repeat rounded-lg h-auto flex flex-col justify-between p-4 mb-8"
      style={{
        backgroundImage: 'linear-gradient(to bottom, #4a3038, #3d262c, #311d21, #251416, #1b0808)',
        minHeight: '400px',
        backgroundOpacity: '0.5',
      }}
    >
      <div className="flex flex-col items-start justify-center text-white space-y-4">
        <h2 className="text-4xl font-bold">Live Streams</h2>
        <button className="flex items-center text-white bg-black bg-opacity-50 px-4 py-2 rounded-full hover:bg-opacity-70" 
          // onClick={() => { handleScrollRight(liveStreamRef); }}
        >
          Explore <span className="ml-2">→</span>
        </button>
      </div>

      <div
        className="flex overflow-x-auto p-2  relative first-line scrollbar-none"
        style={{
          scrollSnapType: 'x mandatory',
          flexDirection: isMobile ? 'column' : 'row',
        }}
        // ref={liveStreamRef}
      >
        {liveStreams?.length > 0 ? (
          liveStreams.map((stream, index) => (
            <div
              key={index}
              style={{
                minWidth: isMobile ? '100%' : '25%',
                maxWidth: isMobile ? '100%' : '25%',
                marginLeft: isMobile ? '0' : '2%',
              }}
            >
              <StreamCard stream={stream} />
            </div>
          ))
        ) : (
          <div className="w-full flex flex-col items-center justify-center text-center py-10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-gray-400 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10l4.553 2.276A1 1 0 0120 13.118v5.764a1 1 0 01-1.447.894L15 17m0-7V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2h7a2 2 0 002-2v-4m0-7l-5 3"
              />
            </svg>
            <p className="text-lg font-semibold text-gray-300">No live streams yet</p>
            <p className="text-sm text-gray-400 mt-1">
             {userProfileData.fullName} hasn't shared any live streams yet. Check back later!
            </p>
          </div>
        )}
      </div>
    </section>

    <section
      className="relative bg-cover bg-center bg-no-repeat rounded-lg h-auto flex flex-col justify-between p-4 mb-8"
      style={{
        backgroundImage: 'linear-gradient(to bottom, #436b69, #365958, #2a4847, #1f3737, #142727)',
        minHeight: '400px',
        backgroundOpacity: '0.5',
      }}
    >
      <div className="flex flex-col items-start justify-center text-white space-y-4">
        <h2 className="text-4xl font-bold">Audio/Podcasts</h2>
        <button
          className="flex items-center text-white bg-black bg-opacity-50 px-4 py-2 rounded-full hover:bg-opacity-70"
          // onClick={() => { handleScrollRight(audioRef); }}
        >
          Explore <span className="ml-2">→</span>
        </button>
      </div>

      <div
        className="flex overflow-x-auto p-2 relative first-line scrollbar-none"
        style={{
          scrollSnapType: 'x mandatory',
          flexDirection: isMobile ? 'column' : 'row',
        }}
        // ref={audioRef}
      >
        {userAudioData?.length > 0 ? (
          userAudioData.map((audio, index) => (
            <div
              key={audio._id}
              style={{
                minWidth: isMobile ? '100%' : '25%',
                maxWidth: isMobile ? '100%' : '25%',
                marginLeft: isMobile ? '0' : '2%',
              }}
            >
              <AudioCard
                key={index}
                audio={audio}
              />
            </div>
          ))
        ) : (
          <div className="w-full flex flex-col items-center justify-center text-center py-10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-gray-400 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10l4.553 2.276A1 1 0 0120 13.118v5.764a1 1 0 01-1.447.894L15 17m0-7V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2h7a2 2 0 002-2v-4m0-7l-5 3"
              />
            </svg>
            <p className="text-lg font-semibold text-gray-300">No audio/podcasts yet</p>
            <p className="text-sm text-gray-400 mt-1">
             {userProfileData.fullName} hasn't hosted any audio/podcasts yet. Click "Upload" to start sharing your content!
            </p>
          </div>
        )}
      </div>
    </section>

      </div>
    </div>

    

    )
}

export default UserProfile;