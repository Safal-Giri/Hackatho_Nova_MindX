const Person = require('../models/person_model');

// Register or add new face descriptor
exports.registerPerson = async (req, res) => {
  try {
    const { name, relationship, faceDescriptor, visitFrequency } = req.body;

    if (!name || !faceDescriptor) {
      return res.status(400).json({
        status: 'failed',
        message: 'Name and face descriptor are required'
      });
    }

    // Ensure descriptor is array
    const descArray = Array.from(faceDescriptor);

    // Case-insensitive check for existing person
    let person = await Person.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });

    if (person) {
      // Add new face descriptor to existing person
      person.faceDescriptors.push(descArray);
      // Update relationship/frequency if provided and different
      if (relationship) person.relationship = relationship;
      if (visitFrequency) person.visitFrequency = visitFrequency;

      await person.save();

      return res.json({
        status: 'success',
        message: 'Face added to existing person',
        data: person
      });
    }

    // Create new person
    person = new Person({
      name,
      relationship,
      visitFrequency,
      faceDescriptors: [descArray]
    });

    await person.save();

    res.status(201).json({
      status: 'success',
      message: 'Person registered successfully',
      data: person
    });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        status: 'failed',
        message: 'A person with this name already exists.'
      });
    }
    console.error('Error registering person:', err);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};


// Get all persons
exports.getAllPersons = async (req, res) => {
  try {
    const persons = await Person.find({});
    res.json({
      status: 'success',
      data: persons
    });
  } catch (err) {
    console.error('Error fetching persons:', err);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

exports.deletePerson = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ status: 'failed', message: 'Person ID is required' });
    }

    const person = await Person.findById(id);

    if (!person) {
      return res.status(404).json({ status: 'failed', message: 'Person not found' });
    }

    await Person.findByIdAndDelete(id);

    res.json({
      status: 'success',
      message: `Person '${person.name}' deleted successfully`
    });

  } catch (err) {
    console.error('Error deleting person:', err);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

exports.updatePerson = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, relationship, visitFrequency } = req.body;

    const person = await Person.findByIdAndUpdate(
      id,
      { name, relationship, visitFrequency },
      { new: true }
    );

    if (!person) {
      return res.status(404).json({
        status: 'failed',
        message: 'Person not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Person updated successfully',
      data: person
    });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        status: 'failed',
        message: 'A person with this name already exists.'
      });
    }
    console.error('Error updating person:', err);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

