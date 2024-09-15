import "./ModalBottom.style.scss";

//모달로 타이틀 변경하는 흐름 순서 5
// 변경된 모달의 타이틀 값을 버튼, 저장에 바인딩하기위해 전달된 함수 props, handleSubmit을 버튼을 onClick 이벤트에 바인딩함
function ModalBottom({ buttonType, handleCancel, handleSubmit }) {
  const handleChangeSubmit = () => {
    if (handleSubmit) {
      handleSubmit();
    }
    handleCancel();
  };

  const twoButtons = (
    <>
      <button className="modal_button action_canel" onClick={handleCancel}>
        취소
      </button>
      <button
        className="modal_button action_submit"
        onClick={handleChangeSubmit}
      >
        저장
      </button>
    </>
  );

  const oneButton = (
    <>
      <button
        className="modal_button single_submit"
        onClick={handleChangeSubmit}
      >
        확인
      </button>
    </>
  );

  let content;

  switch (buttonType) {
    case "typeOne":
      content = oneButton;
      break;
    case "typeTwo":
      content = twoButtons;
      break;
    default:
      content = null;
  }

  if (content === null) content = oneButton;

  // console.log("handleSubmit은 무엇일까", handleSubmit);

  return <div className="modal_bottom">{content}</div>;
}

export default ModalBottom;
