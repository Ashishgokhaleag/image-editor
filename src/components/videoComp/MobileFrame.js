import React from "react";
import Camera from "../../assets/camera.png";

const MobileFrame = ({ children, isDarkMode }) => {
  return (
    <div className="relative mx-auto">
      <div className="relative w-full max-w-[320px] max-auto">
        {/* Phone frame */}
        <div className="rounded-[40px] overflow-hidden shadow-xl bg-[#000005] border-[#000005] border-[12px] border-gray-800 relative">
          {/* Notch */}
          <div className="absolute top-0 inset-x-0 h-8 w-40 left-[25%] bg-black z-10 flex justify-center items-center rounded-bl-[20px] rounded-br-[20px]">
            <div className="absolute w-40 h-[-30px] bg-[#000005] rounded-b-[14px]"></div>
            <div className="w-16 h-[4px] bg-gray-800 mb-3 rounded-full mt-3"></div>
            <img src={Camera} className="w-[12px] ml-2  h-[12px]" alt="lance" />
          </div>

          {/* Screen contant */}
          <div
            className={`${
              isDarkMode ? "bg-gray-900" : "bg-gray-100"
            } w-full h-[600px] overflow-hidden`}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileFrame;
