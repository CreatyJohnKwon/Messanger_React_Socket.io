import { useState, useRef, useEffect } from "react";
import { useSocket } from "../../../Socket/SocketContext";
import ChatTitle from "./ChatTitle/ChatTitle";
import ChatUtil from "./ChatUtil/ChatUtil";
import Finder from "../../Finder/Finder";
import { GlobalStore } from "../../../Store/Store";
import "./ChatTop.style.scss";

function ChatTop({ onSearch, setMessage, room, userId }) {
  const [isMute, setIsMute] = useState(false);
  const finderInput = useRef(null);
  const socket = useSocket();
  const { isBoxVisible, handleVisible, roomNm } = GlobalStore();

  useEffect(() => {
    if (finderInput.current) {
      // finderInput.current.focus();
    }
  }, [isBoxVisible]);

  useEffect(() => {
    socket.emit("room_notification", {
      isNotified: false,
      isFirst: true,
      room,
      userId,
    });

    socket.on("inter_room_notification", (data) => {
      setIsMute(data.isItMute);
    });
  }, [socket]);

  const handleMuteAlert = () => {
    setIsMute((prev) => {
      if (!prev) {
        socket.emit("room_notification", {
          isNotified: true,
          isFirst: false,
          room,
          userId,
        });
      } else {
        socket.emit("room_notification", {
          isNotified: false,
          isFirst: false,
          room,
          userId,
        });
      }
      return !prev;
    });
  };

  const menuData = {
    mute: { isMute, handleMuteAlert },
    visible: { handleVisible },
  };

  return (
    <>
      <h1 className="offscreen">채팅방,{roomNm}</h1>
      <div className="chat_top" id="section_top">
        <nav className="chat_navigation">
          <h2 className="offscreen">채팅창 네비게이션</h2>
          <ChatTitle path={"/"} />
          <ChatUtil menuData={menuData} setMessage={setMessage} />
        </nav>
        {isBoxVisible && <Finder ref={finderInput} onSearch={onSearch} />}
      </div>
    </>
  );
}

export default ChatTop;
