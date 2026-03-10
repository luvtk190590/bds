import React from "react";

export default function Faqs() {
  return (
    <section className="flat-section">
      <div className="container">
        <div className="tf-faq">
          <div
            className="box-title style-1 text-center wow fadeInUpSmall"
            data-wow-delay=".2s"
            data-wow-duration="2000ms"
          >
            <div className="text-subtitle text-primary">Faqs</div>
            <h3 className="title mt-4">Frequently Asked Questions</h3>
          </div>
          <ul className="box-faq" id="wrapper-faq">
            <li className="faq-item">
              <a
                href="#accordion-faq-one"
                className="faq-header collapsed"
                data-bs-toggle="collapse"
                aria-expanded="false"
                aria-controls="accordion-faq-one"
              >
                Why should I use your services?
              </a>
              <div
                id="accordion-faq-one"
                className="collapse"
                data-bs-parent="#wrapper-faq"
              >
                <p className="faq-body">
                  Once your account is set up and you've familiarized yourself
                  with the platform, you are ready to start using our services.
                  Whether it's accessing specific features, making transactions,
                  or utilizing our tools, you'll find everything you need at
                  your fingertips.
                </p>
              </div>
            </li>
            <li className="faq-item">
              <a
                href="#accordion-faq-two"
                className="faq-header"
                data-bs-toggle="collapse"
                aria-expanded="false"
                aria-controls="accordion-faq-two"
              >
                How do I get started with your services?
              </a>
              <div
                id="accordion-faq-two"
                className="collapse show"
                data-bs-parent="#wrapper-faq"
              >
                <p className="faq-body">
                  Once your account is set up and you've familiarized yourself
                  with the platform, you are ready to start using our services.
                  Whether it's accessing specific features, making transactions,
                  or utilizing our tools, you'll find everything you need at
                  your fingertips.
                </p>
              </div>
            </li>
            <li className="faq-item">
              <a
                href="#accordion-faq-three"
                className="faq-header collapsed"
                data-bs-toggle="collapse"
                aria-expanded="false"
                aria-controls="accordion-faq-three"
              >
                How secure are your services?
              </a>
              <div
                id="accordion-faq-three"
                className="collapse"
                data-bs-parent="#wrapper-faq"
              >
                <p className="faq-body">
                  Once your account is set up and you've familiarized yourself
                  with the platform, you are ready to start using our services.
                  Whether it's accessing specific features, making transactions,
                  or utilizing our tools, you'll find everything you need at
                  your fingertips.
                </p>
              </div>
            </li>
            <li className="faq-item">
              <a
                href="#accordion-faq-four"
                className="faq-header collapsed"
                data-bs-toggle="collapse"
                aria-expanded="false"
                aria-controls="accordion-faq-four"
              >
                Is there customer support available?
              </a>
              <div
                id="accordion-faq-four"
                className="collapse"
                data-bs-parent="#wrapper-faq"
              >
                <p className="faq-body">
                  Once your account is set up and you've familiarized yourself
                  with the platform, you are ready to start using our services.
                  Whether it's accessing specific features, making transactions,
                  or utilizing our tools, you'll find everything you need at
                  your fingertips.
                </p>
              </div>
            </li>
            <li className="faq-item">
              <a
                href="#accordion-faq-five"
                className="faq-header collapsed"
                data-bs-toggle="collapse"
                aria-expanded="false"
                aria-controls="accordion-faq-five"
              >
                How can I update my account information?
              </a>
              <div
                id="accordion-faq-five"
                className="collapse"
                data-bs-parent="#wrapper-faq"
              >
                <p className="faq-body">
                  Once your account is set up and you've familiarized yourself
                  with the platform, you are ready to start using our services.
                  Whether it's accessing specific features, making transactions,
                  or utilizing our tools, you'll find everything you need at
                  your fingertips.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
