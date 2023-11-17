import { Router } from "express";
import { transporter } from "../nodemailer.js";
const router = Router();

router.get("/api/mail", async (req, res)=>{
    const messageOpt ={
        from: "ivofiorentino0@gmail.com", 
        to: "ivofiorentino0@gmail.com",
        subject: "THANK YOU FOR YOUR PURCHASE",
        text: "You will soon receive your products!",
    };
    // try {
    //     await transporter.sendMail(messageOpt);
    //     res.send("Message sent");
    //     res.redirect("/api/mail");
    // } catch (error) {
    //     console.error("Error sending the email:", error);
    //     res.send("Error sending the email.");
    // }
    await transporter.sendMail(messageOpt);
    res.send('Email sended correctly!') 
});

export default router;