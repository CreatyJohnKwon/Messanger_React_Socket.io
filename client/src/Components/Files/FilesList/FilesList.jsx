import { useRef, useEffect } from "react";
import FileDownload from "../FileDownload/FileDownload";
import { GlobalStore } from "../../../Store/Store";
import { handleDownload } from "../FileDownload/FileDownload";
import Image from "../../Image/Image";
import PDF from "../../../Assets/Images/file_pdf.svg";
import IMG from "../../../Assets/Images/file_img.svg";
import XLS from "../../../Assets/Images/file_xls.svg";
import ETC from "../../../Assets/Images/file_etc.svg";
import "./FilesList.style.scss";

function FilesList({ file, index }) {
  const refs = useRef([]);
  const prevWidth = useRef(window.innerWidth);
  const [fileName, fileType] = file[index].fileNm.split(".");
  const { platform } = GlobalStore();

  const handleResizeLogic = (screenWidth) => {
    refs.current.forEach((ref) => {
      if (!ref) return;

      let maxWidth;

      if (screenWidth <= 376) {
        maxWidth = 224;
      } else if (screenWidth <= 385) {
        maxWidth = 235;
      } else if (screenWidth <= 394) {
        maxWidth = 249;
      } else if (screenWidth <= 415) {
        maxWidth = 260;
      } else if (screenWidth <= 421) {
        maxWidth = 270;
      } else if (screenWidth <= 431) {
        maxWidth = 289;
      } else if (screenWidth <= 480) {
        maxWidth = 290;
      } else if (screenWidth <= 590) {
        maxWidth = 360;
      } else if (screenWidth === 600) {
        maxWidth = 360;
      } else {
        maxWidth = 360;
      }

      ref.style.width = "";
      ref.style.width = ref.offsetWidth > maxWidth ? `${maxWidth}px` : "";
      ref.style.overflow = "hidden";
      ref.style.textOverflow = "ellipsis";
      ref.style.whiteSpace = "nowrap";
    });
  };

  const handleResize = () => {
    const screenWidth = window.innerWidth;
    handleResizeLogic(screenWidth);
    prevWidth.current = screenWidth;
  };

  useEffect(() => {
    handleResizeLogic(window.innerWidth);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const renderContent = (fileType) => {
    switch (fileType) {
      case "pdf":
        return PDF; // pdf 아이콘 소스

      case "jpg":
      case "png":
      case "jpeg":
      case "gif":
      case "tiff":
      case "psd":
      case "bmp":
        // case "svg":
        // case "svg+xml":
        return IMG; // image 아이콘 소스

      case "xls":
      case "xlsx":
      case "xlsm":
      case "xlsb":
      case "xltx":
      case "haansoftxlsx":
        return XLS; // xlsc 및 엑셀 아이콘 소스

      // case 'mp4':
      // case 'mov':
      // case 'wmv':
      // case 'avi':
      // case 'avchd':
      // case 'mkv':
      // case 'flv':
      // case 'f4v':
      // case 'swf':
      //   return VIDEO // error 아이콘 소스

      default:
        return ETC; // etc 아이콘 소스
    }
  };

  const downClicked = () => {
    if (platform === "aos") {
      window.AOS.downLoadFile(file[index].fileUrl, file[index].fileNm);
    } else if (platform === "ios") {
      window.webkit.messageHandlers.downLoadFile.postMessage({
        url: file[index].fileUrl,
        name: file[index].fileNm,
      });
    } else {
      handleDownload(file[index].fileNm, file[index].fileUrl);
    }
  };

  return (
    <li key={index} className="item_savedFiles" onClick={() => downClicked()}>
      <div className="item_savedFile">
        <div className="item_FileType">
          <Image
            srcValue={renderContent(file[index].fileType)}
            altValue={`${file[index].fileNm}의 아이콘`}
          />
        </div>
        <p className="text_downFile">
          <span className="offscreen">파일명,</span>
          <span
            className="text_fileName"
            ref={(el) => (refs.current[index] = el)}
          >
            {fileName}
          </span>
          .<span className="text_fileType">{fileType}</span>
        </p>
      </div>
      <FileDownload fileNm={file[index].fileNm} />
    </li>
  );
}

export default FilesList;
