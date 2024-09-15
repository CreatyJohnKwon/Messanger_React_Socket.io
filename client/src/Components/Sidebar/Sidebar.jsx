import { useNavigate } from "react-router-dom"
import { useSocket } from "../../Socket/SocketContext"
import SidebarTop from "./SidebarTop/SidebarTop"
import SidebarContent from "./SidebarContent/SidebarContent"
import Image from "../Image/Image"
import chatOut from "../../Assets/Images/chatOut.svg"
import "./Sidebar.style.scss"
import { GlobalStore } from "../../Store/Store"

function Sidebar({ isActive, data }) {
  const { menuTitle, menuContent } = data
  const navigate = useNavigate()
  const socket = useSocket()
  const { 
    platform, 
    tabIndex,
    userId,
    roomCd
  } = GlobalStore()

  const leaveRoom = () => {
    const msg = "채팅방을 나가시겠어요?";
    const callbackFunction = "handleAndroidResponse";

    if (platform === "aos") {
      if (window.AOS) window.AOS.chooseAlert(msg, callbackFunction);
    } else if (platform === "ios") {
      window.webkit.messageHandlers.outOfRoom.postMessage({});
    } else {
      if (window.confirm(msg)) {
        getOut();
      }
    }
  };

  /** iOS/AOS 컨펌 다이얼로그를 위한 로직이므로.. */
  window.handleAndroidResponse = function (response) {
    if (platform === "aos" && response === "confirmed") {
      getOut();
    } else if (platform === "ios") {
      getOut();
    }
  };

  function handleAndroidResponse(response) {
    if (response === "confirmed") {
      getOut();
    }
  }
  /** 절 대 삭 제 금 지 */

  /* 방 나가기 / 사내톡 */
  function getOut() {
    socket.emit("out_room", { room: roomCd, userId }, (response) => {
      if (response.code === 202) {
        if (platform === "aos" || platform === "ios") navigate(-1);
        else {
          window.close();
          window.opener.document.location.href = window.opener.document.URL;
        }
      } else {
        if (platform === "aos") {
          if (window.AOS) window.AOS.alert(response.message);
        } else {
          alert(response.message);
        }
      }
    });
  }

  return (
    <nav
      className={isActive ? "navigation_menu active" : "navigation_menu"}
      aria-expanded={isActive}
      aria-label="사이드바 메뉴"
      aria-controls="sidebarContent"
    >
      <div className="sidebar_Content" id="sidebarContent">
        <SidebarTop chatInfo={menuTitle} />
        <SidebarContent menuContent={menuContent} />
      </div>
      {tabIndex === 0 && (
        <button type="button" className="button_chatOut" onClick={leaveRoom}>
          <Image
            srcValue={chatOut}
            altValue="사각형을 가리키는 화살표 이미지"
          ></Image>
          <span className="text_chatOut">채팅방 나가기</span>
        </button>
      )}
    </nav>
  );
}

export default Sidebar;
