/* RT Network internal team roster — the pool an operator staffs events
   from. Each member's `capacity` tag drives automatic task assignment
   when a quote converts to a CRM event (src/quotesPanel.jsx); every
   converted event gets the full roster on its team list so any member
   can be reassigned by hand afterward too. */

export const TEAM = [
  { id: 1, name: 'Sarah Mitchell', role: 'Lead Planner', capacity: 'planning', email: 'sarah@risingtide.store', avatar: 'SM' },
  { id: 2, name: 'James Cooper', role: 'Vendor Coordinator', capacity: 'vendor', email: 'james@risingtide.store', avatar: 'JC' },
  { id: 3, name: 'Emily Rodriguez', role: 'Guest Experience Manager', capacity: 'guest', email: 'emily@risingtide.store', avatar: 'ER' },
  { id: 4, name: 'Marcus Weber', role: 'Budget & Billing Lead', capacity: 'billing', email: 'marcus@risingtide.store', avatar: 'MW' },
  { id: 5, name: 'Priya Nair', role: 'Day-of Operations Lead', capacity: 'ops', email: 'priya@risingtide.store', avatar: 'PN' },
  { id: 6, name: 'Tom Fischer', role: 'Logistics & AV Liaison', capacity: 'logistics', email: 'tom@risingtide.store', avatar: 'TF' },
  { id: 7, name: 'Lena Hoffmann', role: 'Client Relations Manager', capacity: 'client', email: 'lena@risingtide.store', avatar: 'LH' },
];

export function memberFor(capacity) {
  return TEAM.find(m => m.capacity === capacity) || null;
}
