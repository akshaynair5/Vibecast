// SubscriberFormatter.jsx
import React from "react";

/**
 * Formats a number into a shortened format.
 * @param {number} num - The number to format.
 * @returns {string} - Formatted string like 1.2k, 1M, etc.
 */
const formatSubscribers = (num) => {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  } else if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  } else {
    return num.toString();
  }
};

/**
 * Subscribers Component
 * @param {Object} props
 * @param {number} props.subscribers - Number of subscribers
 */
const Subscribers = ({ subscribers }) => {
  return (
    <p className="text-sm text-gray-400">
      {formatSubscribers(subscribers || 0)} subscribers
    </p>
  );
};

export default Subscribers;
