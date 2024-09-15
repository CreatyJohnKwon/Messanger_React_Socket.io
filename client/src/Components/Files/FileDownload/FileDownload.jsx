import React from "react";
import { GlobalStore } from "../../../Store/Store";
import "./FileDownload.style.scss";

export const handleDownload = (fileNm, fileUrl) => {
  fetch(fileUrl, { mode: "no-cors" })
    .then((response) => response.blob())
    .then((blob) => {
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileNm);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    })
    .catch((error) => console.error("Download failed", error));
};

const FileDownload = ({ fileNm }) => {
  const { platform } = GlobalStore();

  return (
    <button type="button" className="button_download">
      <span className="offscreen">{`${fileNm} 다운로드 버튼`}</span>
    </button>
  );
};

export default FileDownload;
