import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CarBookingForm from './CarForm';

export default function Home() {
  return (
    <>
      <CarBookingForm />
    </>
  );
}
