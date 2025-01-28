import { useEffect, useState, useContext } from "react";
import { Authcontext } from "../contextProvider";
import Like from '../assets/like.png'
import unLike from '../assets/unlike.png'
import axiosInstance from "../services/axiosInstance";
import Likes from "./likeFormatter";
import { set } from "date-fns";
import PlaylistModal from "./playlistComponent";
import { useNavigate } from "react-router-dom";

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
      currentAudio.audio.comments.push(response.data.message);
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
        className={`fixed bg-slate-800 text-white transition-all duration-300 shadow-lg rounded-lg z-[1000] ${
          isFullscreen
            ? "w-[100vw] h-[100vh] p-8 flex flex-row top-0 left-0"
            : isExpanded
            ? "w-1/3 h-4/5 rounded-t-lg p-4 bottom-0 top-[12vh] left-[65vw]"
            : "w-1/5 h-25 flex items-center p-4 left-[75vw] bottom-4"
        }`}
        onClick={!isExpanded ? toggleExpand : null}
      >
        {/* Fullscreen Toggle Button */}
        {isExpanded && (
          <button
            className="absolute top-2 left-2 bg-slate-700 px-3 py-1 rounded text-xs hover:bg-slate-600"
            onClick={(e) => {
              e.stopPropagation();
              toggleFullscreen();
            }}
          >
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </button>
        )}

        {/* Collapse/Unexpand Button */}
        {isExpanded && !isFullscreen && (
          <button
            className="absolute top-2 right-2 bg-red-500 px-3 py-1 rounded text-xs hover:bg-red-400"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand();
            }}
          >
            Collapse
          </button>
        )}

      {/* Content Layout */}
      <div
        className={`flex ${
          isFullscreen ? "flex-col items-center w-1/2 h-full" :
          isExpanded ? "flex-col items-center" : "flex flex-row"
        } w-full h-full`}
      >
        {/* Thumbnail */}
        <div className={`rounded-md ${
              isFullscreen && currentAudio
                ? "w-full h-auto pb-5"
                : isExpanded && currentAudio
                ? "w-full h-auto mb-4 mt-5"
                : "w-[100%] h-auto"
            } justify-center items-center flex flex-col`}>
          <img
            src={
              currentAudio?.audio?.thumbnail
                ? currentAudio.audio.thumbnail
                : "https://via.placeholder.com/60"
            }
            alt="Album Art"
            className={`rounded-md ${
              isFullscreen && currentAudio
                ? "w-1/2 h-auto"
                : isExpanded && currentAudio
                ? "w-[50%] h-auto mb-4"
                : "w-full h-auto"
            }`}
          />
          <div className="flex flex-col justify-center w-full pt-2">
            <p className="text-s text-gray-400 cursor-pointer" onClick={handleUserSelect}>{currentAudio.audio?.ownerInfo[0].fullName || "Artist"}</p>
            {
              isExpanded || isFullscreen ? (
                <p className="text-2xl text-white-400 text">{currentAudio.audio?.title || "Title Not Available"}</p>
              ) : null
            }
          </div>
        </div>

        {/* Compressed Form */}
        {!isFullscreen && !isExpanded && (
          <>
            <div className="flex flex-col ml-4 items-center w-[70%]">
              <button
                className="bg-slate-700 px-4 py-2 rounded-full hover:bg-slate-600"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlayPause();
                }}
              >
                {play ? "Pause" : "Play"}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => {
                  e.stopPropagation();
                  handleSliderChange(e);
                }}
                className="w-[12vw] mt-4 ml-4"
              />
            </div>
          </>
        )}

        {/* Expanded or Fullscreen Form */}
        {(isExpanded || isFullscreen) && (
          <>
            <div className="flex items-center justify-between w-full mt-4">
              {/* Buttons */}
              <button
                className="bg-slate-700 px-4 py-2 rounded-full hover:bg-slate-600"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlayPause();
                }}
              >
                {play ? "Pause" : "Play"}
              </button>
              <button className="bg-slate-700 px-4 py-2 rounded-full hover:bg-slate-600 h-10 w-15 flex items-center justify-center" onClick={(e)=>{currentAudio.audio?.isLiked? toggleUnLike(e) : toggleLike(e)}}>
                  {
                    currentAudio.audio?.isLiked 
                      ? <img src={Like} alt="Unlike" className="h-6 mr-3" />
                      : <img src={unLike} alt="Like" className="h-6 mr-3"  />
                  }
                  <Likes likes = {currentAudio.audio.likeCount} />
              </button>

              <button className="bg-slate-700 px-4 py-2 rounded-full hover:bg-slate-600" onClick={(e)=>{openPlaylistModal(e)}}>
                Add to Playlist
              </button>
              {isPlaylistModalOpen && (
                <PlaylistModal
                  onClose={closePlaylistModal}
                />
              )}
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
              className="w-full mt-4"
            />
          </>
        )}
        {
          isExpanded || isFullscreen ? (
            <div className="w-[95%] h-auto mt-4 m-[2.5%] bg-slate-600 rounded-md p-2">
              <p className="text-lg text-white align-text-top-left">About</p>
              <p className="text-lg text-white align-text-top-left">
                {currentAudio?.audio?.description || "Description Not Available"}
              </p>
            </div>
          ) : null
        }
      </div>
      {
        isFullscreen && (
        <div
          className={`flex ${
            isFullscreen ? "flex-col items-center w-1/2 h-full" :
            isExpanded ? "flex-col items-center" : "items-center"
          } w-full h-full overflow-y-scroll`}
        >
          <div className="w-full">
          <div className="add-comment-section mt-4">
              <textarea
                className="w-full p-2 border rounded text-black"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              ></textarea>
              <button
                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
                onClick={handleAddComment}
              >
                Add Comment
              </button>
            </div>
            <div className="comments-section">
              {currentAudio.audio?.comments.map((comment, index) => (
                <div key={index} className="flex items-center w-full mt-4">
                  <img
                    src={comment.owner.avatar}
                    alt="User Profile Pic"
                    className="w-10 h-10 rounded-full mr-4"
                  />
                  <div className="flex flex-col">
                    <p className="text-xs text-gray-400">{comment.owner.fullName}</p>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        )
      }
    </div>
  );
}
