// import { Twilio } from 'twilio';
import { VerifyUserOtpData, SendUserOtpData, SendOtpData } from '../api/authentication/authentication.interface';
import { AUTHENDICATION_CONSTANT } from '../constant';
import request from 'request';

const accountSid = AUTHENDICATION_CONSTANT.TWILIO_ACCOUNT_SID;
const authToken = AUTHENDICATION_CONSTANT.TWILIO_AUTH_TOKEN;
const serviceId = AUTHENDICATION_CONSTANT.TWILIO_SERVICE_ID;

// const twilioClient = new Twilio(accountSid, authToken);

// const SendLoginOtp = async (data: SendUserOtpData) => {
//   const mobileNumber = data.phoneNumber;

//   const result = await twilioClient.verify.v2.services(serviceId)
//     .verifications
//     .create({ to: mobileNumber, channel: 'sms' })
//     .then(verification => {
//       return verification;
//     });

//   if (result.sid != '' && result.status == "pending")
//     return true;
//   else
//     return false;
// }

// const VerifyLoginOtp = async (data: VerifyUserOtpData) => {
//   const code = data.otp;
//   const mobileNumber = data.phoneNumber;

//   const result = await twilioClient.verify.v2.services(serviceId)
//     .verificationChecks
//     .create({ to: mobileNumber, code: code })
//     .then(verification => {
//       return verification;
//     });

//   if (result.status == "approved")
//     return true;
//   else
//     return false;
// }

const sendCurlRequest = (options: any) => {
  return new Promise((resolve, reject) => {
    request(options, async function (error: any, response: any, body: any) {
      if (error) {
        reject(error);
      } else {
        if (body) {
          const bodyResponseArray = body.split(';');
          if (bodyResponseArray[0] == 'Status:1') {
            const data = true;
            resolve(data);
          } else {
            reject('There was an issue into sending otp.');
          }
        }
      }
    });
  });
};

const SendGreenAdsOtp = async (data: SendOtpData) => {
  const mobileNumber = data.phoneNumber;
  const otp = data.otp;
  const getString = data.messageString;

  const options = {
    'method': 'GET',
    'url': getString,
    'headers': {
    }
  };

  const result = await sendCurlRequest(options).then((data) => {
    return data;
  }).catch((error) => {
    throw new Error(error);
  });

  return result;
}

export {
  // twilioClient,
  // SendLoginOtp,
  // VerifyLoginOtp,
  SendGreenAdsOtp
}