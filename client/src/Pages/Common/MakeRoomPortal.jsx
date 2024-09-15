import ReactDOM from "react-dom";

function MakeRoomPortal({ children }) {
  const el = document.getElementById("modal_room");
  if (!el) {
    console.error("Target container #modal_room not found in the DOM.")
    return null
  }
  return ReactDOM.createPortal(children, el);
}

export default MakeRoomPortal;
