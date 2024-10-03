import Agenda, { Job, JobAttributesData } from 'agenda'
// import NotificationController from '../api/notification/notification.controller';
import Logger from '../logger';
// import { AGENDA_JOB_CONSTANT } from '../constant';

const mongoConnectionString = process.env.MONGO_SRV || '';

const agenda = new Agenda({ db: { address: mongoConnectionString } });
agenda
 .on('ready', () => Logger.info(`Agenda job sheduling started`))
 .on('error', () => Logger.info("Agenda connection error!"));

// const JOB_NAME_OBJ = AGENDA_JOB_CONSTANT.JOB_NAME_OBJ;

//  const jobNames = {
//   monthlyLeaderboradBonus: JOB_NAME_OBJ.CREDIT_MONTHLY_LEADERBOARD_BONUS,
//   monthlyReferLeaderboardBonus: JOB_NAME_OBJ.CREDIT_MONTHLY_REFER_AND_EARN_LEADERBOARD_BONUS,
//   notification: JOB_NAME_OBJ.NOTIFICATION,
  // monthlyGstCalculate: JOB_NAME_OBJ.MONTHLY_GST_CALCULATE
// };


// agenda.define<JobAttributesData>(jobNames.notification, async (job: Job<JobAttributesData>) => {
  // const NotificationObj = new NotificationController();

  // const { notificationId } = job.attrs.data;
  // console.log('Notification Job Runned : ', notificationId);
  // await NotificationObj.sendNotification(notificationId);
// });


export {
  agenda
}