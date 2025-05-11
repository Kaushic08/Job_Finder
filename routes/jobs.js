const express = require('express');
const mongoose = require('mongoose');
const Job = require('../models/Job');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { location, skills } = req.query;
        let query = {};

        if (location) {
            query.location = { $regex: location.trim(), $options: 'i' };
        }

        if (skills) {
            const skillsArray = skills.split(',')
                                      .map(skill => skill.trim().toLowerCase())
                                      .filter(skill => skill);
            if(skillsArray.length > 0) {
                query.skills = { $all: skillsArray };
            }
        }

        const jobs = await Job.find(query).sort({ postedDate: -1 });

        if (!jobs.length) {
             if (location || skills) {
                  return res.json({ message: "No jobs found matching your criteria.", jobs: [] });
             } else {
                 return res.json({ message: "No jobs posted yet.", jobs: [] });
             }
        }

        res.json({ jobs });

    } catch (err) {
        console.error("Error fetching jobs:", err);
        res.status(500).json({ message: "Error fetching jobs from database.", error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
             return res.status(400).json({ message: "Invalid Job ID format" });
        }

        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }
        res.json(job);
    } catch (err) {
         console.error("Error fetching job by ID:", err);
        res.status(500).json({ message: "Error fetching job details.", error: err.message });
    }
});

module.exports = router;