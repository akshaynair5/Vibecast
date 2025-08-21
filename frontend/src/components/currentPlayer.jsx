import { useEffect, useState, useContext } from "react";
import { Authcontext } from "../contextProvider";
import Like from '../assets/like.png'
import unLike from '../assets/unlike.png'
import axiosInstance from "../services/axiosInstance";
import Likes from "./likeFormatter";
import { set } from "date-fns";
import PlaylistModal from "./playlistComponent";
import { useNavigate } from "react-router-dom";
import { Play, Pause, Maximize, Minimize, Heart, HeartOff, Plus, X, Trash2, Check, Edit3 } from "lucide-react"
import AddToPlaylistModal from "./addToPlaylistModal";

export default function MusicPlayer() {
  const { currentAudio, setCurrentAudio, audioElement, currentUser, setCollectUser, collectUser} = useContext(Authcontext);
  const [listenTime, setListenTime] = useState(0);
  const [play, setPlay] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [fullScreenLoading, setFullScreenLoading] = useState(false);
  const [disableBtn, setDisableBtn] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

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

  useEffect(() => {
    console.log("Current Audio:", currentAudio);
  }, [currentAudio])

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
    if (!isFullscreen) return;

    const fetchComments = async () => {
      try {
        setFullScreenLoading(true);
        const { data } = await axiosInstance.get(`/comments/${currentAudio.audio._id}`);
        console.log(data);

        // ApiResponse => { status, data: <array>, message }
        const comments = Array.isArray(data?.data) ? data.data : [];

        setCurrentAudio(prev => ({
          ...prev,
          audio: {
            ...prev.audio,
            comments,  // <-- store the array directly
          },
        }));
      } catch (e) {
        console.error(e);
        setCurrentAudio(prev => ({
          ...prev,
          audio: { ...prev.audio, comments: [] },
        }));
      } finally {
        setFullScreenLoading(false);
      }
    };

    fetchComments();
  }, [isFullscreen]);



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
    setDisableBtn(true);
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
    setDisableBtn(false);
  }
  const toggleUnLike = async (e) => {
    e.preventDefault();
    setDisableBtn(true);
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
    setDisableBtn(false);
  };
  
    const toggleCommentLike = async(comment, index) => {
      setDisableBtn(true);
      try{
        if(isExpanded){
          setIsExpanded(true);
        }
        const res = await axiosInstance.post(`/like/toggle/c/${comment._id}`)
        console.log(res.data)
        setCurrentAudio((prev) => {
          prev.audio.comments[index].hasLiked = true;
          prev.audio.comments[index].likesCount += 1;
          return { ...prev };
        });
        
      }
      catch(err){
        console.log(err)
      }
      setDisableBtn(false);
    }
  const toggleCommentUnLike = async (comment, index) => {
    setDisableBtn(true);
    try {
      const res = await axiosInstance.delete(
        `/like/toggleDislike`,
        {
          data: { commentId: comment._id } 
        }
      );
      console.log(res.data);
      setCurrentAudio((prev) => {
        // currentAudio.audio?.comments
        prev.audio.comments[index].hasLiked = false;
        prev.audio.comments[index].likesCount -= 1;
        return { ...prev };
      }); 
    } catch (err) {
      console.log(err);
    }
    setDisableBtn(false);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setDisableBtn(true);

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

    setDisableBtn(false);
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
    if(isExpanded || isFullscreen){
      setIsExpanded(false);
      setIsFullscreen(false);
    }
    navigate(`/${currentAudio.audio.ownerInfo[0].username}`);
    
  }

  const handleCommentUserSelect = (username) => {
    if(username === currentUser.username){
      navigate('/profile')
    }
    setCollectUser({username: username});
    if(isExpanded || isFullscreen){
      setIsExpanded(false);
      setIsFullscreen(false);
    }
    navigate(`/${username}`);
  }

  const handleSaveEdit = async (commentId, index, editContent) => {
    // if (!editContent.trim()) return;
    setDisableBtn(true);
    console.log(editContent)
    try {
      const res = await axiosInstance.patch(`/comments/c/${commentId}`, {data: {comment: editContent}});
        setCurrentAudio((prev) => {
        // currentAudio.audio?.comments
        prev.audio.comments[index].content = editContent;
        return { ...prev };
      }); 
    }
    catch (err) {
      console.log(err);
    }

    setEditingComment(null);
    setDisableBtn(false);
  }

  const handleDeleteComment = async (commentId, index) => {
    setDisableBtn(true);
    try {
      const res = await axiosInstance.delete(`/comments/c/${commentId}`);
      console.log(res.data);
      setCurrentAudio((prev) => {
        prev.audio.comments.splice(index, 1);
        return { ...prev };
      });
    } catch (err) {
      console.log(err);
    }
    setDisableBtn(false);
  }

  return (
    <div
  className={`fixed text-white transition-all duration-300 shadow-lg rounded-lg z-[1000] backdrop-blur-lg bg-opacity-10 ${
    isFullscreen
      ? `w-[100vw] h-[100vh] p-8 flex flex-row top-0 left-0`
      : isExpanded
      ? `${windowWidth >= 768 ? 'w-1/3 left-[65vw] h-4/5' : 'w-[95%] left-[2.5%] h-4/5'} rounded-lg p-4 bottom-0 top-[12vh] flex flex-col`
      : `${windowWidth >= 768 ? 'w-1/5 left-[75vw] h-25' : 'w-[95%] left-[2.5%] h-15'} flex items-center p-4 bottom-4`
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
      isFullscreen ? `${windowWidth >= 768 ? 'flex-row' : 'flex-col'} w-full h-full` : "flex-col w-full h-full"
    }`}
  >
    {/* Audio Info (Left Side in Fullscreen, Centered in Expanded Mode) */}
    <div
      className={`flex flex-col items-center ${
        isFullscreen ? `${windowWidth >= 768 ? 'w-1/2' : 'w-full'} h-full` : "w-full"
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
          disabled={disableBtn}
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
        <AddToPlaylistModal
          isOpen={isPlaylistModalOpen}
          onClose={() => setIsPlaylistModalOpen(false)}
          musicId={currentAudio.audio._id}
        />
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
      <div className={`flex flex-col ${windowWidth >= 768 ? 'w-1/2' : 'w-full'} h-full overflow-y-scroll p-4`}>
        <textarea
          className="w-full p-2 border rounded bg-gray-800 text-white"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        ></textarea>
        <button
          className="mt-2 bg-slate-700 text-white px-4 py-2 rounded"
          onClick={handleAddComment}
          disabled={!newComment.trim() || disableBtn}
        >
          Add Comment
        </button>
        {fullScreenLoading && (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">Loading comments...</p>
          </div>
        )}

        {!fullScreenLoading && (
          <div className="mt-6 space-y-4">
            {currentAudio.audio?.comments?.map((comment, index) => {
              const isOwner = comment.ownerDetails._id === currentUser._id;
              const isEditing = editingComment?.id === comment._id;

              return (
                <div
                  key={index}
                  className="flex flex-col w-full p-4 bg-neutral-800/40 rounded-2xl shadow-sm hover:bg-neutral-800/60 transition"
                >
                  {/* Row 1: Avatar + Username */}
                  <div className="flex items-center mb-2">
                    <img
                      src={isOwner ? currentUser.avatar : comment.ownerDetails.avatar}
                      alt="User Profile Pic"
                      className="w-9 h-9 rounded-full object-cover mr-3 cursor-pointer"
                      onClick={() =>
                        handleCommentUserSelect(comment.ownerDetails.username)
                      }
                    />
                    <p className="text-sm font-medium text-gray-300">
                      {comment.ownerDetails.username}
                    </p>
                  </div>

                  {/* Row 2: Content or Edit Mode */}
                  <div className="flex items-center justify-between">
                    {isEditing ? (
                      <div className="flex items-center flex-1 space-x-2">
                        <input
                          type="text"
                          value={editingComment.text}
                          onChange={(e) =>
                            setEditingComment({ ...editingComment, text: e.target.value })
                          }
                          className="flex-1 bg-transparent border-b border-gray-500 text-sm text-white focus:outline-none focus:border-white"
                        />
                        <button
                          onClick={() =>
                            handleSaveEdit(comment._id, index, editingComment.text)
                          }
                          className="text-green-400 hover:text-green-500"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={() => setEditingComment(null)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-white leading-snug flex-1 text-start">
                        {comment.content}
                      </p>
                    )}
                  </div>

                  {/* Row 3: Actions */}
                  <div className="flex items-center justify-end mt-3 space-x-4 text-gray-400">
                    {/* Like Button + Count */}
                    <div className="flex items-center space-x-1">
                      <button
                        className="hover:scale-110 transition-transform"
                        disabled={disableBtn}
                        onClick={() =>
                          comment.hasLiked
                            ? toggleCommentUnLike(comment, index)
                            : toggleCommentLike(comment, index)
                        }
                      >
                        {comment.hasLiked ? (
                          <HeartOff size={18} className="text-gray-400 hover:text-white" />
                        ) : (
                          <Heart size={18} className="text-red-500" />
                        )}
                      </button>
                      <Likes likes={comment.likesCount ? comment.likesCount : 0} />
                    </div>

                    {/* Edit/Delete for Owner */}
                    {isOwner && !isEditing && (
                      <>
                        <button
                          onClick={() =>
                            setEditingComment({ id: comment._id, text: comment.content })
                          }
                          className="hover:text-white"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}


        </div>
      )}
    </div>
  </div>
</div>
  );
}
