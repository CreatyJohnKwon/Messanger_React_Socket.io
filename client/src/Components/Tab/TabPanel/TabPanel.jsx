import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSocket } from "../../../Socket/SocketContext";
import { SERVER_IP } from "../../../Store/.IPdata";
import queryString from "query-string";
import { GlobalStore } from "../../../Store/Store";
import "./TabPanel.style.scss";

function TabPanel() {
  const navigate = useNavigate();
  const {
    setRoomNm,
    roomNm,
    userNm,
    setRoomCd,
    tabIndex,
    setUserId,
    setUserNm,
    setMstId,
    platform,
    mstId,
    roomNotify1,
    roomNotify2,
    setRoomNotify1,
    setRoomNotify2,
    initRoomNotify1,
    initRoomNotify2
  } = GlobalStore();
  const [roomDatas, setRoomDatas] = useState([]);

  const listRef = useRef(null);
  const socket = useSocket();
  const location = useLocation();
  const { userId } = queryString.parse(location.search);

  useEffect(() => {
    setUserId(userId);
    fetchUserData();
  }, []);

  useEffect(() => {
    socket.on("broadcastMessage", (data) => {
      if (data.userId !== userId && data.memberId.includes(userId)) {
        if (data.tabIndex === 0) {
          setRoomNotify1()
        } else if (data.tabIndex === 1) {
          setRoomNotify2()
        }
        addClass(data.roomCd)
      }
    });
  
    return () => {
      socket.off("broadcastMessage");
    };
  }, [socket])

  useEffect(() => {
    async function runEffect() {
      try {
        /** Check if any parameter is missing */
        if (!userId) {
          if (platform === "aos") {
            window.AOS.alert(
              "사용자를 찾을 수 없습니다\n관리자에게 문의하세요"
            );
          } else alert("사용자를 찾을 수 없습니다\n관리자에게 문의하세요");
          socket.disconnect();
        }

        socket.emit(
          "socket_on",
          { userNm, userId, mstId, tabIndex },
          async (error) => {
            if (error) {
              console.log(`400 ERROR: ${error}`);
            }
          }
        );
      } catch (err) {
        console.log(err.message);
      }
    }

    runEffect();

    return () => {
      socket.off("socket_on");
    };
  }, [tabIndex]);

  useEffect(() => {
    const roomLen = roomDatas.length
    let sum = 0
    if (roomLen > 0) {
      for (let i=0; i<roomLen; i++) sum = sum + parseInt(roomDatas[i].R_CNT)
      if (tabIndex === 0) {
        initRoomNotify1(sum)
      } else if (tabIndex === 1) {
        initRoomNotify2(sum)
      }
    }
  }, [roomDatas]);

  useEffect(() => {
    socket.on("room_data", (data) => {
      if (data) {
        setRoomDatas(data.roomsData)
        if (data.data[0]) initRoomNotify1(parseInt(data.data[0].TOTAL_R_CNT))
        else if (data.data[1])  initRoomNotify2(parseInt(data.data[1].TOTAL_R_CNT))
      } else {
        alert("방을 불러오지 못했어요")
      }
    })

    return () => {
      socket.off("room_data")
    }
  }, [roomNm])

  useEffect(() => {
    const handleStorageEvent = (event) => {
      let roomNm = localStorage.getItem("roomName")
      let roomCd = localStorage.getItem("roomCode")

      if (event.key === "roomName" && event.newValue) {
        roomNm = event.newValue
        localStorage.removeItem("roomName");
      }
  
      if (event.key === "roomCode" && event.newValue) {
        roomCd = event.newValue
        localStorage.removeItem("roomCode");
      }

      if (roomNm && roomCd) {
        editRoomNm(roomNm, roomCd);
      }
    };

    window.addEventListener("storage", handleStorageEvent);

    return () => {
      window.removeEventListener("storage", handleStorageEvent);
    };
  }, []);

  const openInNewTab = (url, roomCode, roomNm) => {
    let newWindow;
    let windowOptions;

    removeClass(roomCode);
    setRoomCd(roomCode)
    setRoomNm(roomNm)

    if (platform === "ios" || platform === "aos") {
      navigate("/talk/taxtalk");
    } else {
      windowOptions =
        "width=600,height=1000,resizable=no,scrollbars=no,location=no,menubar=no,status=no,fullscreen=no,titlebar=no";
      newWindow = window.open(url, roomCode, windowOptions);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${SERVER_IP}user`, {
        // local
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }), // assuming userId is defined in the scope
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.text();
      const userJSON = JSON.parse(data);

      setUserNm(userJSON.userNm);
      setMstId(userJSON.mstId);
    } catch (error) {
      console.error(`Failed to fetch user data: ${error.message}`);
    }
  };

  /* 유저가 방에 들어가면 해당 방의 COUNT가 초기화 되는 로직 방에 들어가는 순간 
  class가 삭제되는 방식이다링 */
  const removeClass = (roomCd) => {
    if (listRef.current) { 
      const titleElements = listRef.current.querySelectorAll(".item_tabPanel");
      titleElements.forEach((titleElement) => {
        if (titleElement.getAttribute('data-room-cd') === roomCd) {
          const countMessageElement = titleElement.querySelector(".count_message");
          if (countMessageElement) {
            if (tabIndex === 0) {
              initRoomNotify1(roomNotify1-parseInt(countMessageElement.textContent))
            } else if (tabIndex === 1) {
              initRoomNotify2(roomNotify2-parseInt(countMessageElement.textContent))
            }
            countMessageElement.remove()
          }
        }
      });
    }
  };

  /* 유저가 방에 들어가는 순간 지워지는 span을 다시 생성해주는 로직이다링 */
  const addClass = (roomCd) => {
    if (listRef.current) {
      const titleElements = listRef.current.querySelectorAll(".item_tabPanel");
      titleElements.forEach((titleElement) => {
        if (titleElement.getAttribute('data-room-cd') === roomCd) {
          const buttonElement = titleElement.querySelector('.link_chatRoom');
          const existingCountMessageElement = buttonElement.querySelector('.count_message');
          if (!existingCountMessageElement) {
            const newCountMessageElement = document.createElement('span');
            newCountMessageElement.className = 'count_message';
            newCountMessageElement.textContent = 1;
            buttonElement.appendChild(newCountMessageElement);
          } else {
            existingCountMessageElement.textContent++
          }
        }
      });
    }
  };  

  /* 방 제목이 바뀌는 순간, 새로고침 보다 더 나은 알고리즘을 지닌 로직이다링 */
  const editRoomNm = (roomName, roomCode) => {
    if (listRef.current) {
      const titleElements = listRef.current.querySelectorAll(".item_tabPanel");
      titleElements.forEach((titleElement) => {
        if (titleElement.getAttribute('data-room-cd') === roomCode) {
          const buttonElement = titleElement.querySelector('.link_chatRoom');
          const existingCountMessageElement = buttonElement.querySelector('.title_chatRoom');
          existingCountMessageElement.textContent = roomName
        }
      });
    }
  };  

  return (
    roomDatas && (
      <div className="tab_panel">
        <span className="offscreen">탭 컨텐츠</span>
        <ul className="list_tabPanel" ref={listRef}>
          {roomDatas.txt === undefined
            ? roomDatas.map(({ ROOM_CD, ROOM_NM, R_CNT }) => (
                <li key={ROOM_CD} className="item_tabPanel"  data-room-cd={ROOM_CD}>
                  <div className="section_chatRoom">
                    <button
                      type="button"
                      onClick={() =>
                        openInNewTab(`/talk/taxTalk`, ROOM_CD, ROOM_NM)
                      }
                      className="link_chatRoom"
                    >
                      <span className="title_chatRoom">{ROOM_NM}</span>
                      {R_CNT > 0 && (
                        <span className="count_message">{R_CNT}</span>
                      )}
                    </button>
                  </div>
                </li>
              ))
            : roomDatas.txt !== undefined && (
                <li className="no_rooms">
                  <p className="no_rooms_message">{roomDatas.txt}</p>
                </li>
              )}
        </ul>
      </div>
    )
  );
}

export default TabPanel;
