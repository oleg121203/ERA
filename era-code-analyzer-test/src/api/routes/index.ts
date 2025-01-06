import express from 'express';
import { AnalysisController } from '../controllers/analysis.controller'; // Добавлено

const router = express.Router();
const controller = new AnalysisController(); // Добавлено

router.post('/analyze', (req, res) => controller.analyze(req, res)); // Изменено
router.post('/batch-analyze', (req, res) => controller.batchAnalyze(req, res)); // Изменено

export default router;