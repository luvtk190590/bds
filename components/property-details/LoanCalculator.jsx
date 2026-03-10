"use client";
import React from "react";

export default function LoanCalculator() {
  return (
    <>
      {" "}
      <h5 className="title fw-6">Loan Calculator</h5>
      <form className="box-loan-calc" onSubmit={(e) => e.preventDefault()}>
        <div className="box-top">
          <div className="item-calc">
            <label htmlFor="loan1" className="label">
              Total Amount:
            </label>
            <input
              type="number"
              id="loan1"
              placeholder="10,000"
              className="form-control"
            />
          </div>
          <div className="item-calc">
            <label htmlFor="loan1" className="label">
              Down Payment:
            </label>
            <input
              type="number"
              id="loan1"
              placeholder={3000}
              className="form-control"
            />
          </div>
          <div className="item-calc">
            <label htmlFor="loan1" className="label">
              Amortization Period (months):
            </label>
            <input
              type="number"
              id="loan1"
              placeholder={12}
              className="form-control"
            />
          </div>
          <div className="item-calc">
            <label htmlFor="loan1" className="label">
              Interest rate (%):
            </label>
            <input
              type="number"
              id="loan1"
              placeholder={5}
              className="form-control"
            />
          </div>
        </div>
        <div className="box-bottom">
          <button className="tf-btn primary">Calculator</button>
          <div className="d-flex gap-4">
            <span className="text-btn fw-6">Monthly Payment:</span>
            <span className="text-btn fw-6 text-primary">$599.25</span>
          </div>
        </div>
      </form>
    </>
  );
}
