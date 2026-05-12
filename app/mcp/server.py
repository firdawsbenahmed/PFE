from fastmcp import FastMCP
import requests

mcp = FastMCP("aviation business MCP")
BASE_URL = "HTTP://127.0.0.1:8000"

@mcp.tool()

def health_check():
    return{
        "status":"ok",
        "message":"mcp server is up" ,
    }

## 1st tool : searching for 
@mcp.tool() ## AI callable tool
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
    print(response.json())

    return response.json()


if __name__ == "__main__":
    result = flight_search(
        origin="Algiers",
        destination="Frankfurt"
    )

    print(result)

