import { useEffect, useState, forwardRef, useCallback } from "react"
import useDebounce from "./useDebounce"
import "./ChatForm.style.scss"
import { GlobalStore } from "../../Store/Store"

const ChatForm = forwardRef(
  ({
      inputTitle,
      placeHolderValue,
      userInputValue,
      setDebouncedUserInputValue,
      setMessage,
      sendMessage,
      message,
    },
    ref
  ) => {
    const debouncedUserInputValue = useDebounce(userInputValue, 300)
    const [ lastCalled, setLastCalled ] = useState(0)
    const { platform } = GlobalStore()

    useEffect(() => {
      if (message === "") {
        const inputBoxDOM = ref.current.parentElement.parentElement;
        inputBoxDOM.style.height = "40px";
      }
    }, [message]);

    const adjustHeight = useCallback((element) => {
      if (!element) return;
      const inputBox = element.parentElement.parentElement;
      inputBox.style.height = "auto";
      inputBox.style.height = element.scrollHeight + "px";
      const heightValue = parseInt(inputBox.style.height, 10);
      if (heightValue >= 110) {
        inputBox.style.maxHeight = "110px";
      }
    }, []);

    const keyDownFunc = (event) => {
      const now = Date.now();
      // const inputBoxDOM = ref.current.parentElement.parentElement

      // MacOS 에서는 두 번씩 호출되는 에러가 발생한다
      if (
        (event.key === "Enter" && !event.shiftKey && platform === "web") ||
        (event.key === "Enter" && !event.shiftKey && platform === "mac")
      ) {
        if (platform === "mac") {
          if (now - lastCalled > 500) {
            sendMessage({ event, isText: true });
            setLastCalled(now);
          }
        } else {
          event.preventDefault();
          sendMessage({ event, isText: true });
        }
      }
    };

    return (
      <div className="searchInput">
        <textarea
          ref={ref}
          className="form_input"
          title={inputTitle}
          value={message}
          placeholder={placeHolderValue}
          onChange={({ target: { value } }) => {
            setMessage(value);
            adjustHeight(ref.current);
          }}
          onKeyDown={(event) => {
            keyDownFunc(event);
          }}
          style={{ resize: "none" }}
        />
      </div>
    );
  }
);

export default ChatForm;
