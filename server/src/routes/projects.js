import { Router } from 'express';
import {
	createProject,
	deleteProject,
	getProject,
	listProjects,
	applyToProject,
	updateProject,
} from '../controllers/projectsController.js';

const router = Router();

router.get('/', listProjects);
router.get('/:id', getProject);
router.post('/', createProject);
router.post('/:id/applications', applyToProject);
router.patch('/:id', updateProject);
router.delete('/:id', deleteProject);

export default router;
