const fs = require('fs');

const PATH = './db/jobs.json';

function getJobs() {
    return JSON.parse(fs.readFileSync(PATH));
}

function addJob(job) {
    let jobs = getJobs();
    jobs.push(job);
    saveJobs(jobs);
}

function removeJob(index) {
    let jobs = getJobs();
    jobs.splice(index, 1);
    saveJobs(jobs);
}

function updateJob(index, updatedJob) {
    let jobs = getJobs();
    jobs.splice(index, 1, updatedJob);
    saveJobs(jobs);
}

function saveJobs(jobs) {
    let data = JSON.stringify(jobs);
    fs.writeFileSync(PATH, data);
}

module.exports = {
    addJob,
    removeJob,
    updateJob,
    getJobs
}