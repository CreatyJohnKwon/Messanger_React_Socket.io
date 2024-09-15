# React-Socket.IO_PJ

리액트로 소켓 통신 구현

<br />

# 작업자
#### JW Kwon : FE & AOS Launching

<br />

## Velog - socket.IO 섭렵기 기록 (FE)

##### https://velog.io/@creatyjohn/REACT-주니어의-Socket.IO-경험기1
##### https://velog.io/@creatyjohn/REACT-주니어의-Socket.IO-경험기2

<br />

# 커밋 일기

## 240809
#### 더 이상 뒤로 갈 수 없는 세무톡에서 뒤로가거나 새로고침을 할 시, alert 로 한번 물어보게 하려고 한다
###### 뒤로가기 및 새로고침 막기, 아래와 같은 alert 으로 한번 더 확인한다
#### "사이트를 나가시겠습니까?"

~~~javascript
/* client/src/App.js */
const preventClose = (e) => {  
    e.preventDefault() 
    e.returnValue = ""
}

useEffect(() => {
    window.addEventListener("beforeunload", preventClose)

    return () => {
        window.removeEventListener("beforeunload", preventClose)
    }
}, [])
~~~

## 240819
#### 1. 톡 종료 시 종료 Ask 팝업 철회함

#### 2. PrevButton.jsx
- 순정 라우팅에서 팝업형 라우팅으로 변경 되었으므로 prevButton 동작 형식도 바뀜
- 현재 경로를 가져와서, **정확히** '/talk/taxTalk' 일 경우에만 창이 아예 꺼지도록 바뀜

~~~javascript
/* client/src/Components/Button/PrevButton/PrevButton.jsx/line:11 */
const handleGoBack = () => {
    window.location.pathname === '/talk/taxTalk' ? window.close() : navigate(-1)
}
~~~

#### 3. Tabpanel.jsx
- 팝업형 라우팅 과정에 있어서 해당 ROOM_CD 도 param 으로 받아서 "_blank" 대신에 네이밍을 해주어야 함
- 이유는 무조건 새 창만 팝업되는 현상을 방지하기 위함 (하나의 방이 클릭할때마다 중복해서 계속 나오는 현상/ 이미 열려 있는 방은 새로고침만 적용 되어야 정상 작동으로 판단 함)
- 해당 현상을 완화하기 위해 스타일이 달리 적용되었음. CSS 연구 필요
~~~javascript
/* client/src/Components/Tab/TabPanel.jsx/line:99 */
const openInNewTab = (url, roomCd) => {
    const windowOptions = "width=600,height=1000,resizable=no,scrollbars=no,location=no,menubar=no,status=no,fullscreen=no,titlebar=no"
    const newWindow = window.open(url, roomCd, windowOptions)
    if (newWindow) {
        newWindow.opener = null
    }
}
~~~

#### 4. Store.jsx
- New Logic for divide socket connecting devices / PC & Mobile
- Mobile ? true : false (~q => PC ? false : true)
```javascript
/* client/src/Store/Store.jsx/line:7 */
isMobile: false,
setIsMobile: (data) =>
    set({ isMobile: data }),
```

#### 5. TaxTalk.jsx
> solute ```1.``` problem here...
- ```Problem``` : Refresh Component bring Crash each Rooms
- ```Solute``` : Deprecate ```F5 || ctrl+r```
```javascript
/* client/src/Components/Pages/Talk/TaxTalk.jsx/line:16 */
const preventRefresh = (event) => {
    if (event.ctrlKey || event.key === "F5") {
        event.preventDefault()
        event.returnValue = ""
    }
}
    
useEffect(() => { 
    const handleKeyDown = (event) => {
        if ((event.ctrlKey && event.key === 'r') || event.key === 'F5') {
            preventRefresh(event)
        }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {    
        window.removeEventListener("keydown", handleKeyDown)
    }
}, [])
```

#### 6. UX -> Uncomfortable interface to wait for chat messages
- Firstable, ~~It's not a Server side's position.~~
- Secondable, It must ```await``` until set list of messages in Client side.
- Ok then, Let's search about how to get Progress Bar modules or something...
- Is React have a better modules about progress bar?
- Before that We have Gif Image for Test Code
- Let's try it!

#### 7. index.js
- Edit file type format logic
- ```Undefined``` data format to just ```null``` or ```empty String``` data
```javascript
/* server/index.js */
const extractSuffix = (inputStr) => {
    const parts = inputStr.split("/")
    return parts.length > 0 ? parts[parts.length - 1] : ''
}
```

#### 8. index.js
- fileType data preprocessing for DB Error that
- if fileDiv(fileType) over then 50 char, theirs length error
- solute : format fileType that based with ```"/"``` and ```Pop(LIFO)``` it
```javascript
/* server/index.js */
const fileType = file.fileType.split("/").pop()
```

## 240820
#### 1. index.js / Chat.jsx
- Speed ​​improvements when setting chat messageses
- Reform debud speed : **349ms -> 143ms**
- Reform code length : **64 -> 51**
- *Before* : received the data, one by one to client Status Effect
- *After* : received the data once, push to Array **'messages'**
- It made more comfortable to separate chat message data
```javascript
/* Before server/index.js:line477 */
for (let i = 0; i < rows.length; i++) {
    const currentDate = new Date(rows[i].REG_DT);

    let nextDate = null;
    if (i < rows.length - 1) {
        nextDate = new Date(rows[i + 1].REG_DT);
    }

    if (
        nextDate === null ||
        currentDate.getFullYear() !== nextDate.getFullYear() ||
        currentDate.getMonth() !== nextDate.getMonth() ||
        currentDate.getDate() !== nextDate.getDate()
    ) {
        const isText = parseInt(rows[i].IS_TEXT) === 1;

        const file = [
        {
            fileUrl: `https://attachfile-board.s3.ap-northeast-2.amazonaws.com/${
            rows[i].REAL_NAME.split("_")[0]
            }/${rows[i].REAL_NAME.split(".")[0]}`,
            fileNm: rows[i].FILE_NAME,
            fileType: extractSuffix(rows[i].FILE_DIV),
        },
        ];

        socket.emit("message_info", {
        code: 0,
        len: rows.length,
        user: rows[i].USER_NM,
        id: rows[i].USER_ID,
        txt: rows[i].CHAT_CONTENTS,
        isText,
        isRead: rows[i].READ_YN,
        file: file[0],
        time: formatDateTime(rows[i].REG_DT),
        date: nextDate, // nextDate가 null일 경우에는 마지막 요소임
        });
    } else {
        const isText = parseInt(rows[i].IS_TEXT) === 1;

        const file = [
        {
            fileUrl: `https://attachfile-board.s3.ap-northeast-2.amazonaws.com/${
            rows[i].REAL_NAME.split("_")[0]
            }/${rows[i].REAL_NAME.split(".")[0]}`,
            fileNm: rows[i].FILE_NAME,
            fileType: extractSuffix(rows[i].FILE_DIV),
        },
        ];

        socket.emit("message_info", {
        code: 1,
        len: rows.length,
        user: rows[i].USER_NM,
        id: rows[i].USER_ID,
        txt: rows[i].CHAT_CONTENTS,
        isText,
        isRead: rows[i].READ_YN,
        file: file[0],
        time: formatDateTime(rows[i].REG_DT),
        date: rows[i].REG_DT,
        });
    }
}

/* Before client/src/Components/Chat/Chat.jsx:line:44 */
const handleMessageInfo = async (message) => {
    setMessages((messages) => [...messages, message])
    if (message.len) setMessageLen(message.len)
    else setMessageLen(0)
}
```
<br />

```javascript
/* After server/index.js/line:474 */
const messages = [] // array type variable 

for (let i = 0; i < rows.length; i++) {
    ...

    // 공통요소 pickout
    const isText = parseInt(rows[i].IS_TEXT) === 1

    const file = [
        {
        fileUrl: `https://attachfile-board.s3.ap-northeast-2.amazonaws.com/${
            rows[i].REAL_NAME.split("_")[0]
        }/${rows[i].REAL_NAME.split(".")[0]}`,
        fileNm: rows[i].FILE_NAME,
        fileType: extractSuffix(rows[i].FILE_DIV),
        },
    ];

    if (
        nextDate === null ||
        currentDate.getFullYear() !== nextDate.getFullYear() ||
        currentDate.getMonth() !== nextDate.getMonth() ||
        currentDate.getDate() !== nextDate.getDate()
    ) {
        messages.push({
            code: 0,
            len: rows.length,
            user: rows[i].USER_NM,
            id: rows[i].USER_ID,
            txt: rows[i].CHAT_CONTENTS,
            isText,
            isRead: rows[i].READ_YN,
            file: file[0],
            time: formatDateTime(rows[i].REG_DT),
            date: nextDate,
        });
    } else {
        messages.push({
            code: 1,
            len: rows.length,
            user: rows[i].USER_NM,
            id: rows[i].USER_ID,
            txt: rows[i].CHAT_CONTENTS,
            isText,
            isRead: rows[i].READ_YN,
            file: file[0],
            time: formatDateTime(rows[i].REG_DT),
            date: rows[i].REG_DT,
        });
    }
}

// send socket just once
socket.emit("message_info", messages)

/* After client/src/Components/Chat/Chat.jsx:line:44 */
const handleMessageInfo = async (message) => {
    setMessages((messages) => [...messages, ...message])
    if (message.length > 0) setMessageLen(message[0].len)
    else setMessageLen(0)
}
```

#### 2. ChatSingleMessage.jsx
- **problem** : copy fileUrl is unnecessary when user clicked image
- **solute** : popUp new window fileUrl when user onClick Image
```javascript
/* ChatSingleMessage.jsx */
// line:144
const popUrl = async (url) => {
    try {
        window.open(url, url, "width:100%;height:100%;scrollbars=no,menubar=no,fullscreen=no")
    } catch (error) {
        console.error("clipboared에 복사 중 에러가 발생했습니다.", error)
    }
}
```
```xml
<!-- line:233 / edit text --> 
<button
    type="button"
    className={`message_copy ${showCopyText ? "show" : ""}`}
    onClick={() => popUrl(file.fileUrl)}
    >
    <!-- 기존의 '링크 복사하기' 에서 '새 창 띄우기' 로 edit-->
    새 창으로 띄우기
</button>
```
##
### Must DO. Eclipse Logic ```iframe``` or ```<a href /> Tag```
> reference : https://sweetpro.tistory.com/79

## MemberTalk Error List
### Accordion : onSearch build Error
- Problem : 직원이 많을 경우 특정 직원을 찾으려는 과정이 필요함
- Feature : 열었다 닫을 수 있는 리스트 형식으로 화살표를 사용
- Error : onSearch, 모달이 겹쳐서 생기는 에러가 아닐까
- Solute1 : 1차 테스트를 위해서 검색창을 제외하고 서버 반영 예정
- Solute2 : 테스트 동안 백그라운드에서 작업하여 개선

### Accordion : checked user invite logic
- Problem : 부서별로 나뉜, 여러 직원을 동시 초대 하려고 함
- Feature : 여러 직원을 체크 하여 한꺼번에 대상 추가
- Error : 이쪽 부서를 체크하다가 다른 부서를 체크하면 이전 체크 삭제 됨
- Solute : 멤버톡 초대 핵심이라 늦출 수 없음 로직 상, 상태관리 속의 문제를 찾으면 금방 오류를 해결할 수 있을 듯