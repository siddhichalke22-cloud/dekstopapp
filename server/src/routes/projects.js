import { Router } from 'express';
import {
	createProject,
	deleteProject,
	getProject,
	listProjects,
	applyToProject,
	updateProject,
} from '../controllers/projectsController.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { listBookmarks, listMyApplications, removeBookmark, saveBookmark } from '../controllers/projectsController.js';

const router = Router();

router.get('/', listProjects);
router.get('/:id', getProject);
router.post('/', createProject);
router.get('/me/applications', requireAuth, listMyApplications);
router.get('/me/bookmarks', requireAuth, listBookmarks);
router.put('/:id/bookmark', requireAuth, saveBookmark);
router.delete('/:id/bookmark', requireAuth, removeBookmark);
router.post('/:id/applications', requireAuth, applyToProject);
router.patch('/:id', updateProject);
router.delete('/:id', deleteProject);

export default router;
