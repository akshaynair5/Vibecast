import React from "react";

const Button1 = ({ content, activeSection, onClick, active }) => {
  return (
    <button
      className={`flex items-center justify-center text-sm px-[1px] py-[2px] rounded-3xl min-w-[5vw] transition-all duration-300 bg-gradient-to-r from-[#6a2c63] via-[#480a73] to-[#200132] text-white ${
        active ? "px-[1px] py-[2px]" : "px-[1px] py-[2px"
      }`}
      onClick={onClick}
    >
      <span
        className={`rounded-3xl px-4 py-2 ${
          active ? "" : "bg-[#0a0908]"
        } min-w-[98%]`}
      >
        {content}
      </span>
    </button>
  );
};

export default Button1;
