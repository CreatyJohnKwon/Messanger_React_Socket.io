import { useState, useRef, useEffect } from "react"
import CheckBox from "./CheckBox"
import DefaultImg from "../../Assets/Images/user_default.png"
import "./CheckBoxList.style.scss"

const CheckBoxList = ({ componentData }) => {
  // 체크한 인풋을 모아두는 상태
  const [currentCheckedInputs, setCurrentCheckedInputs] = useState(new Set())
  const checkBoxlistRef = useRef(null)

  useEffect(() => {
    if (checkBoxlistRef.current) {
      const liItemCount =
        checkBoxlistRef.current.querySelectorAll(".item_checkbox")
      if (liItemCount.length >= 3) {
        checkBoxlistRef.current.classList.add("item_scroll")
      }
    }
  }, [componentData])

  const handleCurrentCheckInput = (id, isChecked) => {
    const updatedCheckedInputs = new Set(currentCheckedInputs)
    const updatedCheckedToLocal = new Set(JSON.parse(localStorage.getItem("checkedInputs")) || [])

    if (isChecked) {
      updatedCheckedInputs.add(id)
      updatedCheckedToLocal.add(id)
    } else {
      updatedCheckedInputs.delete(id)
      updatedCheckedToLocal.delete(id)
    }

    setCurrentCheckedInputs(updatedCheckedInputs)
    localStorage.setItem("checkedInputs", JSON.stringify([...updatedCheckedToLocal]))
  }

  return (
    <>
      <ul className="list_checkbox" ref={checkBoxlistRef}>
        {componentData.map(({ key, rank, nameValue, altValue, isOline }) => (
          <CheckBox
            key={key}
            rank={rank}
            status={isOline}
            nameValue={nameValue}
            id={key}
            srcValue={DefaultImg}
            altValue={altValue}
            checked={currentCheckedInputs.has(key)} // 개별 체크박스의 상태 전달
            handleCurrentCheckInput={handleCurrentCheckInput}
          />
        ))}
      </ul>
    </>
  )
}

export const getArrDataFromLocalStorage = () => {
  return JSON.parse(localStorage.getItem("checkedInputs")) || []
}

export default CheckBoxList
