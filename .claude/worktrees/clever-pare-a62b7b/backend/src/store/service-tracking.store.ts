// service-tracking.store.ts
export interface ServiceTracking {
  serviceId: string;
  userEmail: string;
  serviceName: string;
  status: 'submitted' | 'assigned' | 'in_progress' | 'completed';
  timeline: { step: string; timestamp: string }[];
  estimatedCompletion?: string;
  createdAt: string;
}

const serviceTrackingStore = new Map<string, ServiceTracking>();

export const createServiceTracking = (data: ServiceTracking) => {
  serviceTrackingStore.set(data.serviceId, data);
};

export const getServiceTrackingByEmail = (email: string) => {
  return Array.from(serviceTrackingStore.values()).filter(
    (s) => s.userEmail === email
  );
};

export const getServiceTrackingById = (id: string) => {
  return serviceTrackingStore.get(id);
};
