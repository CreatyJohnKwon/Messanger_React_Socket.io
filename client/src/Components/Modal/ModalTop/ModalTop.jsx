import "./ModalTop.style.scss";

function ModalTop({ title, children, closeHandler }) {
  return (
    <div className="modal_top">
      <span className="modal_title">{title}</span>
      {children && <p className="modal_subTitle">{children}</p>}
      <button type="button" className="button_close" onClick={closeHandler}>
        <span className="offscreen">{`${title} 모달 종료하기`}</span>
      </button>
    </div>
  );
}

export default ModalTop;
