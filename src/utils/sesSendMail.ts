import * as AWS from '@aws-sdk/client-ses';
import { MAIL_CONFIG } from '../constant';

// AWS.config.update({
//     region: MAIL_CONFIG.SES_AWS_RELIGION,
//     accessKeyId: MAIL_CONFIG.SES_AWS_ACCESS_KEY_ID,
//     secretAccessKey: MAIL_CONFIG.SES_AWS_SECRET_ACCESS_KEY
// });

export const sendEmail = async function (to: any, subject: any, body: any) { //by gaurav

    const REGION = process.env.AWS_BUCKET_REGION || '';

    // load AWS SES V2
    // var ses = new AWS.SES({
    //     accessKeyId: MAIL_CONFIG.SES_AWS_ACCESS_KEY_ID,
    //     secretAccessKey: MAIL_CONFIG.SES_AWS_SECRET_ACCESS_KEY,
    //     region: 'us-east-1'
    // });

    // load AWS SES V3
    const sesClient = new AWS.SESClient({
        region: REGION, // replace with your AWS region
        credentials: {
            accessKeyId: MAIL_CONFIG.SES_AWS_ACCESS_KEY_ID,
            secretAccessKey: MAIL_CONFIG.SES_AWS_SECRET_ACCESS_KEY,
        },
    })

    const sendEmailParams = {
        Source: MAIL_CONFIG.SES_FROM,
        Destination: { ToAddresses: [to] },
        Message: {
            Subject: {
                Data: subject
            },
            Body: {
                Html: {
                    Data: body
                }
            }
        }
    }
    const sendEmailCommand = new AWS.SendEmailCommand(sendEmailParams);

    //if email not activate then send back false
    // let bouncedObj = await AWSWebHookModel.findOne({ email: to.toLowerCase() })
    // if (bouncedObj) return false

    try {
        const sendEmailResponse = await sesClient.send(sendEmailCommand);
        console.log('Email sent successfully:', sendEmailResponse);
        return true;
    } catch (err) {
        console.error('Error sending email:', err);
        return false;
    }

}