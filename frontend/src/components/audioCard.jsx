import React, { useState, useContext } from "react";
import { Authcontext } from "../contextProvider";
import axiosInstance from "../services/axiosInstance";
import { getFormattedCreationDate } from "../services/dateFormatter";
import { Mic, PlusCircle, XCircle, Upload } from "lucide-react";

const AudioCard = ({ audio, onUpdate, onDelete }) => {
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [updatedInfo, setUpdatedInfo] = useState({
    title: audio?.title,
    description: audio?.description,
  });
  const { setCurrentAudio } = useContext(Authcontext);

  const durationInMinutes = Math.floor(audio.duration / 60);

  // Truncate the description to a maximum of 15 words
  const truncateDescription = (description, wordLimit) => {
    const words = description?.split(" ");
    if (words?.length > wordLimit) {
      return `${words.slice(0, wordLimit).join(" ")}...`;
    }
    return description;
  };

  const handleUpdate = () => {
    onUpdate(updatedInfo, audio._id);
    setShowUpdatePopup(false);
  };

  const onPlay = async () => {
    try {
      setCurrentAudio({
        audio: null, 
        isPlaying: false, 
        progress: 0,
      });
      const audioDetails = await axiosInstance.get(`/video/${audio._id}`);
      setCurrentAudio({
        audio: { ...audio, ...audioDetails.data.data },
        isPlaying: true,
        progress: 0,
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      className="bg-[#212529bc] p-4 rounded-lg shadow-md relative text-white flex flex-col justify-between
        min-w-[80px] sm:min-w-[280px] md:min-w-[320px]
        w-full max-w-[380px]
        mt-5"
    >
      {/* Duration Badge */}
      <div className="absolute top-2 left-2 bg-gray-800 bg-opacity-75 text-white text-xs sm:text-sm px-2 py-0.5 sm:py-1 rounded-md">
        {durationInMinutes} min
      </div>

      {/* Thumbnail */}
      <img
        src={audio.thumbnail}
        alt="Audio/Podcast"
        className="w-full h-[8rem] sm:h-[10rem] md:h-[12rem] object-cover rounded-md cursor-pointer"
        onClick={onPlay}
      />

      {/* Title */}
      <h4 className="mt-2 text-base sm:text-lg font-semibold text-white line-clamp-1">
        {audio.title}
      </h4>

      {/* Description */}
      <p className="text-xs sm:text-sm text-gray-300 line-clamp-2">
        {audio.description}
      </p>

      {/* Posted Date */}
      <p className="text-xs text-gray-400 mt-1">
        Posted on: {getFormattedCreationDate(audio)}
      </p>

      {/* Action Buttons */}
      <div className="flex justify-between mt-3 space-x-2">
        {onUpdate && (
          <button
            className="block w-full px-3 py-2 text-xs sm:text-sm text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md transition-all"
            onClick={() => setShowUpdatePopup(true)}
          >
            Update
          </button>
        )}
        {onDelete && (
          <button
            className="block w-full px-3 py-2 text-xs sm:text-sm text-red-400 bg-gray-800 hover:bg-gray-700 rounded-md transition-all"
            onClick={() => setShowDeletePopup(true)}
          >
            Delete
          </button>
        )}
      </div>


      {/* Update and Delete Popups */}
      {showUpdatePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-900 text-white rounded-lg p-6 max-w-md w-full shadow-lg">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold">Update Audio Info</h4>
              <button onClick={() => setShowUpdatePopup(false)}>
                <XCircle size={22} className="text-gray-400 hover:text-gray-300 transition" />
              </button>
            </div>

            {/* Title Input */}
            <label className="block text-sm font-medium text-gray-300">Title</label>
            <input
              type="text"
              value={updatedInfo.title}
              onChange={(e) => setUpdatedInfo({ ...updatedInfo, title: e.target.value })}
              className="p-3 mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />

            {/* Description Input */}
            <label className="block text-sm font-medium text-gray-300 mt-4">Description</label>
            <textarea
              value={updatedInfo.description}
              onChange={(e) => setUpdatedInfo({ ...updatedInfo, description: e.target.value })}
              rows='4'
              className="p-4 mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />

            {/* Modal Buttons */}
            <div className="mt-6 flex justify-end space-x-[5%]">
              <button
                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition w-[48%]"
                onClick={() => setShowUpdatePopup(false)}
              >
                Cancel
              </button>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-500 transition w-[48%]"
                onClick={handleUpdate}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeletePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-900 text-white rounded-lg p-6 max-w-md w-full shadow-lg">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold">Are you sure?</h4>
              <button onClick={() => setShowDeletePopup(false)}>
                <XCircle size={22} className="text-gray-400 hover:text-gray-300 transition" />
              </button>
            </div>

            {/* Modal Content */}
            <p className="text-sm text-gray-500 mb-4">
              Do you really want to delete this audio? This action cannot be undone.
            </p>

            {/* Modal Buttons */}
            <div className="mt-6 flex justify-end space-x-[5%]">
              <button
                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition w-[48%]"
                onClick={() => setShowDeletePopup(false)}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-500 transition w-[48%]"
                onClick={() => {
                  onDelete(audio._id);
                  setShowDeletePopup(false);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AudioCard;
