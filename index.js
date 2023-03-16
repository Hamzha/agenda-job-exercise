const express = require("express");
const Agenda = require('agenda')
var bodyParser = require('body-parser')


const app = express();
const PORT = 3000;
app.use(bodyParser.json())

app.post('/start-job', (req, res) => {
  try {
    const { timeInterval, jobName } = req.body;

    const mongoConnectionString = "mongodb://127.0.0.1/agenda";
    const agenda = new Agenda({ db: { address: mongoConnectionString } });
    agenda.define(jobName, async (job) => {
    });
    (async function () {
      // IIFE to give access to async/await
      try {
        await agenda.start();
        console.log('start --')

        await agenda.on('ready', async (job) => {
          console.log("Job %s ready", job.attrs.name);
        });

        await agenda.every(timeInterval, [jobName]);

        agenda.on("start", (job) => {
          console.log("Job %s starting", job.attrs.name);
        })
        agenda.on('complete', (job) => {
          console.log("Job %s completed", job.attrs.name, getDateTime());
        })
        agenda.on('success', (job) => {
          console.log("Job %s success", job.attrs.name);
        })
        agenda.on('fail', (err, job) => {
          console.log("Job %s fail", job.attrs.name, err);
        })

      } catch (err) { console.log(err) }
    })();
    res.json({ 'message': 'Job Started Successfully' })

  } catch (error) {
    res.json(error)
  }
});

app.post('/update-job', (req, res) => {
  try {
    const { timeInterval, jobName } = req.body;
    console.log(timeInterval)
    const mongoConnectionString = "mongodb://127.0.0.1/agenda";
    const agenda = new Agenda({ db: { address: mongoConnectionString } });
    agenda.on('ready', async () => {
      const jobs = await agenda.jobs({ name: jobName })
      const job = jobs[0]
      console.log(job)
      job.attrs.repeatInterval = timeInterval;
      job.save()
    })
    res.json({ 'job Updated Successfully': true })
  } catch (error) {
    res.json({ error })
    console.log(error)
  }
});

const updateJobById = async (jobId, updateBody) => {
  try {
    const job = await agenda.jobs({ _id: mongoose.Types.ObjectId(jobId) });
    if (!job) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Job not found');
    }

    Object.assign(job[0].attrs.data, updateBody);
    await job[0].save();
    return job[0];

  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

function getDateTime() {
  var now = new Date();
  var year = now.getFullYear();
  var month = now.getMonth() + 1;
  var day = now.getDate();
  var hour = now.getHours();
  var minute = now.getMinutes();
  var second = now.getSeconds();
  if (month.toString().length == 1) {
    month = '0' + month;
  }
  if (day.toString().length == 1) {
    day = '0' + day;
  }
  if (hour.toString().length == 1) {
    hour = '0' + hour;
  }
  if (minute.toString().length == 1) {
    minute = '0' + minute;
  }
  if (second.toString().length == 1) {
    second = '0' + second;
  }
  var dateTime = year + '/' + month + '/' + day + ' ' + hour + ':' + minute + ':' + second;
  return dateTime;
}
app.listen(PORT, () => {
  console.log("Console is running or port" + PORT);
});
