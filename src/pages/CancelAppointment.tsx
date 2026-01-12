import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Loader2, Calendar, ArrowLeft, CalendarClock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AppointmentInfo {
  id: string;
  guest_name: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
}

export default function CancelAppointment() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [appointment, setAppointment] = useState<AppointmentInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid cancellation link. Please check the link in your email.');
      setLoading(false);
      return;
    }

    // Fetch appointment info using the cancel token
    async function fetchAppointment() {
      try {
        const { data, error: fetchError } = await supabase
          .from('appointments')
          .select('id, guest_name, appointment_date, appointment_time, status')
          .eq('cancel_token', token)
          .single();

        if (fetchError || !data) {
          setError('Appointment not found. The link may be invalid or expired.');
          return;
        }

        if (data.status === 'cancelled') {
          setError('This appointment has already been cancelled.');
          return;
        }

        const appointmentDateTime = new Date(`${data.appointment_date}T${data.appointment_time}`);
        if (appointmentDateTime < new Date()) {
          setError('This appointment has already passed and cannot be cancelled.');
          return;
        }

        setAppointment(data);
      } catch (err) {
        console.error('Error fetching appointment:', err);
        setError('Failed to load appointment details. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchAppointment();
  }, [token]);

  const handleCancel = async () => {
    if (!token) return;
    
    setCancelling(true);
    setError(null);

    try {
      // Send token in POST body for security (avoids URL parameter leakage in logs/referrers)
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cancel-appointment`;
      const result = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await result.json();

      if (!result.ok) {
        throw new Error(data.error || 'Failed to cancel appointment');
      }

      setSuccess(true);
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel appointment. Please try again.');
    } finally {
      setCancelling(false);
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

  if (loading) {
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
            <CardTitle>Appointment Cancelled</CardTitle>
            <CardDescription>
              Your strategy call has been successfully cancelled.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-center text-muted-foreground">
              A confirmation email has been sent to your inbox.
            </p>
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

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle>Unable to Cancel</CardTitle>
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Cancel Appointment</CardTitle>
          <CardDescription>
            Are you sure you want to cancel this strategy call?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {appointment && (
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <p className="text-sm">
                <span className="font-medium">Name:</span> {appointment.guest_name}
              </p>
              <p className="text-sm">
                <span className="font-medium">Date:</span> {formatDate(appointment.appointment_date)}
              </p>
              <p className="text-sm">
                <span className="font-medium">Time:</span> {formatTime(appointment.appointment_time)}
              </p>
            </div>
          )}
          
          <div className="flex flex-col gap-3">
            <Button variant="outline" asChild>
              <Link to={`/reschedule?token=${token}`}>
                <CalendarClock className="mr-2 h-4 w-4" />
                Reschedule Instead
              </Link>
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Yes, Cancel Appointment'
              )}
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Keep Appointment
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
