'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePickerWithRange } from './DateRangePicker';
import { DateRange } from 'react-day-picker';

type Booking = {
  vehicle: string;
  bookingDate: DateRange;
  note: string;
};

const bookings: Booking[] = [];

function getDisabledDates(bookings: Booking[]): Date[] {
  const disabledDates: Date[] = [];

  bookings.forEach(({ bookingDate }) => {
    const { from, to } = bookingDate;
    if (from && to) {
      const currentDate = new Date(from);
      while (currentDate <= to) {
        disabledDates.push(new Date(currentDate)); // Push a copy to avoid mutating the reference
        currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
      }
    }
  });

  return disabledDates;
}

export default function CarBookingForm() {
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [bookingDateRange, setBookingDateRange] = useState<
    DateRange | undefined
  >();
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    if (!selectedVehicle || !bookingDateRange || !note) {
      alert('Please fill in all fields.');
      return;
    }
    bookings.push({
      vehicle: selectedVehicle,
      bookingDate: bookingDateRange,
      note: note,
    });

    setBookingDateRange(undefined);
    setSelectedVehicle('');
    setNote('');
    alert('Booking Submitted Successfully!');
  };

  function dateSelectHandler(dateRange: DateRange | undefined) {
    console.log(dateRange);
    setBookingDateRange(dateRange);
  }

  return (
    <div className="w-full mx-auto p-4">
      <Card className="shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle>New Vehicle Booking</CardTitle>
          <CardDescription></CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Select Vehicle</Label>
              <Select onValueChange={setSelectedVehicle}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a vehicle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tesla Model S">Tesla Model S</SelectItem>
                  <SelectItem value="BMW X5">BMW X5</SelectItem>
                  <SelectItem value="Audi A4">Audi A4</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Booking Range</Label>
              <DatePickerWithRange
                dateRange={bookingDateRange}
                setDateRange={dateSelectHandler}
                disabledDates={getDisabledDates(bookings)}
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Input
                type="text"
                placeholder="Add notes"
                value={note}
                onChange={e => setNote(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">
              Book Now
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
