const express = require('express');
const router = express.Router();
const personController = require('../controller/person_controller');

// Register new person
router.post('/register', personController.registerPerson);

// Get all persons (for loading face matcher)
router.get('/people', personController.getAllPersons);

router.delete('/deleteperson/:id', personController.deletePerson)

module.exports = router;
