import { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Your specific AWS Lambda URL
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
      .then(data => setAvailableSlots(data.available_slots));
  }, [formattedDate]);

  const handleBooking = async () => {
    const response = await fetch(`${API_URL}/api/appointments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, date: formattedDate, time: selectedSlot, service: "Manual Driving", phone }),
    });
    if (response.ok) setIsBooked(true);
  };

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <Calendar mode="single" selected={date} onSelect={setDate} />
      <div className="grid grid-cols-2 gap-2">
        {allSlots.map(slot => (
          <Button 
            key={slot} 
            disabled={!availableSlots.includes(slot)} 
            onClick={() => setSelectedSlot(slot)}
            variant={selectedSlot === slot ? "default" : "outline"}
          >
            {slot}
          </Button>
        ))}
      </div>
      <input className="border p-2 w-full" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
      <input className="border p-2 w-full" placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
      <Button className="w-full" onClick={handleBooking}>Confirm</Button>
    </div>
  );
}
