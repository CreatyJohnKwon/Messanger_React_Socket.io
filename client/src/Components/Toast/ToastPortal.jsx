import ReactDOM from "react-dom"

function ToastPortal({ children }) {
  const el = document.getElementById("toast")
  return ReactDOM.createPortal(children, el)
}

export default ToastPortal
