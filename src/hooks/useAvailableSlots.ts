import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface WorkingHours {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface AdminSettings {
  appointment_duration_minutes: number;
  buffer_minutes: number;
  advance_booking_days: number;
  timezone: string;
}

interface BusyPeriod {
  start: string; // HH:MM format
  end: string;   // HH:MM format
}

// Check if a time slot overlaps with any busy period
function isSlotBusy(slotStart: string, slotDurationMinutes: number, busyPeriods: BusyPeriod[]): boolean {
  const [slotStartHour, slotStartMin] = slotStart.split(':').map(Number);
  const slotStartMinutes = slotStartHour * 60 + slotStartMin;
  const slotEndMinutes = slotStartMinutes + slotDurationMinutes;

  for (const busy of busyPeriods) {
    const [busyStartHour, busyStartMin] = busy.start.split(':').map(Number);
    const [busyEndHour, busyEndMin] = busy.end.split(':').map(Number);
    const busyStartMinutes = busyStartHour * 60 + busyStartMin;
    const busyEndMinutes = busyEndHour * 60 + busyEndMin;

    // Check for overlap: slot starts before busy ends AND slot ends after busy starts
    if (slotStartMinutes < busyEndMinutes && slotEndMinutes > busyStartMinutes) {
      return true;
    }
  }

  return false;
}

export const useAvailableSlots = (selectedDate: Date | null) => {
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [calendarConfigured, setCalendarConfigured] = useState(false);

  // Fetch working hours, settings, and blocked dates on mount
  useEffect(() => {
    const fetchData = async () => {
      const [workingHoursResult, settingsResult, blockedDatesResult] = await Promise.all([
        supabase.from('working_hours').select('*'),
        supabase.from('admin_settings').select('*').limit(1).maybeSingle(),
        supabase.from('blocked_dates').select('blocked_date'),
      ]);

      if (workingHoursResult.data) {
        setWorkingHours(workingHoursResult.data);
      }
      if (settingsResult.data) {
        setSettings(settingsResult.data);
      }
      if (blockedDatesResult.data) {
        setBlockedDates(blockedDatesResult.data.map(d => d.blocked_date));
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  // Generate available slots when date is selected
  useEffect(() => {
    const generateSlots = async () => {
      if (!selectedDate || !settings || workingHours.length === 0) {
        setAvailableSlots([]);
        setLoadingSlots(false);
        return;
      }

      const dayOfWeek = selectedDate.getDay();
      const dayHours = workingHours.find(wh => wh.day_of_week === dayOfWeek);

      if (!dayHours || !dayHours.is_available) {
        setAvailableSlots([]);
        return;
      }

      // Get existing appointments for this date
      const dateStr = selectedDate.toISOString().split('T')[0];
      
      // Fetch appointment availability (via secure view) and Google Calendar events in parallel
      // Using appointment_availability view which only exposes date/time/duration (no PII)
      // Note: 'appointment_availability' is a database view not in auto-generated types
      // Regenerate Supabase types to remove 'as any' cast
      const [availabilityResult, calendarResult] = await Promise.all([
        supabase
          .from('appointment_availability' as 'appointments')
          .select('appointment_time')
          .eq('appointment_date', dateStr),
        supabase.functions.invoke('fetch-calendar-events', {
          body: { date: dateStr, timezone: settings.timezone }
        })
      ]);

      const bookedTimes = new Set(
        availabilityResult.data?.map((a: { appointment_time: string }) => a.appointment_time.slice(0, 5)) || []
      );

      // Extract busy periods from Google Calendar
      let busyPeriods: BusyPeriod[] = [];
      if (calendarResult.data && !calendarResult.error) {
        busyPeriods = calendarResult.data.busyPeriods || [];
        setCalendarConfigured(calendarResult.data.configured || false);
        if (busyPeriods.length > 0) {
          console.log('Google Calendar busy periods:', busyPeriods);
        }
      } else if (calendarResult.error) {
        console.warn('Failed to fetch calendar events:', calendarResult.error);
      }

      // Generate time slots
      const slots: string[] = [];
      const [startHour, startMin] = dayHours.start_time.split(':').map(Number);
      const [endHour, endMin] = dayHours.end_time.split(':').map(Number);
      
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      const slotDuration = settings.appointment_duration_minutes + settings.buffer_minutes;

      for (let time = startMinutes; time + settings.appointment_duration_minutes <= endMinutes; time += slotDuration) {
        const hour = Math.floor(time / 60);
        const minute = time % 60;
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // Check if slot is booked by existing appointment
        if (bookedTimes.has(timeStr)) {
          continue;
        }

        // Check if slot overlaps with Google Calendar busy period
        if (isSlotBusy(timeStr, settings.appointment_duration_minutes, busyPeriods)) {
          console.log(`Slot ${timeStr} blocked by Google Calendar event`);
          continue;
        }

        slots.push(timeStr);
      }

      setAvailableSlots(slots);
      setLoadingSlots(false);
    };

    if (selectedDate && settings && workingHours.length > 0) {
      setLoadingSlots(true);
    }
    generateSlots();
  }, [selectedDate, workingHours, settings]);

  const isDateAvailable = (date: Date): boolean => {
    if (!settings) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if date is in the past
    if (date < today) return false;
    
    // Check if date is today
    if (date.getTime() === today.getTime()) return false;
    
    // Check advance booking limit
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + settings.advance_booking_days);
    if (date > maxDate) return false;

    // Check if date is blocked
    const dateStr = date.toISOString().split('T')[0];
    if (blockedDates.includes(dateStr)) return false;

    // Check if day has working hours
    const dayOfWeek = date.getDay();
    const dayHours = workingHours.find(wh => wh.day_of_week === dayOfWeek);
    
    return dayHours?.is_available ?? false;
  };

  const formatTimeDisplay = (time24: string): string => {
    const [hour, minute] = time24.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  return {
    availableSlots,
    isDateAvailable,
    formatTimeDisplay,
    loading,
    loadingSlots,
    settings,
    blockedDates,
    calendarConfigured,
  };
};