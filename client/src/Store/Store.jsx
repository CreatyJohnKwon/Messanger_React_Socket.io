import { create } from "zustand"
import { persist } from "zustand/middleware"

export const GlobalStore = create(
  persist(
    (set) => ({
      /*** 접속 디바이스 유형 관리 / true : 모바일 접속, false : PC 접속 */
      platform: "",
      setPlatform: (data) =>
        set({ platform: data }),

      /*** 사용자 정보 관리 */
      userId: '',
      setUserId: (data) =>
        set({ userId: data }),

      mstId: '',
      setMstId: (data) =>
        set({ mstId: data }),

      userNm: '',
      setUserNm: (data) =>
        set({ userNm: data }),

      roomCd: '',
      setRoomCd: (data) =>
        set({ roomCd: data }),

      /*** 룸 멤버 관리 */
      roomMembers: [],
      setRoomMembers: (data) =>
        set({ roomMembers: data }),

      /*** 마스터 멤버 조회 */
      members: [],
      setMembers: (data) =>
        set({ members: data }),

      /*** 마스터 멤버 조회 */
      depts: [],
      setDepts: (data) =>
        set({ depts: data }),

      /*** 룸 이름 관리 */
      roomNm: "",
      setRoomNm: (data) =>
        set({ roomNm: data }),

      /*** 탭 상단 인덱스 관리 */
      tabIndex: 1,
      setTabIndex: (data) =>
        set({ tabIndex: data }),

      /*** 룸 파일 관리 */
      filesBox: [],
      setFilesBox: (data) =>
        set({ filesBox: data }),

      /*** 검색 컴포넌트 상태 관리 */
      isBoxVisible: false,
      handleVisible: () =>
        set((state) => ({ isBoxVisible: !state.isBoxVisible })),

      /*** 룸 정보 관리 */
      roomData: [],
      setRoomData: (data) =>
        set({ roomData: data }),

      /*** 마지막 시간 관리 */
      lastTime: " ",
      setLastTime: (data) =>
        set({ lastTime: data }),

      roomNotify1: 0,
      setRoomNotify1: () =>
        set((state) => ({ roomNotify1: state.roomNotify1 + 1 })),

      roomNotify2: 0,
      setRoomNotify2: () =>
        set((state) => ({ roomNotify2: state.roomNotify2 + 1 })),

      initRoomNotify1: (state) =>
        set(() => ({ roomNotify1: state })),

      initRoomNotify2: (state) =>
        set(() => ({ roomNotify2: state })),
    }),
    {
      name: "app-storage", // 로컬 스토리지에 저장될 키 이름
      getStorage: () => localStorage, // 기본값: localStorage
    }
  )
)