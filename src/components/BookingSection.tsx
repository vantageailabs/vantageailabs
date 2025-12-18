import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Video, ChevronLeft, ChevronRight, Check } from "lucide-react";

const timeSlots = [
  "9:00 AM", "10:00 AM", "11:00 AM", 
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"
];

const BookingSection = () => {
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const { firstDay, daysInMonth } = getDaysInMonth(currentMonth);
  const today = new Date();
  const isCurrentMonth = currentMonth.getMonth() === today.getMonth() && 
                          currentMonth.getFullYear() === today.getFullYear();

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentMonth(newMonth);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const isDateAvailable = (day: number) => {
    if (isCurrentMonth && day <= today.getDate()) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dayOfWeek = date.getDay();
    return dayOfWeek !== 0 && dayOfWeek !== 6; // Exclude weekends
  };

  const handleBooking = () => {
    if (selectedDate && selectedTime) {
      const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), selectedDate).toLocaleDateString();
      alert(`Booking confirmed for ${dateStr} at ${selectedTime}. We'll send you a confirmation email!`);
    }
  };

  return (
    <section id="booking" className="py-20 md:py-32 bg-background relative">
      <div className="container px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-primary font-semibold uppercase tracking-wider text-sm mb-4">
            Ready to Scale?
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            Book Your <span className="text-gradient-primary">Free Strategy Call</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            30 minutes. Zero pressure. We'll audit your current processes and show you exactly where AI can save you time and money.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="card-elevated p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Calendar */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display font-semibold">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => navigateMonth('prev')}
                      className="p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => navigateMonth('next')}
                      className="p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day} className="text-center text-xs text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const available = isDateAvailable(day);
                    const selected = selectedDate === day;
                    
                    return (
                      <button
                        key={day}
                        onClick={() => available && setSelectedDate(day)}
                        disabled={!available}
                        className={`
                          aspect-square rounded-lg text-sm font-medium transition-all
                          ${available 
                            ? selected 
                              ? 'bg-primary text-primary-foreground' 
                              : 'hover:bg-muted'
                            : 'text-muted-foreground/30 cursor-not-allowed'
                          }
                        `}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time slots & details */}
              <div>
                {selectedDate ? (
                  <>
                    <h3 className="font-display font-semibold mb-4">
                      Available times for {currentMonth.toLocaleDateString('en-US', { month: 'short' })} {selectedDate}
                    </h3>
                    <div className="grid grid-cols-2 gap-2 mb-6">
                      {timeSlots.map(time => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`
                            p-3 rounded-lg text-sm font-medium transition-all border
                            ${selectedTime === time
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'border-border hover:border-primary/50 hover:bg-muted/50'
                            }
                          `}
                        >
                          {time}
                        </button>
                      ))}
                    </div>

                    {selectedTime && (
                      <Button 
                        variant="hero" 
                        size="lg" 
                        className="w-full"
                        onClick={handleBooking}
                      >
                        Confirm Booking
                        <Check className="w-5 h-5" />
                      </Button>
                    )}
                  </>
                ) : (
                  <div className="h-full flex flex-col justify-center items-center text-center p-6">
                    <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Select a date to see available times
                    </p>
                  </div>
                )}

                {/* Call details */}
                <div className="mt-6 pt-6 border-t border-border space-y-3">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Video className="w-5 h-5 text-primary" />
                    <span>Video call via Zoom</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Clock className="w-5 h-5 text-primary" />
                    <span>30 minutes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingSection;
