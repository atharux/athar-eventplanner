import React, { useState } from 'react';
import { Calendar, Users, MessageSquare, Search, Plus, X, Send, CheckCircle, Clock, DollarSign, MapPin, Star, Upload, Menu, Bell, FileText, Edit, Trash2, Check, Filter, TrendingUp, AlertCircle, Home, Settings, ChevronRight, ChevronDown } from 'lucide-react';

export default function EventPlannerApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [messageInput, setMessageInput] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(0);

  // Demo Data - Events
  const [events] = useState([
    { id: 1, name: 'Summer Gala 2025', date: '2025-06-15', budget: 50000, spent: 32000, guests: 250, confirmed: 180, status: 'active', vendors: 8, tasks: 24, completed: 18, type: 'Corporate' },
    { id: 2, name: 'Thompson Wedding', date: '2025-07-22', budget: 75000, spent: 45000, guests: 180, confirmed: 150, status: 'active', vendors: 12, tasks: 31, completed: 22, type: 'Wedding' },
    { id: 3, name: 'Tech Conference 2025', date: '2025-08-10', budget: 120000, spent: 15000, guests: 500, confirmed: 320, status: 'planning', vendors: 5, tasks: 42, completed: 8, type: 'Conference' },
    { id: 4, name: 'Birthday Celebration', date: '2025-05-30', budget: 15000, spent: 8500, guests: 80, confirmed: 65, status: 'active', vendors: 6, tasks: 15, completed: 12, type: 'Birthday' },
    { id: 5, name: 'Annual Charity Gala', date: '2025-09-14', budget: 90000, spent: 5000, guests: 350, confirmed: 200, status: 'planning', vendors: 3, tasks: 38, completed: 5, type: 'Fundraiser' }
  ]);

  // Demo Data - Vendors
  const vendors = [
    { id: 1, name: 'Elegant Catering Co.', category: 'Catering', rating: 4.9, price: '$$$$', location: 'Downtown', reviews: 127, booked: true },
    { id: 2, name: 'Harmony DJ Services', category: 'Entertainment', rating: 4.8, price: '$$$', location: 'Citywide', reviews: 89, booked: true },
    { id: 3, name: 'Bloom & Petal', category: 'Florals', rating: 5.0, price: '$$$', location: 'Westside', reviews: 156, booked: false },
    { id: 4, name: 'Grand Ballroom', category: 'Venue', rating: 4.7, price: '$$$$', location: 'Central District', reviews: 203, booked: true },
    { id: 5, name: 'Snapshot Studios', category: 'Photography', rating: 4.9, price: '$$$', location: 'East Bay', reviews: 94, booked: false },
    { id: 6, name: 'Sparkle Decor', category: 'Decorations', rating: 4.6, price: '$$', location: 'North End', reviews: 71, booked: true },
    { id: 7, name: 'Gourmet Delights', category: 'Catering', rating: 4.8, price: '$$$', location: 'Midtown', reviews: 112, booked: false },
    { id: 8, name: 'Live Band Collective', category: 'Entertainment', rating: 4.7, price: '$$$$', location: 'Downtown', reviews: 78, booked: false },
    { id: 9, name: 'Picture Perfect', category: 'Photography', rating: 4.9, price: '$$$$', location: 'Citywide', reviews: 145, booked: false },
    { id: 10, name: 'Crystal Palace', category: 'Venue', rating: 4.8, price: '$$$$$', location: 'Waterfront', reviews: 189, booked: false },
    { id: 11, name: 'Sweet Treats Bakery', category: 'Catering', rating: 4.6, price: '$$', location: 'North Side', reviews: 93, booked: false },
    { id: 12, name: 'Vintage Props', category: 'Decorations', rating: 4.5, price: '$$$', location: 'East District', reviews: 56, booked: false }
  ];

  // Demo Data - Messages
  const conversations = [
    {
      id: 1,
      vendor: 'Elegant Catering Co.',
      lastMessage: 'Menu proposal attached for your review',
      time: '10:30 AM',
      unread: true,
      messages: [
        { sender: 'vendor', text: 'Hi! Thanks for reaching out about catering for the Summer Gala.', time: '9:15 AM' },
        { sender: 'me', text: 'Hello! Yes, we need catering for 250 guests. Can you provide options?', time: '9:20 AM' },
        { sender: 'vendor', text: 'Absolutely! I have prepared a comprehensive menu proposal.', time: '9:45 AM' },
        { sender: 'vendor', text: 'Menu proposal attached for your review', time: '10:30 AM' }
      ]
    },
    {
      id: 2,
      vendor: 'Harmony DJ Services',
      lastMessage: 'Confirming booking for June 15th',
      time: '9:15 AM',
      unread: true,
      messages: [
        { sender: 'vendor', text: 'Hi! Confirming our booking for June 15th at Grand Ballroom.', time: '9:15 AM' },
        { sender: 'me', text: 'Perfect! What time will you arrive for setup?', time: '9:20 AM' }
      ]
    },
    {
      id: 3,
      vendor: 'Grand Ballroom',
      lastMessage: 'Contract signed and payment received',
      time: 'Yesterday',
      unread: false,
      messages: [
        { sender: 'vendor', text: 'Thank you for choosing Grand Ballroom!', time: 'Yesterday' },
        { sender: 'vendor', text: 'Contract signed and payment received', time: 'Yesterday' }
      ]
    },
    {
      id: 4,
      vendor: 'Bloom & Petal',
      lastMessage: 'Samples ready for Friday viewing',
      time: '2 days ago',
      unread: false,
      messages: [
        { sender: 'me', text: 'Can I see some floral arrangement samples?', time: '3 days ago' },
        { sender: 'vendor', text: 'Of course! I will prepare some options.', time: '3 days ago' },
        { sender: 'vendor', text: 'Samples ready for Friday viewing', time: '2 days ago' }
      ]
    }
  ];

  // Demo Data - Tasks
  const [tasks] = useState([
    { id: 1, title: 'Finalize menu with caterer', event: 'Summer Gala 2025', dueDate: '2025-05-01', status: 'pending', priority: 'high', assignedTo: 'Elegant Catering Co.' },
    { id: 2, title: 'Send venue contract', event: 'Thompson Wedding', dueDate: '2025-04-28', status: 'completed', priority: 'high', assignedTo: 'Grand Ballroom' },
    { id: 3, title: 'Confirm DJ equipment setup', event: 'Summer Gala 2025', dueDate: '2025-05-10', status: 'pending', priority: 'medium', assignedTo: 'Harmony DJ Services' },
    { id: 4, title: 'Review floral samples', event: 'Thompson Wedding', dueDate: '2025-04-30', status: 'in-progress', priority: 'high', assignedTo: 'Bloom & Petal' },
    { id: 5, title: 'Book photography session', event: 'Tech Conference 2025', dueDate: '2025-05-15', status: 'pending', priority: 'medium', assignedTo: 'Snapshot Studios' },
    { id: 6, title: 'Finalize seating chart', event: 'Thompson Wedding', dueDate: '2025-05-05', status: 'in-progress', priority: 'low', assignedTo: 'Internal Team' },
    { id: 7, title: 'Order event signage', event: 'Tech Conference 2025', dueDate: '2025-05-20', status: 'pending', priority: 'low', assignedTo: 'Sparkle Decor' },
    { id: 8, title: 'Send invitations', event: 'Birthday Celebration', dueDate: '2025-04-25', status: 'completed', priority: 'high', assignedTo: 'Internal Team' },
    { id: 9, title: 'Confirm AV equipment rental', event: 'Tech Conference 2025', dueDate: '2025-05-12', status: 'pending', priority: 'high', assignedTo: 'TechAV Solutions' },
    { id: 10, title: 'Schedule venue walkthrough', event: 'Annual Charity Gala', dueDate: '2025-05-08', status: 'pending', priority: 'medium', assignedTo: 'Crystal Palace' }
  ]);

  // Demo Data - Budget Items
  const [budgetItems] = useState([
    { id: 1, category: 'Venue', vendor: 'Grand Ballroom', amount: 12000, paid: 12000, status: 'paid', event: 'Summer Gala 2025' },
    { id: 2, category: 'Catering', vendor: 'Elegant Catering Co.', amount: 15000, paid: 7500, status: 'partial', event: 'Summer Gala 2025' },
    { id: 3, category: 'Entertainment', vendor: 'Harmony DJ Services', amount: 2500, paid: 0, status: 'pending', event: 'Summer Gala 2025' },
    { id: 4, category: 'Decorations', vendor: 'Sparkle Decor', amount: 3500, paid: 1000, status: 'partial', event: 'Summer Gala 2025' },
    { id: 5, category: 'Photography', vendor: 'Snapshot Studios', amount: 4000, paid: 0, status: 'pending', event: 'Summer Gala 2025' },
    { id: 6, category: 'Florals', vendor: 'Bloom & Petal', amount: 2800, paid: 0, status: 'pending', event: 'Thompson Wedding' },
    { id: 7, category: 'Venue', vendor: 'Crystal Palace', amount: 25000, paid: 5000, status: 'partial', event: 'Thompson Wedding' }
  ]);

  // Demo Data - Guest List
  const [guests] = useState([
    { id: 1, name: 'John Smith', email: 'john@email.com', rsvp: 'confirmed', plusOne: true, event: 'Summer Gala 2025', table: 'A1' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@email.com', rsvp: 'confirmed', plusOne: false, event: 'Summer Gala 2025', table: 'A1' },
    { id: 3, name: 'Michael Chen', email: 'michael@email.com', rsvp: 'pending', plusOne: true, event: 'Summer Gala 2025', table: 'B2' },
    { id: 4, name: 'Emily Davis', email: 'emily@email.com', rsvp: 'confirmed', plusOne: true, event: 'Summer Gala 2025', table: 'A2' },
    { id: 5, name: 'David Wilson', email: 'david@email.com', rsvp: 'declined', plusOne: false, event: 'Summer Gala 2025', table: null },
    { id: 6, name: 'Lisa Anderson', email: 'lisa@email.com', rsvp: 'confirmed', plusOne: false, event: 'Thompson Wedding', table: 'C1' },
    { id: 7, name: 'James Brown', email: 'james@email.com', rsvp: 'pending', plusOne: true, event: 'Thompson Wedding', table: 'C2' },
    { id: 8, name: 'Jennifer White', email: 'jennifer@email.com', rsvp: 'confirmed', plusOne: true, event: 'Thompson Wedding', table: 'C1' }
  ]);

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         vendor.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || vendor.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const CreateEventModal = () => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Create New Event</h2>
          <button onClick={() => setShowCreateEvent(false)} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Event Name</label>
            <input type="text" placeholder="e.g., Summer Gala 2025" className="w-full bg-slate-800 border border-slate-700 px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Event Type</label>
              <select className="w-full bg-slate-800 border border-slate-700 px-4 py-2 text-white focus:outline-none focus:border-blue-500">
                <option>Wedding</option>
                <option>Corporate</option>
                <option>Birthday</option>
                <option>Conference</option>
                <option>Fundraiser</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Date</label>
              <input type="date" className="w-full bg-slate-800 border border-slate-700 px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Budget ($)</label>
              <input type="number" placeholder="50000" className="w-full bg-slate-800 border border-slate-700 px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Expected Guests</label>
              <input type="number" placeholder="150" className="w-full bg-slate-800 border border-slate-700 px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
            <input type="text" placeholder="City or venue name" className="w-full bg-slate-800 border border-slate-700 px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 transition-colors">
              Create Event
            </button>
            <button onClick={() => setShowCreateEvent(false)} className="px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-3 transition-colors border border-slate-700">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const VendorModal = ({ vendor }) => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">{vendor.name}</h2>
            <p className="text-blue-400 text-sm mt-1">{vendor.category}</p>
          </div>
          <button onClick={() => setShowVendorModal(false)} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-6 pb-6 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <Star className="text-yellow-500 fill-yellow-500" size={20} />
              <span className="text-white font-bold text-lg">{vendor.rating}</span>
              <span className="text-slate-400 text-sm">({vendor.reviews} reviews)</span>
            </div>
            <div className="text-green-400 font-bold text-lg">{vendor.price}</div>
            <div className="flex items-center gap-2 text-slate-300">
              <MapPin size={16} className="text-blue-400" />
              <span className="text-sm">{vendor.location}</span>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-white mb-3">About</h3>
            <p className="text-slate-300 leading-relaxed">
              Professional {vendor.category.toLowerCase()} services with over 10 years of experience. 
              We specialize in creating unforgettable moments for your special day. 
              Our team is dedicated to excellence and customer satisfaction.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-white mb-3">Services</h3>
            <div className="flex flex-wrap gap-2">
              {['Full Service', 'Custom Packages', 'Day-of Coordination', 'Consultations'].map(service => (
                <span key={service} className="bg-slate-800 border border-slate-700 px-3 py-1 text-blue-400 text-sm">
                  {service}
                </span>
              ))}
            </div>
          </div>
          
          <div className="space-y-3">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 transition-colors">
              Send Inquiry
            </button>
            <button className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-3 transition-colors border border-slate-700">
              Save to Favorites
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const BudgetTracker = () => {
    const selectedEventBudget = events.find(e => e.id === 1);
    const eventBudgetItems = budgetItems.filter(item => item.event === selectedEventBudget?.name);
    const totalBudget = selectedEventBudget?.budget || 0;
    const totalSpent = eventBudgetItems.reduce((sum, item) => sum + item.paid, 0);
    const totalCommitted = eventBudgetItems.reduce((sum, item) => sum + item.amount, 0);

    return (
      <div className="bg-slate-900 border border-slate-700 p-6">
        <h2 className="text-xl font-bold text-white mb-6">Budget Tracker - {selectedEventBudget?.name}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-800 border border-slate-700 p-4">
            <p className="text-slate-400 text-sm mb-1">Total Budget</p>
            <p className="text-2xl font-bold text-white">${totalBudget.toLocaleString()}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 p-4">
            <p className="text-slate-400 text-sm mb-1">Spent</p>
            <p className="text-2xl font-bold text-green-400">${totalSpent.toLocaleString()}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 p-4">
            <p className="text-slate-400 text-sm mb-1">Remaining</p>
            <p className="text-2xl font-bold text-blue-400">${(totalBudget - totalSpent).toLocaleString()}</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>Budget Progress</span>
            <span>{Math.round((totalSpent / totalBudget) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-800 h-3 border border-slate-700">
            <div className="bg-green-500 h-full" style={{ width: `${(totalSpent / totalBudget) * 100}%` }}></div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Category</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Vendor</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium text-sm">Amount</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium text-sm">Paid</th>
                <th className="text-center py-3 px-4 text-slate-400 font-medium text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {eventBudgetItems.map(item => (
                <tr key={item.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                  <td className="py-3 px-4 text-white">{item.category}</td>
                  <td className="py-3 px-4 text-slate-300">{item.vendor}</td>
                  <td className="py-3 px-4 text-right text-white">${item.amount.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right text-green-400">${item.paid.toLocaleString()}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-block px-2 py-1 text-xs ${
                      item.status === 'paid' ? 'bg-green-900 text-green-400 border border-green-700' :
                      item.status === 'partial' ? 'bg-yellow-900 text-yellow-400 border border-yellow-700' :
                      'bg-red-900 text-red-400 border border-red-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const GuestListPreview = () => {
    const selectedEventGuests = guests.filter(g => g.event === 'Summer Gala 2025');
    const confirmed = selectedEventGuests.filter(g => g.rsvp === 'confirmed').length;
    const pending = selectedEventGuests.filter(g => g.rsvp === 'pending').length;
    const declined = selectedEventGuests.filter(g => g.rsvp === 'declined').length;

    return (
      <div className="bg-slate-900 border border-slate-700 p-6">
        <h2 className="text-xl font-bold text-white mb-6">Guest List - Summer Gala 2025</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800 border border-slate-700 p-4">
            <p className="text-slate-400 text-sm mb-1">Total Invited</p>
            <p className="text-2xl font-bold text-white">{selectedEventGuests.length}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 p-4">
            <p className="text-slate-400 text-sm mb-1">Confirmed</p>
            <p className="text-2xl font-bold text-green-400">{confirmed}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 p-4">
            <p className="text-slate-400 text-sm mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-400">{pending}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 p-4">
            <p className="text-slate-400 text-sm mb-1">Declined</p>
            <p className="text-2xl font-bold text-red-400">{declined}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Name</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Email</th>
                <th className="text-center py-3 px-4 text-slate-400 font-medium text-sm">RSVP</th>
                <th className="text-center py-3 px-4 text-slate-400 font-medium text-sm">+1</th>
                <th className="text-center py-3 px-4 text-slate-400 font-medium text-sm">Table</th>
              </tr>
            </thead>
            <tbody>
              {selectedEventGuests.map(guest => (
                <tr key={guest.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                  <td className="py-3 px-4 text-white">{guest.name}</td>
                  <td className="py-3 px-4 text-slate-300">{guest.email}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-block px-2 py-1 text-xs ${
                      guest.rsvp === 'confirmed' ? 'bg-green-900 text-green-400 border border-green-700' :
                      guest.rsvp === 'pending' ? 'bg-yellow-900 text-yellow-400 border border-yellow-700' :
                      'bg-red-900 text-red-400 border border-red-700'
                    }`}>
                      {guest.rsvp}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-white">{guest.plusOne ? 'Yes' : 'No'}</td>
                  <td className="py-3 px-4 text-center text-slate-300">{guest.table || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const TaskManager = () => {
    const pendingTasks = tasks.filter(t => t.status === 'pending');
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
    const completedTasks = tasks.filter(t => t.status === 'completed');

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-white">Task Manager</h1>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 font-semibold flex items-center gap-2">
            <Plus size={20} />
            Add Task
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-900 border border-slate-700 p-4">
            <p className="text-slate-400 text-sm mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-400">{pendingTasks.length}</p>
          </div>
          <div className="bg-slate-900 border border-slate-700 p-4">
            <p className="text-slate-400 text-sm mb-1">In Progress</p>
            <p className="text-2xl font-bold text-blue-400">{inProgressTasks.length}</p>
          </div>
          <div className="bg-slate-900 border border-slate-700 p-4">
            <p className="text-slate-400 text-sm mb-1">Completed</p>
            <p className="text-2xl font-bold text-green-400">{completedTasks.length}</p>
          </div>
        </div>

        <div className="space-y-4">
          {tasks.map(task => (
            <div key={task.id} className="bg-slate-900 border border-slate-700 p-4 hover:border-blue-500 transition-colors">
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <div className={`w-4 h-4 border-2 ${task.status === 'completed' ? 'bg-green-500 border-green-500' : 'border-slate-600'}`}>
                    {task.status === 'completed' && <Check size={12} className="text-white" />}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                    <h3 className={`font-semibold ${task.status === 'completed' ? 'text-slate-500 line-through' : 'text-white'}`}>
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs ${
                        task.priority === 'high' ? 'bg-red-900 text-red-400 border border-red-700' :
                        task.priority === 'medium' ? 'bg-yellow-900 text-yellow-400 border border-yellow-700' :
                        'bg-green-900 text-green-400 border border-green-700'
                      }`}>
                        {task.priority}
                      </span>
                      <span className={`px-2 py-1 text-xs ${
                        task.status === 'completed' ? 'bg-green-900 text-green-400 border border-green-700' :
                        task.status === 'in-progress' ? 'bg-blue-900 text-blue-400 border border-blue-700' :
                        'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {task.event}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      Due {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      {task.assignedTo}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="text-slate-400 hover:text-blue-400">
                    <Edit size={18} />
                  </button>
                  <button className="text-slate-400 hover:text-red-400">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const TimelineView = () => {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white mb-6">Event Timeline</h1>
        
        <div className="bg-slate-900 border border-slate-700 p-6">
          <div className="space-y-6">
            {events.slice(0, 3).map((event, idx) => (
              <div key={event.id} className="relative">
                {idx !== 2 && (
                  <div className="absolute left-4 top-12 bottom-0 w-0.5 bg-slate-700"></div>
                )}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-600 border-4 border-slate-900 flex items-center justify-center">
                      <Calendar size={16} className="text-white" />
                    </div>
                  </div>
                  <div className="flex-1 bg-slate-800 border border-slate-700 p-4 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                      <h3 className="text-lg font-bold text-white">{event.name}</h3>
                      <span className="text-sm text-slate-400">{new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-3">
                      <span>{event.type}</span>
                      <span>{event.guests} guests</span>
                      <span>${event.budget.toLocaleString()} budget</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 border border-slate-700">
                      <div className="bg-green-500 h-full" style={{ width: `${(event.completed / event.tasks) * 100}%` }}></div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">{event.completed} of {event.tasks} tasks completed</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const Dashboard = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400">Welcome back! Here's your event overview</p>
        </div>
        <button onClick={() => setShowCreateEvent(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 font-semibold flex items-center gap-2">
          <Plus size={20} />
          New Event
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-600 border border-blue-500 p-6">
          <div className="flex justify-between items-start mb-4">
            <Calendar size={32} className="text-white" />
            <span className="text-3xl font-bold text-white">{events.length}</span>
          </div>
          <h3 className="text-sm text-white/90">Total Events</h3>
          <p className="text-xs text-white/70 mt-1">{events.filter(e => e.status === 'active').length} active</p>
        </div>

        <div className="bg-purple-600 border border-purple-500 p-6">
          <div className="flex justify-between items-start mb-4">
            <Users size={32} className="text-white" />
            <span className="text-3xl font-bold text-white">{vendors.filter(v => v.booked).length}</span>
          </div>
          <h3 className="text-sm text-white/90">Booked Vendors</h3>
          <p className="text-xs text-white/70 mt-1">Out of {vendors.length} total</p>
        </div>

        <div className="bg-green-600 border border-green-500 p-6">
          <div className="flex justify-between items-start mb-4">
            <CheckCircle size={32} className="text-white" />
            <span className="text-3xl font-bold text-white">{tasks.filter(t => t.status === 'completed').length}</span>
          </div>
          <h3 className="text-sm text-white/90">Tasks Done</h3>
          <p className="text-xs text-white/70 mt-1">{tasks.length} total tasks</p>
        </div>

        <div className="bg-orange-600 border border-orange-500 p-6">
          <div className="flex justify-between items-start mb-4">
            <MessageSquare size={32} className="text-white" />
            <span className="text-3xl font-bold text-white">{conversations.filter(c => c.unread).length}</span>
          </div>
          <h3 className="text-sm text-white/90">New Messages</h3>
          <p className="text-xs text-white/70 mt-1">{conversations.length} conversations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-700 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Upcoming Events</h2>
          <div className="space-y-3">
            {events.slice(0, 3).map(event => (
              <div key={event.id} className="bg-slate-800 border border-slate-700 p-4 hover:border-blue-500 transition-colors cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-white">{event.name}</h3>
                  <span className={`text-xs px-2 py-1 ${event.status === 'active' ? 'bg-green-900 text-green-400 border border-green-700' : 'bg-yellow-900 text-yellow-400 border border-yellow-700'}`}>
                    {event.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={14} />
                    {event.guests} guests
                  </span>
                </div>
                <div className="w-full bg-slate-900 h-2 border border-slate-700">
                  <div className="bg-blue-600 h-full" style={{ width: `${(event.completed / event.tasks) * 100}%` }}></div>
                </div>
                <p className="text-xs text-slate-400 mt-2">{event.completed} of {event.tasks} tasks</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Pending Tasks</h2>
          <div className="space-y-3">
            {tasks.filter(t => t.status === 'pending').slice(0, 4).map(task => (
              <div key={task.id} className="flex items-start gap-3 bg-slate-800 border border-slate-700 p-4">
                <div className="mt-1">
                  <div className={`w-3 h-3 ${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium text-sm">{task.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{task.event}</p>
                  <div className="flex gap-3 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const EventsView = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-white">Events</h1>
        <button onClick={() => setShowCreateEvent(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 font-semibold flex items-center gap-2">
          <Plus size={20} />
          Create Event
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map(event => (
          <div key={event.id} className="bg-slate-900 border border-slate-700 p-6 hover:border-blue-500 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">{event.name}</h3>
                <span className="text-sm text-slate-400">{event.type}</span>
              </div>
              <span className={`text-xs px-3 py-1 ${event.status === 'active' ? 'bg-green-900 text-green-400 border border-green-700' : 'bg-yellow-900 text-yellow-400 border border-yellow-700'}`}>
                {event.status}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-slate-300">
                <Calendar size={16} className="text-blue-400" />
                <span className="text-sm">{new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Users size={16} className="text-purple-400" />
                <span className="text-sm">{event.guests} guests ({event.confirmed} confirmed)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <DollarSign size={16} className="text-green-400" />
                <span className="text-sm">${event.spent.toLocaleString()} / ${event.budget.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 p-3">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Progress</span>
                <span className="text-white font-semibold">{Math.round((event.completed / event.tasks) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-900 h-2 border border-slate-700">
                <div className="bg-blue-600 h-full" style={{ width: `${(event.completed / event.tasks) * 100}%` }}></div>
              </div>
              <p className="text-xs text-slate-400 mt-2">{event.completed} of {event.tasks} tasks • {event.vendors} vendors</p>
            </div>

            <div className="flex gap-2 mt-4">
              <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 text-sm font-medium transition-colors border border-slate-700">
                View Details
              </button>
              <button className="px-4 bg-slate-800 hover:bg-slate-700 text-white transition-colors border border-slate-700">
                <Edit size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const VendorsView = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Vendors & Service Providers</h1>

      <div className="bg-slate-900 border border-slate-700 p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500" size={20} />
            <input
              type="text"
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 pl-12 pr-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-800 border border-slate-700 px-4 py-2 text-white focus:outline-none focus:border-blue-500"
          >
            <option>All</option>
            <option>Catering</option>
            <option>Entertainment</option>
            <option>Florals</option>
            <option>Venue</option>
            <option>Photography</option>
            <option>Decorations</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredVendors.map(vendor => (
            <div
              key={vendor.id}
              onClick={() => { setSelectedVendor(vendor); setShowVendorModal(true); }}
              className="bg-slate-800 border border-slate-700 p-5 hover:border-blue-500 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 border border-slate-700">
                  <Star className="text-yellow-500 fill-yellow-500" size={14} />
                  <span className="text-white text-sm font-bold">{vendor.rating}</span>
                </div>
                {vendor.booked && (
                  <span className="text-xs bg-green-900 text-green-400 px-2 py-1 border border-green-700">Booked</span>
                )}
              </div>

              <h3 className="text-lg font-bold text-white mb-1">{vendor.name}</h3>
              <p className="text-blue-400 text-sm mb-3 font-medium">{vendor.category}</p>

              <div className="flex justify-between items-center text-sm mb-4">
                <span className="text-green-400 font-bold">{vendor.price}</span>
                <span className="text-slate-400 flex items-center gap-1">
                  <MapPin size={14} />
                  {vendor.location}
                </span>
              </div>

              <div className="pt-4 border-t border-slate-700">
                <p className="text-xs text-slate-400">{vendor.reviews} reviews</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const MessagesView = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Messages</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-slate-900 border border-slate-700 p-4 max-h-[calc(100vh-250px)] overflow-y-auto">
          <h2 className="text-lg font-bold text-white mb-4">Conversations</h2>
          <div className="space-y-2">
            {conversations.map((conv, idx) => (
              <div
                key={conv.id}
                onClick={() => setSelectedConversation(idx)}
                className={`p-4 cursor-pointer transition-colors ${
                  selectedConversation === idx
                    ? 'bg-blue-600 border-2 border-blue-500'
                    : conv.unread
                    ? 'bg-slate-800 border-2 border-slate-600'
                    : 'bg-slate-800 border border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-white text-sm truncate">{conv.vendor}</h3>
                  <span className="text-xs text-slate-400 whitespace-nowrap ml-2">{conv.time}</span>
                </div>
                <p className="text-sm text-slate-300 truncate">{conv.lastMessage}</p>
                {conv.unread && (
                  <span className="inline-block mt-2 text-xs bg-blue-600 text-white px-2 py-1">New</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-900 border border-slate-700 flex flex-col max-h-[calc(100vh-250px)]">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-xl font-bold text-white">{conversations[selectedConversation].vendor}</h2>
            <p className="text-slate-400 text-sm">Last active {conversations[selectedConversation].time}</p>
          </div>

          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {conversations[selectedConversation].messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.sender === 'me' ? 'justify-end' : ''}`}>
                {msg.sender !== 'me' && (
                  <div className="w-10 h-10 bg-slate-700 border border-slate-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    V
                  </div>
                )}
                <div className="flex-1 max-w-md">
                  <div className={`p-4 ${msg.sender === 'me' ? 'bg-blue-600 border border-blue-500' : 'bg-slate-800 border border-slate-700'}`}>
                    <p className="text-white">{msg.text}</p>
                  </div>
                  <span className="text-xs text-slate-500 mt-1 block">{msg.time}</span>
                </div>
                {msg.sender === 'me' && (
                  <div className="w-10 h-10 bg-blue-600 border border-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                    M
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-6 border-t border-slate-700">
            <div className="flex gap-3">
              <button className="p-3 bg-slate-800 border border-slate-700 hover:border-blue-500 transition-colors">
                <Upload size={20} className="text-blue-400" />
              </button>
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-slate-800 border border-slate-700 px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button className="px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors flex items-center gap-2">
                <Send size={20} />
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 border-b border-slate-700 p-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 border-2 border-blue-500 flex items-center justify-center font-bold text-xl">E</div>
          <span className="text-xl font-bold">EventFlow</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white">
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar */}
      <nav className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block w-full md:w-64 bg-slate-900 border-r border-slate-700 md:sticky md:top-0 md:h-screen overflow-y-auto`}>
        <div className="hidden md:block p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 border-2 border-blue-500 flex items-center justify-center font-bold text-2xl">E</div>
            <div>
              <h1 className="text-xl font-bold">EventFlow</h1>
              <p className="text-xs text-slate-400">Event Planning</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Home },
            { id: 'events', label: 'Events', icon: Calendar },
            { id: 'vendors', label: 'Vendors', icon: Users },
            { id: 'tasks', label: 'Tasks', icon: CheckCircle },
            { id: 'budget', label: 'Budget', icon: DollarSign },
            { id: 'guests', label: 'Guest List', icon: Users },
            { id: 'timeline', label: 'Timeline', icon: Clock },
            { id: 'messages', label: 'Messages', icon: MessageSquare },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                  activeTab === item.id 
                    ? 'bg-blue-600 border border-blue-500 text-white' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
                {item.id === 'messages' && conversations.filter(c => c.unread).length > 0 && (
                  <span className="ml-auto bg-red-600 text-white text-xs px-2 py-1">{conversations.filter(c => c.unread).length}</span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'events' && <EventsView />}
        {activeTab === 'vendors' && <VendorsView />}
        {activeTab === 'tasks' && <TaskManager />}
        {activeTab === 'budget' && <BudgetTracker />}
        {activeTab === 'guests' && <GuestListPreview />}
        {activeTab === 'timeline' && <TimelineView />}
        {activeTab === 'messages' && <MessagesView />}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <div className="bg-slate-900 border border-slate-700 p-6">
              <p className="text-slate-400">Settings panel coming soon...</p>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {showCreateEvent && <CreateEventModal />}
      {showVendorModal && selectedVendor && <VendorModal vendor={selectedVendor} />}
    </div>
  );
}