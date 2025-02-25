import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CarBookingForm from './CarForm';
import ItemLookup from './ItemLookup';

export default function Home() {
  return (
    <>
      <Tabs defaultValue="account" className="w-full">
        <TabsList>
          <TabsTrigger value="account">Vehicle Calendar</TabsTrigger>
          <TabsTrigger value="password">Item Lookup</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <CarBookingForm />
        </TabsContent>
        <TabsContent value="password">
          <ItemLookup />
        </TabsContent>
      </Tabs>
    </>
  );
}
