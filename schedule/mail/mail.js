import nodemailer from 'nodemailer';

const from = 'theshen@qq.com';

const transPort = nodemailer.createTransport({
    host: 'smtp.qq.com',
    port: 465,
    secure: true,
    auth: {
        pass: 'rxfumzravtslcaad',
        user: from
    }
});

export function sendMail(to, subject, text) {
    const sendConfig = {
        to,
        from,
        subject,
        text
    };

    return new Promise((resolve, reject) => {
        console.log('send to', to, subject, text);
        transPort.sendMail(sendConfig, (error, result) => {
            if (error) {
                console.log(error);
                console.log(result);
                resolve({});
            } else {
                console.log(`send to ${to} successfully~`);
                resolve({});
            }
        })
    });
}