import React, { useState, useContext } from "react";
import { Authcontext } from "../contextProvider";
import axiosInstance from "../services/axiosInstance";
import { getFormattedCreationDate } from "../services/dateFormatter";

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
    <div className="bg-[#212529bc] p-4 rounded-lg shadow-md relative text-white flex flex-col justify-between min-w-[100%] max-w-[100%] max-h-[100%] z-10 mt-5">
      {/* Play Button and Duration */}
      <div className="absolute top-2 left-2 bg-gray-800 bg-opacity-75 text-white text-sm px-2 py-1 rounded-md">
        {durationInMinutes} min
      </div>
      {/* <button
        className="absolute top-2 right-2 bg-indigo-500 text-white rounded-full p-2 hover:bg-indigo-600"
        onClick={onPlay}
      >
        ▶
      </button> */}

      {/* Image */}
      <img
        src={`${audio.thumbnail}`}
        alt="Audio/Podcast"
        className="w-full h-40 object-cover rounded-md cursor-pointer"
        onClick={onPlay}
      />

      {/* Title and Description */}
      <h4 className="mt-2 text-lg font-semibold text-white-800 truncate">{truncateDescription(audio.title, 5)}</h4>
      <p className="text-sm text-gray-300 truncate">
        {truncateDescription(audio.description, 10)}
      </p>

      {/* Posted Date */}
      <p className="text-xs text-gray-300 mt-1">
        Posted on: {getFormattedCreationDate(audio)}
      </p>

      {/* Action Buttons */}
      <div className="flex justify-between mt-4 space-x-2">
        {onUpdate && (
          <button
            className="block w-full px-4 py-3 text-sm text-gray-100 bg-blue-600 hover:bg-blue-800 rounded-md transition-all"
            onClick={() => setShowUpdatePopup(true)}
          >
            Update
          </button>
        )}
        {onDelete && (
          <button
            className="block w-full px-4 py-3 text-sm text-gray-100 bg-red-600 hover:bg-red-800 rounded-md transition-all"
            onClick={() => setShowDeletePopup(true)}
          >
            Delete
          </button>
        )}
      </div>

      {/* Update and Delete Popups */}
      {showUpdatePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h4 className="text-lg font-semibold mb-4">Update Audio Info</h4>
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              value={updatedInfo.title}
              onChange={(e) =>
                setUpdatedInfo({ ...updatedInfo, title: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            <label className="block text-sm font-medium text-gray-700 mt-4">
              Description
            </label>
            <textarea
              value={updatedInfo.description}
              onChange={(e) =>
                setUpdatedInfo({ ...updatedInfo, description: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            <div className="mt-4 flex justify-end space-x-2">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                onClick={() => setShowUpdatePopup(false)}
              >
                Cancel
              </button>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                onClick={handleUpdate}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeletePopup && (
        <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-[1000]">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h4 className="text-lg font-semibold mb-4">Are you sure?</h4>
            <p className="text-sm text-gray-600">
              Do you really want to delete this audio? This action cannot be
              undone.
            </p>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                className="bg-gray-500 text-black px-4 py-2 rounded-md hover:bg-gray-600"
                onClick={() => setShowDeletePopup(false)}
              >
                Cancel
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
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
