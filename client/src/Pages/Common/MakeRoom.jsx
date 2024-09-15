import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSocket } from "../../Socket/SocketContext";
import LayOut from "../../Util/LayOut/LayOut";
import PrevButton from "./../../Components/Button/PrevButton/PrevButton"
import SearchForm from "../../Components/Forms/SearchForm"
import MakeRoomAccordion from "./MakeRoomAccordion"
import MakeRoomPortal from "./MakeRoomPortal"
import Modal from "../../Components/Modal/Modal"
import "./MakeRoom.style.scss"
import { getArrDataFromLocalStorage } from '../../Components/Checkbox/CheckBoxList'
import { GlobalStore } from '../../Store/Store'

const MakeRoom = () => {
  const navigate = useNavigate();
  const [createModal, setCreateModal] = useState(false);
  const [userInputValue, setUserInputValue] = useState("");
  const [arrData, setArrData] = useState(getArrDataFromLocalStorage);
  const socket = useSocket();

  const { 
    platform, 
    mstId, 
    userId,
    roomCd
  } = GlobalStore()

  const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  };

  let query = useQuery();
  const inviteType = query.get("index");

  const handleRoomModal = () => {
    const storedArrData = getArrDataFromLocalStorage();
    setArrData(storedArrData);

    if (inviteType === `1`) {
      if (storedArrData.length === 0) {
        if (platform === "aos") window.AOS.alert("초대 할 유저를 선택해주세요");
        else alert("초대 할 유저를 선택해주세요");
        return;
      } else setCreateModal((prev) => !prev);
    } else {
      socket.emit(
        "req_invite_member",
        {
          room: roomCd,
          arrData: storedArrData,
        },
        (response) => {
          if (response.code < 400) {
            handleInviteClose();
            return;
          } else {
            if (platform === "aos") window.AOS.alert(response.message);
            else alert(response.message);
          }
        }
      );
    }
  };

  const runSubmit = () => {
    socket.emit(
      "req_mk_room",
      {
        arrData,
        roomNm: userInputValue === "" ? "택스톡방" : userInputValue,
        mstId,
        userId,
      },
      (response) => {
        if (response.code < 400) {
          handleInviteClose();
          return;
        } else {
          if (platform === "aos") window.AOS.alert(response.message);
          else alert(response.message);
        }
      }
    );
  };

  const handleInviteClose = () => {
    navigate(-1);
  };

  useEffect(() => {
    return () => {
      socket.off("req_mk_room");
      localStorage.removeItem("checkedInputs");
    };
  }, []);

  return inviteType === "1" ? (
    <LayOut>
      <div className="room_container">
        <PrevButton title={"조직도"} />
        {/* <Finder /> 에러로 인한 임시 주석 : 권준우/240829 */}
        <div className="room_contents">
          <MakeRoomAccordion />
          <ul className="button_list">
            <li className="button_item">
              <button
                type="button"
                className="button_create button_cancel"
                onClick={handleInviteClose}
              >
                취소
              </button>
            </li>
            <li className="button_item">
              <button
                type="button"
                className="button_create button_room"
                onClick={handleRoomModal}
              >
                대화방 만들기
              </button>
            </li>
          </ul>
          {createModal && (
            <MakeRoomPortal>
              <Modal
                modalTitle={"대화방 이름"}
                modalSubTitle={"대화방 이름을 입력해주세요."}
                modalContentValue={() => (
                  <SearchForm
                    inputTitle={"채팅방 이름생성 모달 인풋창"}
                    placeHolderValue={"택스톡방"}
                    setUserInputValue={setUserInputValue}
                  />
                )}
                modalButtonType={"typeTwo"}
                modalCloseHandler={handleRoomModal}
                modalSubmitHandler={runSubmit}
              />
            </MakeRoomPortal>
          )}
        </div>
      </div>
    </LayOut>
  ) : (
    <LayOut>
      <div className="room_container">
        <PrevButton title={"조직도"} />
        {/* <Finder /> 에러로 인한 임시 주석 : 권준우/240829 */}
        <div className="room_contents">
          <MakeRoomAccordion />
          <ul className="button_list">
            <li className="button_item">
              <button
                type="button"
                className="button_create button_cancel"
                onClick={handleInviteClose}
              >
                취소
              </button>
            </li>
            <li className="button_item">
              <button
                type="button"
                className="button_create button_room"
                onClick={handleRoomModal}
              >
                초대하기
              </button>
            </li>
          </ul>
        </div>
      </div>
    </LayOut>
  );
};

export default MakeRoom;
