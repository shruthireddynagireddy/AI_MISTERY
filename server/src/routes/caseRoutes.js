import { Router } from 'express';
import { accuse, create, retrieve, retrieveEvidence } from '../controllers/caseController.js';
const router=Router();
router.post('/cases',create);
router.get('/cases/:caseId',retrieve);
router.get('/cases/:caseId/evidence/:evidenceId',retrieveEvidence);
router.post('/cases/:caseId/accusations',accuse);
export default router;
