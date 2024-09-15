import { useState } from "react";
import Sidebar from "../../../Sidebar/Sidebar";
import SearchForm from "../../../Forms/SearchForm";
import ModalPortal from "../../../Modal/ModalPortal";
import Modal from "../../../Modal/Modal";
import OverlayPortal from "../../../Overlay/OverlayPortal";
import Overlay from "../../../Overlay/Overlay";
import useSidebarData from "../../../Sidebar/useSidebarData";
import useTaxTalkTitleModal from "../../../../Pages/Talk/TaxTalk/useTaxTalkTitleModal";
import ButtonImage from "../../../Button/ButtonImage/ButtonImage";
import alertImage from "../../../../Assets/Images/AlertImage.svg";
import mutedAlertImage from "../../../../Assets/Images/mutedAlertImage.svg";
import searchImage from "../../../../Assets/Images/search.svg";
import menuImage from "../../../../Assets/Images/menu.svg";
import { GlobalStore } from "../../../../Store/Store";
import { useSocket } from "../../../../Socket/SocketContext";
import "./ChatUtil.style.scss";

function ChatUtil({ menuData }) {
  const {
    mute: { isMute, handleMuteAlert },
    visible: { handleVisible },
  } = menuData;

  const { isBoxVisible, setRoomNm } = GlobalStore();
  const [userInputValue, setUserInputValue] = useState("");
  const [sidebar, setSidebar] = useState(false);

  const showSidebar = () => setSidebar((prev) => !prev);
  const openSideBar = () => {
    showSidebar();
    if (isBoxVisible) handleVisible();
  };
  const socket = useSocket();

  // 모달로 타이틀 변경하는 흐름 순서 1
  // 채팅창의 타이틀명을 모달에서 변경하려는데,
  // 그 변경된 타이틀 명을 공통 컴포넌트 searchForm을 사용하면서
  // 변경된 타이틀 값을 저장 할, 변경된 상태명(changedTitle), 상태를 변경할 핸들러(setChangedTitle)
  // 저장 할, 변경된 상태명(changedTitle)을 모달에 전달함
  // 모달에서 저장버튼을 눌러 변경된 상태명(changedTitle)으로 적용하기 위해,
  // 상태를 변경할 핸들러(setChangedTitle)와 변경된 상태명(changedTitle)을 props로 전달한다 ,
  /**
   * isModalOpen(true/false) : 버튼을 클릭 시, 값이 변경(true/false)되면서 모달을 활성화하는 목적의 상태 변수
   * handleModalOpen : isModalOpen의 값을 변경하는 핸들러
   * changedTitle : 기존의 대화방 타이틀이 변경된 값을 저장할 상태 변수
   * setChangedTitle :
   */
  const { isModalOpen, handleModalOpen, changedTitle, setChangedTitle } =
    useTaxTalkTitleModal();
  const sidebarData = useSidebarData(handleModalOpen);
  const {
    menuTitle: { roomCategory, roomTitle, currentMemberCount },
  } = sidebarData;
  let currentTalkTitle = `${roomCategory} ${roomTitle} ${currentMemberCount}`;

  /**
   * 관련 컴포넌트 : SearchForm.jsx, InputBox.jsx, Modal.jsx, ModalBottom.jsx
   * 모달로 타이틀 변경하는 흐름 순서 3
   * Modal 컴포넌트의 자식, ModalBottom에 handleSubmit으로
   * 전달되는 함수 props
   * ModalBottom 컴포넌트에서 버튼, 저장을 클릭 시,
   * 인풋에 새롭게 입력된 텍스트 값을 변경할 핸들러
   * 핸들러, handleChangeModalTitle안에서 값을 태워서 보내는 로직을 추가해야함
   * value라는 인수를 정의하여, 값, 즉, changedTitle을 받을 수 있도록 처리 및 함수정의
   */
  const handleChangeModalTitle = () => {
    if (userInputValue === "") {
      alert("채팅방 이름을 지어주세요");
    } else {
      setRoomNm(userInputValue);
      socket.emit("update_room_name", { userInputValue }, (response) => {
        if (response.code === 200) {
          reloadParentWindow(userInputValue, response.room);
        }
      });
    }
  };

  const reloadParentWindow = (userInputValue, room) => {
    localStorage.setItem("roomName", userInputValue);
    localStorage.setItem("roomCode", room);
  };

  return (
    <div className="section_util">
      <ul className="list_util">
        <li className="item_util">
          <ButtonImage
            buttonName="대화방 알림 설정"
            srcValue={!isMute ? alertImage : mutedAlertImage}
            altValue={
              !isMute
                ? "종 모양의 알림 이미지"
                : "종 모양에 사선이 그어진 무음 이미지"
            }
            clickHandler={handleMuteAlert}
          />
        </li>
        <li className="item_util">
          <ButtonImage
            buttonName="대화방 키워드 검색"
            srcValue={searchImage}
            altValue="돋보기 모양의 이미지"
            clickHandler={handleVisible}
          />
        </li>
        <li className="item_util">
          <ButtonImage
            buttonName="대화방 메뉴 열기"
            srcValue={menuImage}
            altValue="대화방 메뉴 열기"
            clickHandler={openSideBar}
          />
          <Sidebar isActive={sidebar} data={sidebarData} />
          {sidebar && (
            <OverlayPortal>
              <Overlay onClick={showSidebar} />
            </OverlayPortal>
          )}
          {isModalOpen && (
            <ModalPortal>
              <Modal
                modalTitle={"대화방 이름"}
                modalChangedTitle={changedTitle}
                modalSubTitle={"대화방 이름을 입력해주세요."}
                modalContentValue={() => (
                  <SearchForm
                    inputTitle={"채팅방 이름변경 모달 인풋창"}
                    placeHolderValue={"채팅방 이름을 입력해주세요"}
                    currentInputValue={currentTalkTitle}
                    setDebouncedUserInputValue={setChangedTitle}
                    setUserInputValue={setUserInputValue}
                  />
                )}
                modalButtonType={"typeTwo"}
                modalCloseHandler={handleModalOpen}
                // 모달로 타이틀 변경하는 흐름 순서 4
                // modalSubmitHandler라는 props이름으로
                // ModalBottom 컴포넌트에 있는 버튼, 저장을 클릭해서 변경된 타이틀명을 저장하기 위해서 이를 도와주는 함수를 전달함
                modalSubmitHandler={() => handleChangeModalTitle(changedTitle)}
              />
            </ModalPortal>
          )}
        </li>
      </ul>
    </div>
  );
}

export default ChatUtil;
