# React-Socket.IO_PJ

리액트로 소켓 통신 구현

# 작업자 - HW ROH - WP

## history

- 240801 [7]

  - style 수정
  - 컴포넌트 마운트 이슈 (스크롤 / 버튼 VISIBLE)
    - 채팅 컴포넌트 초기 마운트의 스크롤과 버튼 보임 이슈

- 240802 [1]

  - 데이터 생성을 위한 함수 정의
    - 중첩 아코디언 데이터

- 240805 [3]

  - style 수정
  - 중첩 아코디언을 위한 데이터 생성 함수 리펙토링
  - 리액트 구조, 상태(STATE)와 뷰(VIEW)구조로 변경

- 240807 [1]

  - 변수 howFarScrolledUp를 ref 객체, howFarScrolledUpRef 로 변경해 topToBottom 버튼 작동하지 않는 이슈 해결
    - 변수 howFarScrolledUp가 함수 handleScroll에 정의되어 있어, 스코프 문제로 Chat 컴포넌트 전역에서 사용하기 위해, useRef객체로 변경해 작동되지 않는 이슈 해결

- 240808 [1]
  - 아코디언 아이템 갯수가 많을 경우/부족한 경우에 따라 스크롤 css 추가
  - 현재 아코디언 아이템의 갯수가 많고 적음을 보여줄 스타일적 기능 추가
 
- 240809 [1]
  - 메세지 입력 시, 메세지 여러줄 입력 되도록 기능 개선
    - 메세지 입력하고, Shift + enter 키를 누를 경우, 메세지 send 되지 않고, 다음 줄로 넘어가도록 기능 추가
    - 메세지에 입력한 공백도 적용되어 전달(send 되도록) 기능 변경
 
- 240812 [3]
  - 채팅 메세지 입력창 UI 개선
  - 이미지 height가 높은 이미지 업로드 시, 텍스트와 달리, 이미지가 짤려서, 이미지 bottom으로 scrollIntoView 가 되지 않는 이슈 해결 
  - 탭 패널 컨텐츠, 새창(window.open())에서 열리도록 코드 개선
    - '채팅방 나가기" 클릭 시, 새창 종료(window.close())되도록 코드 

## 240801 - searchme86 (Web Publisher)

#### 수행 작업 카테고리 (7)

- style 수정
- 컴포넌트 초기 마운트 처리
  - 채팅 컴포넌트 초기 마운트의 스크롤과 버튼 보임 이슈

##### 1.

##### 카테고리 : 스타일 (간격)

##### 경로 :

- client > Chat > ChatMessage > ChatMessageRow > ChatMessageRow.style.scss

##### 내용 : .chat_message 영역, padding-bottom 영역 수치 변경

##### 2.

##### 카테고리 : 기능개선 (스크롤)

##### 경로 :

- client > Chat > Chat.jsx

##### 내용 : topTopTobutton 버튼 활성(visible:true/false)되는 로직 변경

##### 변경 사유: 페이지 마다 스크롤 방식이 상이함

##### 상세 설명

    * 변수,thresholdValue
        - topTopTobutton 버튼이 활성화 되는 기준값,
        - 문서의 scrollHeight 값에 특정비율(0.9)로 계산함
        - 페이지 스크롤 값이 thresholdValue 보다 같거나 작을때, 클때 topTopTobutton 버튼 활성됨

    *topTopTobutton 버튼
        - 페이지 스크롤을 상단으로 이동 할 경우, 보여지는(visivle) 버튼
        - 최신 메세지(페이지 위치상 제일 하단)로 이동하도록 함

    *이전 코드
        - if(thresholdValue < scrollTop){...}

        [#코드 설명]
            - 출력되는 scrollTop 값이 스크롤 되는 값이라고 생각함

    *변경된 코드
        - if (thresholdValue <= *howFarScrolledUp) {...}

        - 유저가 스크롤 한 값 (howFarScrolledUp)과 기준점(thresholdValue)에 따라 핸들러를 트리거
            - howFarScrolledUp : 페이지 하단부터 상단까지 스크롤 얼만큼 되었는지를 담는 변수
                - howFarScrolledUp = scrollHeight - bottomLinePositionValue;
            - topTopTobutton 버튼 활성 조건 :
                - 유저가 스크롤 한 정도가, 페이지 상단에서 얼만큼 이동한 scrollTop이 아니라, 페이지 하단에서 페이지 상단으로 얼만큼 이동했는지 값이라는 것을 고려안함
            - 채팅 컴포넌트의 높이값(754px, 고정값)을 고려하지 않고, 단순 scrollTop 값으로 계산했음
                - bottomLinePositionValue : chatContainerRef.current.offsetHeight + scrollTop
                    - 채팅 컴포넌트의 높이값(chatContainerRef.current.offsetHeight)은 고정이고, 이 값에 스크롤 되는 값(scrollTop)이 총 페이지의 높이값
                    - 채팅 컴포넌트의 높이값은 고정적으로 보이는 부분, 페이지 스크롤 할 경우, scrollTop이 변함
                    - 현재 scrollTop의 값이 페이지 상단이 아닌, 페이지 하단이 포인트
                        - 페이지 하단의 포지션 값은, 고정적인 채팅 컴포넌트의 높이값  +  변경되는 scrollTop
            - howFarScrolledUp = scrollHeight - bottomLinePositionValue;
                - 페이지를 모두 스크롤 할 경우, bottomLinePositionValue의 값은 scrollHeight과 일치함
                    - 문서 전체 높이 = 현재 페이지 하단의 높이 + 스크롤 한 값
                        -  스크롤 한 값 = 문서 전체 높이 - 현재 페이지 하단의 높이

##### 3.

##### 카테고리 : 기능개선 (마운트 시점에 따른 버튼 보임/보이지 않음)

##### 경로 :

- client > Chat > Chat.jsx

##### 내용 : topTopTobutton 버튼이 Chat컴포넌트 마운트 동시에 아래 스크롤 될 경우, 보였다가 사라지는 이슈,<br/> 아래 스크롤 될 경우 보이지 않도록 수정

##### 변경 사유 : 컴포넌트 마운트 시점, 기본, 스크롤이 아래로 내려가도록 디폴트 설정을 하여,<br/> 채팅 컴포넌트의 높이 중 특정 시점(\*thresholdValue)을 지나가기 때문에 topTopTobutton 버튼이 보임

##### 상세 설명

        - const [initialScroll, setInitialScroll] = useState(true);
        - const handleScroll = (e) => { if (initialScroll) return; ... }
            - 컴포넌트 마운트 시, 함수 handleScroll가 실행되지 않도록, initialScroll을 true로 하여 함수 handleScroll실행되지 않도록 처리

        - setTimeout(() => {setInitialScroll(false);  return () => { setInitialScroll(true); }; }, 2000);
            - 컴포넌트가 페이지 하단 스크롤 할 경우, 일정시간(2000) 이후에 initialScroll를 false로 변경
                - 유저가 스크롤 할 경우, topTopTobutton 버튼이 나오도록, initialScroll 상태를 false로 변경 해야함
                - 컴포넌트가 언마운트 될 경우, initialScroll이 true가 되도록 처리

##### 4.

##### 카테고리 : 스타일

##### 경로

- client > Chat > ChatMessage > ChatMessageRow > ChatMessageRow.style.scss

##### 내용 : top-btn버튼, 모바일 사이즈에 따른 버튼 Position css 추가/변경

##### 5.

##### 카테고리 : 스타일

##### 경로

    - client > Chat > ChatMessage > ChatMessageRow > ChatMessageRow.jsx
    - client > Chat > ChatMessage > ChatMessageRow > ChatMessageRow.style.scss

##### 내용 : '메세지가 없을 경우' 엘리먼트 및 css 수정

##### 6.

##### 카테고리 : 스타일

##### 경로

    - client > Files > FilesList > Files.jsx
    - client > Files > FilesList > Files.style.scss

##### 내용 : '메세지가 없을 경우', 기존의 엘리먼트 태그 수정 및 css 수정

##### 7.

##### 카테고리 : 스타일

##### 경로

    - client > Tab > TabPanel > TabPanel.style.scss

##### 내용 : '방 만들기' 버튼, 모바일 사이즈에 따른 Position 위치, css 수정

# 작업자 - HW ROH - WP

## 240802 - searchme86 (Web Publisher)

#### 수행 작업 카테고리 (1)

- 데이터 생성을 위한 함수 정의
  - 중첩 아코디언 데이터

##### 1.

##### 카테고리 : 데이터 가공

##### 경로

    - client > People > useCreateAccordionData.jsx

##### 내용 : 중첩 아코디언으로 보여줄/중첩 아코디언이 사용 할 데이터를 만들, 함수를 정의

##### 상세 설명

\*데이터
: 회사 데이터 ( 예: const companies = [{ COM_NM: "나의 회사" }];)<br/>
: 부서 데이터 ( 예: const departments = [{ DEPT_NM: "개발팀" },{ DEPT_NM: "서비스운영팀" }, ...] )<br/>
: 부서원 데이터 ( 예 : const members = [ {altValue: "노희지 사원 프로필 이미지",deptNm: "기타", isOline: true, key: "ks230530", mstId: "kocore", nameValue: "노희지", rank: "사원", component: "etc",belongto: "나의 회사"}, {...},.. ] )<br/>

\*함수<br/>
핵심 : - 인자로 전달한 부서의 값과, 맴버의 부서가 일치하고, <br/> - 일치한 부서원 값(현재 온라인(isOline) 상태, 온라인 중인 맴버의 수, 체크리스트를 위한 데이터 )<br/> - 부서별 온라인 멤버 수 세기, 인자로 전달한 부서의 값과, 맴버의 부서가 일치하고, 동시에,그 맴버가 현재 온라인(isOline) 인 경우의 갯수 <br/>

```javascript
const countOnlineMembers = (deptNm, membersList) =>
  membersList.filter((member) => member.deptNm === deptNm && member.isOline)
    .length;
```

- 부서별 총 멤버 수 세기, 인자로 전달한 부서의 값과, 맴버의 부서가 일치하고, 그 요소의 총 갯수<br/>

```javascript
const countTotalMembers = (deptNm, membersList) =>
  membersList.filter((member) => member.deptNm === deptNm).length;
```

- 부서별 속한 맴버를 위한 체크리스트 컴포넌트 데이터를 생성<br/>

```javascript
const organizeMembersByComponent = (membersList) => {
  const result = {};

  membersList.forEach((member) => {
    if (!result[member.component]) {
      result[member.component] = {
        componentName: member.component,
        employeeData: [],
      };
    }

    result[member.component] = {
      ...result[member.component],
      employeeData: [...result[member.component].employeeData, member],
    };
  });

  return Object.values(result);
};
```

- 중첩 아코디언 데이터를 생성하는 함수
  > company : const companies = [{ COM_NM: "나의 회사" }];<br/>
  > departmentsList : const departments 변수 <br/>
  > membersList : const members 변수 <br/>

```javascript
const createNestedAccordionData = (company, departmentsList, membersList) => {
  return {
    index: companies.findIndex((c) => c.COM_NM === company.COM_NM),
    categoryName: company.COM_NM,
    currentTotalOnlinedCount: 0, // This will be calculated later
    groupTotalMember: membersList.length, // Total members

    // 체크박스컴포넌트를 위한 새로운 배열 생성
    subCategoryContent: departmentsList.map((dept, deptIndex) => ({
      index: deptIndex,
      teamName: dept.DEPT_NM,
      componentName: getComponentNames(dept.DEPT_NM, membersList).join(", "),
      currentOnlinedCount: countOnlineMembers(dept.DEPT_NM, membersList),
      teamTotalMember: countTotalMembers(dept.DEPT_NM, membersList),
    })),
  };
};
```

- 중첩 아코디언 데이터를 위해 변수를 넣음

```javascript
const nestedAccordionData = [
  createNestedAccordionData(companies[0], departments, members),
  createNestedAccordionData(companies[1], departments2, members2),
];
```

- 키 currentTotalOnlinedCount의 값을 계산하기 위해 reduce 메서드 사용

```javascript
nestedAccordionData.forEach((data) => {
  data.currentTotalOnlinedCount = data.subCategoryContent.reduce(
    (sum, item) => sum + item.currentOnlinedCount,
    0
  );
});

const shape = organizeMembersByComponent(members);
```

# 작업자 - HW ROH - WP

## 240805 - searchme86 (Web Publisher)

#### 수행 작업 카테고리 (3)

- style 수정
- 중첩 아코디언을 위한 데이터 생성 함수 리펙토링
  - 정의한 변수를 함수에서 참조하는 방식에서, 변수를 함수 인자로 전달하는 방식으로 변경
- 상태(STATE)와 뷰(VIEW)구조로 변경
  - 중첩 아코디언 & 체크박스 컴포넌트
  - 이전에 상태(STATE)+뷰(VIEW)가 혼합된 구조에서 리액트 구조, 상태(STATE)와 상태를 호출하고 보여주는 뷰(VIEW)를 이원화 된 구조로 변경
    - 상태(useCreateAccordionData.jsx)
      - 상태관리 구조에 따라 파일명/파일 위치 변경 예정
    - 뷰 (PeopleAccordion.jsx / MakeRoomAccordion.jsx )

##### 1.

##### 카테고리 : 기능개선 (중첩데이터 생성 함수 코드방식 변경)

##### 경로

    - client > People > useCreateAccordionData.jsx

##### 내용 : 정의된 변수(예: 회사리스트 배열)를 코드에 고정적으로 사용한 코드를, 변수를 받는 형태로 코드 변경

##### 변경 사유 : 페이지 상단에 정의한 변수(const companies)를 참조하였던 방식을, 변수를 함수 인자로 받는 구조로 변경

##### 상세 설명

        이전 코드
            const createNestedAccordionData = (company, departmentsList, membersList) => { return { index: (*companies.findIndex((c) => c.COM_NM === company.COM_NM) + 1 ).toString(),
               - companies는  "const companies = [{ COM_NM: "나의 회사" }];"로 배열 companies를 고정적으로 참조함
        이후 코드
           const createNestedAccordionData = ( eachCompany, departmentsList, membersList, *arrayOfCompanies ) => { return { index: (*arrayOfCompanies.findIndex((c) => c.COM_NM === eachCompany.COM_NM) + 1 ).toString(),
               - arrayOfCompanies는 배열인자를 받을 수 있는 인자
               - arrayOfCompanies에 배열 인자를 전달하는 구조로 변경

##### 2.

##### 카테고리 : 구조(structure)

##### 경로

- Pages > People > usePeopleAccordion.jsx (삭제됨)
- Pages > People > PeopleAccordion.jsx (수정됨)
- Pages > Common > MakeRoomAccordion.jsx (수정됨)
- Components > Accordion > AccordionNested.jsx (새로생성)

##### 내용

: 파일삭제 / 구조변경 / 상태구조 변경 / 공통 컴포넌트 정의

##### 변경 사유

- 기존, 상태를 불러오는 곳과 상태를 보여주는 곳으로 분리하여 작성된 구조가 아니었음
- 기존, 동일한 상태(아코디언 데이터)를 위한 공통 컴포넌트를 정의하지 않음

##### 상세 설명

- useCreateAccordionData.jsx (Pages > People > useCreateAccordionData.jsx)
  - 데이터를 불러오고, 가공해서 생성하는 곳, 데이터를 출력하는 곳
- AccordionNested.jsx (Components > Accordion > AccordionNested.jsx)
  - useCreateAccordionData.jsx 에서 생성한 데이터를 보여주는 곳
  - 컴포넌트의 props
    - nestedAccordionData : useCreateAccordionData.jsx에서 생성한 중첩 아코디언 데이터(체크박스 데이터 포함)
    - innerComponent: InnerComponent : 체크박스 컴포넌트를 받을 props
    - noDataMessage : 중첩 아코디언 데이터가 없을 경우 fallback 메세지
  - 한계 : 체크박스 컴포넌트를 위한 고정 데이터를 받기 때문에, 체크박스 이외의 컴포넌트를 받을 경우, 새롭게 데이터(예: 아코디언 데이터)를 만들어야 함
- PeopleAccordion.jsx, MakeRoomAccordion.jsx
  - AccordionNested 컴포넌트를 활용해 공통 코드, 컴포넌트로 대체함
  ```javascript
  <AccordionNested
    nestedAccordionData={nestedAccordionData}
    innerComponent={CheckBoxList}
    noDataMessage={"부서/팀의 데이터가 존재하지 않습니다."}
  />
  ```

# 작업자 - HW ROH - WP

## 240807 - searchme86 (Web Publisher)

#### 수행 작업 카테고리 (1)

- 변수 howFarScrolledUp를 ref 객체, howFarScrolledUpRef 로 변경해 topToBottom 버튼 작동하지 않는 이슈 해결
  - 변수 howFarScrolledUp가 함수 handleScroll에 정의되어 있어, 스코프 문제로 Chat 컴포넌트 전역에서 사용하기 위해, useRef객체로 변경해 작동되지 않는 이슈 해결

##### 1.

##### 카테고리 : 버그, 기능작동되지 않음

##### 경로

    - client > Components > Chat > Chat.jsx

##### 내용 : 변수 howFarScrolledUp를 howFarScrolledUpRef, ref 객체로 변경함

##### 변경 사유 : 변수 howFarScrolledUp 값이 함수 handleScroll에 정의되어 있어, 다른 스코프에서 변수 howFarScrolledUp를 사용 할 수 없었음

# 작업자 - HW ROH - WP

## 240808 - searchme86 (Web Publisher)

#### 수행 작업 카테고리 (1)

##### 1.

##### 카테고리 : 기능 개선 ( 아코디언 아이템 갯수에 따른 스크롤 생성)

##### 경로

    - client > Components > Checkbox > CheckBoxList.jsx
    - client > Components > Checkbox > CheckBoxList.style.scss

##### 내용 : 체크박스의 갯수가 3개 이상일 경우, 해당 리스트 영역에 스크롤 생성되고 그렇지 않는 경우 생성되지 않음

##### 변경 사유 : 현재 인원이 많고 적음을 보여줄 스타일적 기능 추가

##### 상세 설명 : useRef를 통해 .list_checkbox돔을 참조하고, 해당 돔의 자식(.item_checkbox)의 갯수를 파악하고, 갯수가 총 3명을 기준으로 함, 3명 이상일 경우, 해당 .list_checkbox돔에 클래스 .item_scroll추가, .item_scroll이 있는 경우에 스크롤 css 추가하고 그렇지 않는 경우 스크롤이 생성되지 않도록 함

```javascript
useEffect(() => {
  if (checkBoxlistRef.current) {
    const liItemCount =
      checkBoxlistRef.current.querySelectorAll(".item_checkbox");
    if (liItemCount.length >= 3) {
      checkBoxlistRef.current.classList.add("item_scroll");
    }
  }
}, []);

## 240809 - searchme86 (Web Publisher)

#### 수행 작업 카테고리 (1)

- 메세지 입력 시, 메세지 여러줄 입력 되도록 기능 개선
  - 메세지 입력하고, Shift + enter 키를 누를 경우, 메세지 send 되지 않고, 다음 줄로 넘어가도록 기능 추가
  - 메세지에 입력한 공백도 적용되어 전달(send 되도록) 기능 변경

##### 1.

##### 카테고리 : 기능개선, 메세지 전달

##### 경로 :

- client > Components > Chat > ChatMessage > ChatSingleMessage > ChatSingleMessage.jsx
- client > Components > Forms > ChatForm.jsx

##### 내용 :
  - 메세지 입력 시, enter키를 누르면 메세지 전달, shift + enter 키를 누르면 메세지 다음 줄로 이동
  - 메세지 창에, 메세지에 공백을 넣을 경우, 공백이 있는 상태로 채팅메세지로 입력됨

##### 변경 사유 :
  - multi line으로 메세지를 입력하지 못하는 상황 발생
  - shift + enter 키를 누르면 메세지가 다음줄로 넘어가질 않고 메세지가 전송됨
  - 메세지창에 공백이 있는 메세지를 입력 시, 채팅 메세지에 공백없이 메세지가 입력됨

##### 코드설명
> textarea에 입력된 줄 바꿈은 단순히 줄 바꿈 문자(\n)로 저장되기 때문에, 이를 HTML에서 다음줄로 이동하기 위해 줄 바꿈 문자(\n)을 <br/>로 교체합니다.
```javascript
 let formattedText = trimmedText.replace(/\n/g, "<br>");
 ...
  } else {
    messageTextRef.current.innerHTML = formattedText;
  }
```
> textarea에 입력된 줄 바꿈은 단순히 줄 바꿈 문자(\n)로 저장되기 때문에, 이를 HTML에서 다음줄로 이동하기 위해 줄 바꿈 문자(\n)을 <br/>로 교체합니다.
```javascript

> ref로 참조한 엘리먼트의 스타일을 조정합니다.
const adjustHeight = (element) => {
   element.style.height = "auto";
   element.style.height = element.scrollHeight + "px";
};

<textarea
   ref={ref}
   type="text"
   className="form_input"
   title={inputTitle}
   value={message}
   placeholder={placeHolderValue}
   onChange={({ target: { value } }) => {
     setMessage(value);
     adjustHeight(ref.current); // ref로 참조한 엘리먼트의 스타일을 처리합니다.
   }}
   onKeyDown={(event) => {
     if (event.key === "Enter" && !event.shiftKey) { // shift + enter키를 입력한 경우에는 메세지가 전달되지 않습니다.
       event.preventDefault();
       sendMessage({ event, isText: true });
       ref.current.style.height = "auto";
     }
   }}
   style={{
     resize: "none",
     overflow: "hidden",
     boxSizing: "border-box",
   }}
/>
```

## 240812 - searchme86 (Web Publisher)
#### 수행 작업 카테고리 (2)

  - 채팅 메세지 입력창 UI 개선
  - 이미지 height가 큰 이미지 업로드 시, 텍스트와 달리, 이미지가 짤려서, 이미지 bottom으로 scrollIntoView 가 되지 않는 이슈 해결 

##### 1.

##### 카테고리 : UI 개선

##### 경로 :

- client > Pages > Talk > TaxTalk.jsx
- client > Components > InputBox > InputBox.style.jsx
- client > Components > Forms > ChatForm.jsx
- client > Components > Forms > ChatForm.style.scss
- client > Components > Chat > ChatBottom.style.scss
- client > Components > Chat > ChatMessage > ChatMessageRow.style.scss
  
##### 내용 :
- 채팅 메세지 입력창 UI 개선

##### 변경 사유 :
- 다중(multi) 메세지를 입력할 수 있게 되어, scroll-y가 가능하도록 textArea를 수정 및 UI변경

##### 2.

##### 카테고리 : 기능개선, 이미지 height가 큰 이미지 업로드 시, 텍스트와 달리, 이미지가 짤려서, 이미지 bottom으로 scrollIntoView 가 되지 않는 이슈, 

##### 경로 :

- client > Components > Chat > ChatMessage > ChatSingleMessage > ChatSingleMessage.jsx

##### 내용 :
  - 이미지가 로드된 후에 스크롤을 조정하는 코드해 useEffect에서 이미지 로딩이 완료된 후에 스크롤을 조정하는 코드를 추가

##### 변경 사유 :
  - 이미지를 로드하는 시간이 필요하기 때문에 발생 한 내용 이미지를 로드하는 동안 DOM 요소의 크기가 확정되지 않아 scrollIntoView가 올바르게 동작하지 않는 경우

##### 코드설명
> useRef로 참조된 영역에서 img 태그가 존재 하는 곳을 먼저 정의하고, trimmedImg가 있

```javascript
 useEffect(() => {
  // isText가 false이고, trimmedImg가 true이며, userImageRef.current가 존재하는 경우에만 실행
  if (!isText && trimmedImg && userImageRef.current) {
    // userImageRef.current 내에서 img 요소를 찾음
    const imgElement = userImageRef.current.querySelector("img");
    
    // img 요소가 존재하면
    if (imgElement) {
      // img 요소가 로드되면 실행될 onload 이벤트 핸들러 설정
      imgElement.onload = () => {
        // userImageRef.current 요소를 스크롤하여 중앙에 위치시키는 함수 호출
        userImageRef.current.scrollIntoView({
          behavior: "smooth",  // 부드럽게 스크롤
          block: "bottom",     // 바닥에 위치
        });
      };
    }
  }
}, [trimmedImg, isText]); // trimmedImg와 isText가 변경될 때마다 실행
  .....
<div className="message_space img" ref={userImageRef}>...</div>
```
##### 3.

##### 카테고리 : 기능개선, 탭 컨텐츠 새 창에서 열리도록 스타일 및 기능 변경, 

##### 경로 :

- client > Components > Tab > TabPanel > TabPanel.jsx
- client > Components > Tab > TabPanel > TabPanel.style.js
- client > Components > Sidebar > Sidebar.jsx
- client > Components > Chat > ChatMessageRow > ChatMessageRow.style.js
- client > Components > InputBox > InputBox.style.js

##### 내용 :
- 탭 패널 컨텐츠, 새창(window.open())에서 열리도록 코드 개선
    - '채팅방 나가기" 클릭 시, 새창 종료(window.close())되도록 코드
      -  window.close()는 window.open()으로 실행된 새창을 종료함

##### 변경 사유 :
  - 탭 컨텐츠를 새 창에서 열리도록(open()) 기획 변경

##### 코드설명
> openInNewTab라는 window창을 정의하여, url (`/talk/taxTalk`)을 전달하여 실행
> '채팅방 나가기" 텍스트에는 window.close()를 통해서 window.open()으로 실행한 창을 종료

> TabPanel.jsx
```javascript
const openInNewTab = (url) => {
  const windowOptions =
    "width=600,height=1000,resizable=no,scrollbars=no,noopener,noreferrer";
  const newWindow = window.open(url, "_blank", windowOptions);
  if (newWindow) {
    newWindow.opener = null;
  }
};

<button
  type="button"
  onClick={() => openInNewTab(`/talk/taxTalk`)}
  className="link_chatRoom"
>
 .....
</button>
```
>Sidebar.jsx
```javascript
const leaveRoom = () => {
  socket.emit("leaveRoom", {}); // 방을 나가기만할 때, 전문가 톡
  // socket.emit('out_room', {}) // 방을 아예 탈퇴 할 때, 사내 톡
  // navigate(-1);
  window.close();
};

```


## 240813 - searchme86 (Web Publisher)
#### 수행 작업 카테고리 (2)

  - 채팅 메세지 입력창 UI 개선
  - 이미지 height가 큰 이미지 업로드 시, 텍스트와 달리, 이미지가 짤려서, 이미지 bottom으로 scrollIntoView 가 되지 않는 이슈 해결 
