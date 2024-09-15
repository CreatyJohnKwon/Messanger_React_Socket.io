import Image from "../../Image/Image";
import "./ButtonImage.style.scss";

function ButtonImage({ buttonName, srcValue, altValue, clickHandler }) {
  return (
    <button
      type="button"
      aria-label={buttonName}
      className="button_image"
      onClick={clickHandler}
    >
      <Image srcValue={srcValue} altValue={altValue} />
    </button>
  );
}

export default ButtonImage;
