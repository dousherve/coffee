import {
    schedule
} from 'node-cron';
import {
    exec
} from 'child_process';

const ON_COMMAND = "bash /home/pi/scripts/on_coffee";
const OFF_COMMAND = "bash /home/pi/scripts/off_coffee";

let tasks = [];

function scheduleCronJobs(job) {
    let onTask = schedule(`${job.m} ${job.h} * * *`, () => {
        exec(ON_COMMAND);
    }, {
        scheduled: job.enabled
    });

    let offM = job.m + job.delay;
    let offH = job.h + (offM - (offM % 60)) / 60;
    offM %= 60;

    let offTask = schedule(`${offM} ${offH} * * *`, () => {
        exec(OFF_COMMAND);
    }, {
        scheduled: job.enabled
    });

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
    tasks
        .filter(task => task.job.id === job.id)
        .forEach(task => {
            task.onTask.start();
            task.offTask.start();
        });
}

function disableJob(job) {
    tasks
        .filter(task => task.job.id === job.id)
        .forEach(task => {
            task.onTask.stop();
            task.offTask.stop();
        });
}

export default {
    scheduleCronJobs,
    removeCronJobs
}