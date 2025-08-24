import React, { useContext, useEffect, useState } from "react";
import axiosInstance from "../services/axiosInstance";
import NewPlaylistModal from "./newPlaylistModal";
import { Authcontext } from "../contextProvider";

const PlaylistModal = ({ onClose }) => {

  const {currentUser, currentAudio} = useContext(Authcontext);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [isNewPlaylistModalOpen, setIsNewPlaylistModalOpen] = useState(false);


  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const res = await axiosInstance.get(`/playlist/${currentUser._id}`);
        setPlaylists(res.data.message);
      } catch (err) {
        console.error(err);
      }
    };

    fetchPlaylists();
  }, []);

  const handleAddToPlaylist = async () => {
    if (selectedPlaylist) {

        try{
            const response = await axiosInstance.patch(`/playlist/add/${currentAudio.audio._id}/${selectedPlaylist._id}`)
        }
        catch(err){
            console.error(err)
        }
    }
  };

  const openNewPlaylistModal = () => {
    setIsNewPlaylistModalOpen(true);
  };

  const closeNewPlaylistModal = () => {
    setIsNewPlaylistModalOpen(false);
  };

  const handleNewPlaylistAdded = (newPlaylist) => {
    setPlaylists((prev) => [...prev, newPlaylist]);
    closeNewPlaylistModal();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-4">Select a Playlist</h2>
        <ul className="mb-4">
          {playlists.map((playlist) => (
            <li
              key={playlist.id}
              onClick={() => setSelectedPlaylist(playlist)}
              className={`cursor-pointer p-2 rounded text-black ${
                selectedPlaylist === playlist.name
                  ? "bg-slate-200 font-bold"
                  : "hover:bg-slate-100"
              }`}
            >
              {playlist.name}
            </li>
          ))}
        </ul>
        <button
          onClick={openNewPlaylistModal}
          className="w-full bg-green-500 text-white py-2 rounded-full mb-4"
        >
          Create New Playlist
        </button>
        <div className="flex justify-between">
          <button
            onClick={handleAddToPlaylist}
            className="bg-blue-500 text-white px-4 py-2 rounded-full"
          >
            Add
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-full"
          >
            Cancel
          </button>
        </div>
      </div>

      {isNewPlaylistModalOpen && (
        <NewPlaylistModal
          onClose={closeNewPlaylistModal}
          onAddNewPlaylist={handleNewPlaylistAdded}
        />
      )}
    </div>
  );
};

export default PlaylistModal;
