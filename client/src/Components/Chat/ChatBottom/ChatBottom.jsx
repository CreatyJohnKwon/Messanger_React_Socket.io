import InputBox from "../../InputBox/InputBox";
import "./ChatBottom.style.scss";

function ChatBottom({
  bs,
  ba,
  ss,
  sa,
  tt,
  ph,
  rec,
  ib,
  setMessage,
  sendMessage,
  uploadFile,
  message,
}) {
  return (
    <footer className="chat_bottom">
      <h2 className="offscreen">채팅창 메세지 입력창</h2>
      <InputBox
        boxSrc={bs}
        boxAlt={ba}
        isButtonExist={ib}
        sendSrc={ss}
        sendAlt={sa}
        title={tt}
        placeholder={ph}
        isRectangle={rec}
        setMessage={setMessage}
        sendMessage={sendMessage}
        uploadFile={uploadFile}
        message={message}
      />
    </footer>
  );
}

export default ChatBottom;
