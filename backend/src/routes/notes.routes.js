import express from 'express';

import upload from '../middlewares/upload.middleware.js';

import {
  createNote,
  editNote,
  deleteNote,
  getAllNotes,
  getNotesByCourse,
  saveDownload,
  getUserDownloads
} from '../controllers/notes.controller.js';

const router = express.Router();

router.get('/all', getAllNotes);

router.get('/course/:courseId', getNotesByCourse);

router.post(
  '/create',
  upload.single('note_file'),
  createNote
);

router.put(
  '/edit/:id',
  upload.single('note_file'),
  editNote
);

router.delete('/delete/:id', deleteNote);

/* DOWNLOAD ROUTES */

router.post(
  '/download',
  saveDownload
);

router.get(
  '/download/user/:userId',
  getUserDownloads
);



export default router;