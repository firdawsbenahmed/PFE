from app.models.company import Company
from app.models.user import User
from app.models.Store import Store
from app.models.inventory import Inventory
from app.models.product import Product
from app.models.rate_limit import RateLimitCounter
from app.models.endpoint import Endpoints
from app.models.api_integration import ApiIntegration
from app.models.audit_log import AuditLogs
from app.models.mcp_tool_permission import Mcp_tool_p
from app.models.flights import Flight
from app.models.flight_classes import Flight_class
from app.models.booking import Booking
from app.models.email_verification import EmailVerificationToken

## this file is usefull for the imports 
## later in for the Alembic and if i need to import all the app.models 
## i'll use only from app.app.models import * instead of importing each model alone 
## also if we need to import any model we only do from app.app.models import company 
## so mainly it helps to import app.models cleanly 