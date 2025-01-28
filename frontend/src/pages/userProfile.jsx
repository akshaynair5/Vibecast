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

function UserProfile() {
    const {currentUser, setCurrentUser, currentAudio, collectUser} = useContext(Authcontext)
    const [userAudioData, setUserAudioData] = useState([]);
    const [userProfileData, setUserProfileData] = useState([]);
    const [liveStreams, setLiveStreams] = useState([]);

    useEffect(()=>{
       const fetchUserProfileData = async ()=>{
            console.log(collectUser)
            try{
                const result = await axiosInstance.get(`/users/c/${collectUser.username}`)
                console.log(result.data)
                setUserProfileData(result.data.message[0]);
                setUserAudioData(result.data.message[0].videos);
                setLiveStreams(result.data.message[0].liveStreams);
            }
            catch(err){
                console.log(err)
            }
        }
        fetchUserProfileData();
    },[])

    useEffect(()=>{
        console.log(userProfileData)
    },[userProfileData])

    const handleSubscription = async () => {
        try{
            const res = await axiosInstance.post(`/subscriptions/c/${collectUser._id}`);
            console.log(res.data);
            setUserProfileData(prevState => ({...prevState, isSubscribed: true, subscribersCount: prevState.subscribersCount + 1}));
        }
        catch(err){
            console.log(err)
        }
    }

    const handleUnSubscription = async () => {
        try{
            const res = await axiosInstance.delete(`/subscriptions/c/${collectUser._id}`);
            console.log(res.data);
            setUserProfileData(prevState => ({...prevState, isSubscribed: false, subscribersCount: prevState.subscribersCount - 1}));
        }
        catch(err){
            console.log(err)
        }
    }

  return (
    <div className='fixed top-0 left-0 bg-slate-700 w-screen h-screen overflow-y-scroll scrollbar-thin scrollbar-thumb-scrollbar scrollbar-track-transparent z-10'>
      <Navbar/>
      <Sidebar/>

      <div className="min-h-screen bg-slate-700 text-white">
      {/* Cover Image Section */}
      <div className="relative w-full h-64 bg-slate-700">
      {/* Cover Image */}
      <img
        src={userProfileData?.coverImage}
        alt="Cover"
        className="object-cover w-full h-full rounded-b-lg cursor-pointer z-0"
      />

      {/* User Name */}
      <div className="absolute bottom-4 left-4 text-white">
        <h2 className="text-3xl font-semibold ml-4 text-white">
          @{userProfileData?.username}
        </h2>
      </div>
    </div>

      {/* User Info Section */}
      <div className="max-w-7xl mx-auto px-4 py-8 bg-slate-700 text-white">
      {/* Profile Section */}
      <div className="flex flex-col md:flex-row md:items-center md:space-x-8">
        {/* Profile Picture */}
        <div className="flex-shrink-0 mb-4 md:mb-0">
          <img
            src={userProfileData?.avatar}
            alt="Profile"
            className="w-36 h-36 rounded-full border-4 border-white shadow-lg cursor-pointer"
          />
        </div>

        {/* User Info */}
        <div className="flex flex-col justify-center space-y-2">
          <h2 className="text-2xl font-bold text-white">
            {userProfileData?.fullName}
          </h2>
          <p className="text-sm text-gray-400">
            Description or bio about the user goes here.
          </p>

          <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={userProfileData?.isSubscribed? handleUnSubscription : handleSubscription}
            >
                {userProfileData?.isSubscribed? "Subscribed" : "Subscribe"}
          </button>

        </div>
      </div>
    </div>
    <div className="bg-slate-700 py-8">
      <div className="max-w-7xl mx-auto px-4 relative z-0">
        <h3 className="text-2xl font-semibold text-gray-100 mb-6">Live Streams</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 z-0">
          {/* Example of a single live stream item */}
          {liveStreams?.length > 0 &&
            liveStreams.map((stream, index) => (
              <StreamCard stream={stream} key={index} />
            ))}

          {/* If no live streams are available */}
          {liveStreams?.length === 0 && (
            <div className="bg-gray-50 p-4 rounded-lg shadow-md relative z-0">
              <img
                src="https://via.placeholder.com/300x200"
                alt="Live Stream"
                className="w-full h-40 object-cover rounded-md"
              />
              <h4 className="mt-2 text-lg font-semibold text-gray-800">
                Stream Title
              </h4>
              <p className="text-sm text-gray-600">
                No live streams available at the moment.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>

      {/* User's Audio/Podcast Section */}
      <div className="bg-slate-700 py-8">
            <div className="max-w-7xl mx-auto px-4 relative z-0">
                <h3 className="text-2xl font-semibold text-gray-100 mb-6">Audio/Podcasts</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 z-0">
                {/* Example of a single audio/podcast item */}
                {userAudioData?.length > 0 &&
                    userAudioData.map((audio, index) => (
                    <AudioCard
                        key={index}
                        audio={audio}
                        className="relative z-0"
                    />
                    ))}

                {userAudioData?.length === 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg shadow-md relative z-0">
                    <img
                        src="https://via.placeholder.com/300x200"
                        alt="Audio/Podcast"
                        className="w-full h-40 object-cover rounded-md"
                    />
                    <h4 className="mt-2 text-lg font-semibold text-gray-800">Podcast Title</h4>
                    <p className="text-sm text-gray-600">Short description of the podcast goes here.</p>
                    </div>
                )}
                </div>
            </div>
        </div>

      </div>
    </div>
    )
}

export default UserProfile;