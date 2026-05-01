import { useState } from "react";
import { CalendarSelector } from "./components/booking/calendar-selector";
import { AdminDashboard } from "./components/dashboard/admin-dashboard";
import { Button } from "./components/ui/button";

function App() {
  const [currentView, setCurrentView] = useState<"customer" | "admin">("customer");

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="text-xl font-bold tracking-tight text-slate-900">
          Axiom<span className="text-blue-600">.</span>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-500 hidden md:block">
            {currentView === "customer" ? "Customer Booking URL" : "Owner Internal Dashboard"}
          </span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCurrentView(currentView === "customer" ? "admin" : "customer")}
          >
            Switch to {currentView === "customer" ? "Admin View" : "Customer View"}
          </Button>
        </div>
      </nav>

      <main className="pb-12">
        {currentView === "customer" ? (
          <div className="container mx-auto">
            <div className="text-center mt-12 mb-8">
              <h1 className="text-3xl font-bold text-slate-900">Book an Appointment</h1>
              <p className="text-slate-500 mt-2">Select a date and time that works for you.</p>
            </div>
            <CalendarSelector />
          </div>
        ) : (
          <AdminDashboard />
        )}
      </main>
    </div>
  );
}

export default App;
