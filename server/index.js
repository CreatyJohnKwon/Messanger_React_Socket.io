/** 패키지 세팅 */
require("dotenv").config();

const express = require("express"); // nodeJs Express server 기용
const multer = require('multer');
const cors = require("cors");
const app = express();
const {
  getUserNm,
  getCorpMembers,
  getCorpDepts,
  getChat,
  getAllRoom,
  getMemberTalkRoom,
  getMemberTalkMembers,
  getFiles,
  getOneRoom,
  getRoomMembers,
  getMember,
  getChatCount,
  getRoomRead,
  updateUserIsOnline,
  updateRoomName,
  postChat,
  postFiles,
  postMember,
  postNewRoom,
  updateReadYN,
  deleteMember,
} = require("./maria.js"); // mariaDB 쿼리문 적용
const { sendToBucket } = require("./s3controller.js"); // 파일 업로드는 S3 기용
const server = require("http").createServer(app);
const storage = multer.memoryStorage(); // 메모리에 파일을 저장 (또는 디스크 저장 설정 가능)
const upload = multer({ storage: storage });
let memberId = []

app.use(
  cors({
    // origin: 'https://client.mtok.kr', // 필요한 경우 '*'을 사용하여 모든 도메인 허용
    origin: "*", // 필요한 경우 '*'을 사용하여 모든 도메인 허용
    methods: ["GET", "POST", "UPDATE", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

/** AWS 에 서버가 잘 세팅 되었는지 증빙하기 위한 페이지 데이터 세팅 */
app.get("/health", function (req, res) {
  // request parameter 삭제 금지
  res.send("hello AWS!");
});

/** userId 로 mstId 와 userNm 반환 */
app.post("/user", function (req, res) {
  const { userId } = req.body;

  if (!userId) return res.status(400).send("User ID is required");

  getUserNm()(userId)
    .then((data) => {
      res.send({
        userNm: data[0].USER_NM,
        mstId: data[0].MST_ID,
      });
    })
    .catch((err) => {
      console.error(`${err.message} | ${getCurrentTimeFormatted()}`);
      res.status(500).send("Error retrieving user name");
    });
});

/** 파일을 S3로 저장 */
app.post("/upload", upload.single('file'), function (req, res) {
  const { fileType, fileNm, fileSize, mstId } = req.body;
  const file = req.file

  if (!file) return res.status(401).send("No file provided");

  try {
    sendToBucket(
      { file: file.buffer, fileType, fileNm, fileSize, mstId }, // 버퍼로 파일을 전달
      (response) => {
        res.send(response);
      }
    );
  } catch (error) {
    console.error(`send_file 중 오류 발생: ${error} | ${getCurrentTimeFormatted()}`);
    res.status(500).send("File upload failed");
  }
})

/** 소켓 세팅 */
const io = require("socket.io")(server, {
  cors: {
    // origin: "https://client.mtok.kr",
    origin: "*",
    methods: ["GET", "POST", "UPDATE", "DELETE"],
    credential: true,
  },
});

// The room, client A already in
let mstIdArr = [];

/** 소켓 시작 */
io.on("connection", (socket) => {
  /* 소켓 진입 */
  socket.on("socket_on", ({ userNm, userId, mstId, tabIndex }) => {
    try {
      socket.userNm = userNm;
      socket.userId = userId;
      socket.mstId = mstId;
      socket.lastRoomCd = "";

      updateUserIsOnline({
        status: 1,
        userId: userId,
      })

      roomData({ mstId, userId, tabIndex: tabIndex+1 })
    } catch (error) {
      console.error(
        `socket_on 중 오류 발생: ${
          error.message
        } | ${getCurrentTimeFormatted()}`
      );
      
      callback({ 
        code: 401, 
        message: `방 조회 중 에러 발생`
      })
    }
  });

  /*** 룸 진입 */
  socket.on("join_room", (data) => {
    try {
      const room = data.roomCd;
      const userNm = data.userNm;
      const userId = data.userId;
      const mstId = data.mstId;
      const tabIndex = data.tabIndex

      getOneRoom()(room)
        .then((roomData) => {
          socket.emit("res_room_data", roomData);
        })
        .catch((err) =>
          console.error(`${err.message} | ${getCurrentTimeFormatted()}`)
        );

      if (tabIndex === 1) {
        getRoomMembers()(room)
        .then((membersData) => {
          socket.emit("room_members", membersData)
          for (let i=0; i<membersData.length; i++) {
            memberId.push(membersData[i].USER_ID)
          }
        })
        .catch((err) =>
          console.error(`${err.message} | ${getCurrentTimeFormatted()}`)
        );
      } else if (tabIndex === 0) {
        getMemberTalkMembers()(room)
        .then((membersData) => {
          socket.emit("room_members", membersData)
          for (let i=0; i<membersData.length; i++) {
            memberId.push(membersData[i].USER_ID)
          }
        })
        .catch((err) =>
          console.error(`${err.message} | ${getCurrentTimeFormatted()}`)
        );
      }

      socket.room = room;

      if (socket.lastRoomCd !== room) {
        socket.leave(socket.lastRoomCd);
      }

      updateAndSetChat(room, mstId, userId, userNm);

      socket.join(room);
      socket.lastRoomCd = room;

      console.log(
        `User ${userNm} join room ${room} | ${getCurrentTimeFormatted()}`
      );
    } catch (error) {
      console.error(
        `join_room 중 오류 발생: ${
          error.message
        } | ${getCurrentTimeFormatted()}`
      );
    }
  });

  /*** 개인을 위한 룸 정보 */
  socket.on("room_notification", (data) => {
    try {
      const userId = data.userId;
      const room = data.room;

      if (data.isFirst) {
        // data.isNotified 를 DB 에서 GET 해서 isItMute에 뿌려줌
        // true가 알림 킨 상태, false는 끈 상태
        getMember()(room, userId)
          .then((data) => {
            if (data) {
              const roomNoti = data.ALARM_YN == "Y" ? false : true;
              socket.emit("inter_room_notification", {
                isItMute: roomNoti,
              });
            } else {
              postMember()({
                room,
                userId,
                notiYn: "Y",
              });
            }
          })
          .catch((err) =>
            console.error(`${err.message} | ${getCurrentTimeFormatted()}`)
          );
      } else {
        // data.isNotified 를 DB 에 UPDATE
        const notiYn = data.isNotified == true ? "N" : "Y";
        postMember()({
          room,
          userId,
          notiYn,
        });
      }
    } catch (error) {
      console.error(
        `room_notification 중 오류 발생: ${error} | ${getCurrentTimeFormatted()}`
      );
    }
  });

  /*** 직원 리스트 */
  socket.on("req_corp_info", (data) => {
    const mstId = data.mstId;
    const userId = data.userId;
    try {
      getCorpDepts()(mstId, userId).then((deptData) => {
        socket.emit("res_corp_dept", deptData);
      });

      getCorpMembers()(mstId, userId)
        .then((membersData) => {
          let member = [];

          for (i = 0; membersData.length > i; i++) {
            const memberJSON = {
              key: membersData[i].USER_ID,
              mstId: membersData[i].MST_ID,
              deptNm: membersData[i].DEPT_NM,
              rank: membersData[i].POSN_NM,
              nameValue: membersData[i].USER_NM,
              altValue: `${membersData[i].USER_NM} ${membersData[i].POSN_NM} 프로필 이미지`,
              isOline: membersData[i].IS_ONLINE,
            };

            member.push(memberJSON);
          }

          socket.emit("res_corp_member", { member });
        })
        .catch((err) =>
          console.error(`${err.message} | ${getCurrentTimeFormatted()}`)
        );
    } catch (err) {
      console.error(`${err.message} | ${getCurrentTimeFormatted()}`);
      console.log(
        `Failure connection mstId: ${mstId} | ${getCurrentTimeFormatted()}`
      );
    }
  });
  
  /** 방 만들기 (사내톡) */
  socket.on("req_mk_room", ({ arrData, roomNm, mstId, userId }, callback) => {
    try {
      if (arrData.length<1 || arrData==null || arrData==undefined) {
        callback({ 
          code: 201, 
          message: `초대할 유저를 선택해주세요`
        })
      } else {
        postNewRoom()({
          roomNm,
          mstId,
          userId
        }).then((room) => {
          for (let i=0; i<arrData.length; i++) {
            postMember()({
              room,
              userId: arrData[i],
              notiYn: 'Y',
            }).then(() => {
              callback({ 
                code: 200, 
                message: '방이 생성되었습니다'
              })
            }).catch((err) => {
              callback({ code: 406, message: err.message })
            })
          }
        }).catch((err) => {
          callback({ code: 405, message: err.message })
        })
      }
    } catch (err) {
      callback({ code: 404, message: err.message })
    }
  })

  /** 대화상대 추가 */
  socket.on('req_invite_member', ({ room, arrData }, callback) => {
    if (arrData.length<1 || arrData==null || arrData==undefined) {
      callback({ 
        code: 405, 
        message: `초대할 유저를 선택해주세요`
      })
    } else {
      for (let i=0; i<arrData.length; i++) {
        postMember()({
          room,
          userId: arrData[i],
          notiYn: 'Y',
        }).then(() => {
          callback({ 
            code: 200, 
            message: '초대를 완료했어요'
          })
        }).catch(() => {
          callback({ code: 406, message: '초대를 실패했어요' })
        })
      }
    }
  })

  /*** 파일 보관함 */
  socket.on("req_filebox", (data) => {
    try {
      const room = data.roomCd;
      if (!room)
        console.log(`error: no room Number | ${getCurrentTimeFormatted()}`);
      getFiles()(room)
        .then((rows) => {
          if (rows === undefined) {
            console.log(
              `room num : ${room} have no files | ${getCurrentTimeFormatted()}`
            );
          } else {
            try {
              let fileBox = [];
              let nextDate = null

              if (rows.length == 0) {
                fileBox.push({ txt: "업로드 된 파일이 없습니다" });
              }

              // chats data, which may print to view
              for (i = 0; rows.length > i; i++) {
                let currentDate = new Date(rows[i].REG_DT);
  
                // 마지막 요소의 날짜를 처리하는 경우
                if (i < rows.length - 1) {
                  nextDate = new Date(rows[i + 1].REG_DT);
                }

                const file = {
                  fileUrl: `https://attachfile-board.s3.ap-northeast-2.amazonaws.com/${
                    rows[i].REAL_NAME.split("_")[0]
                  }/${rows[i].REAL_NAME.split(".")[0]}`,
                  fileNm: rows[i].FILE_NAME,
                  realNm: rows[i].REAL_NAME,
                  fileType: extractSuffix(rows[i].FILE_DIV),
                  currentDay: formatDate(currentDate),
                  nextDay: formatDate(nextDate)
                };

                fileBox.push(file);
              }

              socket.emit("res_filebox", {
                file: fileBox,
                len: rows.length,
              });
            } catch (err) {
              console.error(`${err.message} | ${getCurrentTimeFormatted()}`);
              console.log(
                `Failure connection userNm: ${room} | ${getCurrentTimeFormatted()}`
              );
            }
          }
        })
        .catch((err) => {
          console.error(`${err} | ${getCurrentTimeFormatted()}`);
        });
    } catch (error) {
      console.error(
        `req_filebox 중 오류 발생: ${error} ${getCurrentTimeFormatted()}`
      );
    }
  });

  /** 메세지 및 파일정보 채팅방으로 전송 */
  socket.on("send_message", ({ message, file, userId, userNm, roomCd, isText, time, tabIndex }, callback) => {
      try {
        const roomCount = mstIdArr.filter((item) => item.room === roomCd).length;
        let isRead = roomCount > 1 ? "Y" : "N";

        if (isText && message) {
          if (message.trim() === "") return
          postChat()({
            roomCd,
            userId,
            message,
            isRead,
            isText,
          });

          getChatCount()(roomCd)
            .then((rows) => {
              io.to(roomCd).emit("message_info", {
                len: parseInt(rows.CHAT_CNT, 10),
                user: userNm,
                id: userId,
                txt: message,
                isText,
                isRead,
                time,
              });
            })
            .catch((err) => {
              console.error(
                `getChatCount function 중 오류 발생: ${err} | ${getCurrentTimeFormatted()}`
              );
            });

            callback({ 
              code: 200, 
              message: `chat send success`
            })

            io.emit("broadcastMessage", { roomCd, tabIndex, userId, memberId });
        } else if (!isText && message == undefined) {
          const fileSize = file.fileSize;
          /* fileType 데이터 가공 / 50자를 넘을 때를 대비한, DB char length 초과 에러 예외 처리 */
          const fileType = file.fileType.split("/").pop();
          const fileNm = file.fileNm;
          const realNm = file.realNm;
          const fileUrl = file.fileUrl;

          console.log(
            `${
              (fileNm, realNm, fileType, fileUrl, fileSize)
            } | ${getCurrentTimeFormatted()}`
          );

          postChat()({
            roomCd,
            userId,
            message: "",
            isRead,
            isText,
          })
            .then((results) => {
              const insertIdStr = results.insertId.toString();
              const chatCd = parseInt(
                insertIdStr.includes("n")
                  ? insertIdStr.replace("n", "")
                  : insertIdStr
              );

              postFiles()({
                roomCd,
                chatCd,
                fileNm,
                realNm,
                fileSize,
                fileType,
              });
            })
            .catch((error) =>
              console.log(`${error} | ${getCurrentTimeFormatted()}`)
            );

          getChatCount()(roomCd)
            .then((rows) => {
              io.to(roomCd).emit("message_info", {
                len: parseInt(rows.CHAT_CNT, 10),
                user: userNm,
                id: userId,
                file: file,
                isText: isText,
                isRead: isRead,
                time: time,
              });
            })
            .catch((err) => {
              console.error(
                `getChatCount function 중 오류 발생: ${err} | ${getCurrentTimeFormatted()}`
              );
            });

            callback({ 
              code: 200, 
              message: `chat send success`
            })

            io.emit("broadcastMessage", { roomCd, tabIndex, userId, memberId });
        }
      } catch (error) {
        console.error(
          `send_message 중 오류 발생: ${error} | ${getCurrentTimeFormatted()}`
        );
      }
    }
  );

  /** 방 제목 변경 */
  socket.on("update_room_name", ({ userInputValue }, callback) => {
    try {
      updateRoomName({
        roomNm: userInputValue,
        roomCd: socket.room,
      });
      callback({ code: 200, room: socket.room })
    } catch (error) {
      console.error(
        `update_room_name 중 오류 발생: ${error} | ${getCurrentTimeFormatted()}`
      );
    }
  });

  /**
   * leaveRoom 과 disconnect 의 차이
   * 방을 떠나는 것과 소켓을 종료하는 것은 다르지만 같은 느낌을 주고 있다
   * 방을 떠나는 것은 잠깐 그 방만을 떠나는 것이지만
   * 소켓을 종료하는 것은 아예 모든 소켓을 끊어버리는 것이기에
   * 메인화면에서의 어떤 정보도 소켓에서부터 받아올 수 없다
   */
  socket.on("leave_room", ({ userNm, roomCd }) => {
    try {
      console.log(
        `User ${userNm} left room ${roomCd} | ${getCurrentTimeFormatted()}`
      );

      socket.leave(roomCd);
    } catch (error) {
      console.error(
        `leave_room 중 오류 발생: ${error} | ${getCurrentTimeFormatted()}`
      );
    }
  });

  socket.on("out_room", ({ room, userId }, callback) => {
    try {
      socket.leave(room)

      deleteMember({
        room,
        userId
      }).then(() => {
        callback({ code: 202 })
        roomData({ mstId, userId, tabIndex: tabIndex-1 })
        socket.emit('refresh_room_tab', {})
      }).catch(() => {
        callback({ code: 404, message: `방을 나가지 못했어요` })
      })
    } catch (error) {
      console.error(
        `out_room 중 오류 발생: ${error} | ${getCurrentTimeFormatted()}`
      );
    }
  });

  socket.on("disconnect", () => {
    try {
      socket.leave(socket.lastRoomCd);

      updateUserIsOnline({
        status: 0,
        userId: socket.userId,
      });

      if (socket.userNm)
        console.log(
          `${socket.userNm} User Socket Exit | ${getCurrentTimeFormatted()}`
        );
    } catch (error) {
      console.error(
        `disconnect 중 오류 발생: ${error} | ${getCurrentTimeFormatted()}`
      );
    }
  });

  const roomData = ({ mstId, userId, tabIndex }) => {
    getRoomRead()(userId)
    .then((data) => {
      if (tabIndex === 2) {
        // 전문가 톡 방 조회 process
        getAllRoom()(mstId, userId, tabIndex)
        .then((roomsData) => {
          if (roomsData.length > 0) {
            socket.emit("room_data", { roomsData, data });
          } else {
            socket.emit("room_data", {
              roomsData: { txt: "생성된 방이 없습니다" },
            });
          }
        })
        .catch((err) =>
          console.error(`${err.message} | ${getCurrentTimeFormatted()}`)
        );
      } else if (tabIndex === 1) {
        // 멤버 톡 방 조회 process
        getMemberTalkRoom()(userId)
        .then((roomsData) => {
          if (roomsData.length > 0) {
            socket.emit("room_data", { roomsData, data });
          } else {
            socket.emit("room_data", {
              roomsData: { txt: "생성된 방이 없습니다" },
            });
          }
        })
        .catch((err) =>
          console.error(`${err.message} | ${getCurrentTimeFormatted()}`)
        );
      }
    }).catch((err) =>
      console.error(`${err.message} | ${getCurrentTimeFormatted()}`)
    );
  }

  /** 예외로직 */
  const setChat = ({ userId, userNm, mstId, room }) => {
    try {
      getChat()(room)
        .then((rows) => {
          if (rows === undefined) {
            console.log(
              `room num : ${room} have no chats | ${getCurrentTimeFormatted()}`
            );
          } else {
            try {
              const messages = [];

              for (let i = 0; i < rows.length; i++) {
                const currentDate = new Date(rows[i].REG_DT);

                // 마지막 요소의 날짜를 처리하는 경우
                let nextDate = null;
                if (i < rows.length - 1) {
                  nextDate = new Date(rows[i + 1].REG_DT);
                }

                const isText = parseInt(rows[i].IS_TEXT) === 1;

                const file = [
                  {
                    fileUrl: `https://attachfile-board.s3.ap-northeast-2.amazonaws.com/${
                      rows[i].REAL_NAME.split("_")[0]
                    }/${rows[i].REAL_NAME.split(".")[0]}`,
                    fileNm: rows[i].FILE_NAME,
                    fileType: extractSuffix(rows[i].FILE_DIV),
                  },
                ];

                // 다음 날짜가 다르거나 마지막 요소인 경우를 확인하는 조건
                if (
                  nextDate === null ||
                  currentDate.getFullYear() !== nextDate.getFullYear() ||
                  currentDate.getMonth() !== nextDate.getMonth() ||
                  currentDate.getDate() !== nextDate.getDate()
                ) {
                  messages.push({
                    code: 0,
                    len: rows.length,
                    user: rows[i].USER_NM,
                    id: rows[i].USER_ID,
                    txt: rows[i].CHAT_CONTENTS,
                    isText,
                    isRead: rows[i].READ_YN,
                    file: file[0],
                    time: formatDateTime(rows[i].REG_DT),
                    currentDate : rows[i].REG_DT,
                    date: nextDate,
                  });
                } else {
                  messages.push({
                    code: 1,
                    len: rows.length,
                    user: rows[i].USER_NM,
                    id: rows[i].USER_ID,
                    txt: rows[i].CHAT_CONTENTS,
                    isText,
                    isRead: rows[i].READ_YN,
                    file: file[0],
                    time: formatDateTime(rows[i].REG_DT),
                    date: rows[i].REG_DT,
                  });
                }
              }

              if (rows.length == 0) {
                messages.push({
                  id: "admin",
                  txt: "채팅을 시작하여 활성화 시켜보세요!",
                  isText: 1,
                });
              }

              socket.emit("messages_info", messages);
            } catch (err) {
              console.log(
                `Failure connection userNm: ${userNm}, userId: ${userId}, mstId: ${mstId}, room: ${room} | ${getCurrentTimeFormatted()}`
              );
              console.error(
                `채팅 세팅 중 오류 발생: ${
                  err.message
                } | ${getCurrentTimeFormatted()}`
              );
            }
          }
        })
        .catch((err) => {
          console.error(
            `setChat function 중 오류 발생: ${err} | ${getCurrentTimeFormatted()}`
          );
        });
    } catch (error) {
      console.error(
        `setChat function 중 오류 발생: ${error} | ${getCurrentTimeFormatted()}`
      );
    }
  };

  /*** 채팅 읽음 표시 ({room, userId}) / update chats, read n(No) to y(Yes) (query UPDATE) */
  const setIsRead = (room) => {
    try {
      return new Promise((resolve, reject) => {
        let arr = [];

        getChat()(room)
          .then((rows) => {
            try {
              for (let i = 0; i < rows.length; i++) {
                arr.push(rows[i].READ_YN);
              }
              resolve(arr);
            } catch (err) {
              console.error(
                `getChat to setIsRead 를 resolve 중 오류1 발생: ${
                  err.message
                } | ${getCurrentTimeFormatted()}`
              );
              reject(err);
            }
          })
          .catch((err) => {
            console.error(
              `getChat to setIsRead reject 중 오류2 발생: ${
                err.message
              } | ${getCurrentTimeFormatted()}`
            );
            reject(err);
          });
      });
    } catch (error) {
      console.error(
        `setIsRead 중 오류3 발생: ${err.message} | ${getCurrentTimeFormatted()}`
      );
    }
  };

  /*** 채팅 접속 시, io단(룸 전체)에 방송함 */
  async function updateAndSetChat(room, mstId, userId, userNm) {
    try {
      await updateReadYN({ room, userId });

      setChat({ userId, userNm, mstId, room });

      const arr = await setIsRead(room);
      io.emit("set_read_arr", arr);
    } catch (error) {
      console.error(
        `updateAndSetChat function 중 오류 발생: ${
          error.message
        } | ${getCurrentTimeFormatted()}`
      );
    }
  }

  // 입력된 날짜 문자열을 Date 객체로 변환하는 로직
  function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);

    const options = {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };

    return date.toLocaleTimeString("en-US", options);
  }

  const extractSuffix = (inputStr) => {
    const parts = inputStr.split("/");
    return parts.length > 0 ? parts[parts.length - 1] : "";
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Intl.DateTimeFormat("ko-KR", options).format(date);
  };
});

const getCurrentTimeFormatted = () => {
  const now = new Date();
  const options = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZoneName: "short",
  };
  // 대한민국 표준시 정보를 포함하지 않도록 설정
  return now.toLocaleString("en-US", options).replace("GMT+9", "").trim();
};

// 서버를 지정한 포트 번호로 실행 함
server.listen(process.env.PORT, () => {
  console.log(
    `Server listening at port ${
      process.env.PORT
    } | ${getCurrentTimeFormatted()}`
  );
});
