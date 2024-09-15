import "./ModalContent.style.scss";

function ModalContent({ children }) {
  return <div className="modal_content">{children()}</div>;
}

export default ModalContent;
