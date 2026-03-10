"use client";
import Image from "next/image";
import React, { useState } from "react";
import ModalVideo from "react-modal-video";

export default function Video() {
  const [isOpen, setOpen] = useState(false);
  return (
    <>
      <h5 className="title fw-6">Video</h5>
      <div className="img-video">
        <Image
          alt="img-video"
          src="/images/banner/img-video.jpg"
          width={812}
          height={457}
        />
        <a
          onClick={() => setOpen(true)}
          data-fancybox="gallery2"
          className="btn-video"
        >
          <span className="icon icon-play" />
        </a>
      </div>
      <ModalVideo
        channel="youtube"
        youtube={{ mute: 0, autoplay: 0 }}
        isOpen={isOpen}
        videoId="MLpWrANjFbI"
        onClose={() => setOpen(false)}
      />
    </>
  );
}
