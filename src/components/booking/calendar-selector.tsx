import { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Your live AWS Lambda Endpoint
const API_URL = "https://gz6qco37n5grzols3x3blboh2m0vtgjn.lambda-url.ap-southeast-1.on.aws";

export function CalendarSelector() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isBooked, setIsBooked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allSlots = ["9:00 AM", "10:30 AM", "1:00 PM", "2:30 PM", "4:00 PM"];
  const formattedDate = date ? date.toLocaleDateString('en-CA') : '';

  useEffect(() => {
    if (!formattedDate) return;
    
    fetch(`${API_URL}/api/slots?date=${formattedDate}`)
      .then(res => res.json())
      .then(data => {
        setAvailableSlots(data.available_slots);
        setSelectedSlot(null);
      })
      .catch(err => console.error("Failed to fetch slots:", err));
  }, [formattedDate, isBooked]);

  const handleBooking = async () => {
    if (!formattedDate || !selectedSlot || !name || !phone) return;
    setIsSubmitting(true);

    const bookingData = {
      name: name,
      date: formattedDate,
      time: selectedSlot,
      service: "Manual Driving - 1 Hr",
      phone: phone
    };

    try {
      const response = await fetch(`${API_URL}/api/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      if (response.ok) setIsBooked(true);
    } catch (error) {
      console.error("Failed to book:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isBooked) {
    return (
      <Card className="max-w-md mx-auto mt-12 text-center border-green-500/20 bg-green-50/50">
        <CardHeader>
          <CardTitle className="text-green-700">Booking Confirmed!</CardTitle>
          <CardDescription>Scheduled for {date?.toLocaleDateString()} at {selectedSlot}.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-6">A reminder SMS will be sent 2 hours prior.</p>
          <Button variant="outline" onClick={() => {
            setIsBooked(false);
            setName("");
            setPhone("");
          }}>Book Another Slot</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 p-4 max-w-4xl mx-auto mt-8">
      <Card className="flex-1 shadow-sm">
        <CardHeader>
          <CardTitle>Select a Date</CardTitle>
          <CardDescription>Pick a day for your appointment.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
        </CardContent>
      </Card>

      <Card className="flex-1 shadow-sm flex flex-col">
        <CardHeader>
          <CardTitle>Available Time</CardTitle>
          <CardDescription>{date ? date.toLocaleDateString() : 'Select a date first'}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="grid grid-cols-2 gap-3 mb-6">
            {allSlots.map((slot) => {
              const isAvailable = availableSlots.includes(slot);
              return (
                <Button
                  key={slot}
                  variant={selectedSlot === slot ? "default" : "outline"}
                  className={`w-full ${!isAvailable ? 'opacity-50 cursor-not-allowed bg-slate-100 text-slate-400 border-none' : ''}`}
                  disabled={!isAvailable}
                  onClick={() => setSelectedSlot(slot)}
                >
                  {slot} {!isAvailable && "(Booked)"}
                </Button>
              )
            })}
          </div>
          
          <div className="space-y-3 mt-auto mb-6">
            <input 
              type="text" 
              placeholder="Your Name" 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input 
              type="tel" 
              placeholder="Phone Number (e.g. 0917...)" 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <Button 
            className="w-full" 
            size="lg" 
            disabled={!date || !selectedSlot || !name || !phone || isSubmitting} 
            onClick={handleBooking}
          >
            {isSubmitting ? "Processing..." : "Confirm Booking"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
