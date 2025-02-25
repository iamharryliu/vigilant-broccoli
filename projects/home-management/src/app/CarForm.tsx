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
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type Vehicle = {
  id: number;
  name: string;
  description: string;
};

const vehicles: Vehicle[] = [
  {
    id: 1,
    name: 'Tesla Model S',
    description:
      'A fully electric luxury sedan with cutting-edge technology and impressive range.',
  },
  {
    id: 2,
    name: 'Ford F-150',
    description:
      'A reliable and powerful pickup truck known for its towing capacity and rugged design.',
  },
  {
    id: 3,
    name: 'Honda Civic',
    description:
      'A compact car praised for its fuel efficiency, reliability, and affordability.',
  },
  {
    id: 4,
    name: 'BMW X5',
    description:
      'A luxury SUV combining performance, comfort, and advanced technology features.',
  },
  {
    id: 5,
    name: 'Ducati Panigale V4',
    description:
      'A high-performance superbike built for speed, agility, and precision on the track.',
  },
];

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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
      <VehicleDetailView vehicle={vehicles[0]}></VehicleDetailView>
    </div>
  );
}

function VehicleDetailView({ vehicle }: { vehicle: Vehicle }) {
  function createNewBooking() {
    console.log('create new booking for ');
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vehicle</CardTitle>
        <CardDescription>
          {vehicle.name} - {vehicle.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button>Create New Booking</Button>
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
        <Calendar
          initialFocus
          mode="range"
          numberOfMonths={2}
          disabled={getDisabledDates(bookings)}
        />
      </CardContent>
    </Card>
  );
}
