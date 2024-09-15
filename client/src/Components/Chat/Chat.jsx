import ChatTop from "./ChatTop/ChatTop";
import ChatBottom from "./ChatBottom/ChatBottom";
import ChatMessageRow from "./ChatMessage/ChatMessageRow/ChatMessageRow";
import "./Chat.style.scss";

import { useCallback, useState, useEffect, useRef } from "react";
import { useSocket } from "../../Socket/SocketContext";
import { SERVER_IP } from "../../Store/.IPdata";
import { GlobalStore } from "../../Store/Store";

function Chat({ bs, ba, ss, sa, tt, ph, rec, ib }) {
  const socket = useSocket();
  const chatContainerRef = useRef(null);
  const howFarScrolledUpRef = useRef(null);

  // 서버로 데이터 전송
  const [readArr, setReadArr] = useState("");
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [messageLen, setMessageLen] = useState(0);
  const [fileInfo, setFileInfo] = useState(null);
  const [searchText, setSearchText] = useState("");

  // 버튼 bottom scroll
  // const [clientHeight, setClientHeight] = useState(0);
  const [scrollHeight, setScrollHeight] = useState(0);
  const [thresholdValue, setThresholdValue] = useState(0);
  const [isButtonVisible, setIsButtonVisible] = useState(false);

  const {
    setRoomMembers,
    setRoomData,
    roomCd,
    mstId,
    userId,
    userNm,
    tabIndex,
  } = GlobalStore();

  useEffect(() => {
    socket.emit("join_room", {
      roomCd,
      mstId,
      userId,
      userNm,
      tabIndex,
    });

    const handleMessagesInfo = async (message) => {
      setMessages((prevMessages) => [...prevMessages, ...message]);
      if (messages) {
        setMessageLen(message[0].len);
      } else setMessageLen(0);
      socket.off("messages_info", handleMessagesInfo);
    };

    const handleMessageInfo = async (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
      if (messages) {
        setMessageLen(message.len);
      } else setMessageLen(0);
    };

    const handleNewMstId = async (data) => {
      setReadArr(data);
    };

    const handleLeaveRoom = () => {
      socket.emit("leave_room", { userNm, roomCd });
    };

    socket.on("res_room_data", (data) => {
      setRoomData(data[0]);
    });

    socket.on("room_members", (data) => {
      setRoomMembers(data);
    });

    socket.on("messages_info", handleMessagesInfo);
    socket.on("message_info", handleMessageInfo);
    socket.on("set_read_arr", handleNewMstId);

    // 창이 꺼지면 방에서 나가게 됨
    window.addEventListener("beforeunload", handleLeaveRoom);

    return () => {
      socket.off("message_info", handleMessageInfo);
      socket.off("set_read_arr", handleNewMstId);
      socket.off("room_members");
      socket.off("res_room_data");
      // 해당 함수를 반환 해주는 로직(다른 컴포넌트에서 적용 안되게 하기 위하여)
      window.removeEventListener("beforeunload", handleLeaveRoom);
    };
  }, [roomCd, mstId, userId, userNm]);

  /** function of send Message to Message */
  const sendMessage = ({ event, file, isText }) => {
    const now = new Date();

    if (event || message) {
      /** init event */
      event.preventDefault();
      /** emit server for Insert to DB */
      socket.emit(
        "send_message",
        {
          message,
          userNm,
          userId,
          roomCd,
          isText,
          time: formatTime(now),
          tabIndex,
        },
        (response) => {
          if (response.code === 200) {
            setMessage("");
          } else {
            alert("메시지 전송 실패");
          }
        }
      );
    } else {
      socket.emit(
        "send_message",
        {
          file,
          userNm,
          userId,
          roomCd,
          isText,
          time: formatTime(now),
          tabIndex,
        },
        (response) => {
          if (response.code === 200) {
            setMessage("");
          } else {
            alert("메시지 전송 실패");
          }
        }
      );
    }
  };

  /** get files from <Input> component */
  const uploadFile = (file) => {
    return new Promise((resolve, reject) => {
      const fileNm = file.name;
      const fileSize = file.size;
      const fileType = file.type;

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("fileNm", fileNm);
        formData.append("fileSize", fileSize);
        formData.append("fileType", fileType);
        formData.append("mstId", mstId);

        fetch(`${SERVER_IP}upload`, {
          method: "POST",
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            resolve(data);
            setFileInfo(data);
          })
          .catch((error) => {
            reject(error);
          });
      } else {
        reject(new Error("No file provided"));
      }
    });
  };

  const formatTime = (date) => {
    // 시간을 12시간제로 변환
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";

    // 12시간제로 변환된 시간을 얻기 위해 12로 나머지 연산을 수행
    const formattedHours = hours % 12 || 12; // 0을 12로 변환
    const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;

    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  /** 채팅 메세지 영역에서 스크롤 이벤트 & topToButton의 보임/안보임 처리*/
  const handleScroll = useCallback((e) => {
    let chatMessageContainerHeight;
    let bottomLinePositionValue;

    const element = e.target; // 채팅 메세지 영역(.chat_message)
    const scrollTop = element.scrollTop; // 채팅 메세지 영역이 전체에서 얼만큼 "내려온 상태"인지
    const scrollHeight = element.scrollHeight; // "전체" 채팅 메세지 높이
    const thresholdValue = scrollHeight * 0.05; // topToButton이 보여지고 사라질 "기준 값"

    setScrollHeight(scrollHeight);
    setThresholdValue(thresholdValue);

    if (chatContainerRef.current) {
      if (typeof chatContainerRef.current.offsetHeight === "number") {
        chatMessageContainerHeight = chatContainerRef.current.offsetHeight; // "화면에서 보여지는" 채팅 메세지 영역높이
        bottomLinePositionValue = chatMessageContainerHeight + scrollTop; // 채팅 메세지 영역의 가장 끝 값, 스킄롤 기준이 바닥(bottom)에서 위(top)로 계산이기 때문
      }
    }

    // 얼마나 스크롤 가능한지-화면에서 보이는 채팅 메세지 영역이 전체 채팅 메세지 영역에서
    // 채팅 영역을 스크롤 하는 것 = 전체 채팅 메세지 영역에서 화면에서 보이는 채팅 메세지 영역을 제외하고 남음 영역을 스크롤
    howFarScrolledUpRef.current = scrollHeight - bottomLinePositionValue;

    if (thresholdValue <= howFarScrolledUpRef.current) {
      setIsButtonVisible(true);
    } else {
      setIsButtonVisible(false);
    }
  }, []);

  /** topToButton버튼 클릭 시, 스크롤 처리 */
  const handleToBottom = useCallback(() => {
    if (howFarScrolledUpRef.current > thresholdValue) {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({
          top: scrollHeight,
          behavior: "smooth",
        });
      }
    }
  }, [scrollHeight, thresholdValue]);

  return (
    messages &&
    messages.length > 0 && (
      <>
        <ChatTop
          room={roomCd}
          userId={userId}
          onSearch={setSearchText}
          setMessage={setMessage}
        />
        <ChatMessageRow
          fileInfo={fileInfo}
          // readYn={readArr}
          messages={messages}
          messageLen={messageLen}
          userId={userId}
          ref={chatContainerRef}
          searchText={searchText}
          visible={isButtonVisible}
          scrollChatBody={handleScroll}
          moveToBottom={handleToBottom}
        />
        <ChatBottom
          bs={bs}
          ba={ba}
          ss={ss}
          sa={sa}
          tt={tt}
          ph={ph}
          rec={rec}
          ib={ib}
          message={message}
          setMessage={setMessage}
          sendMessage={sendMessage}
          uploadFile={uploadFile}
        />
      </>
    )
  );
}

export default Chat;
