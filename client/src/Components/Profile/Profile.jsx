import React from "react"
import Image from "../Image/Image"
import "./Profile.style.scss"

function Profile({ profileImage, profileAlt }) {
  return (
    <div className="userImage">
      <Image
        srcValue={profileImage}
        altValue={`${profileAlt}님의 프로필 이미지`}
      />
    </div>
  )
}

export default Profile
