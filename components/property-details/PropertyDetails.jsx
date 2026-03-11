import Description from "./Description";
import Overview from "./Overview";
import Video from "./Video";
import Features from "./Features";
import MapLocation from "./MapLocation";
import FloorPlan from "./FloorPlan";
import LoanCalculator from "./LoanCalculator";
import GuestReview from "./GuestReview";
import ContactSeller from "./ContactSeller";
import WidgetBox from "./WidgetBox";

import LeatestProperties from "./LeatestProperties";
// Kiểm tra amenities có dữ liệu không (array hoặc JSON string)
function hasAmenities(propertyItem) {
  const raw = propertyItem?.amenities;
  if (Array.isArray(raw)) return raw.filter(Boolean).length > 0;
  if (typeof raw === "string" && raw.trim()) {
    try { return JSON.parse(raw).filter(Boolean).length > 0; } catch { return false; }
  }
  return false;
}

export default function PropertyDetails({ propertyItem }) {
  return (
    <>
      <section className="flat-section-v3 flat-property-detail">
        <div className="container">
          <div className="row">
            <div className="col-xl-8 col-lg-7">
              <div className="single-property-element single-property-desc">
                <Description propertyItem={propertyItem} />
              </div>
              <div className="single-property-element single-property-overview">
                <Overview propertyItem={propertyItem} />
              </div>

              {hasAmenities(propertyItem) && (
                <div className="single-property-element single-property-feature">
                  <Features propertyItem={propertyItem} />
                </div>
              )}
              <div className="single-property-element single-property-map">
                <MapLocation propertyItem={propertyItem} />
              </div>
              <div className="single-property-element single-property-floor">
                <FloorPlan propertyItem={propertyItem} />
              </div>
              <div className="single-property-element single-property-loan">
                <LoanCalculator />
              </div>
              <div className="single-property-element single-wrapper-review">
                <GuestReview propertyItem={propertyItem} />
              </div>
            </div>
            <div className="col-xl-4 col-lg-5">
              <div className="single-sidebar fixed-sidebar">
                <div className="widget-box single-property-contact">
                  <ContactSeller propertyItem={propertyItem} />
                </div>
                <div className="flat-tab flat-tab-form widget-filter-search widget-box">
                  <WidgetBox />
                </div>

                <div className="box-latest-property">
                  <LeatestProperties excludeId={propertyItem?.id} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>{" "}
    </>
  );
}
