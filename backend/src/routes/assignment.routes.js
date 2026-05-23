import express from 'express';

import {
  getStudentAssignments,
  submitAssignmentSolution,
  unsubmitAssignmentSolution,
  createAssignment,
  getAllAssignmentSubmissions,
  approveAssignmentSubmission,
  rejectAssignmentSubmission,
   updateAssignmentStatus,
   deleteSubmissionRecord
} from '../controllers/assignment.controller.js';

import uploadAssignment from "../middlewares/assignmentUpload.middleware.js";

const router = express.Router();



/* SUBMIT */
router.post(
  '/submit',
  uploadAssignment.single("file"),
  submitAssignmentSolution
);

/* UNSUBMIT */
router.post(
  '/unsubmit',
  unsubmitAssignmentSolution
);

/* ADMIN CREATE */
router.post(
  '/admin/create',
  createAssignment
);

/* ADMIN FETCH */
router.get(
  '/admin/submissions',
  getAllAssignmentSubmissions
);

router.get('/:userId', getStudentAssignments);

/* APPROVE */
router.post(
  '/admin/approve',
  approveAssignmentSubmission
);

/* REJECT */
router.post(
  '/admin/reject',
  rejectAssignmentSubmission
);

router.patch('/review', updateAssignmentStatus);

router.delete(
  '/submission/:id',
  deleteSubmissionRecord
);

export default router;