import { Router } from "express";
import { transporter } from "../nodemailer.js";
const router = Router();

router.get("/api/mail", async (req, res) => {
    const messageOptions = {
        from: "luu.debiaggi@gmail.com",
        to: "luu.debiaggi@gmail.com",
        subject: "THANK YOU FOR YOUR PURCHASE",
        text: "You will receive your products soon!",
    };
    try {
        await transporter.sendMail(messageOptions);
        res.send("Message sent");
        res.redirect("/api/mail");
    } catch (error) {
        console.error("Error sending the email:", error);
        res.send("Error sending the email.");
    }
});

export default router;