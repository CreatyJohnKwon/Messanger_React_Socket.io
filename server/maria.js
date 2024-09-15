require('dotenv').config()

const mariadb = require('mariadb')

const connection = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    multipleStatements: true,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})

const selectRoomParTCpants = 
`
    SELECT A.MST_ID
    , CONCAT(GROUP_CONCAT(A.EMP_ID SEPARATOR ', ')) AS USER_ID
    , CONCAT(GROUP_CONCAT(A.EMP_NM SEPARATOR ', ')) AS USER_NM
    , L.LND_ID
    , E.L_USERID
    , E.L_USERNM
    , R.ROOM_CD
    FROM CM_EMP A
    LEFT JOIN CM_EMP_PGM B ON A.MST_ID = B.MST_ID AND A.EMP_KEY = B.EMP_KEY AND B.PGM_ID = 'CRM00290'
    LEFT JOIN CM_MEMBER_SETUP L ON A.MST_ID = L.MST_ID
    LEFT JOIN (SELECT X.LND_ID, X.MST_ID
                , CASE WHEN IFNULL(Y.USER_ID,'') = '' THEN Z.ADMIN_ID ELSE CONCAT(GROUP_CONCAT(Y.USER_ID SEPARATOR ', ')) END AS L_USERID
                , CASE WHEN IFNULL(Y.USER_ID,'') = '' THEN FN_getUserNm(Z.ADMIN_ID) ELSE CONCAT(GROUP_CONCAT(FN_getUserNm(Y.USER_ID) SEPARATOR ', ')) END AS L_USERNM
            FROM CM_LNDCTN_CUST X
            LEFT JOIN CM_LNDCTN_EMP Y ON X.LND_ID = Y.LND_ID AND X.CUST_NO = Y.CUST_NO
            LEFT JOIN CM_LNDCTN Z ON X.LND_ID = Z.LND_ID
            WHERE X.MST_ID = ?
            AND X.SVC_STS IN ('05','21')
            AND IFNULL(Y.USE_YN,'') != 'N'
            AND IFNULL(Y.STR_DATE,'19000101') <= DATE_FORMAT(NOW(),'%Y%m%d')
            AND (CASE WHEN IFNULL(Y.END_DATE,'') = '' THEN DATE_FORMAT(NOW(),'%Y%m%d') ELSE Y.END_DATE END) >= DATE_FORMAT(NOW(),'%Y%m%d')
            GROUP BY X.LND_ID, X.MST_ID
        ) E ON L.LND_ID = E.LND_ID
    LEFT JOIN PT_ROOM R ON A.MST_ID = R.MST_ID
    WHERE A.MST_ID = ?
    AND IFNULL(A.EMP_ID,'') != '' 
    AND IFNULL(B.USE_YN,'N') = 'Y'
    GROUP BY A.MST_ID, L.LND_ID, R.ROOM_CD
`

const selectUserDataQuery =
`
    SELECT B.USER_NM, A.MST_ID
    FROM PT_USER B
    JOIN PT_USER_MST A ON B.USER_ID = A.USER_ID
    WHERE B.USER_ID = ?
`

const selectUserQuery = 
`
    SELECT * FROM CV_USER WHERE USER_ID = ?
`

const selectChatQuery = 
`
    SELECT A.ROOM_CD
        , A.CHAT_CD
        , A.USER_ID
        , U.USER_NM
        , A.CHAT_CONTENTS
        , A.READ_YN
        , CASE WHEN IFNULL(B.FILE_SEQ,0) = 0 THEN '1' ELSE '0' END AS IS_TEXT
        , IFNULL(B.FILE_SEQ,0) AS FILE_SEQ
        , IFNULL(B.FILE_NAME,'') AS FILE_NAME
        , IFNULL(B.REAL_NAME,'') AS REAL_NAME
        , IFNULL(B.FILE_DIV,'') AS FILE_DIV
        , A.REG_DT
    FROM PT_CHAT A
    LEFT JOIN PT_CHAT_FILE B ON A.ROOM_CD = B.ROOM_CD AND A.CHAT_CD = B.CHAT_CD
    LEFT JOIN PT_USER U ON A.USER_ID = U.USER_ID
    WHERE A.ROOM_CD = ?
    ORDER BY A.REG_DT ASC
`

const selectRoomMembers = 
`
        SELECT 'C' AS ROOM_DIV
        , R.MST_ID
        , C.EMP_ID AS USER_ID
        , C.EMP_NM AS USER_NM
        , IFNULL(C.POSN_NM,'') AS POSN_NM
    FROM PT_ROOM R 
    LEFT JOIN CM_EMP_PGM B ON R.MST_ID = B.MST_ID AND B.PGM_ID = 'CRM00290'
    LEFT JOIN CM_EMP C ON B.MST_ID = C.MST_ID AND B.EMP_KEY = C.EMP_KEY
    WHERE R.ROOM_CD = ?
    AND IFNULL(B.USE_YN,'') = 'Y'
    UNION ALL 
    SELECT 'T' AS ROOM_DIV
        , R.LND_ID AS MST_ID 
        , B.USER_ID
        , FN_getUserNm(B.USER_ID) AS USER_NM
        , '세무' AS POSN_NM
    FROM PT_ROOM R 
    LEFT JOIN (SELECT DISTINCT X.LND_ID
                    , CASE WHEN IFNULL(Y.USER_ID,'') = '' THEN Z.ADMIN_ID ELSE Y.USER_ID END AS USER_ID
                FROM CM_LNDCTN_CUST X
                LEFT JOIN CM_LNDCTN_EMP Y ON X.LND_ID = Y.LND_ID AND X.CUST_NO = Y.CUST_NO
                LEFT JOIN CM_LNDCTN Z ON X.LND_ID = Z.LND_ID
                WHERE X.SVC_STS IN ('05','21')
                    AND IFNULL(Y.USE_YN,'') != 'N'
                    AND IFNULL(Y.STR_DATE,'19000101') <= DATE_FORMAT(NOW(),'%Y%m%d')
                    AND (CASE WHEN IFNULL(Y.END_DATE,'') = '' THEN DATE_FORMAT(NOW(),'%Y%m%d') ELSE Y.END_DATE END) >= DATE_FORMAT(NOW(),'%Y%m%d')
                ) B ON R.LND_ID = B.LND_ID
    WHERE R.ROOM_CD = ?
`

const selectMemberTalkMembers = 
`
    SELECT 'C' AS ROOM_DIV
        , A.MST_ID
        , C.EMP_ID AS USER_ID
        , C.EMP_NM AS USER_NM
        , IFNULL(C.POSN_NM,'') AS POSN_NM
    FROM PT_ROOM_MBR R 
    LEFT JOIN PT_ROOM A ON R.ROOM_CD = A.ROOM_CD
    LEFT JOIN CM_EMP C ON A.MST_ID = C.MST_ID AND R.USER_ID = C.EMP_ID
    WHERE R.ROOM_CD = ?
`

const selectRoomQuery = 
`
    SELECT A.ROOM_CD
            , A.ROOM_NM
            , 'C' AS ROOM_TYPE
            , CAST(IFNULL(C.R_CNT, 0) AS CHAR) AS R_CNT
    FROM PT_ROOM A
    LEFT JOIN PT_USER_MST B ON A.MST_ID = B.MST_ID
    LEFT JOIN (SELECT ROOM_CD, COUNT(READ_YN) AS R_CNT
                 FROM PT_CHAT X
                WHERE USER_ID != ?
                  AND READ_YN = 'N'
                GROUP BY ROOM_CD) C ON A.ROOM_CD = C.ROOM_CD
    WHERE A.MST_ID = ?
        AND B.USER_ID = ?
        AND A.ROOM_CG = ?
    UNION ALL
    SELECT A.ROOM_CD
            , A.ROOM_NM
            , 'T' AS ROOM_TYPE
            , CAST(IFNULL(C.R_CNT, 0) AS CHAR) AS R_CNT
    FROM PT_ROOM A
    LEFT JOIN PT_USER_MST B ON A.LND_ID = B.MST_ID
    LEFT JOIN (SELECT ROOM_CD, COUNT(READ_YN) AS R_CNT
                 FROM PT_CHAT X
                WHERE USER_ID != ?
                  AND READ_YN = 'N'
                GROUP BY ROOM_CD) C ON A.ROOM_CD = C.ROOM_CD
        WHERE A.LND_ID = ?
        AND B.USER_ID = ?
        AND A.ROOM_CG = ?
`

const selectRoomRead = 
`
    SELECT 
        A.ROOM_CG,
        SUM(CAST(IFNULL(C.R_CNT, 0) AS SIGNED)) AS TOTAL_R_CNT
    FROM 
        PT_ROOM_MBR R
    LEFT JOIN 
        PT_ROOM A ON R.ROOM_CD = A.ROOM_CD
    LEFT JOIN 
        (SELECT ROOM_CD, COUNT(READ_YN) AS R_CNT
        FROM PT_CHAT
        WHERE USER_ID != ?
        AND READ_YN = 'N'
        GROUP BY ROOM_CD) C ON A.ROOM_CD = C.ROOM_CD
    WHERE 
        R.USER_ID = ?
    GROUP BY 
        A.ROOM_CG;
`

const selectMemberTalkRoomQuery = 
`
    SELECT 
        A.ROOM_CD, 
        A.ROOM_NM, 
        A.REG_DT, 
        CAST(IFNULL(C.R_CNT, 0) AS CHAR) AS R_CNT
    FROM 
        PT_ROOM_MBR R 
    LEFT JOIN 
        PT_ROOM A ON R.ROOM_CD = A.ROOM_CD
    LEFT JOIN 
        (SELECT ROOM_CD, COUNT(READ_YN) AS R_CNT
        FROM PT_CHAT
        WHERE USER_ID != ?
        AND READ_YN = 'N'
        GROUP BY ROOM_CD) C ON A.ROOM_CD = C.ROOM_CD
    WHERE 
        R.USER_ID = ?
        AND A.ROOM_CG = 1
`

const selectOneRoom =
`
    SELECT * from PT_ROOM
    WHERE ROOM_CD = ?
`

const selectRoomFiles = 
`
    SELECT * FROM PT_CHAT_FILE
    WHERE ROOM_CD = ?
    ORDER BY REG_DT DESC
`

const selectMember = 
`
    SELECT * FROM PT_ROOM_MBR
    WHERE ROOM_CD = ? AND USER_ID = ?
`

const selectMemberPosn = 
`
    SELECT 'C' AS ROOM_DIV
        , R.MST_ID
        , C.EMP_ID AS USER_ID
        , C.EMP_NM AS USER_NM
        , IFNULL(C.POSN_NM,'') AS POSN_NM
    FROM PT_ROOM R 
    LEFT JOIN CM_EMP_PGM B ON R.MST_ID = B.MST_ID AND B.PGM_ID = 'CRM00290'
    LEFT JOIN CM_EMP C ON B.MST_ID = C.MST_ID AND B.EMP_KEY = C.EMP_KEY
    WHERE R.ROOM_CD = ?
    AND IFNULL(B.USE_YN,'') = 'Y'
    UNION ALL 
    SELECT 'T' AS ROOM_DIV
        , R.LND_ID AS MST_ID 
        , B.USER_ID
        , FN_getUserNm(B.USER_ID) AS USER_NM
        , '세무' AS POSN_NM
    FROM PT_ROOM R 
    LEFT JOIN (SELECT DISTINCT X.LND_ID
                    , CASE WHEN IFNULL(Y.USER_ID,'') = '' THEN Z.ADMIN_ID ELSE Y.USER_ID END AS USER_ID
                FROM CM_LNDCTN_CUST X
                LEFT JOIN CM_LNDCTN_EMP Y ON X.LND_ID = Y.LND_ID AND X.CUST_NO = Y.CUST_NO
                LEFT JOIN CM_LNDCTN Z ON X.LND_ID = Z.LND_ID
                WHERE X.SVC_STS IN ('05','21')
                    AND IFNULL(Y.USE_YN,'') != 'N'
                    AND IFNULL(Y.STR_DATE,'19000101') <= DATE_FORMAT(NOW(),'%Y%m%d')      
                    AND (CASE WHEN IFNULL(Y.END_DATE,'') = '' THEN DATE_FORMAT(NOW(),'%Y%m%d') ELSE Y.END_DATE END) >= DATE_FORMAT(NOW(),'%Y%m%d')
                ) B ON R.LND_ID = B.LND_ID
    WHERE R.ROOM_CD = ? 
`

const selectCorpMembers = 
`
    SELECT C.MST_ID
            , C.EMP_ID AS USER_ID
            , C.EMP_NM AS USER_NM
            , IFNULL(C.DEPT_NM,'기타') AS DEPT_NM
            , IFNULL(IF(C.POSN_NM = '', '인턴', C.POSN_NM), '인턴') AS POSN_NM
            , IFNULL(D.IS_ONLINE,0) AS IS_ONLINE
        FROM (SELECT DISTINCT MST_ID
                FROM (SELECT MST_ID
                        FROM PT_USER_MULTI
                        WHERE USER_ID = ?
                        AND USE_YN = 'Y'
                        UNION ALL
                        SELECT MST_ID
                        FROM PT_USER_MST 
                        WHERE MST_ID = ?
                        AND USER_ID = ?) X
                ) A
        LEFT JOIN PT_USER_MST B ON A.MST_ID = B.MST_ID
        LEFT JOIN CM_EMP C ON B.MST_ID = C.MST_ID AND B.USER_ID = C.EMP_ID
        LEFT JOIN PT_USER D ON B.USER_ID = D.USER_ID
    WHERE IFNULL(B.USE_YN,'') = 'Y'
        AND B.USER_ID != ''
        AND (IFNULL(C.RESIGN_DATE,'99999999') >= DATE_FORMAT(NOW(),'%Y%m%d') OR C.RESIGN_DATE = '')
    ORDER BY USER_NM
`

const selectCorpDepts =
`
    SELECT DISTINCT IFNULL(C.DEPT_NM,'기타') AS DEPT_NM
    FROM (SELECT DISTINCT MST_ID
            FROM (SELECT MST_ID
                    FROM PT_USER_MULTI
                    WHERE USER_ID = ?
                    AND USE_YN = 'Y'
                    UNION ALL
                    SELECT MST_ID
                    FROM PT_USER_MST 
                    WHERE MST_ID = ?
                    AND USER_ID = ?) X
            ) A
    LEFT JOIN PT_USER_MST B ON A.MST_ID = B.MST_ID
    LEFT JOIN CM_EMP C ON B.MST_ID = C.MST_ID AND B.USER_ID = C.EMP_ID		
    WHERE IFNULL(B.USE_YN,'') = 'Y'
    AND B.USER_ID != ''
    AND (IFNULL(C.RESIGN_DATE,'99999999') >= DATE_FORMAT(NOW(),'%Y%m%d') OR C.RESIGN_DATE = '')
`

const updateReadQuery = 
`
    UPDATE PT_CHAT X
    SET X.READ_YN = 'Y'
    WHERE X.ROOM_CD = ?
    AND X.CHAT_CD IN (SELECT A.CHAT_CD
                        FROM PT_CHAT A
                        LEFT JOIN PT_USER_MST B ON A.USER_ID = B.USER_ID
                        WHERE A.ROOM_CD  = ?
                        AND A.USER_ID != ?
                        AND A.REG_DT < NOW()
                        AND A.READ_YN = 'N')
`
const updateIsOnline = 
`
    UPDATE PT_USER
    SET IS_ONLINE = ?
    WHERE USER_ID = ?
`

const insertFilesQuery = 
`
    INSERT INTO PT_CHAT_FILE ( ROOM_CD, CHAT_CD, FILE_SEQ, FILE_NAME, REAL_NAME, FILE_SIZE, FILE_ROTA, FILE_DIV, REG_DT )
        VALUES ( ?, ?, 
                (SELECT IFNULL(MAX(X.FILE_SEQ), 0)+1 AS SEQ FROM PT_CHAT_FILE X WHERE X.ROOM_CD = ? AND X.CHAT_CD = ?) 
                , ?, ?, ?, ?, ?, NOW() )
`

const insertRoomNmQuery = 
`
    UPDATE PT_ROOM
    SET ROOM_NM = ?
    WHERE ROOM_CD = ?
`

const insertChatQuery = 
`
    INSERT INTO PT_CHAT (ROOM_CD, USER_ID, CHAT_CONTENTS, READ_YN, IS_TEXT, REG_DT) 
    VALUES (?, ?, ?, ?, ?, NOW())
`
 
const insertMemberQuery = 
`
    INSERT INTO PT_ROOM_MBR (ROOM_CD, USER_ID, ALARM_YN, IS_ONLINE, REG_DT) 
    VALUES (?, ?, ?, 0, NOW())
    ON DUPLICATE KEY UPDATE
        ALARM_YN = VALUES(ALARM_YN),
        REG_DT = NOW()
`

const getRoomCd = 
`
    SELECT CONCAT(DATE_FORMAT(NOW(),'%Y'),'-', REPLICATE(0,5-LENGTH(IFNULL(MAX(RIGHT(ROOM_CD,5)),0)+1)), CAST(IFNULL(MAX(RIGHT(ROOM_CD,5)),0)+1 AS CHAR)) AS roomCd 
        FROM PT_ROOM
        WHERE LEFT(ROOM_CD,4) = DATE_FORMAT(NOW(),'%Y')
`
const insertNewRoomQuery = 
`
    INSERT INTO PT_ROOM (ROOM_CD, ROOM_NM, MST_ID, ROOM_CG, USER_ID, REG_DT)
        VALUES ( ?, ?, ?, 1, ?, NOW() )
`

const deleteMemberQuery = 
`
    DELETE FROM PT_ROOM_MBR
    WHERE ROOM_CD = ? AND USER_ID = ?
`

/*** 사내톡 : 초대하고자 하는 사내 직원을 모두 불러옴 */
const getCorpMembers = () => {
    return async function select(mstId, userId) {
        if (mstId) {
            try {
                const rows = await connection.execute(selectCorpMembers, [userId, mstId, userId])
                return rows
            } catch (err) {
                throw err
            }
        } else console.log(`400: No Data ${mstId}, mstId plz`)
    }
}

const getUserNm = () => {
    return async function select(userId) {
        if (userId) {
            try {
                const rows = await connection.execute(selectUserDataQuery, [userId])
                return rows
            } catch (err) {
                throw err
            }
        } else console.log(`401: No Data ${userId}, userId plz`)
    }
}

const getCorpDepts = () => {
    return async function select(mstId, userId) {
        if (mstId) {
            try {
                const rows = await connection.execute(selectCorpDepts, [userId, mstId, userId])
                return rows
            } catch (err) {
                throw err
            }
        } else {
            console.log(`402: No Data ${mstId}, mstId plz`)
        }
    }
}

/*** 모든 룸을 가져옴 (mstId) */
const getAllRoom = () => {
    return async function select(mstId, userId, tabIndex) {
        if (mstId) {
            try {
                const rows = await connection.execute(selectRoomQuery, [userId, mstId, userId, tabIndex, userId, mstId, userId, tabIndex])
                return rows
            } catch (err) {
                throw err
            }
        } else {
            console.log(`403: No Data ${mstId}, mstId plz`)
        }
    }
}

/*** 모든 룸을 가져옴 (mstId) */
const getMemberTalkRoom = () => {
    return async function select(userId) {
        if (userId) {
            try {
                const rows = await connection.execute(selectMemberTalkRoomQuery, [userId, userId])
                return rows
            } catch (err) {
                throw err
            }
        } else {
            console.log(`404: No Data ${userId}, mstId plz`)
        }
    }
}

/*** 하나의 지정 룸을 가져옴 (room) */
const getOneRoom = () => {
    return async function select(room) {
        if (room) {
            try {
                const rows = await connection.execute(selectOneRoom, [room])
                return rows
            } catch (err) {
                throw err
            }
        } else {
            console.log(`405: No Data ${room}, roomCd plz`)
        }
    }
}

/**** param 룸의 모든 챗을 불러옴 (룸 코드) /get all of chats (query SELECT) */
const getChat = () => {
    return async function select(room) {
        if (room) {
            try {
                const rows = await connection.execute(selectChatQuery, room)
                return rows
            } catch (err) {
                throw err
            }
        } else {
            console.log(`406: No Data ${room}, roomCd plz`)
        }
    }   
}

/**** param 룸의 모든 챗을 불러옴 (룸 코드) /get all of chats (query SELECT) */
const getRoomParTCpants = () => {
    return async function select(mstId) {
        if (mstId) {
            try {
                const rows = await connection.execute(selectRoomParTCpants, mstId)
                return rows
            } catch (err) {
                throw err
            }
        } else {
            console.log(`407: No Data ${mstId}, mstId plz`)
        }
    }   
}

const getRoomMembers  = () => {
    return async function select(room) {
        if (room) {
            try {
                const rows = await connection.execute(selectRoomMembers, [room, room])
                return rows
            } catch (err) {
                throw err
            }
        } else {
            console.log(`408: No Data ${room}, roomCd plz`)
        }
    }
}

const getMemberTalkMembers  = () => {
    return async function select(room) {
        if (room) {
            try {
                const rows = await connection.execute(selectMemberTalkMembers, [room])
                return rows
            } catch (err) {
                throw err
            }
        } else {
            console.log(`409: No Data ${room}, roomCd plz`)
        }
    }
}



/**** param 유저의 정보를 가져옴 (userId) */
const getUser = () => {
    return async function select(userId) {
        if (userId) { 
            try {
                const rows = await connection.execute(selectUserQuery, userId)
                return rows
            } catch (err) {
                throw err
            }
        } else {
            console.log(`410: No Data ${userId}, userId plz`)
        }
    }
}

/** 해당 ROOM의 모든 파일을 가져옴 (파일보관함) */
const getFiles = () => {
    return async function select(room) {
        if (room) {
            try {
                const rows = await connection.execute(selectRoomFiles, room)
                return rows
            } catch (err) {
                throw err
            }
        } else {
            console.log(`411: No Data ${room}, roomCd plz`)
        }
    }
}

const getMember = () => {
    return async function select(room, userId) {
        if (room) {
            try {
                const rows = await connection.execute(selectMember, [room, userId])
                return rows[0]
            } catch (err) {
                throw err
            }
        } else {
            console.log(`412: No Data ${room}, roomCd plz`)
        }
    }
}

const getChatCount = () => {
    return async function select(room) {
        if (room) {
            try {
                const rows = await connection.execute(`SELECT CAST(COUNT(*) AS CHAR) AS CHAT_CNT FROM PT_CHAT WHERE ROOM_CD = ?`, [room])
                return rows[0]
            } catch (err) {
                throw err
            }
        } else {
            console.log(`413: No Data ${room}, roomCd plz`)
        }
    }
}

const getMemberPosn = () => {
    return async function select(room) {
        if (room) {
            try {
                const rows = await connection.execute(selectMemberPosn, [room, room])
                return rows[0]
            } catch (err) {
                throw err
            }
        } else {
            console.log(`415: No Data ${room}, roomCd plz`)
        }
    }
}

const getRoomRead = () => {
    return async function select(userId) {
        if (userId) {
            try {
                const rows = await connection.execute(selectRoomRead, [userId, userId])
                return rows
            } catch (err) {
                throw err
            }
        } else {
            console.log(`416: No Data ${userId}, userId plz`)
        }
    }
}

/**** 나랑 나와의 대화 룸을 가져옴 (유저 ID) / 전문가 톡에서는 안쓰는 기능.. */
// const getMyRoom = () => {
//     return async function memberExist(userId) {
//         if (userId) { 
//             try {
//                 const selectQuery = "SELECT * FROM PT_ROOM WHERE MEMBERS = ?"
//                 const rows = await connection.execute(selectQuery, userId)
//                 return rows[0]
//             } catch (err) {
//                 throw err
//             }
//         } else {
//             console.log(`No Data ${userId}`)
//         }
//     }
// }

/**** 채팅을 post함 ({ room, userId, message, readYn }) */
const postChat = () => {
    return async function post({ roomCd, userId, message, isRead, isText }) {
        try {
            const result = await connection.execute(insertChatQuery, [roomCd, userId, message, isRead, isText])
            return result
        } catch (err) {
            throw err
        }
    }
}

/**** 파일을 post함 ({ roomCd, chatCd, fileNm, realNm, fileSize }) */
const postFiles = () => {
    return async function post({ roomCd, chatCd, fileNm, realNm, fileSize, fileType }) {
        try {
            const result = await connection.execute(insertFilesQuery, [roomCd, chatCd, roomCd, chatCd, fileNm, realNm, fileSize, 0, fileType])
            return result
        } catch (err) {
            throw err
        }
    }
}

/**** 멤버에 대한 정보를 삽입 ({ roomCd, userId, notiYn, regDt }) */
const postMember = () => {
    return async function post({ room, userId, notiYn }) {
        try {
            const result = await connection.execute(insertMemberQuery, [room, userId, notiYn])
            return result
        } catch (err) {
            throw err
        }
    }
}

/**** 멤버에 대한 룸 및 정보 삽입 */ 
const postNewRoom = () => {
    return async function post({ roomNm, mstId, userId }) {
        try {
            const data = await connection.execute(getRoomCd)
            const roomCd = data[0].roomCd
            await connection.execute(insertNewRoomQuery, [roomCd, roomNm, mstId, userId])
            return roomCd
        } catch (err) {
            throw err
        }
    }
}

/**** 룸 제목을 post함 ({ roomCd, chatCd, fileNm, realNm, fileSize }) */
const updateRoomName = ({ roomNm, roomCd }) => {
    try {
            connection.execute(insertRoomNmQuery, [roomNm, roomCd], (error, results) => {
            if (error) console.log(error)
            else console.log(results)
        })
    } catch (err) {
        throw err
    }
}

/*** 채팅 읽음 표시 ({room, userId}) / update chats, read n(No) to y(Yes) (query UPDATE) */
function updateReadYN({ room, userId }) {
    try {
        const rows = connection.execute(updateReadQuery, [room, room, userId])
        return rows
    } catch (err) {
        throw err
    }
}

/*** 유저가 소켓에 접속중인지 확인 */
function updateUserIsOnline({ status, userId }) {
    try {
        const rows = connection.execute(updateIsOnline, [status, userId])
        return rows
    } catch (err) {
        throw err
    }
}

function deleteMember({ room, userId }) {
    try {
        const rows = connection.execute(deleteMemberQuery, [room, userId])
        return rows
    } catch (err) {
        throw err
    }
}
 
module.exports = { 
    getCorpMembers,
    getCorpDepts,
    getChat, 
    getUser,
    getUserNm,
    getAllRoom,
    getMemberTalkRoom,
    getFiles,
    getOneRoom,
    getRoomParTCpants,
    getRoomMembers,
    getMemberTalkMembers,
    getMember,
    getChatCount,
    getMemberPosn,
    getRoomRead,
    postChat,
    postFiles,
    postMember,
    postNewRoom,
    updateUserIsOnline,
    updateRoomName,
    updateReadYN,
    deleteMember
}
