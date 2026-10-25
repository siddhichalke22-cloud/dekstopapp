import { Router } from 'express';
import { createSkillExchange, createSkillOffer, listSkillExchanges, listSkillOffers, listSkills, requestSkillExchange } from '../controllers/skillsController.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

router.get('/', listSkills);
router.get('/exchanges', listSkillExchanges);
router.post('/exchanges', requireAuth, createSkillExchange);
router.get('/offers', listSkillOffers);
router.post('/offers', requireAuth, createSkillOffer);
router.post('/requests', requireAuth, requestSkillExchange);

export default router;