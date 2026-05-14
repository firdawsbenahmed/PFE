from pydantic import EmailStr
import smtplib
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

    if not sender_email or not sender_password : 
        return{
            "success" : False,
            "message" : "email credentials are missing"
        }
    
    try : 
        msg = EmailMessage()
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
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp : 
            smtp.login(sender_email, sender_password)
            smtp.send_message(msg)
        return{
            "success" : True,
            "message" : "Email sent successfuly"
        }
    except Exception as e : 
        return {
            "success" : False,
            "message" : str(e)
        }