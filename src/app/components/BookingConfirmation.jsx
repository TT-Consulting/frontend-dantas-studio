import { Check, Calendar as CalendarIcon, Clock, DollarSign } from 'lucide-react';

export function BookingConfirmation({ onBack, onHome }) {
  const booking = {
    service: 'Gel Nails + Nail Art Design',
    date: 'December 19, 2025',
    time: '14:00',
    duration: '120 min',
    price: 'R$ 270',
    professional: 'Annika',
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 pb-8">
      {/* Success Animation */}
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
        <Check size={48} className="text-green-600" strokeWidth={3} />
      </div>

      {/* Title */}
      <h2 className="text-primary text-center mb-2">Booking Confirmed!</h2>
      <p className="text-gray-600 text-center mb-8">
        We've sent a confirmation to your email
      </p>

      {/* Booking Summary Card */}
      <div className="w-full max-w-sm bg-white rounded-xl p-6 shadow-lg mb-6">
        <h3 className="text-gray-800 mb-4">Appointment Details</h3>
        
        <div className="space-y-4">
          <div>
            <p className="text-gray-500 text-sm mb-1">Service</p>
            <p className="text-primary">{booking.service}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 text-sm mb-1">Date</p>
              <div className="flex items-center gap-2">
                <CalendarIcon size={16} className="text-accent" />
                <p className="text-gray-800 text-sm">{booking.date}</p>
              </div>
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-1">Time</p>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-accent" />
                <p className="text-gray-800 text-sm">{booking.time}</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-gray-500 text-sm mb-1">Duration</p>
            <p className="text-gray-800">{booking.duration}</p>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <p className="text-gray-600">Total</p>
              <div className="flex items-center gap-1">
                <DollarSign size={20} className="text-accent" />
                <p className="text-2xl text-primary">{booking.price}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-sm space-y-3">
        <button className="w-full bg-primary text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-2">
          <CalendarIcon size={20} />
          <span>Add to Google Calendar</span>
        </button>

        {onHome && (
          <button
            onClick={onHome}
            className="w-full bg-white text-primary border-2 border-primary py-4 rounded-xl hover:bg-primary hover:text-white transition-colors"
          >
            Back to Home
          </button>
        )}
      </div>

      {/* Footer Note */}
      <div className="mt-8 text-center">
        <p className="text-gray-500 text-sm">
          You'll receive a reminder 24h before your appointment
        </p>
      </div>
    </div>
  );
}
