import nodemailer from "nodemailer";

export default async function sendEmail({ to, subject, html }) {
   try {
       const transporter = nodemailer.createTransport({
           host: "smtp.gmail.com",
           port: 587,
           auth: {
               user: process.env.EMAIL,
               pass: process.env.EMAIL_PASSWORD,
           },
       });
       await transporter.sendMail({
           from: `saraha app <${process.env.EMAIL}>`,
           to,
           subject,
           html,
       });
       console.log("Email sent to", to);
   } catch (error) {
       console.log(error.message);
   }
}