const Person = require('../models/person_model');

exports.registerPerson = async (req, res) => {
  try {
    const { name, descriptor } = req.body;

    if (!name || !descriptor) {
      return res.status(400).json({ error: 'Name and descriptor are required' });
    }

    const person = await Person.find({ username: name });
    if (person) {
      return res.status(400).send({ status: "failed", message: "Person already registered." })
    }
    // Check if array
    const descArray = Object.values(descriptor);

    const newPerson = new Person({
      name,
      descriptor: descArray
    });

    const savedPerson = await newPerson.save();
    res.status(201).json(savedPerson);
  } catch (err) {
    console.error('Error registering person:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getAllPersons = async (req, res) => {
  try {
    const persons = await Person.find({}, 'name descriptor');
    res.json(persons);
  } catch (err) {
    console.error('Error fetching persons:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
