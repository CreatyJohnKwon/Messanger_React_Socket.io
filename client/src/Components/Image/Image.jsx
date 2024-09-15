import "./Image.style.scss";

function Image({ srcValue, altValue }) {
  return (
    <div className="image_wrap">
      <img src={srcValue} alt={altValue} />
    </div>
  );
}

export default Image;
