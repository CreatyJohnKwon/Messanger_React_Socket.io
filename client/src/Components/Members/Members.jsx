import { Link } from "react-router-dom";
import Image from "../Image/Image";
import chatMemberCount from "../../Assets/Images/chatMemberCount.svg";
import userImage from "../../Assets/Images/user_default.png";
import addMembers from "../../Assets/Images/addMembers.svg";

import "./Members.style.scss";

//zustand store
import { GlobalStore } from "../../Store/Store";

function Members() {
  const { roomMembers, tabIndex } = GlobalStore();

  return (
    <li key="chatMemberCount" className="item_sideBarMenu item_members">
      <div className="title_members">
        <div className="image_sideBarIcon">
          <Image
            srcValue={chatMemberCount}
            altValue="말풍선이 겹쳐있는 이미지"
          />
        </div>
        <p className="text_sideBar">대화방 인원</p>
      </div>

      {tabIndex === 0 ? (
        <Link // 사내톡만
          to={"/create?index=2"}
          // state={MemberInfoPage}
          role="button"
          className="link_addMember"
        >
          <div className="image_add">
            <Image
              srcValue={addMembers}
              altValue="플러스 이미지가 원 안에 위치한 이미지"
            />
          </div>
          <span className="text_addMeber">대화상대 추가</span>
        </Link>
      ) : (
        <></>
      )}

      <ul className="list_member">
        {roomMembers.map((members, index) => {
          return (
            <li key={index} className="item_member">
              <div className="image_member">
                <Image
                  srcValue={userImage}
                  altValue={`${members.USER_NM} ${members.POSN_NM}의 프로필 이미지 `}
                />
              </div>
              <span className="text_memberName">{members.USER_NM}</span>
              {members.POSN_NM ? (
                <span className="text_memberStatus">{members.POSN_NM}</span>
              ) : (
                <span className="text_memberStatus no_status">
                  <span className="offscreen">직급없음</span>
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </li>
  );
}

export default Members;
