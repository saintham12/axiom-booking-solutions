import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Your live AWS Lambda Endpoint
const API_URL = "https://gz6qco37n5grzols3x3blboh2m0vtgjn.lambda-url.ap-southeast-1.on.aws";

interface Appointment {
  id: string;
  name: string;
  date: string;
  time: string;
  service: string;
  status: string;
  phone: string;
}

export function AdminDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/appointments`)
      .then((res) => res.json())
      .then((data) => {
        setAppointments(data.appointments);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      });
  }, []);

  const stats = [
    { title: "Total Bookings", value: appointments.length.toString() },
    { title: "Pending Reminders", value: appointments.filter(a => a.status === 'Pending').length.toString() },
    { title: "Revenue Projected", value: `₱ ${appointments.length * 800}` }, // Simple dynamic calculation
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Confirmed": return <Badge className="bg-green-500 hover:bg-green-600">Confirmed</Badge>;
      case "Pending": return <Badge variant="secondary">Pending Reply</Badge>;
      case "Canceled": return <Badge variant="destructive">Canceled</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h2>
        <p className="text-slate-500">Welcome back. Here is your schedule.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, i) => (
          <Card key={i} className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>All Appointments</CardTitle>
          <CardDescription>Automated reminders are sent 2 hours prior to the slot.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-slate-500">Loading appointments from AWS...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((apt) => (
                  <TableRow key={apt.id}>
                    <TableCell className="font-medium">{apt.date} @ {apt.time}</TableCell>
                    <TableCell>{apt.name}</TableCell>
                    <TableCell>{apt.service}</TableCell>
                    <TableCell className="text-slate-500">{apt.phone}</TableCell>
                    <TableCell className="text-right">{getStatusBadge(apt.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
