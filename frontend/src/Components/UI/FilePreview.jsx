import React from "react";
import { AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";

import ProgressCircle from "./ProgressCircle";

const getFileIcon = (fileName) => {
  const ext = fileName.split(".").pop().toLowerCase();

  if (ext === "pdf") return "https://cdn-icons-png.flaticon.com/512/337/337946.png";
  if (["doc", "docx"].includes(ext)) return "https://cdn-icons-png.flaticon.com/128/888/888883.png";
  if (["png", "jpg", "jpeg"].includes(ext)) return "https://cdn-icons-png.flaticon.com/512/136/136524.png";

  return "https://cdn-icons-png.flaticon.com/512/716/716784.png";
};

export default function FilePreview({ file, progress, onRemove }) {
  const isDone = progress >= 100;

  return (
    <div className="mt-3 flex items-center justify-between p-3 bg-gray-50 border rounded-xl shadow-sm transition">
      <div className="flex items-center gap-4">
        <div className="w-[55px] h-[55px] flex justify-center items-center">
          <AnimatePresence>{!isDone && <ProgressCircle progress={progress} />}</AnimatePresence>
          <AnimatePresence>
            {isDone && (
              <img
                src={getFileIcon(file.name)}
                alt="file"
                className="w-10 h-10 opacity-90"
              />
            )}
          </AnimatePresence>
        </div>

        <div>
          <p className="font-medium text-gray-800">{file.name}</p>
          <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
        </div>
      </div>

      <button onClick={onRemove} className="text-gray-500 hover:text-red-600 text-2xl">
        <IoClose />
      </button>
    </div>
  );
}
