const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'abumuhab98@gmail.com',
        subject: 'Welcome to Task App!!',
        text: `Welcome ${name}. Happy to have you on board. Excited to do great things with you!`
    });
}

const sendCancelEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'abumuhab98@gmail.com',
        subject: 'Sad to see you leave',
        text: `Hey ${name}, we are sad to see you leave. Please do tell us your review on our services and how we can improve.`
    });
}

module.exports = {
    sendWelcomeEmail,
    sendCancelEmail
}