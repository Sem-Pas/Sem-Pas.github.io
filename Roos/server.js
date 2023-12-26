const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

mongoose.connect('mongodb://localhost:27017/roosdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on(
  'error',
  console.error.bind(console, 'MongoDB connection error:')
);

app.use(bodyParser.json());
app.use(cors());

const scheduleSchema = new mongoose.Schema({
  day: Number,
  timeSlot: Number,
  profile: String,
});

const Schedule = mongoose.model('Schedule', scheduleSchema);

app.post('/schedule', async (req, res) => {
  try {
    const { day, timeSlot, profile } = req.body;
    const existingRecord = await Schedule.findOne({ day, timeSlot });

    if (existingRecord) {
      existingRecord.profile = profile;
      await existingRecord.save();
    } else {
      await Schedule.create({ day, timeSlot, profile });
    }

    res.status(200).json({ message: 'Schedule updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/schedule', async (req, res) => {
  try {
    const scheduleData = await Schedule.find();
    res.status(200).json(scheduleData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
mongoose.connect('mongodb://localhost:27017/roos', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
