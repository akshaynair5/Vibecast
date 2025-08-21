import React, { useState } from "react";
import axiosInstance from "../services/axiosInstance";

const NewPlaylistModal = ({ onClose, onAddNewPlaylist }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreatePlaylist = async () => {
    try {
      const res = await axiosInstance.post("/playlist", { name: name, description: description });
      console.log(res.data);
      onAddNewPlaylist(res.data.message);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center text-black z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80">
        <h2 className="text-xl font-semibold mb-4">Create New Playlist</h2>
        <input
          type="text"
          placeholder="Playlist Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border mb-4 p-2 rounded"
        />
        <textarea
          placeholder="Playlist Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border mb-4 p-2 rounded"
        />
        <div className="flex justify-between">
          <button
            onClick={handleCreatePlaylist}
            className="bg-blue-500 text-white px-4 py-2 rounded-full"
          >
            Create
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-full"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewPlaylistModal;
