import { useContext, useEffect, useState } from "react";
import axiosInstance from "../services/axiosInstance";
import { Authcontext } from "../contextProvider";
import PlaylistCard from "./playlistCard";
import AudioCard from "./audioCard";
import { set } from "date-fns";
import { useNavigate } from "react-router-dom";
import rightArrow from "../assets/right-arrow.svg";
import leftArrow from "../assets/left-arrow.svg";
import NewPlaylistModal from "./newPlaylistModal";

export default function Sidebar() {
  const {currentUser, setCollectUser} = useContext(Authcontext);
  const [isOpen, setIsOpen] = useState(false); // Sidebar open/close state
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal open/close state
  const [modalContent, setModalContent] = useState("playlists"); // Content state for modal
  const [previousContentType, setPreviousContentType] = useState(null); // Tracks the previous content type for "Back" functionality
  const [previousContent, setPreviousContent] = useState(null); // Tracks the previous content for "Back" functionality
  const [playlists, setPlaylists] = useState([]);
  const [content, setContent] = useState([]);
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [showNewPlaylistModal, setShowNewPlaylistModal] = useState(false);
  const navigate = useNavigate();
  const windowWidth = window.innerWidth;

  const handleOpenModal = (modalContent, prevContent = null) => {
    setPreviousContent(prevContent);
    setModalContent(modalContent);
    // handlePlaylistCollection();
    setIsModalOpen(true);
  };

  const handleBack = () => {
    setModalContent(previousContentType);
    setPlaylists(previousContent);
    setPreviousContent(null);
  };

  const handlePlaylistCollection = async () =>{
    try{
        const res = await axiosInstance.get(`/playlist/${currentUser._id}`)
        setPlaylists(res.data.message)
        handleOpenModal("playlists")
    }
    catch(err){
        console.log(err)
    }
  }

  const handlePlaylistOpen = (playlist) => {
    setModalContent("Audios");
    setPreviousContent(playlists)
    setPreviousContentType("playlists")
    setCurrentPlaylist(playlist);
    setContent(playlist.videoList);
  }

  const handleOpenSubscribedChannels = async () => {
    handleOpenModal("Channels")
    try{
        const res = await axiosInstance.get(`/subscriptions/`)
        setContent(res.data.message)
    }
    catch(err){
        console.log(err)
    }
  }
  const handleOpenLikedModal = async() => {
    handleOpenModal("Audios")
    try{
        const res = await axiosInstance.get(`/like/videos`)
        setContent(res.data.message)
    }
    catch(err){
        console.log(err)
    }
  }

  const handleChannelOpen = (channel) => {
    setCollectUser(channel)
    navigate(`/${channel.username}`); 
  }

  const handleOpenHistoryModal = async() => {
    handleOpenModal("Audios")
    try{
        const res = await axiosInstance.get(`/users/watch-history`)
        setContent(res.data.message)
    }
    catch(err){
        console.log(err)
    }
  }

  const [modals, setModals] = useState({
    options: null, // ID of the playlist whose options modal is open
    update: null,  // ID of the playlist whose update modal is open
    delete: null,  // ID of the playlist whose delete modal is open
  });

  const [updatedInfo, setUpdatedInfo] = useState({
    name: "",
    description: "",
  });
  
  // Handlers to open/close modals
  const openModal = (type, id) => {
    setModals((prev) => ({ ...prev, [type]: id }));
  };
  
  const closeModal = (type) => {
    setModals((prev) => ({ ...prev, [type]: null }));
  };

  const [audioModals, setAudioModals] = useState({
    options: null, // ID of the audio whose options modal is open
    delete: null,  // ID of the audio whose delete modal is open
  });
  
  // Handlers to open/close modals
  const openAudioModal = (type, id) => {
    setAudioModals((prev) => ({ ...prev, [type]: id }));
  };
  
  const closeAudioModal = (type) => {
    setAudioModals((prev) => ({ ...prev, [type]: null }));
  };


  const onUpdatePlaylist = async (playlistId) => {
    try{
      const res = await axiosInstance.patch(`/playlist/get/${playlistId}`, {name: updatedInfo.name, description: updatedInfo.description});
      setPlaylists((prev)=>(prev.map((pl) => pl._id === playlistId? {...pl, ...updatedInfo} : pl)))
    }
    catch(err){
      console.log(err)
    }
  }

  const onDeletePlaylist = async (playlistId) => {
    try{
      const res = await axiosInstance.delete(`/playlist/get/${playlistId}`);
      setPlaylists((prev)=>(prev.filter((pl) => pl._id !== playlistId)))
    }
    catch(err){
      console.log(err)
    }
  }

  const onDeleteAudio = async (audioId) => {
    try {
  
      const res = await axiosInstance.patch(`/playlist/remove/${audioId}/${currentPlaylist._id}`);
  
      // Make sure prev is an array before using filter
      setContent((prev) => (Array.isArray(prev) ? prev.filter((audio) => audio._id !== audioId) : []));
  
      // Ensure videoList exists and handle safely
      setPreviousContent((prev) =>
        Array.isArray(prev)
          ? prev.map((pl) =>
              pl._id === currentPlaylist._id
                ? {
                    ...pl,
                    videoList: Array.isArray(pl.videoList)
                      ? pl.videoList.filter((audio) => audio._id !== audioId)
                      : [],
                  }
                : pl
            )
          : []
      );
    } catch (err) {
      console.log(err);
    }
  };

  const onClearHistory = async () => {    
    try{
      const res = await axiosInstance.delete(`/users/clear-history`);
      setContent([])
    }
    catch(err){
      console.log(err)
    }
  }
  
  
  return (
    <>
      {
        <div className="flex">
          {/* Sidebar */}
          <div
            className={`fixed ${windowWidth >= 768 ? "top-[10vh]" : "top-[4rem]"} left-0 z-10 w-[250px] h-full bg-gray-900 text-white shadow-md rounded-tr-md rounded-br-md transform ${'top-[10%]'} left-[1%] z-10 h-[calc(100vh-6rem)] bg-[#212529] text-white shadow-md rounded-tr-md rounded-br-md transform ${
              isOpen ? "translate-x-0" : "-translate-x-full"
            } transition-transform duration-300 rounded-md`}
            style={{ 
              width: "250px",
              backgroundImage: 'linear-gradient(to left top, #242424, #1d1d1d, #161616, #0d0d0d, #000000)'
             }}
          >
            <div className="p-4">
              <h2 className="text-lg font-bold mb-4">Sidebar</h2>
              <ul className="space-y-2">
                <li
                  className="hover:bg-slate-700 p-2 rounded-md cursor-pointer"
                  onClick={() => handlePlaylistCollection("playlists")}
                >
                  Playlists
                </li>
                <li className="hover:bg-slate-700 p-2 rounded-md" onClick={()=>{handleOpenSubscribedChannels()}}>
                  <a href="#">Subscribed Channels</a>
                </li>
                <li className="hover:bg-slate-700 p-2 rounded-md" onClick={()=>{handleOpenLikedModal()}}>
                  <a href="#">Liked Podcasts</a>
                </li>
                <li className="hover:bg-slate-700 p-2 rounded-md" onClick={()=>{handleOpenHistoryModal()}}>
                    <a href="#">History</a>
                </li>
                <li className="hover:bg-slate-700 p-2 rounded-md" onClick={()=>{onClearHistory()}}>
                  <a href="#">Clear History</a>
                </li>
                <li className="hover:bg-slate-700 p-2 rounded-md">
                  <a href="#">Help</a>
                </li>
              </ul>
            </div>
          </div>

          {/* Toggle Button */}
          <button
            className={`fixed ${
              windowWidth >= 768 ? "top-[10vh] left-[-19vw]" : "top-[4.5rem] left-[-19.7rem]"
            } z-20 bg-white text-white font-extrabold p-2 shadow-md focus:outline-none ${
              isOpen ? "translate-x-[15rem]" : "translate-x-0"
            } transition-transform duration-300 rounded-tr-lg rounded-br-lg min-w-[22rem] flex flex-row-reverse`}
            onClick={() => setIsOpen(!isOpen)}
          >
            <img
              src={isOpen ? leftArrow : rightArrow}
              alt="Toggle Icon"
              className="w-6 h-6"
            />
          </button>

        </div>
      }

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30 ">
            <div className="rounded-lg shadow-lg w-11/12 md:w-1/2 p-4 scrollbar-none"
              style={{ 
                backgroundImage: 'linear-gradient(to right bottom, #242424, #1d1d1d, #161616, #0d0d0d)'
              }}
            >
                <div className="flex justify-between items-center pb-2 mb-4">
                    {previousContent && (
                    <button
                        onClick={handleBack}
                        className="text-blue-500 hover:underline"
                    >
                        Back
                    </button>
                    )}
                    <h3 className="text-lg font-semibold text-white">
                    {modalContent === "playlists" && "Playlists"}
                    {modalContent === "Audios" && "Audios"}
                    {modalContent === "Channels" && "Channels"}
                    {typeof modalContent === "object" && modalContent.name}
                    </h3>
                    <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-red-500 hover:"
                    >
                    Close
                    </button>
                </div>
                <div className="modal-body">
                    {modalContent === "playlists" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-scroll scrollbar-none"
                              style={{
                              maxHeight: "70vh",
                              overflowY: "auto",
                            }}
                      >
                          {/* Create New Playlist Card */}
                          <div>
                            <button
                              className="w-full h-40 flex items-center justify-center border-2 border-dashed border-gray-400 rounded-md text-gray-400 hover:text-white hover:border-white transition-colors"
                              onClick={() => setShowNewPlaylistModal(true)}
                            >
                              + Create New Playlist
                            </button>
                          </div>
                        {playlists.map((playlist) => {
                          const isOptionsOpen = modals.options === playlist._id;
                          const isUpdateOpen = modals.update === playlist._id;
                          const isDeleteOpen = modals.delete === playlist._id;

                          return (
                            <div key={playlist._id}>
                              {/* Options Button */}
                              <button
                                className="w-full bg-gray-800 text-white py-2 mb-2 rounded-md hover:bg-gray-700 transition-colors flex justify-center items-center font-semibold"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openModal("options", playlist._id);
                                }}
                              >
                                Playlist Options
                              </button>

                              {/* Options Modal */}
                              {isOptionsOpen && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                                  <div
                                    className="rounded-lg shadow-lg w-11/12 md:w-1/3 p-4 max-h-[60vh] overflow-y-auto scrollbar-none"
                                    style={{
                                      backgroundImage:
                                        "linear-gradient(to right bottom, #242424, #1d1d1d, #161616, #0d0d0d)",
                                    }}
                                  >
                                    <h4 className="text-lg font-semibold text-white mb-4">Playlist Options</h4>
                                    <div className="flex flex-col space-y-2">
                                      <button
                                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          closeModal("options");
                                          openModal("update", playlist._id);
                                        }}
                                      >
                                        Update
                                      </button>
                                      <button
                                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          closeModal("options");
                                          openModal("delete", playlist._id);
                                        }}
                                      >
                                        Delete
                                      </button>
                                      <button
                                        className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          closeModal("options");
                                        }}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Update Modal */}
                              {isUpdateOpen && (
                                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
                                  <div className="bg-white p-6 rounded-lg shadow-lg w-80">
                                    <h4 className="text-lg font-semibold mb-4">Update Playlist</h4>
                                    <input
                                      type="text"
                                      placeholder="New Playlist Name"
                                      defaultValue={playlist.name}
                                      className="w-full mb-3 p-2 border rounded"
                                      onChange={(event)=>{setUpdatedInfo({...updatedInfo, name: event.target.value})}}
                                    />
                                    <textarea
                                      placeholder="New Description"
                                      defaultValue={playlist.description}
                                      className="w-full mb-3 p-2 border rounded"
                                      onChange={(event)=>{setUpdatedInfo({...updatedInfo, description: event.target.value})}}
                                    />
                                    <div className="flex justify-between">
                                      <button
                                        className="bg-gray-300 text-black px-4 py-2 rounded-md hover:bg-gray-400"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          closeModal("update");
                                        }}
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          // Call the onUpdatePlaylist function
                                          onUpdatePlaylist(playlist._id);
                                          closeModal("update");
                                        }}
                                      >
                                        Save
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Delete Confirmation Modal */}
                              {isDeleteOpen && (
                                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
                                  <div className="bg-white p-6 rounded-lg shadow-lg">
                                    <h4 className="text-lg font-semibold mb-4">Delete Playlist</h4>
                                    <p className="mb-4">Are you sure you want to delete this playlist?</p>
                                    <div className="flex justify-between">
                                      <button
                                        className="bg-gray-300 text-black px-4 py-2 rounded-md hover:bg-gray-400"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          closeModal("delete");
                                        }}
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          // Call the onDeletePlaylist function
                                          onDeletePlaylist(playlist._id);
                                          closeModal("delete");
                                        }}
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Playlist Card */}
                              <div
                                onClick={() => {
                                  handlePlaylistOpen(playlist);
                                }}
                              >
                                <PlaylistCard playlist={playlist} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {modalContent === "Audios" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-scroll scrollbar-none"
                          style={{
                              maxHeight: "70vh",
                              overflowY: "auto",
                            }}
                      >
                        {content.map((audio, index) => {
                          const isOptionsOpen = audioModals.options === index;
                          const isDeleteOpen = audioModals.delete === index;

                          return (
                            <div key={index}>
                              {/* Options Button */}
                              {
                                previousContent === "playlists" && (
                                  <button
                                    className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400 mb-2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openAudioModal("options", index);
                                    }}
                                  >
                                    ...
                                  </button>
                                )
                              }

                              {/* Options Modal */}
                              {isOptionsOpen && (
                                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
                                  <div className="bg-white p-4 rounded-lg shadow-lg">
                                    <button
                                      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 w-full"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        closeAudioModal("options");
                                        openAudioModal("delete", index);
                                      }}
                                    >
                                      Delete
                                    </button>
                                    <button
                                        className="bg-gray-300 text-black px-4 py-2 rounded-md hover:bg-gray-400 mt-2 w-full"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          closeAudioModal("options"); // Close options modal
                                        }}
                                      >
                                        Cancel
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Delete Confirmation Modal */}
                              {isDeleteOpen && (
                                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
                                  <div className="bg-white p-6 rounded-lg shadow-lg">
                                    <h4 className="text-lg font-semibold mb-4">Delete Audio</h4>
                                    <p className="mb-4">Are you sure you want to delete this audio?</p>
                                    <div className="flex justify-between">
                                      <button
                                        className="bg-gray-300 text-black px-4 py-2 rounded-md hover:bg-gray-400"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          closeAudioModal("delete");
                                        }}
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          // Call the onDelete function
                                          onDeleteAudio(audio._id);
                                          closeAudioModal("delete");
                                        }}
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Audio Card */}
                              <AudioCard key={index} audio={audio} />
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {modalContent === "Channels" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-scroll scrollbar-none"
                              style={{
                              maxHeight: "70vh",
                              overflowY: "auto",
                            }}
                    >
                        {content.map((channel, index) => (
                          <div
                            key={index}
                            className="flex flex-col items-center p-4 rounded-md shadow-lg ring-1 ring-black/5 relative bg-[#2f3337bc]"
                          >
                            <img
                              src={channel.avatar}
                              alt={`${channel.fullName}'s profile`}
                              className="w-16 h-16 rounded-full mb-4 border-2 border-gray-700 shadow-md"
                            />
                            <h4 className="text-lg font-semibold text-gray-100">{channel.fullName}</h4>
                            <p className="text-gray-400">@{channel.username}</p>
                            <button
                              onClick={() => handleChannelOpen(channel)}
                              className="mt-2 px-4 py-2 bg-gray-800 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
                            >
                              View Channel
                            </button>
                          </div>

                        ))}
                    </div>
                    )}

                  {showNewPlaylistModal && (
                    <NewPlaylistModal
                      onClose={() => setShowNewPlaylistModal(false)}
                      onAddNewPlaylist={(newPlaylist) => {
                        setPlaylists([...playlists, newPlaylist]);
                        setShowNewPlaylistModal(false);
                      }}
                    />
                  )}
                </div>
            </div>
        </div>
        )}
    </>
  );
}
