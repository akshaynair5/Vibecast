import React, { useEffect } from "react";
import { getFormattedCreationDate } from "../services/dateFormatter";

const PlaylistCard = ({ playlist, onPlay, onUpdate, onDelete }) => {
  const { name, description, videoList, createdAt } = playlist;

  useEffect(() => {
    console.log(playlist);
  }, [playlist]);

  // Limit thumbnails to a maximum of 4
  const safeVideoList = videoList || [];
  const thumbnails =
    safeVideoList.length > 4
      ? safeVideoList.slice(0, 4).map((video) => video.thumbnail)
      : safeVideoList.map((video) => video.thumbnail);

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

  // Truncate text for consistent card size
  const truncateText = (text, maxLength) => {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  return (
    <div className="p-4 rounded-lg relative text-black z-10 bg-[#2f3337bc] flex flex-col justify-between h-full cursor-pointer">
      {/* Combined Thumbnails */}
      {combinedThumbnails()}

      {/* Playlist Name */}
      <h4
        className="mt-2 text-lg font-semibold text-gray-200 truncate"
        title={name}
      >
        {truncateText(name, 10)}
      </h4>

      {/* Playlist Description */}
      <p
        className="text-sm text-gray-300 mt-1 line-clamp-3"
        title={description}
      >
        {truncateText(description, 10)}
      </p>

      {/* Posted Date */}
      <p className="text-xs text-gray-500 mt-1">
        Created on: {getFormattedCreationDate({ createdAt })}
      </p>

      {/* Action Buttons */}
      <div className="flex justify-between mt-4 flex-wrap gap-2">
        {onPlay && (
          <button
            className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 text-xs sm:text-sm flex-1"
            onClick={() => onPlay(playlist)}
          >
            Play All
          </button>
        )}
        {onUpdate && (
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 text-xs sm:text-sm flex-1"
            onClick={() => onUpdate(playlist._id)}
          >
            Update
          </button>
        )}
        {onDelete && (
          <button
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 text-xs sm:text-sm flex-1"
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