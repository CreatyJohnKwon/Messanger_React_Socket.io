import ModalTop from "./ModalTop/ModalTop"
import ModalContent from "./ModalContent/ModalContent"
import ModalBottom from "./ModalBottom/ModalBottom"
import "./Modal.style.scss"

function Modal({
  modalTitle,
  modalSubTitle,
  modalContentValue,
  modalButtonType,
  modalCloseHandler,
  modalSubmitHandler,
}) {
  return (
    <>
      <div className="modal">
        <ModalTop title={modalTitle} closeHandler={modalCloseHandler}>
          {modalSubTitle}
        </ModalTop>
        <ModalContent>{modalContentValue}</ModalContent>
        <ModalBottom
          buttonType={modalButtonType}
          handleCancel={modalCloseHandler}
          handleSubmit={modalSubmitHandler}
        />
      </div>
      <div className="overlay"></div>
    </>
  )
}

export default Modal
