import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Chat from "../../../Components/Chat/Chat";
import LayOut from "../../../Util/LayOut/LayOut";
import openBox from "../../../Assets/Images/openBox.svg";
import sendMessage from "../../../Assets/Images/sendMessage.svg";

function TaxTalk() {
  const location = useLocation();
  const hideChatPaths = ["/talk/taxTalk/file", "/create"];
  const shouldHideChat = hideChatPaths.some((path) =>
    location.pathname.includes(path)
  );

  const preventRefresh = (event) => {
    if (event.ctrlKey || event.key === "F5") {
      event.preventDefault();
      event.returnValue = "";
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey && event.key === "r") || event.key === "F5") {
        preventRefresh(event);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <LayOut>
      {!shouldHideChat && (
        <Chat
          title={"세무사와 텍스톡"}
          bs={openBox}
          ba="파일 인풋 이미지 + 버튼"
          ib={true}
          ss={sendMessage}
          sa="종이 비행기 이미지"
          tt="메세지 입력창"
          rec={false}
        />
      )}
      <Outlet />
    </LayOut>
  );
}

export default TaxTalk;
