from fastmcp import FastMCP
import requests
from pydantic import EmailStr
mcp = FastMCP("aviation business MCP")
BASE_URL = "HTTP://127.0.0.1:8000"

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
    origin : str | None =None,
    destination : str | None = None
):
    params = {} ## Query Parameters
    if origin: 
        params["origin"] = origin 
    if destination : 
        params["destination"] = destination
    ## the mcp will call the backend 
    response = requests.get( ## to call FastAPI routes
        f"{BASE_URL}/flights/public/search", ##calls the api so it doen not access the database directly  
        params=params
    )
    return response.json()


###########################################################################################

#################################the reservation tool ######################################

@mcp.tool()
def reserve_ticket(
    flight_id : int ,
    flight_class_id : int , 
    passenger_name : str,
    passenger_email : EmailStr
) : 
    playload = {
    "flight_id" : flight_id ,
    "flight_class_id" : flight_class_id , 
    "passenger_name" : passenger_name,
    "passenger_email" : passenger_email        
    }
    response = requests.post(
        f"{BASE_URL}/bookings/guest",
        json=playload
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

if __name__ == "__main__":
    result = update_booking_email(
    booking_id=5,
    old_email="correctemail@gmail.com",
    new_email="benahmedf22@gmail.com"
    )

    print(result)