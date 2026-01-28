const express = require('express');
const router = express.Router();
const medicineController = require('../controller/medicine_controller');
const auth = require('../middleware/auth');

// Apply auth middleware to all medicine routes
router.use(auth);

router.post('/medicines', medicineController.createMedicine);
router.get('/medicines', medicineController.getMedicines);
router.put('/medicines/:id', medicineController.updateMedicine);
router.delete('/medicines/:id', medicineController.deleteMedicine);

module.exports = router;
