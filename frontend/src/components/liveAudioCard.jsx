import React, { useState, useContext } from "react";
import { Authcontext } from "../contextProvider";
import axiosInstance from "../services/axiosInstance";
import { getFormattedCreationDate } from "../services/dateFormatter";

const StreamCard = ({ stream, onUpdate, onDelete }) => {
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [updatedInfo, setUpdatedInfo] = useState({
    title: stream?.title,
    description: stream?.description,
  });
  const { setCurrentLiveStream, setCurrentRemoteAudio, currentUser } = useContext(Authcontext);

  const truncateDescription = (description, wordLimit) => {
    const words = description.split(" ");
    if (words.length > wordLimit) {
      return `${words.slice(0, wordLimit).join(" ")}...`;
    }
    return description;
  };

  const handleUpdate = () => {
    onUpdate(updatedInfo, stream._id);
    setShowUpdatePopup(false);
  };

  const onWatch = async () => {
    if(currentUser._id === stream.owner){
        try {
            setCurrentLiveStream(null);
            const streamDetails = await axiosInstance.get(`/stream/${stream._id}`);
            setCurrentLiveStream(streamDetails.data.data);
            
        } catch (error) {
          console.log(error);
        }
    }
    else{
        try {
            setCurrentRemoteAudio(null);
            console.log(stream._id)
            const streamDetails = await axiosInstance.get(`/stream/${stream._id}`);
            setCurrentRemoteAudio(streamDetails.data.data);
        } catch (error) {
          console.log(error);
        }
    }
  };

  return (
    <div
      className={`p-4 rounded-lg shadow-md relative z-10 ${
        stream.status ? "bg-[#212529bc]" : "bg-[#131314bc]"
      } text-white flex flex-col justify-between min-w-[100%] max-w-[100%] max-h-[100%] z-10 mt-5`}
    >
      {/* Live Status Badge */}
      {stream.status && (
        <div className="absolute top-2 left-2 flex items-center bg-red-500 text-white text-sm px-2 py-1 rounded-md">
          <span className="animate-pulse mr-2 h-2 w-2 bg-white rounded-full"></span>
          Live
        </div>
      )}


      {/* Thumbnail */}
      <img
        src={`${stream.thumbnail}`}
        alt="Live Stream"
        className={`w-full h-40 object-cover rounded-md cursor-pointer ${
          stream.status ? "" : "grayscale"
        }`}
        onClick={onWatch}
      />

      {/* Title and Description */}
      <h4 className="mt-2 text-lg font-semibold text-gray-200">
        {truncateDescription(stream.title, 5)}
      </h4>
      <p className="text-sm text-gray-300">
        {truncateDescription(stream.description, 10)}
      </p>

      {/* Posted Date */}
      <p className="text-xs text-gray-400 mt-1">
        Scheduled on: {getFormattedCreationDate(stream)}
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

      {/* Update Popup */}
      {showUpdatePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h4 className="text-lg font-semibold mb-4">Update Stream Info</h4>
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              value={updatedInfo.title}
              onChange={(e) =>
                setUpdatedInfo({ ...updatedInfo, title: e.target.value })
              }
              className="text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            <label className="block text-sm font-medium text-gray-700 mt-4">
              Description
            </label>
            <textarea
              value={updatedInfo.description}
              onChange={(e) =>
                setUpdatedInfo({ ...updatedInfo, description: e.target.value })
              }
              className="text-black mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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

      {/* Delete Popup */}
      {showDeletePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h4 className="text-lg font-semibold mb-4">Are you sure?</h4>
            <p className="text-sm text-gray-600">
              Do you really want to delete this stream? This action cannot be
              undone.
            </p>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                onClick={() => setShowDeletePopup(false)}
              >
                Cancel
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                onClick={() => {
                  onDelete(stream._id);
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

export default StreamCard;
