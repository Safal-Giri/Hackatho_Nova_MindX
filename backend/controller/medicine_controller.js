const Medicine = require('../models/medicine_model');

// Create new medicine schedule
exports.createMedicine = async (req, res) => {
  try {
    const { name, dose, schedule, time } = req.body;
    const userId = req.user._id;

    if (!name || !dose || !schedule || !time) {
      return res.status(400).json({ status: 'failed', message: 'All fields are required' });
    }

    const medicine = new Medicine({
      name,
      dose,
      schedule,
      time,
      userId
    });

    await medicine.save();
    res.status(201).json({ status: 'success', data: medicine });
  } catch (err) {
    console.error('Error creating medicine:', err);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

// Get all medicines for logged in user
exports.getMedicines = async (req, res) => {
  try {
    const userId = req.user._id;
    const medicines = await Medicine.find({ userId });
    res.json({ status: 'success', data: medicines });
  } catch (err) {
    console.error('Error fetching medicines:', err);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

// Update medicine schedule
exports.updateMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, dose, schedule, time } = req.body;
    const userId = req.user._id;

    const medicine = await Medicine.findOneAndUpdate(
      { _id: id, userId },
      { name, dose, schedule, time },
      { new: true }
    );

    if (!medicine) {
      return res.status(404).json({ status: 'failed', message: 'Medicine not found or unauthorized' });
    }

    res.json({ status: 'success', message: 'Medicine updated successfully', data: medicine });
  } catch (err) {
    console.error('Error updating medicine:', err);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

// Delete medicine schedule
exports.deleteMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const medicine = await Medicine.findOneAndDelete({ _id: id, userId });

    if (!medicine) {
      return res.status(404).json({ status: 'failed', message: 'Medicine not found or unauthorized' });
    }

    res.json({ status: 'success', message: 'Medicine deleted successfully' });
  } catch (err) {
    console.error('Error deleting medicine:', err);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};
