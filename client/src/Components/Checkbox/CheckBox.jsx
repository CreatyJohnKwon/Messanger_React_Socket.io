import { useState, useEffect, useRef } from "react"
import Image from "../Image/Image"
// import { GlobalStore } from "../../Store/Store"

function CheckBox({
  checked,
  handleCurrentCheckInput,
  id,
  nameValue,
  srcValue,
  altValue,
  rank,
  status
}) {
  // 개별 인풋의 상태
  const [singleCheckInput, setSinglecheckInput] = useState(checked)
  const [centeredYPosition, setCenteredYPosition] = useState(0)
  const [leftFromImagePosition, setLeftFromImagePosition] = useState(0)
  const [afterTextPosition, setAfterTextPosition] = useState(0)

  const centeredYPositionRef = useRef(null)
  const leftFromImagePositionRef = useRef(null)
  const afterTextPositionRef = useRef(null)

  // 개별 인풋의 핸들러
  // 개별 인풋을 체크하면
  const handEachInputHandler = ({ target: { checked, id } }) => {
    // checked된 상태와, 해당 인풋의 id를 받아서
    // [#개별] 개별 인풋의 상태를 변경하고
    setSinglecheckInput(checked)
    // [#전체] 현재 어떤 인풋들을 체크했는지, 어떤 인풋의 정보를 변경함
    handleCurrentCheckInput(id, checked)
  }

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === "space") {
      setSinglecheckInput(!singleCheckInput)
      handleCurrentCheckInput(id, !singleCheckInput)
    }
  }

  // 부모 컴포넌트로부터 전달된 checked 상태를 내부 상태로 설정
  useEffect(() => {
    setSinglecheckInput(checked)
  }, [checked])

  // 이름
  useEffect(() => {
    if (leftFromImagePositionRef.current) {
      setLeftFromImagePosition(
        leftFromImagePositionRef.current.offsetWidth + 10
      )
    }
  }, [])

  // 직급
  useEffect(() => {
    if (leftFromImagePositionRef.current) {
      setAfterTextPosition(leftFromImagePositionRef.current.offsetWidth + 73)
    }
  }, [])

  // 텍스트 top, center
  useEffect(() => {
    if (
      centeredYPositionRef.current &&
      centeredYPositionRef.current?.offsetHeight > 0
    ) {
      setCenteredYPosition(centeredYPositionRef.current?.offsetHeight / 2 - 8)
    }
  }, [leftFromImagePosition])

  return (
    <>
      <li className={`item_checkbox ${status ? "online" : "offline"}`}>
        <div className="section_user">
          <div className="image_checkbox" ref={leftFromImagePositionRef}>
            <Image srcValue={srcValue} altValue={altValue} />
          </div>
          <div className="text_userRank" ref={centeredYPositionRef}>
            <label
              htmlFor={id}
              className="text_label"
              ref={afterTextPositionRef}
              style={{
                paddingTop: `${centeredYPosition && centeredYPosition}px`,
                paddingLeft: `${
                  leftFromImagePosition && leftFromImagePosition
                }px`,
              }}
            >
              {nameValue}
            </label>
            <span
              className="text_rank"
              style={{
                paddingTop: `${centeredYPosition && centeredYPosition}px`,
                paddingLeft: `${afterTextPosition && afterTextPosition}px`,
              }}
            >
              {rank}
            </span>
          </div>
        </div>
        <div className="section_checkbox">
          <input
            type="checkbox"
            className="form_input"
            id={id}
            checked={singleCheckInput} // 내부 상태를 사용하여 체크박스 상태 설정
            // disabled={status ? false : true} // 기획이 수정되어, offline 상태여도 초대 가능함
            onChange={handEachInputHandler}
            onKeyDown={handleKeyDown}
            aria-disabled={status ? "false" : "true"}
            aria-checked={singleCheckInput}
            aria-labelledby={id}
            aria-label={`Checkbox for ${nameValue}`}
            tabIndex="0"
          />
        </div>
      </li>
    </>
  )
}

export default CheckBox
