import "./Overlay.style.scss";

function Overlay({ onClick }) {
  return <div className="overlay" onClick={onClick}></div>;
}

export default Overlay;
