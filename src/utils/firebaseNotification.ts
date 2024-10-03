
import { MongoService } from '.';

const FCM = require('fcm-node');

const GAME_FIREBASE_SERVER_KEY = process.env.GAME_FIREBASE_SERVER_KEY || '';
const fcm = new FCM(GAME_FIREBASE_SERVER_KEY);

export const sendNotification = async (
  fcToken: any,
  notiData: object,
  data?: any,
  notificationObj?: any,
  userId?: any
) => {
  const message = {
    to: fcToken,
    notification: notiData,
    android: {},
    data: data
  };

  let result: boolean = false;

  return new Promise((resolve, reject) => {
    fcm.send(message, async function (err: any, response: any) {
      console.log('response FCM : ', response);

      if (!err && response) {
        const responseObj = JSON.parse(response);

        if (responseObj.success) {
          result = true;

        }
      }
    });
    resolve(result);
  });
};

export const sendSilentNotification = async (
  fcToken: any,
  notiData: object
) => {
  const message = {
    to: fcToken,
    content_available: true,
    notification: {},
    android: {}
  };

  return new Promise((resolve, reject) => {
    fcm.send(message, function (err: any, response: any) {
      if (err) {
        const responseObj = JSON.parse(err);

        if (
          responseObj &&
          responseObj.results &&
          responseObj.results[0] &&
          responseObj.results[0].error == 'NotRegistered'
        ) {
          resolve(false);
        } else {
          resolve(true);
        }
      } else {
        resolve(true);
      }
    });
  });
};
