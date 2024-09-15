const AWS = require('aws-sdk')
require('dotenv').config()

// AWS SDK 설정
AWS.config.update({
  region: process.env.S3_REGION, // S3 버킷을 생성할 AWS 리전
  accessKeyId: process.env.S3_ACCESS_KEY_ID, // AWS IAM 사용자의 액세스 키 ID
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY, // AWS IAM 사용자의 비밀 액세스 키
})

// S3 서비스 생성
const s3 = new AWS.S3()

const sendToBucket = ({ file, fileType, fileNm, fileSize, mstId }, callback) => {

  // S3 버킷 생성
  const bParams = {
    Bucket: 'attachfile-board', // 생성할 S3 버킷 이름
  }

  s3.createBucket(bParams, (err, data) => {
    if (err) {
      console.error(`${err.message}`)
      postFile(file)
    } else {
      console.log(`${data.Location}`)
      postFile(file)
    }
  })

  const postFile = async (file) => {
    try {
      const now = currentTime()
      const realNm = `${mstId}_${now}.${getExtensionFromMimeType(fileType, fileNm)}`

      // 업로드 params
      const uParams = {
        Bucket: 'attachfile-board',
        Key: `${mstId}/${mstId}_${now}`,
        Body: file,
        ContentType: fileType || `*`
      }

      // 멀티파트 업로드
      const managedUpload = s3.upload(uParams, {
        partSize: 5 * 1024 * 1024, // 5MB 단위로 청크 분할
        queueSize: 10, // 동시에 업로드할 청크 수
      });

      // 업로드 진행 상황 출력
      managedUpload.on('httpUploadProgress', (progress) => {
        console.log(`Uploaded: ${progress.loaded} of ${progress.total} bytes`);
      });

      const data = await managedUpload.promise()

      callback({
        fileNm: fileNm,
        realNm: realNm,
        fileUrl: data.Location,
        fileSize: fileSize,
        fileType: fileType
      })
    } catch (error) {
      console.error(`Error uploading file: ${error}`)
    }
  }
}

const getExtensionFromMimeType = (mimeType, fileNm) => {
  const extensionFront = mimeType.match(/^(.+)\/.+$/)[1]
  const extensionBack = fileNm.split('.')[1]

  switch (extensionFront) {
    case 'image':
        return extensionBack || ''
    case 'application':
      switch (extensionBack) {
        case 'haansoftxlsx':
          return 'xlsx'
      }
      return extensionBack || ''
    default:
      return extensionBack || ''
  }
}

const currentTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  const milliseconds = String(now.getMilliseconds()).padStart(3, '0')

  const formattedTime = `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`

  return formattedTime
}

module.exports = { 
    sendToBucket
}