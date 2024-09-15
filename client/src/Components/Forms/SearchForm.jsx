import { useEffect } from "react";
import useDebounce from "./useDebounce";
import "./SearchForm.style.scss";

const SearchForm = ({
  inputTitle,
  placeHolderValue,
  userInputValue,
  setUserInputValue,
  setDebouncedUserInputValue,
}) => {
  const debouncedUserInputValue = useDebounce(userInputValue, 300);

  useEffect(() => {
    if (setDebouncedUserInputValue) {
      setDebouncedUserInputValue(debouncedUserInputValue);
    }
  }, [debouncedUserInputValue, setDebouncedUserInputValue]);

  const onChangeHandler = (e) => {
    setUserInputValue(e.target.value);
  };

  const handleMessageSubmit = async (e) => {
    if (e.key === "Enter") {
      if (debouncedUserInputValue) {
        setUserInputValue("");
      } else {
        // console.log("유저가 엔터키를 눌렀지만, 메세지가 없는 경우 입니다.");
      }
    }
  };

  return (
    <div className="searchInput">
      <input
        type="text"
        inputMode="text"
        className="form_input"
        title={inputTitle}
        value={userInputValue}
        placeholder={placeHolderValue}
        onChange={onChangeHandler}
        onKeyDown={handleMessageSubmit}
      />
    </div>
  );
};

export default SearchForm;
