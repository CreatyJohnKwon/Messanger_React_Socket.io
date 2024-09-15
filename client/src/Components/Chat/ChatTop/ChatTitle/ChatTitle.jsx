import { GlobalStore } from "../../../../Store/Store";
import PrevButton from "../../../Button/PrevButton/PrevButton";
import "./ChatTitle.style.scss";

function ChatTitle({ path }) {
  const { roomNm } = GlobalStore();

  return <PrevButton path={path} title={roomNm} />;
}

export default ChatTitle;
