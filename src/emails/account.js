const sgMail = require('@sendgrid/mail')

const sendgridAPIKey = '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'

sgMail.setApiKey(sendgridAPIKey)

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