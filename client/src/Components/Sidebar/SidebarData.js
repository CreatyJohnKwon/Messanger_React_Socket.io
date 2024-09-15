import edit from "../../Assets/Images/edit.svg";
import fileSpace from "../../Assets/Images/fileSpace.svg";
import chatAlert from "../../Assets/Images/chatAlert.svg";
import { TaxTalkInfoData } from "../../Pages/Talk/TaxTalk/TaxTalkFileData";

// Pages/Talk/TaxTalk
const { chatInfo, fileRoomInfo } = TaxTalkInfoData;

//clickHandler로 훅의 정보를 가져와야 함
export const sidebarData = {
  menuTitle: chatInfo,
  menuContent: [
    {
      type: "button",
      key: "editMenu",
      srcValue: edit,
      altValue: "노트위에 연필이 있는 이미지",
      textValue: "채팅방 이름 변경",
      clickHandler: "clickHandler",
    },
    {
      type: "link",
      path: fileRoomInfo?.pathTo,
      key: "fileSpace",
      srcValue: fileSpace,
      altValue: "폴더와 문서가 겹쳐있는 이미지",
      textValue: "채팅방 보관함",
      fileInfo: TaxTalkInfoData,
    },
    // {
    //   type: "button",
    //   key: "chatAlert",
    //   srcValue: chatAlert,
    //   altValue: "종 모양 이미지",
    //   textValue: "알림 끄기",
    // },
  ],
};
