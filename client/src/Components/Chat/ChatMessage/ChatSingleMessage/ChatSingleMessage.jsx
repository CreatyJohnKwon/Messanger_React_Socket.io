import { useLayoutEffect, useRef, useEffect, useState } from "react";
import { handleDownload } from "../../../Files/FileDownload/FileDownload";
import Profile from "../../../Profile/Profile";
import { GlobalStore } from "../../../../Store/Store";
import "./ChatSingleMessage.style.scss";

function ChatSingleMessage({
  message: { txt, id, user, isRead, time, isText, file },
  userId,
  // readYn,
  userProfileImage,
  searchText,
  setShowToast,
  callback,
}) {
  const messageTextRef = useRef(null);
  const messageActionRef = useRef(null);
  const userImageRef = useRef(null);
  const [showCopyText, isShowCopyText] = useState(false);
  const [imgRender, setImgRender] = useState(false);
  const [hasCalledCallback, setHasCalledCallback] = useState(false);
  const { platform } = GlobalStore();

  let isSentByCurrentUser = false;
  let trimmedName;
  let trimmeduserId;
  let trimmedText;
  let isImg = false;

  /* 잠깐 사용 안함 */
  let chatRead = "";
  // let chatRead = isRead === "Y" ? "읽음" : "안읽음"
  // if (readYn) chatRead = readYn === "Y" ? "읽음" : "안읽음"

  if (user && userId) {
    trimmedName = user.trim().toLowerCase();
    trimmeduserId = userId.trim().toLowerCase();
  }

  if (id === trimmeduserId) {
    isSentByCurrentUser = true;
  }

  if (file) {
    trimmedText = !isText ? file.fileNm : txt;

    if (!isText) {
      isImg = [
        "jpg",
        "png",
        "jpeg",
        "gif",
        "tiff",
        "psd",
        "bmp",
        // "svg",
        // "svg+xml",
        "image/jpg",
        "image/png",
        "image/jpeg",
        "image/gif",
        "image/tiff",
        "image/psd",
        "image/bmp",
        // "image/svg",
        // "svg+xml",
      ].includes(file.fileType);
    }
  } else {
    trimmedText = !isText ? file.fileNm : txt;
  }

  // Call callback when the component has fully rendered
  useEffect(() => {
    if (!hasCalledCallback) {
      if (isImg) {
        if (imgRender) {
          callback();
          setHasCalledCallback(true);
        }
      } else {
        callback();
        setHasCalledCallback(true);
      }
    }
  }, [imgRender, hasCalledCallback]);

  useLayoutEffect(() => {
    if (messageTextRef.current && messageActionRef.current) {
      const messageTextHeight = messageTextRef.current.offsetHeight;
      messageActionRef.current.style.top = `${messageTextHeight + 15}px`;
    }
  }, [trimmedText]);

  /** 검색컴포넌트, 일치된 텍스트에 background를 설정 및 스크롤 이동 */
  useEffect(() => {
    if (messageTextRef.current) {
      let formattedText = trimmedText.replace(/\n/g, "<br>");
      if (searchText && trimmedText.includes(searchText)) {
        const matched = formattedText.split(
          new RegExp(`(${searchText})`, "gi")
        );
        const highlightedText = matched
          .map((part, index) =>
            part.toLowerCase() === searchText.toLowerCase()
              ? `<mark style="background-color: yellow">${part}</mark>`
              : part
          )
          .join("");

        messageTextRef.current.innerHTML = highlightedText;
        messageTextRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      } else {
        messageTextRef.current.innerHTML = formattedText;
      }
    }
  }, [searchText, trimmedText]);

  useEffect(() => {
    if (!isText && isImg && userImageRef.current) {
      const imgElement = userImageRef.current.querySelector("img");
      if (imgElement) {
        imgElement.onload = () => {
          userImageRef.current.scrollIntoView({
            behavior: "smooth",
            block: "end",
          });
        };
      }
    }
  }, [isText]);

  /** 복사기능, */
  const handleToggleShowCopyText = () => {
    isShowCopyText((prev) => !prev);
  };

  /** 복사기능, */
  const handleCopyText = async (trimmedText) => {
    try {
      if (platform === "aos") {
        window.AOS.copyTxt(trimmedText);
      } else if (platform === "ios") {
        window.webkit.messageHandlers.copyToClipboard.postMessage(trimmedText);
      } else {
        const permissions = await navigator.permissions.query({
          name: "clipboard-write",
        });

        if (permissions.state === "granted" || permissions.state === "prompt") {
          await navigator.clipboard.writeText(trimmedText);
          setShowToast(true);
          setTimeout(() => {
            setShowToast(false);
          }, 1500);
        } else {
          throw new Error(
            "clipboard에 접근할 수 없습니다. 브라우저의 권한을 확인해주세요"
          );
        }
      }
    } catch (error) {
      console.error("clipboared에 복사 중 에러가 발생했습니다.", error);
    }
  };

  /** 복사기능, */
  const renderButton = () => {
    if (showCopyText && isText) {
      return (
        <button
          type="button"
          className={`message_copy ${showCopyText ? "show" : ""}`}
          onClick={() => handleCopyText(trimmedText)}
        >
          복사하기
        </button>
      );
    }
  };

  const popUrl = async () => {
    try {
      if (platform === "aos" || platform === "ios") return;
      if (isImg) {
        // isImg : 이미지 크기에 맞게 새 창을 꺼낸다
        const imgPop = window.open(
          "",
          file.fileUrl,
          "scrollbars=no,menubar=no,fullscreen=no"
        );
        const img = new Image();
        img.src = file.fileUrl;

        img.onload = () => {
          imgPop.document.body.innerHTML = "";
          imgPop.document.body.appendChild(img);
          imgPop.resizeTo(img.width + 50, img.height + 100);
          imgPop.focus();
        };

        img.onerror = () => {
          imgPop.document.body.innerHTML = "Image Load Failed";
        };
      } else if (!isImg) {
        // isFile
        handleDownload(file.fileNm, file.fileUrl);
      }
    } catch (error) {
      console.error("clipboared에 복사 중 에러가 발생했습니다.", error);
    }
  };

  const messageInformation = () => {
    return (
      <div className="message_info">
        <span className="message_isRead">{chatRead}</span>
        <span className="message_time">{time}</span>
      </div>
    );
  };

  /** 이벤트 버블링을 막는 용도- 메세지를 클릭하여도 함수 clickFinderOff가 실행됨, */
  const stopClickBubbling = (e) => {
    e.stopPropagation(); // 클릭 이벤트 전파 방지,컴포넌트 ChatMessageRow, 함수 clickFinderOff 와 기능 연결됨
  };

  return id === "admin" ? (
    <span>{txt}</span>
  ) : isSentByCurrentUser ? (
    <>
      {isText ? (
        <div
          className="message_group message_currentUser"
          onClick={stopClickBubbling}
        >
          <div className="message_item">
            {messageInformation()}
            <div className="message_user">
              <div className="message_space">
                <p
                  className="message_text"
                  ref={messageTextRef}
                  onClick={() => handleToggleShowCopyText()}
                >
                  {trimmedText}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : isImg ? (
        <div className="message_group message_currentUser">
          {/* 이미지 부분 */}
          <div className="message_item">
            {messageInformation()}
            <div className="message_user">
              <div className="message_space img" ref={userImageRef}>
                <img
                  className="message_image"
                  src={file.fileUrl}
                  alt="이미지 파일"
                  onClick={() => popUrl(file.fileUrl)}
                  onLoad={() => setImgRender(true)}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="message_group message_currentUser">
          <div className="message_item">
            {messageInformation()}
            <div className="message_user">
              <div className="message_space file">
                <p
                  className="message_text"
                  ref={messageTextRef}
                  onClick={() => popUrl(file.fileUrl)}
                >
                  {trimmedText}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {renderButton()}
    </>
  ) : (
    <>
      {isText ? (
        <div className="message_group message_coworker">
          <Profile profileImage={userProfileImage} profileAlt={trimmedName} />
          <div className="message_item">
            <div className="message_user">
              <span className="message_userName">{trimmedName}</span>
              <div className="message_space">
                <p
                  className="message_text"
                  ref={messageTextRef}
                  onClick={() => handleToggleShowCopyText()}
                >
                  {trimmedText}
                </p>
              </div>
            </div>
            {messageInformation()}
          </div>
        </div>
      ) : isImg ? (
        <div className="message_group message_coworker">
          <Profile profileImage={userProfileImage} profileAlt={trimmedName} />
          <div className="message_item">
            <div className="message_user">
              <span className="message_userName">{trimmedName}</span>
              <div className="message_space img">
                <img
                  className="message_image"
                  src={file.fileUrl}
                  alt="이미지 파일"
                  onClick={() => popUrl(file.fileUrl)}
                  onLoad={() => setImgRender(true)}
                />
              </div>
            </div>
            {messageInformation()}
          </div>
        </div>
      ) : (
        <div className="message_group message_currentUser">
          <div className="message_item">
            {messageInformation()}

            <div className="message_user">
              <div className="message_space">
                <p
                  className="message_text"
                  ref={messageTextRef}
                  onClick={() => popUrl(file.fileUrl)}
                >
                  {trimmedText}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {renderButton()}
    </>
  );
}

export default ChatSingleMessage;
