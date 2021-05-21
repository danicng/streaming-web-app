const nodemailer = require('nodemailer');

exports.sendMailSingUp = (mailSignup) => {
    const accountValue = process.env.ACCOUNT;
    const passValue = process.env.PASS;

    let transport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: accountValue,
            pass: passValue
        }
    });

    const mailOptions = {
        from: "Streaming Learning",
        to: mailSignup,
        subject: 'Streaming Learning',
        html: '<h1>You have successfully logged in to Streaming Learning</h1><div>@2021</div>'
    };

    transport.sendMail(mailOptions, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log("Email sent to: " + mailSignup);
        }
    });
};


exports.sendMailAddRoom = (mail, nombreSala, typeroom, password) => {
    const accountValue = process.env.ACCOUNT;
    const passValue = process.env.PASS;
    let mailOptions = null;

    let transport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: accountValue,
            pass: passValue
        }
    });

    if (typeroom == 'public') {
        mailOptions = {
            from: "Streaming Learning",
            to: mail,
            subject: 'Streaming Learning',
            html: 'Your teammate ' + mail + ' add you to a new room.<br>'
                + 'The name of the room is <Strong>' + nombreSala + '</Strong> and is <Strong>' + typeroom + '</Strong><br><br>'
                + 'Team Streaming Learning @2021'

        };
    }
    if (typeroom == 'private') {
        mailOptions = {
            from: "Streaming Learning",
            to: mail,
            subject: 'Streaming Learning',
            html: 'Your teammate ' + mail + ' add you to a new room.<br>'
                + 'The name of the room is <Strong>' + nombreSala + '</Strong> and is <Strong>' + typeroom + '</Strong><br>'
                + 'The password for this room is <Strong>' + password + '</Strong><br><br>'
                + 'Team Streaming Learning @2021'

        };
    }

    transport.sendMail(mailOptions, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log("Email sent to: " + mail);
        }
    });

};
