"use client";
import React, { useEffect, useRef } from "react";
import { Chart } from "chart.js/auto";

const LineChart = () => {
  const chartRef = useRef(null); // Reference for the canvas element
  const myChartRef = useRef(null); // Reference for the Chart instance

  const initializeChart = () => {
    const ctx = chartRef.current.getContext("2d");

    // Define the gradient color
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, "rgba(21, 99, 223,0.2)");
    gradient.addColorStop(1, "rgba(21, 99, 223,0)");

    // Initialize the chart
    myChartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
        datasets: [
          {
            data: [42, 45, 70, 65, 140, 130, 145, 145, 160, 135, 140, 130],
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
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  };

  useEffect(() => {
    initializeChart();

    // Add a resize listener to redraw the chart on window resize
    const handleResize = () => {
      myChartRef.current.destroy();
      initializeChart();
    };
    window.addEventListener("resize", handleResize);

    // Clean up the resize listener and chart instance on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
      if (myChartRef.current) {
        myChartRef.current.destroy();
      }
    };
  }, []);

  return <canvas ref={chartRef} id="lineChart"></canvas>;
};

export default LineChart;
