import ToastPortal from "./ToastPortal"
import "./Toast.style.scss"

function Toast() {
  return (
    <ToastPortal>
      <p className="toast_text">복사가 완료되었습니다.</p>
    </ToastPortal>
  )
}

export default Toast
