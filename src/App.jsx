<button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}><Menu size={20} /></button>
      </div>

      <nav className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block w-full md:w-56 bg-white border-r border-slate-200 md:sticky md:top-0 md:h-screen overflow-y-auto`}>
        <div className="hidden md:block p-5 border-b border-slate-200">
          <h1 className="text-lg font-bold text-slate-900">Athar UX</h1>
          <p className="text-xs text-slate-500 mt-1">Event planning platform</p>
        </div>

        <div className="p-3 space-y-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Home },
            { id: 'events', label: 'Events', icon: Calendar },
            { id: 'vendors', label: 'Vendors', icon: Building2 },
            { id: 'venues', label: 'Venues', icon: MapPin },
            { id: 'clients', label: 'Clients', icon: Users },
            { id: 'messages', label: 'Messages', icon: MessageSquare },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(item => {
            const Icon = item.icon;
            return (
              <button key={item.id} onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm ${activeTab === item.id ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                <Icon size={18} /><span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto">
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">{events.length}</div>
              <div className="text-xs text-slate-500">Total Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">{tasks.filter(t => t.status === 'completed').length}</div>
              <div className="text-xs text-slate-500">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">{conversations.filter(c => c.unread).length}</div>
              <div className="text-xs text-slate-500">Unread</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Search..." className="bg-slate-50 border border-slate-200 pl-9 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64" />
            </div>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
                <p className="text-sm text-gray-600">Overview of all your events and activities</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-300 p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-5">
                    <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
                    <button onClick={() => setShowCreateEvent(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium flex items-center gap-2 shadow-sm"><Plus size={14} />New</button>
                  </div>
                  <div className="space-y-3">
                    {events.map(event => (
                      <div key={event.id} onClick={() => { setSelectedEvent(event); setShowEventDetail(true); }}
                        className="border border-gray-300 p-4 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all bg-white">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-sm text-gray-900">{event.name}</h3>
                          <span className={`text-xs px-2 py-1 font-semibold ${event.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{event.status}</span>
                        </div>
                        <div className="text-xs text-gray-600 mb-3 font-medium">{new Date(event.date).toLocaleDateString()} • {event.guests} guests</div>
                        <div className="w-full bg-gray-200 h-2"><div className="bg-blue-600 h-full" style={{width: `${(event.completed/event.tasks)*100}%`}}></div></div>
                        <div className="text-xs text-gray-600 mt-2 font-medium">{event.completed}/{event.tasks} tasks completed</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white border border-gray-300 p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-5">High Priority Tasks</h2>
                    <div className="space-y-2">
                      {tasks.filter(t => t.priority === 'high' && t.status !== 'completed').map(task => (
                        <div key={task.id} onClick={() => { setSelectedTask(task); setShowTaskDetail(true); }} className="border border-gray-300 p-4 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all bg-white">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-red-600 mt-2 flex-shrink-0"></div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-sm text-gray-900">{task.title}</h3>
                              <p className="text-xs text-gray-600 mt-1 font-medium">{task.event}</p>
                              <span className="text-xs text-gray-600 font-medium">Due {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white border border-gray-300 p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-5">Recent Activity</h2>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">EC</div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 font-medium">Elegant Catering sent menu proposal</p>
                          <p className="text-xs text-gray-600 mt-1">10:30 AM</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-emerald-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">✓</div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 font-medium">Venue contract completed</p>
                          <p className="text-xs text-gray-600 mt-1">Yesterday</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">SM</div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 font-medium">Sarah Mitchell joined team</p>
                          <p className="text-xs text-gray-600 mt-1">2 days ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900">Events</h1>
                <button onClick={() => setShowCreateEvent(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm flex items-center gap-2"><Plus size={16} />Create Event</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.map(event => (
                  <div key={event.id} onClick={() => { setSelectedEvent(event); setShowEventDetail(true); }}
                    className="bg-white border border-slate-200 p-5 hover:border-blue-300 hover:shadow-md cursor-pointer">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">{event.name}</h3>
                        <span className="text-xs text-slate-600">{event.type}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 font-medium ${event.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{event.status}</span>
                    </div>
                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex items-center gap-2 text-slate-600"><Calendar size={14} />{new Date(event.date).toLocaleDateString()}</div>
                      <div className="flex items-center gap-2 text-slate-600"><Users size={14} />{event.guests} guests</div>
                      <div className="flex items-center gap-2 text-slate-600"><DollarSign size={14} />${event.spent.toLocaleString()} / ${event.budget.toLocaleString()}</div>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 p-3">
                      <div className="flex justify-between text-xs mb-2"><span className="text-slate-600">Progress</span><span className="font-semibold text-slate-900">{Math.round((event.completed/event.tasks)*100)}%</span></div>
                      <div className="w-full bg-slate-200 h-1.5"><div className="bg-blue-600 h-full" style={{width: `${(event.completed/event.tasks)*100}%`}}></div></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'vendors' && (
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-slate-900">Vendors</h1>

              <div className="bg-white border border-slate-200 p-5">
                <div className="flex gap-3 mb-5">
                  <input type="text" placeholder="Search vendors..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-slate-50 border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>All</option>
                    <option>Catering</option>
                    <option>Entertainment</option>
                    <option>Florals</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredVendors.map(vendor => (
                    <div key={vendor.id} onClick={() => { setSelectedVendor(vendor); setShowVendorModal(true); }}
                      className="border border-slate-200 p-4 hover:border-blue-300 hover:shadow-sm cursor-pointer">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-1 bg-slate-100 px-2 py-1">
                          <Star className="text-amber-500 fill-amber-500" size={12} />
                          <span className="text-xs font-semibold text-slate-900">{vendor.rating}</span>
                        </div>
                        {vendor.booked && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 font-medium">Booked</span>}
                      </div>
                      <h3 className="text-base font-semibold text-slate-900 mb-1">{vendor.name}</h3>
                      <p className="text-xs text-blue-600 mb-3">{vendor.category}</p>
                      <div className="flex justify-between text-xs">
                        <span className="text-emerald-600 font-semibold">{vendor.price}</span>
                        <span className="text-slate-500">{vendor.location}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'venues' && (
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-slate-900">Venues</h1>

              <div className="bg-white border border-slate-200 p-5">
                <div className="mb-5">
                  <input type="text" placeholder="Search venues..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredVenues.map(venue => (
                    <div key={venue.id} className="border border-slate-200 p-4 hover:border-blue-300 hover:shadow-sm cursor-pointer">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-1 bg-slate-100 px-2 py-1">
                          <Star className="text-amber-500 fill-amber-500" size={12} />
                          <span className="text-xs font-semibold text-slate-900">{venue.rating}</span>
                        </div>
                        {venue.booked && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 font-medium">Booked</span>}
                      </div>
                      <h3 className="text-base font-semibold text-slate-900 mb-1">{venue.name}</h3>
                      <p className="text-xs text-slate-600 mb-3 flex items-center gap-1"><MapPin size={12} />{venue.location}</p>
                      <div className="flex justify-between text-xs mb-3">
                        <span className="text-slate-600">Capacity: {venue.capacity}</span>
                        <span className="text-emerald-600 font-semibold">{venue.price}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {venue.amenities.slice(0, 2).map((amenity, idx) => (
                          <span key={idx} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5">{amenity}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-slate-900">Messages</h1>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 p-4">
                  <h2 className="text-base font-semibold text-slate-900 mb-4">Conversations</h2>
                  <div className="space-y-2">
                    {conversations.map((conv, idx) => (
                      <div key={conv.id} onClick={() => setSelectedConversation(idx)}
                        className={`p-3 cursor-pointer border ${selectedConversation === idx ? 'bg-blue-50 border-blue-200' : 'border-slate-200 hover:bg-slate-50'}`}>
                        <h3 className="font-semibold text-sm text-slate-900 mb-1">{conv.vendor}</h3>
                        <p className="text-xs text-slate-600 truncate">{conv.lastMessage}</p>
                        {conv.unread && <span className="inline-block mt-2 text-xs bg-blue-600 text-white px-2 py-0.5 font-medium">New</span>}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-2 bg-white border border-slate-200 flex flex-col">
                  <div className="p-5 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900">{conversations[selectedConversation].vendor}</h2>
                  </div>

                  <div className="flex-1 p-5 space-y-4 overflow-y-auto max-h-[500px]">
                    {conversations[selectedConversation].messages.map((msg, idx) => (
                      <div key={idx} className={`flex gap-3 ${msg.sender === 'me' ? 'justify-end' : ''}`}>
                        <div className={`p-3 max-w-md text-sm ${msg.sender === 'me' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-900'}`}>
                          <p>{msg.text}</p>
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {msg.attachments.map((file, i) => (
                                <div key={i} className="flex items-center gap-1 text-xs opacity-80">
                                  <Paperclip size={10} />{file}
                                </div>
                              ))}
                            </div>
                          )}
                          <span className={`text-xs mt-1 block ${msg.sender === 'me' ? 'text-blue-100' : 'text-slate-500'}`}>{msg.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-5 border-t border-slate-200">
                    <div className="flex gap-3">
                      <button className="p-2 border border-slate-200 hover:bg-slate-50"><Upload size={18} className="text-slate-600" /></button>
                      <input type="text" value={messageInput} onChange={(e) => setMessageInput(e.target.value)} placeholder="Type message..."
                        className="flex-1 bg-slate-50 border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <button className="px-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2"><Send size={16} />Send</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'clients' || activeTab === 'settings') && (
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-slate-900 capitalize">{activeTab}</h1>
              <div className="bg-white border border-slate-200 p-8 text-center">
                <p className="text-slate-600">This section is coming soon...</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {showCreateEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 w-full max-w-2xl">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Create New Event</h2>
              <button onClick={() => setShowCreateEvent(false)} className="text-slate-400 hover:text-slate-900"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <input type="text" placeholder="Event Name" className="w-full bg-slate-50 border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <select className="w-full bg-slate-50 border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Wedding</option>
                <option>Corporate</option>
                <option>Birthday</option>
                <option>Conference</option>
              </select>
              <input type="date" className="w-full bg-slate-50 border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="number" placeholder="Budget ($)" className="w-full bg-slate-50 border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button onClick={() => setShowCreateEvent(false)} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 font-semibold">
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}

      {showVendorModal && selectedVendor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 w-full max-w-2xl">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{selectedVendor.name}</h2>
                <p className="text-sm text-blue-600 mt-1">{selectedVendor.category}</p>
              </div>
              <button onClick={() => setShowVendorModal(false)} className="text-slate-400 hover:text-slate-900"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="text-amber-500 fill-amber-500" size={16} />
                  <span className="font-bold text-slate-900">{selectedVendor.rating}</span>
                  <span className="text-slate-600">({selectedVendor.reviews} reviews)</span>
                </div>
                <div className="text-emerald-600 font-bold">{selectedVendor.price}</div>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin size={14} />
                  <span>{selectedVendor.location}</span>
                </div>
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">About</h3>
                <p className="text-sm text-slate-600">Professional {selectedVendor.category.toLowerCase()} services with over 10 years of experience. We specialize in creating unforgettable moments for your special day.</p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">Last Contact</h3>
                <p className="text-sm text-slate-600">{selectedVendor.lastContact}</p>
              </div>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5">Send Inquiry</button>
                <button className="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-2.5">Save to Favorites</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEventDetail && selectedEvent && <EventDetailView event={selectedEvent} />}
      {showTaskDetail && selectedTask && <TaskDetailModal task={selectedTask} />}
    </div>
  );
}                          <span className={`px-2 py-0.5 text-xs font-medium ${task.priority === 'high' ? 'bg-red-100 text-red-700' : task.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{task.priority}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 text-xs font-medium ${task.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : task.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>{task.status}</span>
                        </td>
                        <td className="py-3 px-4 text-center text-slate-600">{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {taskView === 'board' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['pending', 'in-progress', 'completed'].map(status => (
                  <div key={status} className="bg-slate-50 border border-slate-200 p-4">
                    <h3 className="font-semibold text-slate-900 capitalize mb-3 text-sm">{status.replace('-', ' ')}</h3>
                    <div className="space-y-2">
                      {tasks.filter(t => t.event === event.name && t.status === status).map(task => (
                        <div key={task.id} onClick={() => { setSelectedTask(task); setShowTaskDetail(true); }} className="bg-white border border-slate-200 p-3 cursor-pointer hover:shadow-md">
                          <h4 className="font-medium text-slate-900 text-sm mb-2">{task.title}</h4>
                          <div className="flex items-center justify-between text-xs">
                            <span className={`px-2 py-0.5 ${task.priority === 'high' ? 'bg-red-100 text-red-700' : task.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{task.priority}</span>
                            <span className="text-slate-500">{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeEventTab === 'team' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-900">Team Members</h2>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm flex items-center gap-2"><UserPlus size={16} />Add Member</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {event.team.map(member => (
                <div key={member.id} className="bg-white border border-slate-200 p-5">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 bg-blue-600 flex items-center justify-center font-bold text-white">{member.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 mb-1">{member.name}</h3>
                      <p className="text-sm text-blue-600">{member.role}</p>
                    </div>
                  </div>
                  <div className="text-sm text-slate-600 flex items-center gap-2"><Mail size={12} /><span className="truncate">{member.email}</span></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeEventTab === 'budget' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900">Budget Breakdown</h2>
            <div className="bg-white border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-slate-600 font-medium">Category</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-medium">Vendor</th>
                  <th className="text-right py-3 px-4 text-slate-600 font-medium">Amount</th>
                  <th className="text-right py-3 px-4 text-slate-600 font-medium">Paid</th>
                  <th className="text-center py-3 px-4 text-slate-600 font-medium">Status</th>
                </tr></thead>
                <tbody>
                  {budgetItems.filter(i => i.event === event.name).map(item => (
                    <tr key={item.id} className="border-b border-slate-100">
                      <td className="py-3 px-4 text-slate-900">{item.category}</td>
                      <td className="py-3 px-4 text-slate-600">{item.vendor}</td>
                      <td className="py-3 px-4 text-right text-slate-900">${item.amount.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-emerald-600">${item.paid.toLocaleString()}</td>
                      <td className="py-3 px-4 text-center"><span className={`px-2 py-0.5 text-xs font-medium ${item.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : item.status === 'partial' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{item.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeEventTab === 'guests' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-900">Guest List</h2>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm flex items-center gap-2"><Plus size={16} />Add Guest</button>
            </div>
            <div className="bg-white border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-slate-600 font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-medium">Email</th>
                  <th className="text-center py-3 px-4 text-slate-600 font-medium">RSVP</th>
                  <th className="text-center py-3 px-4 text-slate-600 font-medium">Table</th>
                </tr></thead>
                <tbody>
                  {guests.filter(g => g.event === event.name).map(guest => (
                    <tr key={guest.id} className="border-b border-slate-100">
                      <td className="py-3 px-4 text-slate-900">{guest.name}</td>
                      <td className="py-3 px-4 text-slate-600">{guest.email}</td>
                      <td className="py-3 px-4 text-center"><span className={`px-2 py-0.5 text-xs font-medium ${guest.rsvp === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{guest.rsvp}</span></td>
                      <td className="py-3 px-4 text-center text-slate-600">{guest.table}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col md:flex-row">
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="text-lg font-bold text-slate-900">Athar UX</div>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}><Menu size={20import React, { useState } from 'react';
import { Calendar, Users, MessageSquare, Search, Plus, X, Send, CheckCircle, Clock, DollarSign, MapPin, Star, Upload, Menu, Home, Settings, UserPlus, Mail, Edit, Building2, FileText, BarChart3, ChevronRight, ChevronDown, Paperclip, Tag, Flag, MoreVertical, Filter } from 'lucide-react';

export default function EventPlannerApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [messageInput, setMessageInput] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(0);
  const [activeEventTab, setActiveEventTab] = useState('overview');
  const [taskView, setTaskView] = useState('list'); // list, board, calendar

  const events = [
    { 
      id: 1, name: 'Summer Gala 2025', date: '2025-06-15', budget: 50000, spent: 32000, 
      guests: 250, confirmed: 180, status: 'active', vendors: 8, tasks: 24, completed: 18, 
      type: 'Corporate', location: 'Grand Ballroom, Downtown',
      description: 'Annual corporate gala celebrating company achievements and milestones.',
      team: [
        { id: 1, name: 'Sarah Mitchell', role: 'Lead Planner', email: 'sarah@eventflow.com', avatar: 'SM' },
        { id: 2, name: 'James Cooper', role: 'Vendor Coordinator', email: 'james@eventflow.com', avatar: 'JC' },
        { id: 3, name: 'Emily Rodriguez', role: 'Guest Manager', email: 'emily@eventflow.com', avatar: 'ER' }
      ]
    },
    { 
      id: 2, name: 'Thompson Wedding', date: '2025-07-22', budget: 75000, spent: 45000,
      guests: 180, confirmed: 150, status: 'active', vendors: 12, tasks: 31, completed: 22,
      type: 'Wedding', location: 'Crystal Palace, Waterfront',
      description: 'Elegant waterfront wedding celebration.',
      team: [{ id: 1, name: 'Sarah Mitchell', role: 'Lead Planner', email: 'sarah@eventflow.com', avatar: 'SM' }]
    },
    { 
      id: 3, name: 'Tech Conference 2025', date: '2025-08-10', budget: 120000, spent: 15000,
      guests: 500, confirmed: 320, status: 'planning', vendors: 5, tasks: 42, completed: 8,
      type: 'Conference', location: 'Convention Center',
      description: 'Three-day technology conference.',
      team: [{ id: 1, name: 'Sarah Mitchell', role: 'Lead Planner', email: 'sarah@eventflow.com', avatar: 'SM' }]
    }
  ];

  const vendors = [
    { id: 1, name: 'Elegant Catering Co.', category: 'Catering', rating: 4.9, price: '$$$$', location: 'Downtown', reviews: 127, booked: true, lastContact: '2 days ago' },
    { id: 2, name: 'Harmony DJ Services', category: 'Entertainment', rating: 4.8, price: '$$$', location: 'Citywide', reviews: 89, booked: true, lastContact: '1 week ago' },
    { id: 3, name: 'Bloom & Petal', category: 'Florals', rating: 5.0, price: '$$$', location: 'Westside', reviews: 156, booked: false, lastContact: 'Never' },
    { id: 4, name: 'Gourmet Delights', category: 'Catering', rating: 4.8, price: '$$$', location: 'Midtown', reviews: 112, booked: false, lastContact: '1 month ago' },
    { id: 5, name: 'Live Band Collective', category: 'Entertainment', rating: 4.7, price: '$$$$', location: 'Downtown', reviews: 78, booked: false, lastContact: 'Never' }
  ];

  const venues = [
    { id: 1, name: 'Grand Ballroom', location: 'Downtown', capacity: 300, price: '$$$$$', rating: 4.7, reviews: 203, booked: true, amenities: ['Kitchen', 'Parking', 'AV Equipment'] },
    { id: 2, name: 'Crystal Palace', location: 'Waterfront', capacity: 250, price: '$$$$', rating: 4.8, reviews: 189, booked: false, amenities: ['Waterfront', 'Indoor/Outdoor', 'Catering'] },
    { id: 3, name: 'Convention Center', location: 'Tech District', capacity: 1000, price: '$$$$$', rating: 4.6, reviews: 267, booked: false, amenities: ['Multiple Rooms', 'Tech Setup', 'Catering'] },
    { id: 4, name: 'Garden Estate', location: 'Suburbs', capacity: 150, price: '$$$', rating: 4.9, reviews: 145, booked: false, amenities: ['Outdoor', 'Gardens', 'Tents Available'] }
  ];

  const conversations = [
    { id: 1, vendor: 'Elegant Catering Co.', lastMessage: 'Menu proposal attached', time: '10:30 AM', unread: true,
      messages: [
        { sender: 'vendor', text: 'Hi! Thanks for reaching out about catering.', time: '9:15 AM', attachments: [] },
        { sender: 'me', text: 'We need catering for 250 guests.', time: '9:20 AM', attachments: [] },
        { sender: 'vendor', text: 'Menu proposal attached for your review', time: '10:30 AM', attachments: ['menu-proposal.pdf'] }
      ]
    },
    { id: 2, vendor: 'Harmony DJ Services', lastMessage: 'Confirming booking', time: '9:15 AM', unread: false,
      messages: [{ sender: 'vendor', text: 'Confirming booking for June 15th.', time: '9:15 AM', attachments: [] }]
    }
  ];

  const tasks = [
    { 
      id: 1, title: 'Finalize menu with caterer', event: 'Summer Gala 2025', dueDate: '2025-05-01', 
      status: 'in-progress', priority: 'high', assignedTo: 'James Cooper', createdBy: 'Sarah Mitchell',
      description: 'Review and approve final menu selections for the gala. Ensure dietary restrictions are accommodated.',
      subtasks: [
        { id: 1, title: 'Review menu options', completed: true },
        { id: 2, title: 'Check dietary accommodations', completed: true },
        { id: 3, title: 'Get client approval', completed: false },
        { id: 4, title: 'Finalize with caterer', completed: false }
      ],
      tags: ['catering', 'urgent'],
      comments: [
        { user: 'James Cooper', text: 'Menu options look great. Awaiting client feedback.', time: '2 hours ago' }
      ],
      attachments: ['menu-options.pdf', 'dietary-requirements.xlsx']
    },
    { 
      id: 2, title: 'Send venue contract', event: 'Thompson Wedding', dueDate: '2025-04-28', 
      status: 'completed', priority: 'high', assignedTo: 'Sarah Mitchell', createdBy: 'Sarah Mitchell',
      description: 'Prepare and send signed venue contract to Grand Ballroom.',
      subtasks: [
        { id: 1, title: 'Review contract terms', completed: true },
        { id: 2, title: 'Get signatures', completed: true },
        { id: 3, title: 'Send to venue', completed: true }
      ],
      tags: ['legal', 'venue'],
      comments: [],
      attachments: ['venue-contract-signed.pdf']
    },
    { 
      id: 3, title: 'Confirm DJ setup requirements', event: 'Summer Gala 2025', dueDate: '2025-05-10', 
      status: 'pending', priority: 'medium', assignedTo: 'Emily Rodriguez', createdBy: 'James Cooper',
      description: 'Coordinate with DJ to confirm equipment needs, power requirements, and setup timing.',
      subtasks: [
        { id: 1, title: 'Contact DJ service', completed: false },
        { id: 2, title: 'Confirm power requirements', completed: false },
        { id: 3, title: 'Schedule setup time', completed: false }
      ],
      tags: ['entertainment', 'logistics'],
      comments: [],
      attachments: []
    },
    { 
      id: 4, title: 'Review floral samples', event: 'Thompson Wedding', dueDate: '2025-04-30', 
      status: 'in-progress', priority: 'high', assignedTo: 'Sarah Mitchell', createdBy: 'Sarah Mitchell',
      description: 'Meet with florist to review centerpiece and bouquet samples.',
      subtasks: [
        { id: 1, title: 'Schedule appointment', completed: true },
        { id: 2, title: 'Review samples', completed: false },
        { id: 3, title: 'Select final designs', completed: false }
      ],
      tags: ['florals', 'vendor-meeting'],
      comments: [
        { user: 'Sarah Mitchell', text: 'Appointment scheduled for Friday 2pm', time: '1 day ago' }
      ],
      attachments: ['floral-inspiration.jpg']
    }
  ];

  const budgetItems = [
    { id: 1, category: 'Venue', vendor: 'Grand Ballroom', amount: 12000, paid: 12000, status: 'paid', event: 'Summer Gala 2025', dueDate: '2025-03-01' },
    { id: 2, category: 'Catering', vendor: 'Elegant Catering', amount: 15000, paid: 7500, status: 'partial', event: 'Summer Gala 2025', dueDate: '2025-06-01' },
    { id: 3, category: 'Entertainment', vendor: 'Harmony DJ', amount: 2500, paid: 0, status: 'pending', event: 'Summer Gala 2025', dueDate: '2025-06-10' }
  ];

  const guests = [
    { id: 1, name: 'John Smith', email: 'john@email.com', rsvp: 'confirmed', plusOne: true, event: 'Summer Gala 2025', table: 'A1', dietaryRestrictions: 'Vegetarian' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@email.com', rsvp: 'confirmed', plusOne: false, event: 'Summer Gala 2025', table: 'A1', dietaryRestrictions: 'None' },
    { id: 3, name: 'Michael Chen', email: 'michael@email.com', rsvp: 'pending', plusOne: true, event: 'Summer Gala 2025', table: 'B2', dietaryRestrictions: 'Gluten-free' }
  ];

  const filteredVendors = vendors.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || v.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredVenues = venues.filter(v => {
    return v.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const TaskDetailModal = ({ task }) => (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
      <div className="bg-white w-full md:max-w-4xl md:max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex justify-between items-start">
          <div className="flex-1">
            <input type="text" defaultValue={task.title} className="text-xl font-semibold text-slate-900 border-none focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />
            <div className="flex items-center gap-3 mt-2">
              <span className={`text-xs px-2 py-1 ${task.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : task.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>{task.status}</span>
              <span className={`text-xs px-2 py-1 ${task.priority === 'high' ? 'bg-red-100 text-red-700' : task.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{task.priority}</span>
            </div>
          </div>
          <button onClick={() => setShowTaskDetail(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Description</label>
                <textarea rows="3" defaultValue={task.description} className="w-full bg-slate-50 border border-slate-200 p-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-slate-700">Subtasks</label>
                  <span className="text-xs text-slate-500">{task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} completed</span>
                </div>
                <div className="space-y-2">
                  {task.subtasks.map(subtask => (
                    <div key={subtask.id} className="flex items-center gap-3 p-2 hover:bg-slate-50">
                      <input type="checkbox" checked={subtask.completed} className="w-4 h-4 text-blue-600" readOnly />
                      <span className={`text-sm flex-1 ${subtask.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>{subtask.title}</span>
                    </div>
                  ))}
                  <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-2"><Plus size={14} />Add subtask</button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-3 block">Comments</label>
                <div className="space-y-3">
                  {task.comments.map((comment, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="w-8 h-8 bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">{comment.user.split(' ').map(n => n[0]).join('')}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-900">{comment.user}</span>
                          <span className="text-xs text-slate-400">{comment.time}</span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-3 mt-4">
                    <div className="w-8 h-8 bg-slate-300 flex items-center justify-center text-slate-600 text-xs font-semibold">You</div>
                    <input type="text" placeholder="Add a comment..." className="flex-1 bg-slate-50 border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-2 block">ASSIGNED TO</label>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">{task.assignedTo.split(' ').map(n => n[0]).join('')}</div>
                  <span className="text-sm text-slate-700">{task.assignedTo}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 mb-2 block">DUE DATE</label>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Calendar size={14} />
                  {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 mb-2 block">EVENT</label>
                <div className="text-sm text-slate-700">{task.event}</div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 mb-2 block">TAGS</label>
                <div className="flex flex-wrap gap-2">
                  {task.tags.map(tag => (
                    <span key={tag} className="bg-slate-100 text-slate-600 px-2 py-1 text-xs">{tag}</span>
                  ))}
                </div>
              </div>

              {task.attachments.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-2 block">ATTACHMENTS</label>
                  <div className="space-y-2">
                    {task.attachments.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-slate-700 hover:bg-slate-50 p-2 cursor-pointer">
                        <Paperclip size={14} />
                        <span className="truncate">{file}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 text-sm font-medium flex items-center justify-center gap-2">
                <Paperclip size={14} />Add Attachment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const EventDetailView = ({ event }) => (
    <div className="fixed inset-0 bg-slate-100 z-50 overflow-y-auto">
      <div className="bg-white border-b border-slate-200 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => setShowEventDetail(false)} className="text-slate-600 hover:text-slate-900 flex items-center gap-2 text-sm font-medium">
              <X size={18} /> Back to Events
            </button>
            <div className="flex gap-2">
              <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 text-sm flex items-center gap-2">
                <Edit size={14} /> Edit
              </button>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{event.name}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            <span className="flex items-center gap-1"><Calendar size={14} />{new Date(event.date).toLocaleDateString()}</span>
            <span className="flex items-center gap-1"><MapPin size={14} />{event.location}</span>
            <span className={`px-2 py-0.5 text-xs font-medium ${event.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{event.status}</span>
          </div>
          <div className="flex gap-2 mt-4 border-b border-slate-200">
            {['overview', 'team', 'vendors', 'tasks', 'budget', 'guests'].map(tab => (
              <button key={tab} onClick={() => setActiveEventTab(tab)}
                className={`pb-2 px-3 text-sm font-medium capitalize ${activeEventTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-600 hover:text-slate-900'}`}>
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {activeEventTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white border border-slate-200 p-5">
                <h2 className="text-lg font-semibold text-slate-900 mb-3">Description</h2>
                <p className="text-slate-600 text-sm leading-relaxed">{event.description}</p>
              </div>
              <div className="bg-white border border-slate-200 p-5">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Progress</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <span className="text-slate-600">Tasks Completion</span>
                      <span className="text-slate-900 font-medium">{Math.round((event.completed / event.tasks) * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2"><div className="bg-blue-600 h-full" style={{width: `${(event.completed / event.tasks) * 100}%`}}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <span className="text-slate-600">Budget Used</span>
                      <span className="text-slate-900 font-medium">{Math.round((event.spent / event.budget) * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2"><div className="bg-emerald-500 h-full" style={{width: `${(event.spent / event.budget) * 100}%`}}></div></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 p-5">
                <h2 className="text-base font-semibold text-slate-900 mb-4">Quick Stats</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-slate-600">Budget</span><span className="text-slate-900 font-medium">${event.budget.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-slate-600">Spent</span><span className="text-emerald-600 font-medium">${event.spent.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-slate-600">Guests</span><span className="text-slate-900 font-medium">{event.guests}</span></div>
                  <div className="flex justify-between"><span className="text-slate-600">Confirmed</span><span className="text-emerald-600 font-medium">{event.confirmed}</span></div>
                </div>
              </div>
              <div className="bg-white border border-slate-200 p-5">
                <h2 className="text-base font-semibold text-slate-900 mb-4">Team</h2>
                <div className="space-y-3">
                  {event.team.map(member => (
                    <div key={member.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 flex items-center justify-center font-semibold text-white text-xs">{member.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-900 font-medium text-sm truncate">{member.name}</p>
                        <p className="text-xs text-slate-500 truncate">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeEventTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-slate-900">Tasks</h2>
                <div className="flex gap-1 bg-slate-100 p-1">
                  <button onClick={() => setTaskView('list')} className={`px-3 py-1 text-xs font-medium ${taskView === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}>List</button>
                  <button onClick={() => setTaskView('board')} className={`px-3 py-1 text-xs font-medium ${taskView === 'board' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}>Board</button>
                </div>
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm flex items-center gap-2"><Plus size={16} />Add Task</button>
            </div>

            {taskView === 'list' && (
              <div className="bg-white border border-slate-200">
                <table className="w-full text-sm">
                  <thead><tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-slate-600 font-medium">Task</th>
                    <th className="text-left py-3 px-4 text-slate-600 font-medium">Assigned</th>
                    <th className="text-center py-3 px-4 text-slate-600 font-medium">Priority</th>
                    <th className="text-center py-3 px-4 text-slate-600 font-medium">Status</th>
                    <th className="text-center py-3 px-4 text-slate-600 font-medium">Due</th>
                  </tr></thead>
                  <tbody>
                    {tasks.filter(t => t.event === event.name).map(task => (
                      <tr key={task.id} onClick={() => { setSelectedTask(task); setShowTaskDetail(true); }} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer">
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-900">{task.title}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} subtasks</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">{task.assignedTo.split(' ').map(n => n[0]).join('')}</div>
                            <span className="text-slate-700">{task.assignedTo}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 text-xs font-medium ${task.priority === 'high' ? 'bg-red-100 text-red-700' : task.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{task.
