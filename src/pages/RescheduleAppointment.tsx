import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Loader2, Calendar, ArrowLeft, ChevronLeft, ChevronRight, Clock, Video } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAvailableSlots } from '@/hooks/useAvailableSlots';
import { cn } from '@/lib/utils';

interface AppointmentInfo {
  id: string;
  guest_name: string;
  guest_email: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  duration_minutes: number;
}

export default function RescheduleAppointment() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [rescheduling, setRescheduling] = useState(false);
  const [appointment, setAppointment] = useState<AppointmentInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [newMeetLink, setNewMeetLink] = useState<string | null>(null);
  
  // Calendar state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { availableSlots, isDateAvailable, formatTimeDisplay, loading: slotsLoading, settings } = useAvailableSlots(selectedDate);

  useEffect(() => {
    if (!token) {
      setError('Invalid reschedule link. Please check the link in your email.');
      setLoading(false);
      return;
    }

    async function fetchAppointment() {
      try {
        const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reschedule-appointment?token=${token}`;
        const result = await fetch(functionUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        const data = await result.json();

        if (!result.ok || !data.appointment) {
          setError(data.error || 'Appointment not found.');
          return;
        }

        if (data.appointment.status === 'cancelled') {
          setError('This appointment has been cancelled.');
          return;
        }

        const appointmentDateTime = new Date(`${data.appointment.appointment_date}T${data.appointment.appointment_time}`);
        if (appointmentDateTime < new Date()) {
          setError('This appointment has already passed and cannot be rescheduled.');
          return;
        }

        setAppointment(data.appointment);
      } catch (err) {
        console.error('Error fetching appointment:', err);
        setError('Failed to load appointment details. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchAppointment();
  }, [token]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const { firstDay, daysInMonth } = getDaysInMonth(currentMonth);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentMonth(newMonth);
    setSelectedDay(null);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const handleDaySelect = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (isDateAvailable(date)) {
      setSelectedDay(day);
      setSelectedDate(date);
      setSelectedTime(null);
    }
  };

  const handleReschedule = async () => {
    if (!token || !selectedDate || !selectedTime) return;
    
    setRescheduling(true);
    setError(null);

    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reschedule-appointment`;
      const result = await fetch(functionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          new_date: dateStr,
          new_time: selectedTime,
        }),
      });

      const data = await result.json();

      if (!result.ok) {
        throw new Error(data.error || 'Failed to reschedule appointment');
      }

      setNewMeetLink(data.appointment?.meeting_join_url || null);
      setSuccess(true);
    } catch (err) {
      console.error('Error rescheduling appointment:', err);
      setError(err instanceof Error ? err.message : 'Failed to reschedule. Please try again.');
    } finally {
      setRescheduling(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const checkDayAvailability = (day: number): boolean => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return isDateAvailable(date);
  };

  if (loading || slotsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading appointment details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Appointment Rescheduled!</CardTitle>
            <CardDescription>
              Your strategy call has been moved to the new time.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {selectedDate && selectedTime && (
              <div className="bg-muted rounded-lg p-4 space-y-2">
                <p className="text-sm">
                  <span className="font-medium">New Date:</span> {formatDate(selectedDate.toISOString().split('T')[0])}
                </p>
                <p className="text-sm">
                  <span className="font-medium">New Time:</span> {formatTime(selectedTime)}
                </p>
              </div>
            )}
            <p className="text-center text-muted-foreground text-sm">
              A confirmation email has been sent to your inbox.
            </p>
            <div className="flex flex-col gap-3">
              {newMeetLink && (
                <Button onClick={() => window.open(newMeetLink, '_blank')}>
                  <Video className="mr-2 h-4 w-4" />
                  View Google Meet Link
                </Button>
              )}
              <Button variant="outline" asChild>
                <Link to="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Return to Homepage
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !appointment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle>Unable to Reschedule</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <Button asChild>
                <Link to="/#booking">
                  <Calendar className="mr-2 h-4 w-4" />
                  Book New Appointment
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Return to Homepage
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Reschedule Appointment</CardTitle>
            <CardDescription>
              Select a new date and time for your strategy call
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current appointment info */}
            {appointment && (
              <div className="bg-muted/50 border rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Current Appointment:</p>
                <p className="text-sm">
                  <span className="font-medium">{appointment.guest_name}</span> - {formatDate(appointment.appointment_date)} at {formatTime(appointment.appointment_time)}
                </p>
              </div>
            )}

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {/* Calendar */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Button variant="ghost" size="icon" onClick={() => navigateMonth('prev')}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h3 className="font-semibold">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                  <Button variant="ghost" size="icon" onClick={() => navigateMonth('next')}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const isAvailable = checkDayAvailability(day);
                    const isSelected = selectedDay === day;

                    return (
                      <button
                        key={day}
                        onClick={() => handleDaySelect(day)}
                        disabled={!isAvailable}
                        className={cn(
                          "aspect-square rounded-md text-sm font-medium transition-colors",
                          isAvailable
                            ? isSelected
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted text-foreground"
                            : "text-muted-foreground/40 cursor-not-allowed"
                        )}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time slots */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Available Times
                </h3>
                
                {selectedDate ? (
                  availableSlots.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                      {availableSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={cn(
                            "p-3 rounded-md text-sm font-medium transition-colors border",
                            selectedTime === time
                              ? "bg-primary text-primary-foreground border-primary"
                              : "hover:bg-muted border-border"
                          )}
                        >
                          {formatTimeDisplay(time)}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No available times for this date. Please select another day.
                    </p>
                  )
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Select a date to see available times.
                  </p>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <Button
                onClick={handleReschedule}
                disabled={!selectedDate || !selectedTime || rescheduling}
                className="flex-1"
              >
                {rescheduling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Rescheduling...
                  </>
                ) : (
                  <>
                    <Calendar className="mr-2 h-4 w-4" />
                    Confirm New Time
                  </>
                )}
              </Button>
              <Button variant="outline" asChild>
                <Link to="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Cancel
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
