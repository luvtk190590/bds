"use client";
import React, { useState } from "react";
import PriceInput from "@/components/common/PriceInput";

function formatVND(num) {
  if (num === null || num === undefined || isNaN(num)) return "—";
  return Math.round(num).toLocaleString("vi-VN") + " đ";
}

function calcSchedule(principal, annualRate, months, method) {
  const monthlyRate = annualRate / 100 / 12;
  const rows = [];
  let totalInterest = 0;

  if (method === "declining") {
    // Dư nợ giảm dần: gốc cố định, lãi giảm theo dư nợ còn lại
    const monthlyPrincipal = principal / months;
    let remaining = principal;
    for (let i = 1; i <= months; i++) {
      const interest = remaining * monthlyRate;
      const total = monthlyPrincipal + interest;
      totalInterest += interest;
      remaining = Math.max(0, remaining - monthlyPrincipal);
      rows.push({ month: i, principal: monthlyPrincipal, interest, total, remaining });
    }
  } else {
    // Dư nợ ban đầu: gốc cố định, lãi cố định tính trên vốn gốc ban đầu
    const monthlyPrincipal = principal / months;
    const monthlyInterest = principal * monthlyRate;
    const total = monthlyPrincipal + monthlyInterest;
    let remaining = principal;
    for (let i = 1; i <= months; i++) {
      totalInterest += monthlyInterest;
      remaining = Math.max(0, remaining - monthlyPrincipal);
      rows.push({ month: i, principal: monthlyPrincipal, interest: monthlyInterest, total, remaining });
    }
  }

  return { rows, totalInterest, totalPayment: principal + totalInterest };
}

export default function LoanCalculator() {
  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [loanTerm, setLoanTerm] = useState("");
  const [method, setMethod] = useState("declining");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  function handleCalculate(e) {
    e.preventDefault();
    const principal = parseFloat(loanAmount);
    const rate = parseFloat(interestRate);
    const months = parseInt(loanTerm);

    if (!principal || principal <= 0) { setError("Vui lòng nhập số tiền vay hợp lệ."); return; }
    if (!rate || rate <= 0 || rate > 100) { setError("Vui lòng nhập lãi suất hợp lệ (0–100%/năm)."); return; }
    if (!months || months <= 0 || months > 600) { setError("Vui lòng nhập thời hạn vay hợp lệ (1–600 tháng)."); return; }

    setError("");
    setResult(calcSchedule(principal, rate, months, method));
  }

  function handleMethodChange(m) {
    setMethod(m);
    setResult(null);
    setError("");
  }

  return (
    <>
      <h5 className="title fw-6">Tính lãi suất vay</h5>

      {/* Tabs phương thức */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button
          type="button"
          className={`tf-btn${method === "declining" ? " primary" : " btn-line"}`}
          style={{ minWidth: "auto", padding: "8px 18px", fontSize: 13 }}
          onClick={() => handleMethodChange("declining")}
        >
          Dư nợ giảm dần
        </button>
        <button
          type="button"
          className={`tf-btn${method === "fixed" ? " primary" : " btn-line"}`}
          style={{ minWidth: "auto", padding: "8px 18px", fontSize: 13 }}
          onClick={() => handleMethodChange("fixed")}
        >
          Dư nợ ban đầu
        </button>
      </div>

      <form className="box-loan-calc" onSubmit={handleCalculate}>
        <div className="box-top" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          <div className="item-calc">
            <label className="label">Số tiền vay (VNĐ)</label>
            <PriceInput
              placeholder="VD: 2.000.000.000"
              value={loanAmount}
              onChange={v => { setLoanAmount(v); setResult(null); }}
            />
          </div>
          <div className="item-calc">
            <label className="label">Lãi suất (%/năm)</label>
            <input
              type="number"
              placeholder="VD: 9"
              className="form-control"
              value={interestRate}
              onChange={e => { setInterestRate(e.target.value); setResult(null); }}
              min="0.1"
              max="100"
              step="0.1"
            />
          </div>
          <div className="item-calc">
            <label className="label">Thời hạn vay (tháng)</label>
            <input
              type="number"
              placeholder="VD: 120"
              className="form-control"
              value={loanTerm}
              onChange={e => { setLoanTerm(e.target.value); setResult(null); }}
              min="1"
              max="600"
              step="1"
            />
          </div>
        </div>

        {error && (
          <div style={{ padding: "0 20px 12px", color: "#ef4444", fontSize: 13 }}>{error}</div>
        )}

        <div className="box-bottom" style={{ flexWrap: "wrap", gap: 12 }}>
          <button type="submit" className="tf-btn primary">Tính toán</button>
          {result && (
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: 13, color: "#64748b" }}>Tổng tiền lãi: </span>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#f59e0b" }}>{formatVND(result.totalInterest)}</span>
              </div>
              <div>
                <span style={{ fontSize: 13, color: "#64748b" }}>Tổng số tiền phải trả: </span>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#ef4444" }}>{formatVND(result.totalPayment)}</span>
              </div>
            </div>
          )}
        </div>
      </form>

      {/* Phương thức giải thích */}
      {result && (
        <div style={{ marginTop: 4, padding: "10px 0", fontSize: 12, color: "#94a3b8" }}>
          {method === "declining"
            ? "* Dư nợ giảm dần: tiền gốc cố định, tiền lãi giảm dần theo dư nợ còn lại mỗi tháng."
            : "* Dư nợ ban đầu: tiền gốc và tiền lãi cố định hàng tháng, tính lãi trên vốn gốc ban đầu."}
        </div>
      )}

      {/* Bảng chi tiết */}
      {result && result.rows.length > 0 && (
        <div style={{ marginTop: 16, overflowX: "auto", borderRadius: 12, border: "1px solid #e2e8f0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                <th style={{ padding: "10px 14px", textAlign: "center", borderBottom: "2px solid #e2e8f0", whiteSpace: "nowrap", color: "#374151" }}>Tháng</th>
                <th style={{ padding: "10px 14px", textAlign: "right", borderBottom: "2px solid #e2e8f0", whiteSpace: "nowrap", color: "#374151" }}>Tiền gốc</th>
                <th style={{ padding: "10px 14px", textAlign: "right", borderBottom: "2px solid #e2e8f0", whiteSpace: "nowrap", color: "#374151" }}>Tiền lãi</th>
                <th style={{ padding: "10px 14px", textAlign: "right", borderBottom: "2px solid #e2e8f0", whiteSpace: "nowrap", color: "#374151" }}>Phải trả/tháng</th>
                <th style={{ padding: "10px 14px", textAlign: "right", borderBottom: "2px solid #e2e8f0", whiteSpace: "nowrap", color: "#374151" }}>Dư nợ còn lại</th>
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row, idx) => (
                <tr key={row.month} style={{ borderBottom: "1px solid #f1f5f9", background: idx % 2 === 0 ? "#fff" : "#fafbff" }}>
                  <td style={{ padding: "8px 14px", textAlign: "center", color: "#6b7280" }}>{row.month}</td>
                  <td style={{ padding: "8px 14px", textAlign: "right" }}>{formatVND(row.principal)}</td>
                  <td style={{ padding: "8px 14px", textAlign: "right", color: "#f59e0b" }}>{formatVND(row.interest)}</td>
                  <td style={{ padding: "8px 14px", textAlign: "right", fontWeight: 600 }}>{formatVND(row.total)}</td>
                  <td style={{ padding: "8px 14px", textAlign: "right", color: "#64748b" }}>{formatVND(row.remaining)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
