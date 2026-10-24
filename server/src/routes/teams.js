import { Router } from 'express';
import {
	createTeam,
	deleteTeam,
	getTeam,
	listTeams,
	updateTeam,
} from '../controllers/teamsController.js';

const router = Router();

router.get('/', listTeams);
router.get('/:id', getTeam);
router.post('/', createTeam);
router.patch('/:id', updateTeam);
router.delete('/:id', deleteTeam);

export default router;
