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

if __name__ == "__main__":
    mcp.run()
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
if __name__ == "__main__":
    mcp.run()

############################################################################################
