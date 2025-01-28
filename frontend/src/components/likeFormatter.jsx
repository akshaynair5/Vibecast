import React from 'react';

/**
 * Formats a number into a shortened format.
 * @param {number} num - The number to format.
 * @returns {string} - The formatted number as a string.
 */
const formatNumber = (num) => {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  } else if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
  } else {
    return num.toString();
  }
};

/**
 * Likes Component
 * @param {Object} props - Component props.
 * @param {number} props.likes - The number of likes.
 */
const Likes = ({ likes }) => {
  return (
    <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
      {formatNumber(likes)} Likes
    </div>
  );
};

export default Likes;
