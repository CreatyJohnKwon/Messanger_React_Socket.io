import { useState, useRef, useEffect } from "react"
import Image from "../Image/Image"
import ChatForm from "../Forms/ChatForm"
import "./InputBox.style.scss"

function InputBox({
  boxSrc,
  boxAlt,
  sendSrc,
  sendAlt,
  title,
  placeholder,
  isRectangle,
  isButtonExist,
  setMessage,
  sendMessage,
  uploadFile,
  message,
}) {
  const [showAnimation, setShowAnimationOverlay] = useState(false);

  const className = isRectangle ? "searchFinder" : "";
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      // inputRef.current.focus()
    }
  }, []);

  const handleFileButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileInput = (event) => {
    if (event) {
      uploadFile(event.target.files[0])
        .then((file) => {
          sendMessage({ file, isText: false });
        })
        .catch((error) => {
          console.error(`File upload failed: ${error.message}`);
        });
    }
  };

  return (
    <div className={`inputBox ${className}`}>
      <button
        type="button"
        className="button_showBox"
        onClick={handleFileButtonClick}
      >
        <Image srcValue={boxSrc} altValue={boxAlt} />
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          multiple
          onChange={handleFileInput}
        />
      </button>
      <ChatForm
        ref={inputRef}
        inputTitle={title}
        placeHolderValue={placeholder}
        currentInputValue=""
        setMessage={setMessage}
        sendMessage={sendMessage}
        message={message}
      />
      {isButtonExist && (
        <button
          type="button"
          className={`button_sendMessage ${showAnimation ? "animate" : ""} `}
          onClick={(event) => sendMessage({ event, isText: true })}
        >
          <Image srcValue={sendSrc} altValue={sendAlt} />
        </button>
      )}
    </div>
  );
}

export default InputBox;
