import React from "react";

const Button1 = ({ content, activeSection, onClick, active }) => {
  return (
    <button
      className={`flex items-center justify-center text-sm px-[1px] py-[2px] rounded-3xl min-w-[5vw] transition-all duration-300 bg-gray-400 shadow-b-lg text-black ${
        active ? "px-[1px] py-[2px]" : "px-[1px] py-[2px"
      }`}
      onClick={onClick}
    >
      <span
        className={`rounded-3xl px-4 py-2 ${
          active ? "" : "bg-[#0a0908] text-white"
        } min-w-[98%]`}
      >
        {content}
      </span>
    </button>
  );
};

export default Button1;
