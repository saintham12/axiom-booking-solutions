from fastapi import FastAPI
from pydantic import BaseModel
import boto3
from boto3.dynamodb.conditions import Attr
import uuid
from mangum import Mangum  

app = FastAPI()

# Database setup for Singapore region
dynamodb = boto3.resource('dynamodb', region_name='ap-southeast-1')
table = dynamodb.Table('AxiomBookings')

class Booking(BaseModel):
    name: str
    date: str  
    time: str
    service: str
    phone: str

@app.get("/api/appointments")
def get_appointments():
    response = table.scan()
    return {"appointments": response.get('Items', [])}

@app.post("/api/appointments")
def create_appointment(booking: Booking):
    appointment_id = str(uuid.uuid4())
    new_appointment = {
        "id": appointment_id,
        "name": booking.name,
        "date": booking.date, 
        "time": booking.time,
        "service": booking.service,
        "status": "Pending",
        "phone": booking.phone
    }
    table.put_item(Item=new_appointment)
    return {"message": "Booking saved!", "appointment": new_appointment}

@app.get("/api/slots")
def get_available_slots(date: str):
    master_slots = ["9:00 AM", "10:30 AM", "1:00 PM", "2:30 PM", "4:00 PM"]
    response = table.scan(FilterExpression=Attr('date').eq(date))
    booked_appointments = response.get('Items', [])
    booked_times = [apt['time'] for apt in booked_appointments]
    available = [slot for slot in master_slots if slot not in booked_times]
    return {"available_slots": available}

# AWS Lambda Handler
handler = Mangum(app)
