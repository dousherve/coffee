const cron = require('node-cron');
const exec = require('child_process').exec;

const ON_COMMAND = "bash /home/pi/scripts/on_coffee";
const OFF_COMMAND = "bash /home/pi/scripts/off_coffee";

let tasks = [];

function scheduleCronJobs(job) {
    let onTask = cron.schedule(`${job.m} ${job.h} * * *`, () => {
        exec(ON_COMMAND);
        console.log("ON");
    }, { scheduled: job.enabled });

    // TODO: Compute the correct time, because adding the delay
    //       may result in an amount of minutes greater than 59

    let offTask = cron.schedule(`${job.m + job.delay} ${job.h} * * *`, () => {
        exec(OFF_COMMAND);
        console.log("OFF");
    }, { scheduled: job.enabled });

    tasks.push({
        job: job,
        onTask: onTask,
        offTask: offTask
    });
}

function removeCronJobs(job) {
    tasks.map((task, index) => {
        if (task.job.id === job.id) {
            disableJob(job);
            tasks.splice(index, 1);
            return;
        }
    });
}

function enableJob(job) {
    tasks.filter(task => task.job.id === job.id)
        .forEach(task => {
            task.onTask.start();
            task.offTask.start();
    });
}

function disableJob(job) {
    tasks.filter(task => task.job.id === job.id)
        .forEach(task => {
            task.onTask.stop();
            task.offTask.stop();
    });
}

module.exports = {
    scheduleCronJobs,
    removeCronJobs
}