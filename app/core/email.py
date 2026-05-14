from pydantic import EmailStr
import smtplib ## Python library used to communicate with email servers simple message transfer protocole
import os 
from email.message  import EmailMessage

def email_payment_send (
        to_email : EmailStr,
        payment_link : str , 
        passenger_name : str,
        booking_id :int      
) : 
    sender_email = os.getenv("EMAIL_USER")
    sender_password = os.getenv("EMAIL_PASSWORD")

    if not sender_email or not sender_password : ## if these two are wrong the app won't crash we only skip sending the email hada mekan 
        return{
            "success" : False,
            "message" : "email credentials are missing"
        }
    
    try : 
        msg = EmailMessage() ## here to create and email object 
        ## the metadata of the email like the content ....
        msg["Subject"] = "complete your flight payment"
        msg["From"] = sender_email ## company email remeber to fix this :)
        msg["To"] = to_email
        msg.set_content(
            f""" 
Hello {passenger_name},
I hope this email finds well , 
Your booking has been reserved. 
Booking ID : {booking_id}
Please complete your payment here : 
{payment_link}
Thank you , have a nice day :) 
"""
        )
        with smtplib.SMTP_SSL("smtp.gmail.com" , 465) as smtp : ## to connect securly with the Gmail SMTP sever through the port 465 SSL and in an encrypted way SMTP_SSL this connection will be auto close 
            smtp.login(sender_email, sender_password) ## to authentificate the Gmail with my backend 
            smtp.send_message(msg) ## send the msg core created before 
        return{
            "success" : True,
            "message" : "Email sent successfuly"
        }
    except Exception as e : 
        return {
            "success" : False,
            "message" : str(e)
        }