import express from 'express';
import bodyParser from 'body-parser';

import { getJobs, addJob, removeJob, updateJob } from './db/db';
import { scheduleCronJobs, removeCronJobs } from './crontab-worker';

const app = express();

// Parse incoming requests data
// We can then access the data of the request with
// req.body, and the JSON will be parsed as JS objects

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// GET request
// Retrieve all the jobs

app.get('/coffee/jobs', (_req, res) => {
    res.status(200).send({
        success: true,
        message: 'Successfully retrieved jobs',
        jobs: getJobs()
    })
});

// POST request
// Add a job

app.post('/coffee/jobs', (req, res) => {

    // Error handling
    const h = req.body.h;
    const m = req.body.m;
    const enabled = req.body.enabled;
    const delay = req.body.delay;

    if (!h || h < 0 || h > 23) {
        return res.status(400).send({
            success: false,
            message: 'Hour field is missing or incorrect'
        });
    } else if (!m || m < 0 || m > 59) {
        return res.status(400).send({
            success: false,
            message: 'Minute field is missing or incorrect'
        });
    }

    // Job creation
    const job = {
        id: Math.floor(Math.random() * 99999) + 100000,
        enabled: enabled ? JSON.parse(enabled) : true,
        delay: delay ? parseInt(delay) : 4,
        h: parseInt(h),
        m: parseInt(m)
    }

    addJob(job);
    scheduleCronJobs(job);

    return res.status(201).send({
        success: true,
        message: 'Job added successfully',
        job
    });
});

// DELETE request
// Remove a job

app.delete('/coffee/jobs/:id', (req, res) => {
    const id = parseInt(req.params.id);

    getJobs().map((job, index) => {
        if (job.id === id) {
            removeJob(index);
            removeCronJobs(job);

            return res.status(200).send({
                success: true,
                message: 'Successfully removed job with id ' + id
            });
        }
    });

    return res.status(404).send({
        success: false,
        message: 'Job with id ' + id + ' not found'
    });
});

// PUT request
// Update a job

app.put('/coffee/jobs/:id', (req, res) => {
    const id = parseInt(req.params.id);
    let jobFound;
    let itemIndex;

    getJobs().map((job, index) => {
        if (job.id === id) {
            jobFound = job;
            itemIndex = index;
        }
    });

    if (!jobFound) {
        return res.status(404).send({
            success: false,
            message: 'Job with id ' + id + ' not found'
        });
    }

    // Error handling
    const h = req.body.h;
    const m = req.body.m;
    const enabled = req.body.enabled;
    const delay = req.body.delay;

    if (!h || h < 0 || h > 23) {
        return res.status(400).send({
            success: false,
            message: 'Hour field is missing or incorrect'
        });
    } else if (!m || m < 0 || m > 59) {
        return res.status(400).send({
            success: false,
            message: 'Minute field is missing or incorrect'
        });
    }

    const updatedJob = {
        id: jobFound.id,
        enabled: enabled ? JSON.parse(enabled) : jobFound.enabled,
        delay: parseInt(delay) || jobFound.delay,
        h: parseInt(h) || jobFound.h,
        m: parseInt(m) || jobFound.m
    }

    removeCronJobs(jobFound);
    updateJob(itemIndex, updatedJob);
    scheduleCronJobs(updatedJob);

    return res.status(201).send({
        success: true,
        message: 'Successfully updated job with id ' + id,
        updatedJob
    });

});

// Run the server

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    
    let enabledCount = 0;
    getJobs().forEach(job => {
        scheduleCronJobs(job);
        if (job.enabled) {
            enabledCount++;
        }
    });

    console.log("Scheduled " + getJobs().length + " task(s) (" + enabledCount + " enabled)");
});