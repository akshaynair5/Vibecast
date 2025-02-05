import { useEffect, useState, useContext } from "react";
import { Authcontext } from "../contextProvider";
import Like from '../assets/like.png'
import unLike from '../assets/unlike.png'
import axiosInstance from "../services/axiosInstance";
import Likes from "./likeFormatter";
import { set } from "date-fns";
import PlaylistModal from "./playlistComponent";
import { useNavigate } from "react-router-dom";
import { Play, Pause, Maximize, Minimize, Heart, HeartOff, Plus, X } from "lucide-react"

export default function MusicPlayer() {
  const { currentAudio, setCurrentAudio, audioElement, currentUser, setCollectUser, collectUser} = useContext(Authcontext);
  const [listenTime, setListenTime] = useState(0);
  const [play, setPlay] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const navigate = useNavigate();

  const togglePlayPause = () => {
    setPlay((prev) => {
      const newPlayState = !prev;
      if (newPlayState) {
        audioElement.play();
      } else {
        audioElement.pause();
      }
      return newPlayState;
    });
  };

  const handleSliderChange = (e) => {
    const newTime = (e.target.value / 100) * audioElement?.duration;
    audioElement.currentTime = newTime;
    setProgress(e.target.value);
  };

  const toggleExpand = () => setIsExpanded((prev) => !prev);

  const toggleFullscreen = () => setIsFullscreen((prev) => !prev);

  useEffect(() => {
    if (play) {
      audioElement.play();
    } else {
      audioElement.pause();
    }
  }, [play, audioElement]);

  const increaseViews = async () =>{
    try{
      const res = await axiosInstance.post(`/${currentAudio.audio._id}/views`);
      if(res.data.videoId == currentAudio.audio._id){
        setCurrentAudio((prev) => ({...prev, audio: {...prev.audio, views: prev.audio.views + 1}}))
      }
    }
    catch(err){
      console.log(err)
    }
  }

  useEffect(() => {
    if (audioElement) {
      const intervalId = setInterval(() => {
        if (play) {
          setListenTime((prev) => {
            const newTime = prev + 1;
            if (newTime >= currentAudio.audio.duration / 4) {
              increaseViews();
            }
            return newTime;
          });
        }
      }, 1000);
      // Cleanup function to clear interval
      return () => clearInterval(intervalId);
    }
  }, [audioElement, play]);

  useEffect(() => {
    if (currentAudio?.audio?.videoFile) {
      console.log(currentAudio);
      audioElement.src = currentAudio.audio.videoFile;
      audioElement.currentTime = 0;
      setPlay(currentAudio.isPlaying || false);
    }
  }, [currentAudio, audioElement]);

  useEffect(() => {
    const updateProgress = () => {
      setProgress((audioElement.currentTime / audioElement.duration) * 100 || 0);
    };

    audioElement.addEventListener("timeupdate", updateProgress);
    return () => {
      audioElement.removeEventListener("timeupdate", updateProgress);
    };
  }, [audioElement]);

  const toggleLike = async(e) => {
    e.preventDefault();
    try{
      if(isExpanded){
        setIsExpanded(true);
      }
      const res = await axiosInstance.post(`/like/toggle/v/${currentAudio.audio._id}`)
      console.log(res.data)
      setCurrentAudio((prev) => {
        prev.audio.isLiked = true;
        prev.audio.likeCount += 1;
        return { ...prev };
      });
      
    }
    catch(err){
      console.log(err)
    }
  }
  const toggleUnLike = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.delete(
        `/like/toggleDislike`,
        { params: { videoId: currentAudio.audio._id, likedBy: currentUser._id } }
      );
      console.log(res.data);
      setCurrentAudio((prev) => {
        prev.audio.isLiked = false;
        prev.audio.likeCount -= 1;
        return { ...prev };
      }); 
    } catch (err) {
      console.log(err);
    }
  };
  

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    console.log(newComment);

    try {
      const response = await axiosInstance.post(`/comments/${currentAudio.audio._id}`, {
        comment: newComment,
      });
      setNewComment("");
      console.log(response.data.message);
      currentAudio.audio.comments.push({...response.data.message, owner: currentUser});
      console.log(currentAudio)
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const openPlaylistModal = (e) => {
    e.preventDefault();
    setIsPlaylistModalOpen(true);
  };

  const closePlaylistModal = () => {
    setIsPlaylistModalOpen(false);
  };

  const handleUserSelect = () =>{
    if(currentAudio.audio.ownerInfo[0].username === currentUser.username){
      navigate('/profile')
    }
    setCollectUser(currentAudio.audio.ownerInfo[0])
    navigate(`/${currentAudio.audio.ownerInfo[0].username}`); 
  }

  return (
    <div
  className={`fixed text-white transition-all duration-300 shadow-lg rounded-lg z-[1000] backdrop-blur-lg bg-opacity-10 ${
    isFullscreen
      ? "w-[100vw] h-[100vh] p-8 flex flex-row top-0 left-0"
      : isExpanded
      ? "w-1/3 h-4/5 rounded-lg p-4 bottom-0 top-[12vh] left-[65vw] flex flex-col"
      : "w-1/5 h-25 flex items-center p-4 left-[75vw] bottom-4"
  }`}
  onClick={!isExpanded ? toggleExpand : null}
>
    <div 
    className="absolute inset-0 bg-cover bg-center rounded-lg"
    style={{
      backgroundImage: `url(${currentAudio?.audio?.thumbnail})`,
      filter: "brightness(25%)", // Darken the image
    }}
  ></div>
  <div className='relative z-10'>
    {/* Fullscreen & Collapse Buttons */}
  {isExpanded && (
    <button
      className="absolute top-2 left-2 bg-black/50 p-2 rounded-full hover:bg-black/70"
      onClick={(e) => {
        e.stopPropagation();
        toggleFullscreen();
      }}
    >
      {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
    </button>
  )}
  {isExpanded && !isFullscreen && (
    <button
      className="absolute top-2 right-2 bg-red-500 p-2 rounded-full hover:bg-red-400"
      onClick={(e) => {
        e.stopPropagation();
        toggleExpand();
      }}
    >
      <X size={18} />
    </button>
  )}

  {/* Content */}
  <div
    className={`flex ${
      isFullscreen ? "flex-row w-full h-full" : "flex-col w-full h-full"
    }`}
  >
    {/* Audio Info (Left Side in Fullscreen, Centered in Expanded Mode) */}
    <div
      className={`flex flex-col items-center ${
        isFullscreen ? "w-1/2 h-full" : "w-full"
      }`}
    >
      <img
        src={currentAudio?.audio?.thumbnail || "https://via.placeholder.com/60"}
        alt="Album Art"
        className="rounded-md w-1/2 h-auto shadow-lg"
      />
      <div className="flex flex-col justify-center w-full pt-2 text-center">
        <p
          className="text-sm text-gray-400 cursor-pointer"
          onClick={handleUserSelect}
        >
          {currentAudio.audio?.ownerInfo[0].fullName || "Artist"}
        </p>
        {(isExpanded || isFullscreen) && (
          <p className="text-xl font-semibold text-white">
            {currentAudio.audio?.title || "Title Not Available"}
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between w-full mt-4">
        <button
          className="p-3 bg-black/50 rounded-full hover:bg-black/70"
          onClick={(e) => {
            e.stopPropagation();
            togglePlayPause();
          }}
        >
          {play ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <button
          className="p-3 bg-black/50 rounded-full hover:bg-black/70"
          onClick={(e) => {
            currentAudio.audio?.isLiked ? toggleUnLike(e) : toggleLike(e);
          }}
        >
          {currentAudio.audio?.isLiked ? (
            <Heart size={20} className="text-red-500" />
          ) : (
            <HeartOff size={20} />
          )}
        </button>
        <button
          className="p-3 bg-black/50 rounded-full hover:bg-black/70"
          onClick={openPlaylistModal}
        >
          <Plus size={20} />
        </button>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={progress}
        onChange={(e) => {
          e.stopPropagation();
          handleSliderChange(e);
        }}
        className="w-full mt-4 bg-gray-700 rounded-lg h-2"
      />

      {/* Description */}
      {(isExpanded || isFullscreen) && (
        <div className="w-[95%] bg-black/50 rounded-md p-3 mt-4">
          <p className="text-lg font-semibold text-white">About</p>
          <p className="text-sm text-gray-400">
            {currentAudio?.audio?.description || "Description Not Available"}
          </p>
        </div>
      )}
    </div>

    {/* Comments (Right Side in Fullscreen Mode) */}
    {isFullscreen && (
      <div className="flex flex-col w-1/2 h-full overflow-y-auto p-4">
        <textarea
          className="w-full p-2 border rounded bg-gray-800 text-white"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        ></textarea>
        <button
          className="mt-2 bg-slate-700 text-white px-4 py-2 rounded"
          onClick={handleAddComment}
        >
          Add Comment
        </button>
        <div className="mt-4">
          {currentAudio.audio?.comments.map((comment, index) => (
            <div key={index} className="flex items-center w-full mt-4">
              <img
                src={comment.owner._id == currentUser._id ? currentUser.avatar : comment.owner.avatar}
                alt="User Profile Pic"
                className="w-10 h-10 rounded-full mr-4"
              />
              <div className="flex flex-col">
                <p className="text-xs text-gray-400">{comment.owner.username}</p>
                <p className="text-sm text-white">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
  </div>
</div>
  );
}
