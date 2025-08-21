import React, { useState } from "react";

const Button1 = ({ content, active, onClick }) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  return (
    <button
      onClick={onClick}
      className={`text-[0.6rem] md:text-lg relative flex items-center justify-center text-sm font-medium rounded-full transition-all duration-300 shadow-sm
        ${active 
          ? "bg-gray-200 text-black px-5 py-2" 
          : "bg-[#0a0908] text-white hover:bg-gray-800 px-5 py-2"}
      `}
    >
      {content}
    </button>
  );
};

export default Button1;
