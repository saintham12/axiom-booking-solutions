import { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const API_URL = "https://gz6qco37n5grzols3x3blboh2m0vtgjn.lambda-url.ap-southeast-1.on.aws";

export function CalendarSelector() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isBooked, setIsBooked] = useState(false);

  const allSlots = ["9:00 AM", "10:30 AM", "1:00 PM", "2:30 PM", "4:00 PM"];
  const formattedDate = date ? date.toLocaleDateString('en-CA') : '';

  useEffect(() => {
    if (!formattedDate) return;
    fetch(`${API_URL}/api/slots?date=${formattedDate}`)
      .then(res => res.json())
      .then(data => setAvailableSlots(data.available_slots || []))
      .catch(err => console.error("Fetch error:", err));
  }, [formattedDate, isBooked]);

  const handleBooking = async () => {
    const response = await fetch(`${API_URL}/api/appointments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, date: formattedDate, time: selectedSlot, service: "Manual Driving", phone }),
    });
    if (response.ok) setIsBooked(true);
  };

  if (isBooked) return <div className="text-center p-10 font-bold">Booking Confirmed!</div>;

  return (
    <div className="flex flex-col md:flex-row gap-6 p-4 max-w-4xl mx-auto mt-8">
      <Card className="flex-1">
        <CardHeader><CardTitle>Select Date</CardTitle></CardHeader>
        <CardContent className="flex justify-center">
          <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
        </CardContent>
      </Card>
      <Card className="flex-1">
        <CardHeader><CardTitle>Available Slots</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {allSlots.map(slot => (
              <Button 
                key={slot} 
                variant={selectedSlot === slot ? "default" : "outline"}
                disabled={!availableSlots.includes(slot)}
                onClick={() => setSelectedSlot(slot)}
              >
                {slot}
              </Button>
            ))}
          </div>
          <input className="w-full border p-2 rounded" placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} />
          <input className="w-full border p-2 rounded" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} />
          <Button className="w-full" disabled={!selectedSlot || !name} onClick={handleBooking}>Confirm Booking</Button>
        </CardContent>
      </Card>
    </div>
  );
}
