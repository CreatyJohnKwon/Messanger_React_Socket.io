import FilesList from "./FilesList"
import "./Files.style.scss"

function Files({ filesBox }) {
  const files = filesBox.file

  return files && (
    <ul className="list_files">
      {
        files[0].txt ? <li className="item_vacant">{files[0].txt}</li> : 
        files.map((file, i) => {
          const currentDate = file.currentDay
          const nextDate = file.nextDay
          const showDate = nextDate === currentDate

          return (
            <li key={i} className="item_files">
              {i === 0 && <p className="text_savedDate">{currentDate}</p>}
              <ul className="list_savedFiles">
                <FilesList file={files} index={i} />
              </ul>
              {files.length !== 1 && !showDate && (
                <p className="text_savedDate">{nextDate}</p>
              )}
            </li>
          )
        })
      }
    </ul>
  )
}

export default Files
