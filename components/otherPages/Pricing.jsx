import { pricingPlans } from "@/data/pricing";
import React from "react";

export default function Pricing() {
  return (
    <section className="flat-section flat-pricing">
      <div className="container">
        <div
          className="box-title text-center wow fadeInUpSmall"
          data-wow-delay=".2s"
          data-wow-duration="2000ms"
        >
          <div className="text-subtitle text-primary">Pricing</div>
          <h3 className="title mt-4">Our Subscription</h3>
        </div>
        <div className="row">
          {pricingPlans.map((plan, index) => (
            <div className="box col-lg-3 col-md-6" key={index}>
              <div className={`box-pricing ${plan.active ? "active" : ""}`}>
                <div className="box price d-flex align-items-end">
                  <h3>{plan.price}</h3>
                  <span className="body-2 text-variant-1">/month</span>
                </div>
                <div className="box box-title-price">
                  <h5 className="title">{plan.title}</h5>
                  <p className="desc">
                    Join us every month for a very reasonable price
                  </p>
                </div>
                <ul className="box list-price">
                  {plan.features.map((feature, idx) => (
                    <li className="item" key={idx}>
                      <span
                        className={`check-icon icon-tick2 ${
                          idx >= 3 ? "disable" : ""
                        }`}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="box">
                  <a
                    href="#"
                    className="tf-btn btn-view primary size-1 hover-btn-view"
                  >
                    View All Properties
                    <span className="icon icon-arrow-right2" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
