"use client";
import Image from "next/image";
import { useState } from "react";
import ModalVideo from "react-modal-video";
import { Gallery, Item } from "react-photoswipe-gallery";
const galleryItems = [
  {
    href: "/images/banner/banner-property-6.jpg",
    className: "item2 box-img",
    src: "/images/banner/banner-property-6.jpg",
  },
  {
    href: "/images/banner/banner-property-7.jpg",
    className: "item3 box-img",
    src: "/images/banner/banner-property-7.jpg",
  },
  {
    href: "/images/banner/banner-property-8.jpg",
    className: "item4 box-img",
    src: "/images/banner/banner-property-8.jpg",
  },
  {
    href: "/images/banner/banner-property-9.jpg",
    className: "item5 box-img",
    src: "/images/banner/banner-property-9.jpg",
  },
];
export default function GalleryComponent() {
  const [isOpen, setOpen] = useState(false);
  return (
    <>
      <Gallery>
        <section className="flat-gallery-single">
          <Item
            original="/images/banner/banner-property-5.jpg"
            thumbnail="/images/banner/banner-property-5.jpg"
            width={960}
            height={680}
          >
            {({ ref, open }) => (
              <div className="item1 box-img">
                <a onClick={open} className="d-block" data-fancybox="gallery">
                  <Image
                    alt="img-gallery"
                    ref={ref}
                    src="/images/banner/banner-property-5.jpg"
                    width={960}
                    height={680}
                  />
                </a>
                <div className="box-btn">
                  <a
                    onClick={() => setOpen(true)}
                    data-fancybox="gallery2"
                    className="box-icon"
                  >
                    <span className="icon">
                      <svg
                        width={20}
                        height={20}
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M13.125 8.75L17.0583 4.81667C17.1457 4.72937 17.2571 4.66993 17.3782 4.64586C17.4994 4.62179 17.625 4.63417 17.7391 4.68143C17.8532 4.72869 17.9508 4.80871 18.0195 4.91139C18.0882 5.01407 18.1249 5.1348 18.125 5.25833V14.7417C18.1249 14.8652 18.0882 14.9859 18.0195 15.0886C17.9508 15.1913 17.8532 15.2713 17.7391 15.3186C17.625 15.3658 17.4994 15.3782 17.3782 15.3541C17.2571 15.3301 17.1457 15.2706 17.0583 15.1833L13.125 11.25M3.75 15.625H11.25C11.7473 15.625 12.2242 15.4275 12.5758 15.0758C12.9275 14.7242 13.125 14.2473 13.125 13.75V6.25C13.125 5.75272 12.9275 5.27581 12.5758 4.92417C12.2242 4.57254 11.7473 4.375 11.25 4.375H3.75C3.25272 4.375 2.77581 4.57254 2.42417 4.92417C2.07254 5.27581 1.875 5.75272 1.875 6.25V13.75C1.875 14.2473 2.07254 14.7242 2.42417 15.0758C2.77581 15.4275 3.25272 15.625 3.75 15.625Z"
                          stroke="black"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </a>
                  <a
                    onClick={open}
                    data-fancybox="gallery"
                    className="tf-btn primary"
                  >
                    <svg
                      width={20}
                      height={20}
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1.875 13.125L6.17417 8.82583C6.34828 8.65172 6.55498 8.51361 6.78246 8.41938C7.00995 8.32515 7.25377 8.27665 7.5 8.27665C7.74623 8.27665 7.99005 8.32515 8.21754 8.41938C8.44502 8.51361 8.65172 8.65172 8.82583 8.82583L13.125 13.125M11.875 11.875L13.0492 10.7008C13.2233 10.5267 13.43 10.3886 13.6575 10.2944C13.885 10.2001 14.1288 10.1516 14.375 10.1516C14.6212 10.1516 14.865 10.2001 15.0925 10.2944C15.32 10.3886 15.5267 10.5267 15.7008 10.7008L18.125 13.125M3.125 16.25H16.875C17.2065 16.25 17.5245 16.1183 17.7589 15.8839C17.9933 15.6495 18.125 15.3315 18.125 15V5C18.125 4.66848 17.9933 4.35054 17.7589 4.11612C17.5245 3.8817 17.2065 3.75 16.875 3.75H3.125C2.79348 3.75 2.47554 3.8817 2.24112 4.11612C2.0067 4.35054 1.875 4.66848 1.875 5V15C1.875 15.3315 2.0067 15.6495 2.24112 15.8839C2.47554 16.1183 2.79348 16.25 3.125 16.25ZM11.875 6.875H11.8817V6.88167H11.875V6.875ZM12.1875 6.875C12.1875 6.95788 12.1546 7.03737 12.096 7.09597C12.0374 7.15458 11.9579 7.1875 11.875 7.1875C11.7921 7.1875 11.7126 7.15458 11.654 7.09597C11.5954 7.03737 11.5625 6.95788 11.5625 6.875C11.5625 6.79212 11.5954 6.71263 11.654 6.65403C11.7126 6.59542 11.7921 6.5625 11.875 6.5625C11.9579 6.5625 12.0374 6.59542 12.096 6.65403C12.1546 6.71263 12.1875 6.79212 12.1875 6.875Z"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    View All Photos
                  </a>
                </div>
              </div>
            )}
          </Item>
          {galleryItems.map((item, index) => (
            <Item
              original={item.src}
              thumbnail={item.src}
              width={660}
              height={495}
              key={index}
            >
              {({ ref, open }) => (
                <a
                  onClick={open}
                  className={item.className}
                  data-fancybox="gallery"
                >
                  <Image
                    ref={ref}
                    alt="img-gallery"
                    src={item.src}
                    width={660}
                    height={495}
                  />
                </a>
              )}
            </Item>
          ))}
        </section>{" "}
      </Gallery>

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
