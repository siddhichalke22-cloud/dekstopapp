import { Router } from 'express';
import {
	createTeam,
	deleteTeam,
	getTeam,
	applyToTeam,
	listTeams,
	listMyTeamApplications,
	updateTeam,
} from '../controllers/teamsController.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

router.get('/', listTeams);
router.get('/me/applications', requireAuth, listMyTeamApplications);
router.get('/:id', getTeam);
router.post('/', createTeam);
router.post('/:id/applications', requireAuth, applyToTeam);
router.patch('/:id', updateTeam);
router.delete('/:id', deleteTeam);

export default router;
