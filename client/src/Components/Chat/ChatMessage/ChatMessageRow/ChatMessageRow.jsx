import { forwardRef, useRef, useEffect, useState } from "react";
import ChatSingleMessage from "../ChatSingleMessage/ChatSingleMessage";
import Toast from "../../../Toast/Toast";
import BeatLoader from "react-spinners/BeatLoader";
import { FaArrowDown } from "react-icons/fa";
import { GlobalStore } from "../../../../Store/Store";
import defaultUserImage from "../../../../Assets/Images/user_default.png";
import "./ChatMessageRow.style.scss";

const ChatMessageRow = forwardRef(
  (
    {
      messages,
      messageLen,
      userId,
      // readYn,
      searchText,
      visible,
      moveToBottom,
      scrollChatBody,
    },
    ref
  ) => {
    const userImage = undefined;
    const messageEndRef = useRef(null);
    const { isBoxVisible, handleVisible } = GlobalStore();

    const [showToast, setShowToast] = useState(false);
    const [copyError, setCopyError] = useState(null);
    const [isComplete, setIsComplete] = useState(false);
    const [renderCnt, setRenderCnt] = useState(0);

    // const isLastMessage = messages.length > 0 && messages.length === messageLen;

    const override = {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "calc(100vh - 143px)",
      background: "#cfe7e9",
    };

    if (copyError) console.log(copyError);

    /** 컴포넌트 마운트 시, 만약 찾기(finder) 컴포넌트가 활성화 되어있는 경우, 이를 닫도록 함 */
    useEffect(() => {
      if (isBoxVisible) handleVisible();
    }, []);

    /** 로딩 스피너, 서버에서 수신하는 메세지 여부(length)에 따라 처리 */
    useEffect(() => {
      if (renderCnt+2 >= messages.length) {
        if (messageEndRef.current && ref.current) {
          ref.current.scrollTop = ref.current.scrollHeight;
        }
        setTimeout(() => {
          setIsComplete(true);
        }, 100);
      }
    }, [renderCnt, messageLen]);

    /** 유저가 메세지를 입력하면, 최근 메세지 위치로 이동*/
    useEffect(() => {
      if (isComplete && messageEndRef.current) {
        messageEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, [messages]);

    /** 모바일에서 검색창 이외 영역 클릭 시, 검색창이 사라지도록 함, 컴포넌트 ChatSingleMessage, 함수 stopClickBubbling 와 기능 연결됨*/
    const clickFinderOff = () => {
      if (isBoxVisible) handleVisible();
    };

    const formatDate = (isoString) => {
      const date = new Date(isoString);
      const options = { 
        year: "numeric", 
        month: "long", 
        day: "numeric",
        weekday: "long"
      };
      return new Intl.DateTimeFormat("ko-KR", options).format(date);
    };

    // 새 메시지 시작 시, messages 에서 0번째 배열 pop 시켜서 균형을 맞춤
    if (messages.length > 1 && messages[0].id === "admin") {
      messages.shift();
    }

    const callbackHandler = () => {
      setRenderCnt((prev) => prev + 1);
    };

    return (
      <>
        {!isComplete && (
          <BeatLoader
            color={"#0DABC0"}
            loading={true}
            cssOverride={override}
            size={15}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        )}
        <main
          className={isBoxVisible ? "chat_message active" : "chat_message"}
          ref={ref}
          onScroll={scrollChatBody}
          onClick={clickFinderOff}
        >
          <h2 className="offscreen">채팅창 메세지 영역</h2>

          <ul className="list_message">
            {messages.map((message, i) => (
              <li key={i} className="item_message">
                <ChatSingleMessage
                  message={message}
                  userId={userId}
                  // readYn={readYn[i]}
                  userProfileImage={userImage || defaultUserImage}
                  searchText={searchText}
                  setShowToast={setShowToast}
                  setCopyError={setCopyError}
                  messageLen={messageLen}
                  index={i + 1}
                  callback={callbackHandler}
                />
                {message.code === 0 && message.date ? (
                  <p className="chat_date">{formatDate(message.date)}</p>
                ) : null}
              </li>
            ))}
          </ul>
          <div ref={messageEndRef}></div>
          {showToast && <Toast />}
          {visible && (
            <button type="button" className="top-btn" onClick={moveToBottom}>
              <span className="offscreen">top to bottom 버튼</span>
              <FaArrowDown />
            </button>
          )}
        </main>
      </>
    );
  }
);

export default ChatMessageRow;
