"use client";
import React, { useEffect, useRef } from "react";
import { Chart } from "chart.js/auto";

const MONTH_LABELS = ["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"];

const LineChart = ({ data, labels }) => {
  const chartRef = useRef(null);
  const myChartRef = useRef(null);

  const chartData = data || Array(12).fill(0);
  const chartLabels = labels || MONTH_LABELS;

  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, "rgba(21, 99, 223,0.2)");
    gradient.addColorStop(1, "rgba(21, 99, 223,0)");

    if (myChartRef.current) myChartRef.current.destroy();

    myChartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: chartLabels,
        datasets: [
          {
            data: chartData,
            backgroundColor: gradient,
            borderColor: "#1563DF",
            borderWidth: 2,
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
      },
    });

    return () => {
      if (myChartRef.current) myChartRef.current.destroy();
    };
  }, [JSON.stringify(chartData), JSON.stringify(chartLabels)]);

  return <canvas ref={chartRef} id="lineChart" />;
};

export default LineChart;
