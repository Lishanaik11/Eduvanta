import React, { useState, useEffect } from "react";
// Material UI Core Components
import {
  Box,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";

// Icons
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import AnalyticsOutlinedIcon from "@mui/icons-material/AnalyticsOutlined";

// Chart.js Configuration Imports
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";

import { Doughnut, Bar } from "react-chartjs-2";

// Register all ChartJS extensions needed for rendering canvas widgets
ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend
);

export default function CourseAnalytics() {
  /* ====================================================================
      MOCK DATA LAYERS
     ==================================================================== */
  const [topStats, setTopStats] = useState({
    totalCourses: 0,
    avgCompletionRate: "0%",
    totalEnrollments: 0,
  });

  const [categoryData, setCategoryData] = useState({
    labels: [],
    enrollments: [],
    completions: [],
  });

  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/course-analysis/analytics")
      .then((res) => res.json())
      .then((data) => {
        console.log("Analytics Data:", data);
        setTopStats(data.topStats);
        setCategoryData(data.categoryData);
        setTableData(data.tableData);
      })
      .catch((err) => {
        console.log("Analytics Fetch Error:", err);
      });
  }, []);

  /* ====================================================================
      CHART DEFINITIONS & CONFIGURATION
     ==================================================================== */
  const doughnutChartData = {
    labels: categoryData.labels,
    datasets: [
      {
        label: "Clicks",
        data: categoryData.enrollments,
        backgroundColor: [
          "#2563EB", 
          "#10B981", 
          "#F59E0B", 
          "#8B5CF6", 
          "#EF4444", 
        ],
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%", 
    plugins: {
      legend: {
        // ✅ RESPONSIVE LEGEND: Shifts underneath on tablets/phones to preserve spacing
        position: window.innerWidth < 960 ? "bottom" : "right",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: window.innerWidth < 960 ? 12 : 24,
          font: { size: 13, weight: "500", family: "Inter, sans-serif" },
          color: "#475569",
        },
      },
    },
  };

  const barChartData = {
    labels: categoryData.labels,
    datasets: [
      {
        label: "Enrollments",
        data: categoryData.enrollments,
        backgroundColor: "#3B82F6", 
        borderRadius: 6,
        barPercentage: 0.5,
        categoryPercentage: 0.6,
      },
      {
        label: "Completions",
        data: categoryData.completions,
        backgroundColor: "#10B981", 
        borderRadius: 6,
        barPercentage: 0.5,
        categoryPercentage: 0.6,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        align: "center",
        labels: { 
          usePointStyle: true, 
          pointStyle: "circle",
          font: { size: 13, weight: "500" },
          padding: 20
        },
      },
    },
    scales: {
      x: { 
        grid: { display: false },
        ticks: { color: "#64748b", font: { size: 11, weight: "500" } }
      },
      y: { 
        border: { display: false },
        grid: { color: "#F1F5F9" },
        ticks: { color: "#64748b", font: { size: 11 } }
      },
    },
  };

  return (
    // Maximized layout container padding to allow full horizontal stretch
    <Box sx={{ p: { xs: 2, sm: 3, md: 5 }, backgroundColor: "#F8FAFC", minHeight: "100vh", width: "100%", boxSizing: "border-box" }}>
      
      {/* HEADER BAR TITLE */}
      <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
        <Box sx={{ backgroundColor: "#2563EB", p: 1.5, borderRadius: "12px", color: "#fff", display: "flex", flexShrink: 0 }}>
          <AnalyticsOutlinedIcon sx={{ fontSize: "1.75rem" }} />
        </Box>
        <Box>
          <Typography variant="h4" fontWeight="700" sx={{ color: "#0F172A", letterSpacing: "-0.03em", fontSize: { xs: "1.75rem", md: "2.125rem" } }}>
            Course Analytics
          </Typography>
          <Typography variant="body1" sx={{ color: "#64748B", mt: 0.3, fontSize: { xs: "0.9rem", md: "1rem" } }}>
            Detailed performance metrics for recommended courses
          </Typography>
        </Box>
      </Box>

      {/* TOP ANALYTIC HIGHLIGHT CARDS (Updated to handle clean stacking on tablet/phone views) */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: "Total Courses", val: topStats.totalCourses },
          { label: "Avg. Completion Rate", val: topStats.avgCompletionRate },
          { label: "Total Enrollments", val: topStats.totalEnrollments },
        ].map((stat, i) => (
          <Grid item xs={12} sm={4} key={i}> {/* ✅ Divided evenly 3 columns on tablet and up */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 }, 
                minHeight: "110px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                borderRadius: "16px",
                backgroundColor: "#ffffff",
                boxShadow: "0px 8px 24px rgba(15, 23, 42, 0.03)",
                border: "1px solid #E2E8F0",
                transition: "transform 0.2s ease",
                "&:hover": { transform: "translateY(-2px)" }
              }}
            >
              <Typography variant="body2" fontWeight="600" sx={{ color: "#64748B", mb: 1, letterSpacing: "0.05em", textTransform: "uppercase", fontSize: "0.75rem" }}>
                {stat.label}
              </Typography>
              <Typography variant="h3" fontWeight="700" sx={{ color: "#0F172A", letterSpacing: "-0.04em", lineHeight: 1, fontSize: { xs: "1.75rem", md: "2.5rem" } }}>
                {stat.val}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* CHARTS SECTION (Changes from horizontal splits to stacked rows on smaller displays) */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        
        {/* Left Side Chart - Balanced to md={5}, stacks completely on tablet/phone */}
        <Grid item xs={12} md={5}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: "16px",
              backgroundColor: "#ffffff",
              boxShadow: "0px 8px 24px rgba(15, 23, 42, 0.03)",
              border: "1px solid #E2E8F0",
              height: { xs: "380px", md: "450px" }, // Slightly lower height profile on tiny screen panels
              display: "flex",
              flexDirection: "column"
            }}
          >
            <Typography variant="h6" fontWeight="700" sx={{ color: "#0F172A", mb: 2 }}>
              Enrollments
            </Typography>
            <Box sx={{ position: "relative", flexGrow: 1, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Doughnut data={doughnutChartData} options={doughnutOptions} />
            </Box>
          </Paper>
        </Grid>

        {/* Right Side Chart - Expanded to md={7} */}
        <Grid item xs={12} md={7}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: "16px",
              backgroundColor: "#ffffff",
              boxShadow: "0px 8px 24px rgba(15, 23, 42, 0.03)",
              border: "1px solid #E2E8F0",
              height: { xs: "380px", md: "450px" }, 
              display: "flex",
              flexDirection: "column"
            }}
          >
            <Typography variant="h6" fontWeight="700" sx={{ color: "#0F172A", mb: 2 }}>
              Category Performance
            </Typography>
            <Box sx={{ position: "relative", flexGrow: 1, minHeight: 0 }}>
              <Bar data={barChartData} options={barOptions} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* TOP PERFORMING COURSES DATA TABLE */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "16px",
          backgroundColor: "#ffffff",
          boxShadow: "0px 8px 24px rgba(15, 23, 42, 0.03)",
          border: "1px solid #E2E8F0",
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: 3, px: { xs: 3, md: 4 }, borderBottom: "1px solid #F1F5F9" }}>
          <Typography variant="h6" fontWeight="700" sx={{ color: "#0F172A" }}>
            Top Performing Courses
          </Typography>
        </Box>

        {/* ✅ WRAPPED IN A RESPONSIVE OVERFLOW TRACK CONTAINER */}
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table size="medium" sx={{ minWidth: 650 }}> {/* Guarantees data structures do not squish under 650px wide */}
            <TableHead sx={{ backgroundColor: "#F8FAFC" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "600", color: "#64748B", px: { xs: 3, md: 4 }, py: 2 }}>COURSE NAME</TableCell>
                <TableCell align="right" sx={{ fontWeight: "600", color: "#64748B", py: 2 }}>ENROLLMENTS</TableCell>
                <TableCell align="right" sx={{ fontWeight: "600", color: "#64748B", py: 2 }}>COMPLETIONS</TableCell>
                <TableCell align="right" sx={{ fontWeight: "600", color: "#64748B", py: 2 }}>COMPLETION RATE</TableCell>
                <TableCell align="right" sx={{ fontWeight: "600", color: "#64748B", px: { xs: 3, md: 4 }, py: 2 }}>TREND</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.map((row, index) => (
                <TableRow 
                  key={index} 
                  hover 
                  sx={{ "&:last-child cell, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row" sx={{ fontWeight: "600", color: "#0F172A", px: { xs: 3, md: 4 }, py: 2.5 }}>
                    {row.name}
                  </TableCell>
                  <TableCell align="right" sx={{ color: "#334155", fontWeight: "500", py: 2.5 }}>
                    {row.enrollments?.toLocaleString()}
                  </TableCell>
                  <TableCell align="right" sx={{ color: "#334155", fontWeight: "500", py: 2.5 }}>
                    {row.completions?.toLocaleString()}
                  </TableCell>
                  <TableCell align="right" sx={{ width: "200px", py: 2.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 1.5 }}>
                      <Box
                        sx={{
                          width: "80px",
                          height: "6px",
                          backgroundColor: "#E2E8F0",
                          borderRadius: "4px",
                          overflow: "hidden",
                          display: { xs: "none", sm: "block" } // Hides micro-progress lines on tiny phone displays to maximize layout space
                        }}
                      >
                        <Box
                          sx={{
                            width: row.rate,
                            height: "100%",
                            backgroundColor: "#2563EB",
                            borderRadius: "4px"
                          }}
                        />
                      </Box>
                      <Typography variant="body2" fontWeight="600" sx={{ color: "#334155", minWidth: "45px" }}>
                        {row.rate}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{ px: { xs: 3, md: 4 }, py: 2.5 }}>
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.5,
                        color: row.positive ? "#10B981" : "#EF4444",
                        fontWeight: "600",
                        fontSize: "0.85rem",
                      }}
                    >
                      {row.positive ? (
                        <ArrowUpwardIcon sx={{ fontSize: "0.9rem" }} />
                      ) : (
                        <ArrowDownwardIcon sx={{ fontSize: "0.9rem" }} />
                      )}
                      {row.trend}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}