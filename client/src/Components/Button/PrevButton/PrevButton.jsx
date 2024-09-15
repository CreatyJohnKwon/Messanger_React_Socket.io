import React from "react";
import { useNavigate } from "react-router-dom";
import Image from "../../Image/Image";
import leftArrow from "../../../Assets/Images/leftArrow.svg";
import Store from "../../../Store/Store";
import "./PrevButton.style.scss";
import { GlobalStore } from "../../../Store/Store";

function PrevButton({ title }) {
  const navigate = useNavigate();
  const { platform } = GlobalStore();

  const handleGoBack = () => {
    if (platform === "ios" || platform === "aos") navigate(-1);
    else
      window.location.pathname === "/talk/taxTalk"
        ? window.close()
        : navigate(-1);
  };

  return (
    <div className="section_indicator" id="section_top">
      <div className="link_prevPage">
        <button
          type="button"
          className="button__prevPage"
          aria-label="이전 화면으로 이동"
          onClick={handleGoBack}
        >
          <Image srcValue={leftArrow} altValue="왼쪽 꺽쇠 이미지" />
        </button>
        <span className="text_chatTitle">{title}</span>
      </div>
    </div>
  );
}

export default PrevButton;
