import { useState, useEffect, useContext } from "react";
import axiosInstance from "../services/axiosInstance";
import { Authcontext } from "../contextProvider";

function AddToPlaylistModal({ isOpen, onClose, musicId }) {
  const { currentUser } = useContext(Authcontext);
  const [playlists, setPlaylists] = useState([]);

  // fetch playlists only when modal is open
  useEffect(() => {
    const fetchPlaylists = async () => {
      if (!isOpen) return;
      try {
        const res = await axiosInstance.get(`/playlist/${currentUser._id}`);
        setPlaylists(res.data.message || []);
      } catch (err) {
        console.log(err);
      }
    };
    fetchPlaylists();
  }, [isOpen, currentUser]);

  const handleAddToPlaylist = async (playlistId) => {
    try {
      const res = await axiosInstance.patch(`/playlist/add/${musicId}/${playlistId}`);
      onClose(); // close modal after adding
    } catch (err) {
      console.log(err);
    }
  };

  if (!isOpen) return null;

return (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30">
    <div
      className="rounded-lg shadow-lg w-11/12 md:w-1/2 p-4 max-h-[70vh] overflow-y-auto scrollbar-none"
      style={{
        backgroundImage:
          "linear-gradient(to right bottom, #242424, #1d1d1d, #161616, #0d0d0d)",
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center pb-2 mb-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white">Add Audio</h3>
      </div>

      {/* Body */}
      <div className="modal-body">
        {playlists.length === 0 ? (
          <p className="text-gray-400">No playlists available</p>
        ) : (
          <ul className="space-y-2">
            {playlists.map((playlist, index) => (
              <li key={playlist._id}>
                <button
                  className="w-full flex items-center px-4 py-2 rounded-md bg-[#2f3337bc] hover:bg-[#3b3f44] text-left transition"
                  onClick={() => handleAddToPlaylist(playlist._id)}
                >
                  <span className="text-gray-400 mr-3">{index + 1}.</span>
                  <span className="text-gray-100 font-medium">{playlist.name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-end mt-4">
        <button
          className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
);
}

export default AddToPlaylistModal;