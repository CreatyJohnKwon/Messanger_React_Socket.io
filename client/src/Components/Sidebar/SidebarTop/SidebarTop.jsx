import  { GlobalStore } from "../../../Store/Store";
import "./SidebarTop.style.scss";

function SidebarTop() {
  const { roomData, roomNm } = GlobalStore();

  const formatDate = (isoString) => {
    const date = new Date(isoString);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // 월은 0부터 시작하므로 +1
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}.${month}.${day}`;
  };

  return (
    <div className="sidebar_info">
      <span className="sidebar_text">{roomNm}</span>
      <p className="text_chatDate">
        개설일 :{" "}
        <span className="text_date">{formatDate(roomData.REG_DT)}</span>{" "}
      </p>
    </div>
  );
}

export default SidebarTop;
