import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useSocket } from "../../Socket/SocketContext";
import PrevButton from "../Button/PrevButton/PrevButton";
import Files from "./FilesList/Files";
import { GlobalStore } from "../../Store/Store";
import "./FileContainer.style.scss";

function FileContainer() {
  const location = useLocation();
  const socket = useSocket();

  const { 
    roomNm, 
    setFilesBox, 
    filesBox,
    roomCd
  } = GlobalStore();

  useEffect(() => {
    setFilesBox([]);

    socket.emit("req_filebox", {roomCd});

    socket.on("res_filebox", (fileBox) => {
      setFilesBox(fileBox);
    });

    return () => {
      socket.off("req_filebox");
      socket.off("res_filebox");
    };
  }, []);

  const {
    state: {
      fileRoomInfo: { pathPrev },
    },
  } = location;

  return (
    <div className="fileContainer">
      <PrevButton path={pathPrev} title={roomNm} />
      <Files filesBox={filesBox} />
    </div>
  );
}

export default FileContainer;
