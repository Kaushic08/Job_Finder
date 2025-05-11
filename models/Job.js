const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true },
    skills: [{ type: String, required: true, trim: true, lowercase: true, index: true }],
    employmentType: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Internship'], default: 'Full-time' },
    postedDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', jobSchema);