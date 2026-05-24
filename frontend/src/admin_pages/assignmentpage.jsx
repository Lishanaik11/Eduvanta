import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
} from "@mui/material";

import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import HighlightOffRoundedIcon from "@mui/icons-material/HighlightOffRounded";
import LaunchIcon from "@mui/icons-material/Launch";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import FeedbackOutlinedIcon from "@mui/icons-material/FeedbackOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";

import axios from "axios";

export default function AssignmentPage() {
    const backendUrl = import.meta.env.VITE_API_URL;
  const userId = localStorage.getItem("userId");

  /* ================= STATE ================= */
  const [coursesToAssign, setCoursesToAssign] = useState([]);
  const [submittedAssignments, setSubmittedAssignments] = useState([]);
  
  /* --- FILTER STATE --- */
  const [statusFilter, setStatusFilter] = useState("All"); // Options: "All", "Pending", "Approved", "Rejected"

  /* --- REJECTION MODAL STATE --- */
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  /* ================= FETCH ================= */

  useEffect(() => {
    fetchCourses();
    fetchSubmissions();
  }, []);

  /* -------- COURSES (ADMIN SIDE) -------- */
  const fetchCourses = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/courses`);

      const formatted = (res.data.courses || []).map((c) => ({
        id: c.id,
        name: c.title,
        topic: "",
        dueDate: "",
      }));

      setCoursesToAssign(formatted);
    } catch (err) {
      console.error("Course fetch error:", err);
      setCoursesToAssign([]);
    }
  };

  /* -------- SUBMISSIONS (ADMIN SIDE) -------- */
  const fetchSubmissions = async () => {
    try {
      const res = await axios.get(
         `${backendUrl}/api/assignments/admin/submissions`
      );

      const formatted = (res.data.submissions || []).map((s) => ({
        id: s.id,
        studentName: s.student_name,
        courseName: s.course_title,
        topic: s.title,
        fileUrl: s.submitted_url
          ?`${backendUrl}${s.submitted_url}`
          : "#",
        status: s.status || "Pending",
      }));

      setSubmittedAssignments(formatted);
    } catch (err) {
      console.error("Submission fetch error:", err);
      setSubmittedAssignments([]);
    }
  };

  /* ================= INPUT HANDLER ================= */

  const handleInputChange = (courseId, field, value) => {
    setCoursesToAssign((prev) =>
      prev.map((c) =>
        c.id === courseId ? { ...c, [field]: value } : c
      )
    );
  };

  /* ================= CREATE ASSIGNMENT ================= */

  const handleSendAssignment = async (course) => {
    if (!course.topic || !course.dueDate) {
      alert("Fill all fields");
      return;
    }

    try {
      await axios.post(
        `${backendUrl}/api/assignments/admin/create`,
        {
          title: course.topic,
          description: course.topic,
          due_date: course.dueDate,
          course_id: course.id,
          course_title: course.name,
        }
      );

      alert("Assignment Published");
      fetchCourses();
    } catch (err) {
      console.error("Create error:", err);
    }
  };

  /* ================= STATUS UPDATE ================= */

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axios.patch( `${backendUrl}/api/assignments/review`, {
        submissionId: id,
        status: newStatus,
        feedback: newStatus === "Rejected" ? rejectionReason : null,
      });

      setSubmittedAssignments((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: newStatus } : item
        )
      );
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  /* ================= DELETE SUBMISSION ROUTINE ================= */
  const handleDeleteSubmission = async (id) => {
    if (window.confirm("Are you sure you want to remove this submission record?")) {
      try {
       await axios.delete(
  `${backendUrl}/api/assignments/submission/${id}`
);
        
        setSubmittedAssignments((prev) => prev.filter((item) => item.id !== id));
        alert("Submission entry deleted successfully.");
      } catch (err) {
        console.error("Delete error:", err);
        setSubmittedAssignments((prev) => prev.filter((item) => item.id !== id));
      }
    }
  };

  /* --- REJECTION INTERCEPT ACTIONS --- */
  const handleOpenRejectionModal = (submission) => {
    setSelectedSubmission(submission);
    setRejectionReason("");
    rejectionModalOpen(true);
    setRejectionModalOpen(true);
  };

  const handleConfirmRejection = () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }
    if (selectedSubmission) {
      handleStatusUpdate(selectedSubmission.id, "Rejected");
    }
    setRejectionModalOpen(false);
  };

  const getStatusChip = (status) => {
    let chipStyles = {};
    if (status === "Approved") {
      chipStyles = { bgcolor: "#e2f0d9", color: "#2e7d32", fontWeight: "600", border: "1px solid #b8e0a4" };
    } else if (status === "Rejected") {
      chipStyles = { bgcolor: "#fce8e6", color: "#c62828", fontWeight: "600", border: "1px solid #f5c2c1" };
    } else {
      chipStyles = { bgcolor: "#fff3e0", color: "#ef6c00", fontWeight: "600", border: "1px solid #ffe0b2" };
    }
    return <Chip label={status.toUpperCase()} size="small" sx={{ ...chipStyles, borderRadius: "6px", fontSize: "0.7rem", letterSpacing: "0.5px" }} />;
  };

  /* ================= FILTER LOGIC ================= */
  const filteredSubmissions = submittedAssignments.filter((submission) => {
    if (statusFilter === "All") return true;
    if (statusFilter === "Pending") {
      // Explicitly evaluates that it is neither Approved nor Rejected
      return submission.status !== "Approved" && submission.status !== "Rejected";
    }
    return submission.status.toLowerCase() === statusFilter.toLowerCase();
  });

  const getMetricCount = (status) => {
    if (status === "All") return submittedAssignments.length;
    if (status === "Pending") {
      return submittedAssignments.filter(s => s.status !== "Approved" && s.status !== "Rejected").length;
    }
    return submittedAssignments.filter(s => s.status.toLowerCase() === status.toLowerCase()).length;
  };

  /* ================= UI ================= */

  return (
    <Box sx={{ width: "100%", p: { xs: 2, md: 4 }, bgcolor: "#f8fafc", minHeight: "100vh" }}>
      
      {/* HEADER SECTION */}
      <Box sx={{ mb: 5, display: "flex", alignItems: "center", gap: 2 }}>
        <Box 
          sx={{ 
            bgcolor: "#3B592D", 
            color: "white", 
            p: 1.5, 
            borderRadius: "14px", 
            display: "flex", 
            boxShadow: "0 4px 14px rgba(59, 89, 45, 0.25)" 
          }}
        >
          <AssignmentOutlinedIcon fontSize="medium" />
        </Box>
        <Box>
          <Typography variant="h4" fontWeight="800" color="#1e293b" sx={{ letterSpacing: "-0.5px" }}>
            Course Assignments Panel
          </Typography>
          <Typography variant="body2" color="#64748b" sx={{ mt: 0.5 }}>
            Manage your courses, publish homework, and track student submissions instantly.
          </Typography>
        </Box>
      </Box>

      {/* SECTION 1: CREATE/PUBLISH ASSIGNMENTS */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h6" fontWeight="700" color="#334155" sx={{ mb: 2, ml: 0.5 }}>
          Assign Content to Live Classes
        </Typography>
        <Paper 
          elevation={0} 
          sx={{ 
            borderRadius: "16px", 
            border: "1px solid #e2e8f0", 
            overflow: "hidden",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)"
          }}
        >
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: "#f1f5f9" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "700", color: "#475569", fontSize: "0.80rem" }}>COURSE</TableCell>
                  <TableCell sx={{ fontWeight: "700", color: "#475569", fontSize: "0.80rem", width: "40%" }}>TOPIC / INSTRUCTIONS</TableCell>
                  <TableCell sx={{ fontWeight: "700", color: "#475569", fontSize: "0.80rem", width: "25%" }}>DUE DATE</TableCell>
                  <TableCell sx={{ fontWeight: "700", color: "#475569", fontSize: "0.80rem" }} align="right">ACTION</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {coursesToAssign.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 6, color: "#94a3b8" }}>
                      No active courses available.
                    </TableCell>
                  </TableRow>
                ) : (
                  coursesToAssign.map((row) => (
                    <TableRow key={row.id} sx={{ "&:hover": { bgcolor: "#f8fafc" }, transition: "background 0.2s" }}>
                      <TableCell sx={{ fontWeight: "600", color: "#1e293b" }}>{row.name}</TableCell>

                      <TableCell>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="e.g. Build a secure React authentication form"
                          value={row.topic}
                          onChange={(e) =>
                            handleInputChange(row.id, "topic", e.target.value)
                          }
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "10px",
                              bgcolor: "#ffffff"
                            }
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <TextField
                          type="date"
                          fullWidth
                          size="small"
                          value={row.dueDate}
                          onChange={(e) =>
                            handleInputChange(row.id, "dueDate", e.target.value)
                          }
                          InputLabelProps={{ shrink: true }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "10px",
                              bgcolor: "#ffffff"
                            }
                          }}
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Button
                          variant="contained"
                          disableElevation
                          startIcon={<SendRoundedIcon size="small" />}
                          onClick={() => handleSendAssignment(row)}
                          sx={{
                            borderRadius: "10px",
                            textTransform: "none",
                            fontWeight: "600",
                            px: 3,
                            py: 1,
                            bgcolor: "#3B592D",
                            "&:hover": { bgcolor: "#2c4222" },
                            boxShadow: "0 2px 4px rgba(59, 89, 45, 0.15)"
                          }}
                        >
                          Publish
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      {/* SECTION 2: SUBMISSIONS TRACKING */}
      <Box>
        <Box 
          sx={{ 
            display: "flex", 
            flexDirection: { xs: "column", sm: "row" }, 
            justifyContent: "space-between", 
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 2, 
            mb: 2, 
            ml: 0.5 
          }}
        >
          <Typography variant="h6" fontWeight="700" color="#334155">
            Student Submissions Log
          </Typography>

          {/* DYNAMIC METRIC STATUS FILTERS */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, bgcolor: "#f1f5f9", p: 0.5, borderRadius: "10px" }}>
            <FilterListRoundedIcon sx={{ color: "#94a3b8", ml: 1, fontSize: "1.2rem" }} />
            {["All", "Pending", "Approved", "Rejected"].map((status) => (
              <Chip
                key={status}
                label={`${status} (${getMetricCount(status)})`}
                size="small"
                onClick={() => setStatusFilter(status)}
                sx={{
                  fontWeight: "700",
                  fontSize: "0.75rem",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  border: "none",
                  ...(statusFilter === status ? {
                    bgcolor: status === "Approved" ? "#2e7d32" : status === "Rejected" ? "#c62828" : status === "Pending" ? "#ef6c00" : "#1e293b",
                    color: "#ffffff",
                    "&:hover": { bgcolor: status === "Approved" ? "#2e7d32" : status === "Rejected" ? "#c62828" : status === "Pending" ? "#ef6c00" : "#1e293b" }
                  } : {
                    bgcolor: "transparent",
                    color: "#64748b",
                    "&:hover": { bgcolor: "#e2e8f0", color: "#1e293b" }
                  })
                }}
              />
            ))}
          </Box>
        </Box>

        <Paper 
          elevation={0} 
          sx={{ 
            borderRadius: "16px", 
            border: "1px solid #e2e8f0", 
            overflow: "hidden",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)"
          }}
        >
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: "#f1f5f9" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "700", color: "#475569", fontSize: "0.80rem" }}>STUDENT</TableCell>
                  <TableCell sx={{ fontWeight: "700", color: "#475569", fontSize: "0.80rem" }}>COURSE</TableCell>
                  <TableCell sx={{ fontWeight: "700", color: "#475569", fontSize: "0.80rem" }}>TOPIC</TableCell>
                  <TableCell sx={{ fontWeight: "700", color: "#475569", fontSize: "0.80rem" }}>FILE LINK</TableCell>
                  <TableCell sx={{ fontWeight: "700", color: "#475569", fontSize: "0.80rem" }}>STATUS</TableCell>
                  <TableCell sx={{ fontWeight: "700", color: "#475569", fontSize: "0.80rem" }} align="center">REVIEW ACTIONS</TableCell>
                  <TableCell sx={{ fontWeight: "700", color: "#475569", fontSize: "0.80rem", width: "60px" }} align="right">REMOVE</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredSubmissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6, color: "#94a3b8" }}>
                      No {statusFilter !== "All" ? statusFilter.toLowerCase() : ""} submissions found matching this category view.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubmissions.map((row) => (
                    <TableRow key={row.id} sx={{ "&:hover": { bgcolor: "#f8fafc" }, transition: "background 0.2s" }}>
                      <TableCell sx={{ fontWeight: "600", color: "#1e293b" }}>{row.studentName}</TableCell>
                      <TableCell sx={{ color: "#334155", fontWeight: "500" }}>{row.courseName}</TableCell>
                      <TableCell sx={{ color: "#475569", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {row.topic}
                      </TableCell>

                      <TableCell>
                        <Button 
                          href={row.fileUrl} 
                          target="_blank" 
                          size="small"
                          variant="outlined"
                          endIcon={<LaunchIcon sx={{ width: 14, height: 14 }} />}
                          sx={{ 
                            borderRadius: "8px", 
                            textTransform: "none", 
                            fontWeight: "600",
                            fontSize: "0.775rem",
                            borderColor: "#cbd5e1",
                            color: "#475569",
                            bgcolor: "#ffffff",
                            "&:hover": { borderColor: "#94a3b8", bgcolor: "#f1f5f9" }
                          }}
                        >
                          View File
                        </Button>
                      </TableCell>

                      <TableCell>
                        {getStatusChip(row.status)}
                      </TableCell>

                      <TableCell align="center">
                        <Box sx={{ display: "inline-flex", gap: 1.5 }}>
                          
                          {/* PROPER APPROVE BUTTON */}
                          <Button
                            size="small"
                            variant={row.status === "Approved" ? "outlined" : "contained"}
                            color="success"
                            disableElevation
                            disabled={row.status === "Rejected"}
                            startIcon={<CheckCircleOutlineRoundedIcon />}
                            onClick={() => handleStatusUpdate(row.id, "Approved")}
                            sx={{
                              borderRadius: "20px",
                              textTransform: "none",
                              fontWeight: "700",
                              px: 2,
                              py: 0.5,
                              fontSize: "0.775rem",
                              ...(row.status === "Approved" && {
                                bgcolor: "rgba(46, 125, 50, 0.06)",
                                borderColor: "success.main",
                                pointerEvents: "none"
                              }),
                              "&.Mui-disabled": {
                                opacity: 0.25
                              }
                            }}
                          >
                            {row.status === "Approved" ? "Approved" : "Approve"}
                          </Button>

                          {/* INTERACTIVE REJECT BUTTON WITH REASON DIALOG MODAL */}
                          <Button
                            size="small"
                            variant={row.status === "Rejected" ? "outlined" : "contained"}
                            color="error"
                            disableElevation
                            disabled={row.status === "Approved"}
                            startIcon={<HighlightOffRoundedIcon />}
                            onClick={() => handleOpenRejectionModal(row)}
                            sx={{
                              borderRadius: "20px",
                              textTransform: "none",
                              fontWeight: "700",
                              px: 2,
                              py: 0.5,
                              fontSize: "0.775rem",
                              ...(row.status === "Rejected" && {
                                bgcolor: "rgba(198, 40, 40, 0.06)",
                                borderColor: "error.main",
                                pointerEvents: "none"
                              }),
                              "&.Mui-disabled": {
                                opacity: 0.25
                              }
                            }}
                          >
                            {row.status === "Rejected" ? "Rejected" : "Reject"}
                          </Button>

                        </Box>
                      </TableCell>

                      <TableCell align="right">
                        <Tooltip title="Delete Entry" arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteSubmission(row.id)}
                            sx={{
                              color: "#94a3b8",
                              transition: "all 0.2s",
                              "&:hover": {
                                color: "#ef4444",
                                bgcolor: "#fef2f2"
                              }
                            }}
                          >
                            <DeleteOutlineRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      {/* ================= MODERN REJECTION REASON DIALOG OVERLAY ================= */}
      <Dialog 
        open={rejectionModalOpen} 
        onClose={() => setRejectionModalOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            padding: 1,
            width: "100%",
            maxWidth: "440px"
          }
        }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1 }}>
          <Box sx={{ display: "flex", p: 1, bgcolor: "#fce8e6", color: "#c62828", borderRadius: "10px" }}>
            <FeedbackOutlinedIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight="800" color="#1e293b" sx={{ fontSize: "1.1rem" }}>
              Rejection Feedback
            </Typography>
            <Typography variant="caption" color="#64748b">
              Provide context for {selectedSubmission?.studentName || "the student"}'s submission evaluation.
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="#475569" fontWeight="600" sx={{ mb: 1 }}>
            Reason for Rejection <span style={{ color: "#c62828" }}>*</span>
          </Typography>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={3}
            placeholder="e.g. Code structure is incomplete or authentication parameters failed test routes..."
            variant="outlined"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                fontSize: "0.9rem"
              }
            }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button 
            onClick={() => setRejectionModalOpen(false)}
            sx={{ 
              borderRadius: "10px", 
              textTransform: "none", 
              fontWeight: "600", 
              color: "#64748b" 
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmRejection}
            variant="contained" 
            color="error"
            disableElevation
            sx={{ 
              borderRadius: "10px", 
              textTransform: "none", 
              fontWeight: "600",
              px: 2.5
            }}
          >
            Confirm Rejection
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}