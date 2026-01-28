const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Medicine = require('../models/medicine_model');
const User = require('../models/user_model');

// Email Transport Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Start Cron Job
const startNotificationJob = () => {
  console.log('Medication notification job started (running every minute)');

  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      // Format time as HH:mm
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      console.log(`Checking schedules for: ${currentTime}`);

      // Find medicines scheduled for this exact time
      const medicines = await Medicine.find({ time: currentTime }).populate('userId');

      for (const med of medicines) {
        if (med.userId && med.userId.email) {
          await sendEmail(med.userId.email, med);
        }
      }
    } catch (err) {
      console.error('Error in notification job:', err);
    }
  });
};

const sendEmail = async (email, med) => {
  const mailOptions = {
    from: `DementiAid Assistant <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `🕒 Medication Reminder: ${med.name}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #3498db;">Medication Reminder</h2>
        <p>This is a reminder from <strong>DementiAid</strong> for your patient.</p>
        <hr />
        <p><strong>Medicine:</strong> ${med.name}</p>
        <p><strong>Dose:</strong> ${med.dose}</p>
        <p><strong>Scheduled Time:</strong> ${med.time}</p>
        <p><strong>Frequency:</strong> ${med.schedule}</p>
        <hr />
        <p style="color: #7f8c8d; font-size: 0.9rem;">Please ensure the medication is administered safely.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${email} for medicine ${med.name}`);
  } catch (err) {
    console.error(`Failed to send email to ${email}:`, err);
  }
};

module.exports = { startNotificationJob };
