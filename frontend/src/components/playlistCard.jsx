import React, { useEffect } from "react";
import { getFormattedCreationDate } from "../services/dateFormatter";

const PlaylistCard = ({ playlist, onPlay, onUpdate, onDelete }) => {
  const { name, description, videoList, createdAt } = playlist;
  useEffect(()=>{
    console.log(playlist)
  },[])
  
  // Limit thumbnails to a maximum of 4
  const thumbnails = videoList.slice(0, 4).map((video) => video.thumbnail);

  const combinedThumbnails = () => {
    return (
      <div className="grid grid-cols-2 gap-1 w-full h-40">
        {thumbnails.map((thumbnail, index) => (
          <img
            key={index}
            src={thumbnail}
            alt={`Thumbnail ${index + 1}`}
            className="object-cover w-full h-full rounded-md"
          />
        ))}
        {/* Placeholder if there are less than 4 thumbnails */}
        {Array(4 - thumbnails.length)
          .fill(null)
          .map((_, index) => (
            <div
              key={`placeholder-${index}`}
              className="bg-gray-500 w-full h-full rounded-md"
            ></div>
          ))}
      </div>
    );
  };

  const truncateDescription = (description, wordLimit) => {
    const words = description.split(" ");
    if (words.length > wordLimit) {
      return `${words.slice(0, wordLimit).join(" ")}...`;
    }
    return description;
  };

  return (
    <div className="p-4 rounded-lg relative text-black z-10 bg-[#2f3337bc]">
      {/* Combined Thumbnails */}
      {combinedThumbnails()}

      {/* Playlist Name */}
      <h4 className="mt-2 text-lg font-semibold text-gray-200">{name}</h4>

      {/* Playlist Description */}
      <p className="text-sm text-gray-300">
        {truncateDescription(description, 15)}
      </p>

      {/* Posted Date */}
      <p className="text-xs text-gray-500 mt-1">
        Created on: {getFormattedCreationDate({ createdAt })}
      </p>

      {/* Action Buttons */}
      <div className="flex justify-between mt-4">
        {onPlay && (
          <button
            className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600"
            onClick={() => onPlay(playlist)}
          >
            Play All
          </button>
        )}
        {onUpdate && (
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            onClick={() => onUpdate(playlist._id)}
          >
            Update
          </button>
        )}
        {onDelete && (
          <button
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
            onClick={() => onDelete(playlist._id)}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default PlaylistCard;