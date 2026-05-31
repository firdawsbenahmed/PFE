from fastmcp import FastMCP
import requests
from pydantic import EmailStr
mcp = FastMCP("aviation business MCP")
BASE_URL = "http://127.0.0.1:8000"

@mcp.tool()

def health_check():
    return{
        "status":"ok",
        "message":"mcp server is up" ,
    }

######################## searching for flight  ####################################
## AI callable tool
@mcp.tool()
def flight_search(
    origin: str | None = None,
    destination: str | None = None,
    company_name: str | None = None,
):
    params = {}

    if origin:
        params["origin"] = origin

    if destination:
        params["destination"] = destination

    if company_name:
        params["company_name"] = company_name

    response = requests.get(
        f"{BASE_URL}/flights/public/search",
        params=params
    )

    print("STATUS:", response.status_code)
    print("TEXT:", response.text)

    try:
        return response.json()
    except Exception:
        return {
            "error": "Backend did not return valid JSON",
            "status_code": response.status_code,
            "raw_response": response.text
        }

###########################################################################################

#################################the reservation tool ######################################

@mcp.tool()
def reserve_ticket(
    flight_id : int ,
    flight_class_id : int , 
    passenger_name : str,
    passenger_email : EmailStr
) : 
    payload = {
    "flight_id" : flight_id ,
    "flight_class_id" : flight_class_id , 
    "passenger_name" : passenger_name,
    "passenger_email" : passenger_email        
    }
    response = requests.post(
        f"{BASE_URL}/bookings/guest",
        json=payload
    )
    return response.json()


############################################################################################

@mcp.tool()
def get_booking_details(
    booking_id : int , 
    passenger_email : EmailStr 
) : 
    response = requests.get(
        f"{BASE_URL}/bookings/guest/{booking_id}",
        params={
        "passenger_email" : passenger_email           
        }
    )
    return response.json()

#############################################################################################
###################### updating the booking email ###########################################

@mcp.tool()
def update_booking_email(
    booking_id : int,
    old_email : EmailStr ,
    new_email : EmailStr
) : 
    response = requests.put(
        f"{BASE_URL}/bookings/guest/{booking_id}/email",
        params={
            "old_email" : old_email ,
            "new_email" : new_email           
        }
    )

    return response.json()
#############################################################################################

################################### canceling the booking ###################################
@mcp.tool()
def cancel_booking(
    booking_id : int ,
    passenger_email : EmailStr
) : 
    response = requests.put(
        f"{BASE_URL}/bookings/guest/{booking_id}/cancel",
        params={
            "passenger_email" : passenger_email
        }
    )
    return response.json()
###################################################################################################

################################ Pyment #######################################
@mcp.tool()
def pay_booking(
    booking_id : int,
    passenger_email : EmailStr
) : 
    response = requests.put(
        f"{BASE_URL}/bookings/guest/{booking_id}/pay" , 
        params={
            "passenger_email" : passenger_email
        }
    )
    return response.json()  
####################################################################################3###

############################# checking the availability ################################
@mcp.tool()
def check_seat_availability(
    flight_id : int
):
    response = requests.get(
        f"{BASE_URL}/flights/{flight_id}/available",
        params={
            "flight_id" : flight_id
        }
    )
    return response.json()

#######################################################################################
############################## checking the flight status #############################

@mcp.tool()
def check_flight_status(
    flight_id : int 
) : 
    response = requests.get(
        f"{BASE_URL}/flights/{flight_id}/status"
    )
    return response.json()

################################# testing ##############################################
if __name__ == "__main__":
    mcp.run(transport= "streamable-http", port= 8001)