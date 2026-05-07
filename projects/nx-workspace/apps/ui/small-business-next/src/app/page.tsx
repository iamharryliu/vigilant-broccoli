'use client';

import { useState } from 'react';
import { ProtectedRoute } from './components/protected-route';
import { ServicesManager } from './components/services-manager';
import { SubscribeWidget } from './components/subscribe-widget';
import { SubscriptionsManager } from './components/subscriptions-manager';
import { NotifyDemo } from './components/notify-demo';
import type { Service, Subscription } from './types/subscription.types';

export default function Page() {
  const [services, setServices] = useState<Service[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  const createService = (s: Service) => setServices(prev => [...prev, s]);

  const updateService = (updated: Service) => {
    setServices(prev => prev.map(s => (s.id === updated.id ? updated : s)));
  };

  const deleteService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
    setSubscriptions(prev => prev.filter(s => s.serviceId !== id));
  };

  const addSubscription = (sub: Subscription) => {
    const exists = subscriptions.some(
      s => s.serviceId === sub.serviceId && s.email === sub.email,
    );
    if (!exists) setSubscriptions(prev => [...prev, sub]);
  };

  const deleteSubscription = (id: string) =>
    setSubscriptions(prev => prev.filter(s => s.id !== id));

  const updateSubscription = (updated: Subscription) =>
    setSubscriptions(prev =>
      prev.map(s => (s.id === updated.id ? updated : s)),
    );

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-50 p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-8">
          Subscription Manager
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <ServicesManager
            services={services}
            onCreate={createService}
            onUpdate={updateService}
            onDelete={deleteService}
          />
          <SubscriptionsManager
            services={services}
            subscriptions={subscriptions}
            onDelete={deleteSubscription}
            onUpdate={updateSubscription}
          />
        </div>
        {services.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {services.map(service => (
                <SubscribeWidget
                  key={service.id}
                  service={service}
                  onSubscribe={addSubscription}
                />
              ))}
            </div>
            <NotifyDemo services={services} subscriptions={subscriptions} />
          </>
        )}
      </main>
    </ProtectedRoute>
  );
}
