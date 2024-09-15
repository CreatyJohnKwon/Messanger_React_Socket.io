import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GlobalStore } from "../../../Store/Store";
import { tabData } from "./TabData";
import "./TabMenu.style.scss";

function TabMenu() {
  const { 
    setTabIndex, 
    tabIndex, 
    mstId, 
    platform,
    roomNotify1,
    roomNotify2 
  } = GlobalStore();
  const navigate = useNavigate();
  const tabRefs = useRef([]);
  const sliderRef = useRef(null);
  const [sliderWidth, setSliderWidth] = useState(0);
  const [sliderLeft, setSliderLeft] = useState(12);

  const { menu } = tabData;

  const goCreateUser = () => {
    navigate("/create?index=1");
  };

  if (mstId.startsWith("T")) {
    menu[1].content = "텍스톡";
  } else {
    menu[1].content = "전문가톡";
  }

  const alertMsg = "서비스 준비 중입니다";
  const clicked = (index) => {
    if (mstId === "kocore") {
      setTabIndex(index);
    } else {
      if (index === 0) {
        if (platform === "aos") {
          window.AOS.alert(alertMsg);
        } else {
          alert(alertMsg);
        }
      } else {
        setTabIndex(index);
      }
    }
  };

  const updateSlider = (index) => {
    const selectedTab = tabRefs.current[index];
    if (selectedTab) {
      setSliderWidth(selectedTab.clientWidth);
      let leftPosition = 10;
      for (let i = 0; i < index; i++) {
        leftPosition += tabRefs.current[i].clientWidth + 10;
      }
      setSliderLeft(leftPosition);
    }
  };

  useEffect(() => {
    updateSlider(tabIndex);
  }, [tabIndex]);

  return (
    <div className="tab_Menu" id="section_top">
      <span className="offscreen">탭 메뉴</span>
      <div className="space_menu">
        <ul className="list_tab">
          {menu.map(({ key, content }, index) => (
            <li
              key={key}
              className={`item_tab ${index === tabIndex ? "active" : ""}`}
              ref={(el) => (tabRefs.current[index] = el)}
            >
              <button
                type="button"
                className="button_tab"
                onClick={() => {
                  clicked(index);
                  updateSlider(index);
                }}
              >
                <span className="text_button">{content}</span>
                {index === 0 && roomNotify1 > 0 && <span className="text_count">{roomNotify1}</span>}
                {index === 1 && roomNotify2 > 0 && <span className="text_count">{roomNotify2}</span>}
              </button>
            </li>
          ))}
        </ul>
        <span
          className={`slider ${tabIndex !== null ? "active" : ""}`}
          ref={sliderRef}
          style={{
            width: `${sliderWidth}px`,
            left: `${sliderLeft}px`,
          }}
        >
          <span className="offscreen">선택됨</span>
        </span>
      </div>
      {tabIndex === 0 ? (
        <>
          <button
            type="button"
            className="button_create"
            aria-label="새로 방 만들기"
            onClick={goCreateUser}
          />
        </>
      ) : (
        <></>
      )}
    </div>
  );
}

export default TabMenu;
