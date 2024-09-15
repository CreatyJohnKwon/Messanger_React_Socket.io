import { useEffect } from "react"
import CheckBoxList from "../../Components/Checkbox/CheckBoxList"
import AccordionNested from "../../Components/Accordion/AccordionNested"
import useRoomAccordionData from "../Common/useRoomAccordionData"
import "../../Components/Accordion/Accordion.style.scss"

import { useSocket } from "../../Socket/SocketContext"
import { GlobalStore } from "../../Store/Store"

const MakeRoomAccordion = () => {
  const socket = useSocket()
  const { setMembers, setDepts, mstId, userId } = GlobalStore()
  const { nestedAccordionData } = useRoomAccordionData()

  useEffect(() => {
    socket.emit("req_corp_info", { mstId, userId })
    socket.on("res_corp_dept", (data) => { setDepts(data) })
    socket.on("res_corp_member", (data) => { setMembers(data.member) })

    return () => {
      socket.off("req_corp_info")
      socket.off("res_corp_dept")
      socket.off("res_corp_member")
    }
  }, [])

  return (
    <>
      <AccordionNested
        nestedAccordionData={nestedAccordionData}
        innerComponent={CheckBoxList}
        noDataMessage={"부서/팀의 데이터가 존재하지 않습니다."}
      />
    </>
  )
}

export default MakeRoomAccordion
