import { forwardRef, useState } from "react"
import searchTalk from "../../Assets/Images/searchTalk.svg"
import Image from "../Image/Image"
import "./Finder.style.scss"

const Finder = forwardRef(({ onSearch }, ref) => {
  const [searchText, setSearchText] = useState("")

  const handleChange = (e) => {
    const newText = e.target.value
    setSearchText(newText)
    onSearch(newText)
  }

  return (
    <div className="finder">
      <div className="finder_contents">
        <div className="finder_image">
          <Image srcValue={searchTalk} altValue={"검색 돋보기 아이콘 이미지"} />
        </div>
        <div className="finder_input">
          <input
            ref={ref}
            type="done"
            title="검색어 인풋"
            placeholder="검색어를 입력하세요"
            className="form_input"
            value={searchText}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  )
})

export default Finder