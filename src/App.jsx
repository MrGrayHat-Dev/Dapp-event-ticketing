import React, { useState, useEffect } from 'react';
import { 
  Wallet, Calendar, Ticket, Plus, MapPin, LayoutGrid, 
  Users, Tag, ShieldCheck, AlertCircle, X, Loader2, 
  Trash2, Repeat, Pencil, Minus, ShoppingBag, Clock
} from 'lucide-react';

// --- Firebase Imports ---
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, doc, addDoc, updateDoc, 
  deleteDoc, onSnapshot, runTransaction 
} from 'firebase/firestore';
import { 
  getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged 
} from 'firebase/auth';

// --- CONFIGURATION STRATEGY ---
const userConfig = {
  apiKey: "AIzaSyD2yIcuHv1ZDDrtcJSlhXPm93Xiey5vIQY",
  authDomain: "blocktix-db.firebaseapp.com",
  projectId: "blocktix-db",
  storageBucket: "blocktix-db.firebasestorage.app",
  messagingSenderId: "626656833424",
  appId: "1:626656833424:web:88ed94d60a2959d46e0d15"
};

const isEnvAvailable = typeof __firebase_config !== 'undefined';
const firebaseConfig = isEnvAvailable ? JSON.parse(__firebase_config) : userConfig;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- Initialize Firebase ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Helpers ---
const formatAddress = (addr) => addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : '';

const sendEthTransaction = async (fromAddress, toAddress, amountEth) => {
  if (!window.ethereum) throw new Error("MetaMask not found");
  const weiValue = BigInt(Math.floor(parseFloat(amountEth) * 1e18));
  const valueHex = '0x' + weiValue.toString(16);
  const params = [{ from: fromAddress, to: toAddress, value: valueHex }];
  return await window.ethereum.request({ method: 'eth_sendTransaction', params });
};

// --- Helper: Dynamic Collection Paths ---
const getCollection = (name) => {
  if (isEnvAvailable) {
    return collection(db, 'artifacts', appId, 'public', 'data', name);
  }
  return collection(db, name);
};

const getDocRef = (colName, docId) => {
  if (isEnvAvailable) {
    return doc(db, 'artifacts', appId, 'public', 'data', colName, docId);
  }
  return doc(db, colName, docId);
};

// --- Components ---

const Card = ({ children, className = "" }) => (
  <div className={`bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-lg ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
    orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[color]}`}>
      {children}
    </span>
  );
};

const Button = ({ children, onClick, variant = "primary", className = "", disabled = false, icon: Icon, loading = false, type = "button" }) => {
  const base = "flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20",
    secondary: "bg-slate-700 hover:bg-slate-600 text-slate-200",
    outline: "border border-slate-600 hover:bg-slate-700/50 text-slate-300",
    ghost: "text-slate-400 hover:text-white hover:bg-slate-800",
    danger: "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20",
    success: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} className={`${base} ${variants[variant]} ${className}`}>
      {loading ? <Loader2 size={18} className="animate-spin" /> : Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

const MarketView = ({ events, buyTicket, resaleTickets, buyResaleTicket, walletAddress, isProcessing }) => {
  const [selectedSlots, setSelectedSlots] = useState({});
  const [quantities, setQuantities] = useState({});

  const handleSlotSelect = (eventId, slot) => {
    setSelectedSlots(prev => ({...prev, [eventId]: slot}));
    setQuantities(prev => ({...prev, [eventId]: 1}));
  };

  const handleQuantityChange = (eventId, delta, max) => {
    setQuantities(prev => {
      const current = prev[eventId] || 1;
      const newVal = Math.max(1, Math.min(max, current + delta));
      return { ...prev, [eventId]: newVal };
    });
  };

  return (
    <div className="pb-24">
      <h2 className="text-2xl font-bold text-white mb-6">Primary Events</h2>
      
      {events.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl bg-slate-900/50 mb-12">
            <p className="text-slate-500 mb-2">No active events found.</p>
            <p className="text-sm text-slate-600">Be the first to create one in the Organizer tab!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in duration-300 mb-12">
            {events.map((event) => {
              const hasSlots = event.timeSlots && event.timeSlots.length > 0;
              const activeSlot = selectedSlots[event.id] || (hasSlots ? event.timeSlots[0] : null);
              
              let currentAvailability = 0;
              let maxCapacity = 0;

              if (hasSlots) {
                  currentAvailability = event.slotAvailability ? (event.slotAvailability[activeSlot] || 0) : 0;
                  maxCapacity = event.slotTotalCapacity ? (event.slotTotalCapacity[activeSlot] || 0) : 0;
              } else {
                  currentAvailability = event.remainingSeats || 0;
                  maxCapacity = event.totalSeats || 0;
              }
              
              const currentQuantity = quantities[event.id] || 1;
              const totalPrice = (event.price * currentQuantity).toFixed(4);

              return (
                <Card key={event.id} className="group hover:border-indigo-500/50 transition-all duration-300">
                    <div className={`h-48 w-full relative overflow-hidden`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${
                        event.image === 'purple' ? 'from-purple-900 via-slate-900 to-indigo-900' :
                        event.image === 'blue' ? 'from-blue-900 via-slate-900 to-cyan-900' :
                        'from-pink-900 via-slate-900 to-rose-900'
                    }`} />
                    <div className="absolute inset-0 opacity-30" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px'}}></div>
                    
                    <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-white font-mono text-sm border border-white/10">
                        {event.price} ETH
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-xl font-bold text-white mb-1 drop-shadow-lg">{event.name}</h3>
                        <div className="flex items-center text-slate-300 text-sm gap-2">
                        <MapPin size={14} /> {event.location}
                        </div>
                    </div>
                    </div>
                    
                    <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col gap-1">
                        <div className="flex items-center text-slate-400 text-sm gap-2">
                            <Calendar size={14} /> {event.date}
                        </div>
                        </div>
                        <div className="text-right">
                        <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">
                            {hasSlots ? (activeSlot ? `Slot ${activeSlot}` : 'Select Slot') : 'Available'}
                        </div>
                        <div className={`font-mono font-bold ${currentAvailability < 5 ? 'text-red-400' : 'text-emerald-400'}`}>
                            {currentAvailability} / {maxCapacity}
                        </div>
                        </div>
                    </div>

                    <div className="mb-4">
                        {hasSlots ? (
                            <>
                            <label className="text-xs text-slate-500 uppercase font-bold tracking-wider block mb-2">Select Time</label>
                            <div className="flex flex-wrap gap-2">
                            {event.timeSlots.map(slot => {
                                const seatsInSlot = event.slotAvailability ? (event.slotAvailability[slot] || 0) : 0;
                                const isSoldOut = seatsInSlot === 0;
                                const isSelected = activeSlot === slot;

                                return (
                                <button
                                key={slot}
                                disabled={isSoldOut}
                                onClick={() => handleSlotSelect(event.id, slot)}
                                className={`px-3 py-1 rounded text-xs font-mono transition-colors border ${
                                    isSoldOut 
                                    ? 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed line-through opacity-50' 
                                    : isSelected 
                                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20' 
                                        : 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600'
                                }`}
                                >
                                {slot}
                                </button>
                                );
                            })}
                            </div>
                            </>
                        ) : (
                            <div className="text-xs text-slate-500 italic bg-slate-900/50 p-2 rounded">Standard Ticket Access</div>
                        )}
                    </div>

                    <div className="mb-4 bg-slate-900/50 p-3 rounded-lg flex justify-between items-center border border-slate-700/50">
                        <span className="text-sm text-slate-400 font-medium">Quantity</span>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => handleQuantityChange(event.id, -1, currentAvailability)}
                            disabled={currentQuantity <= 1}
                            className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="font-mono font-bold w-6 text-center text-white">{currentQuantity}</span>
                          <button 
                            onClick={() => handleQuantityChange(event.id, 1, currentAvailability)}
                            disabled={currentQuantity >= currentAvailability}
                            className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button 
                        onClick={() => buyTicket(event, activeSlot, currentQuantity)} 
                        className="flex-1"
                        loading={isProcessing}
                        disabled={currentAvailability === 0 || (hasSlots && !activeSlot) || isProcessing}
                        >
                        {currentAvailability === 0 
                            ? 'Sold Out' 
                            : <span className="flex items-center gap-2"><ShoppingBag size={16}/> Mint {currentQuantity} ({totalPrice} ETH)</span>}
                        </Button>
                    </div>
                    </div>
                </Card>
              );
            })}
        </div>
      )}

      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Repeat size={24} className="text-indigo-400"/> Secondary Market (Resale)
      </h2>
      
      {resaleTickets.length === 0 ? (
        <div className="text-slate-500 italic p-4 bg-slate-900/30 rounded-lg">No resale tickets available currently.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resaleTickets.map((ticket) => (
            <Card key={ticket.id} className="border-l-4 border-l-orange-500">
              <div className="p-5">
                <div className="flex justify-between mb-2">
                  <Badge color="orange">Resale</Badge>
                  <span className="font-mono text-xs text-slate-500">#{String(ticket.id).substring(0,6)}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{ticket.eventName}</h3>
                <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                  <span>{ticket.eventDate}</span>
                  <span className="bg-slate-700 px-2 rounded">{ticket.timeSlot || 'Standard'}</span>
                </div>
                
                <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg mb-4">
                  <div>
                    <div className="text-xs text-slate-500">Original</div>
                    <div className="line-through text-slate-500">{ticket.originalPrice} ETH</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Resale Price</div>
                    <div className="font-bold text-xl text-emerald-400">{ticket.resalePrice} ETH</div>
                  </div>
                </div>

                <Button 
                  onClick={() => buyResaleTicket(ticket)} 
                  className="w-full"
                  variant="success"
                  loading={isProcessing}
                  disabled={(walletAddress && ticket.owner.toLowerCase() === walletAddress.toLowerCase()) || isProcessing}
                >
                  {walletAddress && ticket.owner.toLowerCase() === walletAddress.toLowerCase() ? 'You Own This' : 'Buy Now'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const OrganizerView = ({ events, onEventCreate, onEventUpdate, onEventDelete, walletAddress, showNotification, isProcessing }) => {
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [tempSlotTime, setTempSlotTime] = useState('');
  const [tempSlotCapacity, setTempSlotCapacity] = useState('');
  const [slotList, setSlotList] = useState([]);
  
  const [newEvent, setNewEvent] = useState({
    name: '',
    date: '',
    location: '',
    price: '',
    description: ''
  });

  const resetForm = () => {
    setNewEvent({ name: '', date: '', location: '', price: '', description: '' });
    setSlotList([]);
    setTempSlotTime('');
    setTempSlotCapacity('');
    setEditingId(null);
    setIsCreatingEvent(false);
  };

  const handleEditClick = (event) => {
    let reconstructedSlots = [];
    if (event.slotTotalCapacity && event.timeSlots) {
        reconstructedSlots = event.timeSlots.map(t => ({
            time: t,
            capacity: event.slotTotalCapacity[t] || 0
        }));
    } else if (event.timeSlots) {
        reconstructedSlots = event.timeSlots.map(t => ({ time: t, capacity: event.totalSeats }));
    }

    setNewEvent({
        name: event.name,
        date: event.date,
        location: event.location,
        price: event.price,
        description: event.description
    });
    setSlotList(reconstructedSlots);
    setEditingId(event.id);
    setIsCreatingEvent(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!walletAddress) return showNotification("Please connect wallet first", "error");
    if (slotList.length === 0) return showNotification("Please add at least one time slot", "error");
    
    const finalEventData = {
        ...newEvent,
        timeSlots: slotList.map(s => s.time),
        slotList: slotList,
        id: editingId
    };

    if (editingId) {
        onEventUpdate(finalEventData);
        resetForm();
    } else {
        onEventCreate(finalEventData); 
    }
  };

  const addSlot = () => {
    if (!tempSlotTime) return;
    if (!tempSlotCapacity || parseInt(tempSlotCapacity) <= 0) return;
    
    if (slotList.some(s => s.time === tempSlotTime)) {
        return showNotification("Slot time already exists", "error");
    }

    setSlotList([...slotList, { time: tempSlotTime, capacity: parseInt(tempSlotCapacity) }]);
    setTempSlotTime('');
    setTempSlotCapacity('');
  };

  const removeSlot = (timeToRemove) => {
    setSlotList(slotList.filter(s => s.time !== timeToRemove));
  };

  const totalCapacity = slotList.reduce((acc, curr) => acc + curr.capacity, 0);

  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-300 pb-24">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Event Dashboard</h2>
        <Button onClick={() => {
            if (isCreatingEvent) resetForm();
            else setIsCreatingEvent(true);
        }} icon={isCreatingEvent ? null : Plus} variant={isCreatingEvent ? "secondary" : "primary"}>
          {isCreatingEvent ? 'Cancel' : 'Create Event'}
        </Button>
      </div>

      {isCreatingEvent && (
        <Card className="p-6 bg-slate-800/50 border-indigo-500/30">
          <div className="mb-4 text-xl font-bold text-white">
            {editingId ? 'Edit Event' : 'Create New Event'}
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-400 mb-2">Event Name</label>
              <input 
                required
                type="text" 
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                value={newEvent.name}
                onChange={(e) => setNewEvent({...newEvent, name: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Date</label>
              <input 
                required
                type="date" 
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                value={newEvent.date}
                onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Price (ETH)</label>
              <input 
                required
                type="number" 
                step="0.001"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                value={newEvent.price}
                onChange={(e) => setNewEvent({...newEvent, price: e.target.value})}
              />
            </div>

            <div className="col-span-1 md:col-span-2 bg-slate-900/50 p-4 rounded-xl border border-slate-700">
              <label className="block text-sm font-medium text-indigo-400 mb-3 flex items-center gap-2">
                 <Clock size={16}/> Time Slots & Capacity
              </label>
              
              <div className="flex gap-2 mb-4 items-end">
                <div className="flex-1">
                    <label className="text-xs text-slate-500 mb-1 block">Time</label>
                    <input 
                    type="time" 
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={tempSlotTime}
                    onChange={(e) => setTempSlotTime(e.target.value)}
                    />
                </div>
                <div className="flex-1">
                    <label className="text-xs text-slate-500 mb-1 block">Tickets</label>
                    <input 
                    type="number" 
                    placeholder="Qty"
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={tempSlotCapacity}
                    onChange={(e) => setTempSlotCapacity(e.target.value)}
                    />
                </div>
                <Button onClick={addSlot} icon={Plus} variant="secondary" className="h-[42px]">Add</Button>
              </div>

              {slotList.length > 0 && (
                  <div className="space-y-2">
                      {slotList.map((slot, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-slate-800 px-3 py-2 rounded border border-slate-700">
                              <span className="text-sm text-white font-mono">{slot.time}</span>
                              <div className="flex items-center gap-3">
                                  <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">{slot.capacity} Seats</span>
                                  <button type="button" onClick={() => removeSlot(slot.time)} className="text-slate-500 hover:text-red-400"><X size={14}/></button>
                              </div>
                          </div>
                      ))}
                      <div className="text-right text-xs text-slate-500 mt-2">
                          Total Event Capacity: <span className="text-white font-bold">{totalCapacity}</span>
                      </div>
                  </div>
              )}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-400 mb-2">Location</label>
              <input 
                required
                type="text" 
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                value={newEvent.location}
                onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
              <textarea 
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none"
                value={newEvent.description}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
              />
            </div>

            <div className="col-span-2 flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={resetForm}>Cancel</Button>
              <Button type="submit" loading={isProcessing} icon={ShieldCheck}>{editingId ? 'Update Event' : 'Deploy Contract'}</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Events Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {events.length === 0 ? (
           <div className="p-8 text-center text-slate-500">
             No events deployed yet. Create one above!
           </div>
        ) : (
        <table className="w-full text-left">
          <thead className="bg-slate-900/50 text-slate-400 text-sm uppercase">
            <tr>
              <th className="px-6 py-4 font-medium">Event Name</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Slots</th>
              <th className="px-6 py-4 font-medium">Price</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700 text-slate-300">
            {events.map((e) => (
              <tr key={e.id} className="hover:bg-slate-700/30 transition-colors">
                <td className="px-6 py-4 font-medium text-white">{e.name}</td>
                <td className="px-6 py-4 text-sm">{e.date}</td>
                <td className="px-6 py-4 text-xs font-mono">{e.timeSlots?.length || 0} Slots</td>
                <td className="px-6 py-4 font-mono text-sm">{e.price} ETH</td>
                <td className="px-6 py-4 text-right">
                    {walletAddress && e.organizer.toLowerCase() === walletAddress.toLowerCase() && (
                        <div className="flex justify-end gap-2">
                            <button 
                                onClick={() => handleEditClick(e)}
                                className="p-2 bg-slate-700 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-lg transition-colors"
                                title="Edit Event"
                            >
                                <Pencil size={16} />
                            </button>
                            <button 
                                onClick={() => onEventDelete(e.id)}
                                className="p-2 bg-slate-700 hover:bg-red-600 text-slate-300 hover:text-white rounded-lg transition-colors"
                                title="Delete Event"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
};

const TicketsView = ({ myTickets, handleSellTicket, cancelListing, setActiveTab, walletAddress }) => {
  const [sellingId, setSellingId] = useState(null);
  const [resalePriceInput, setResalePriceInput] = useState('');

  const initiateSell = (id) => {
    setSellingId(id);
    setResalePriceInput('');
  };

  const confirmSell = (id) => {
    if (!resalePriceInput || parseFloat(resalePriceInput) <= 0) return;
    handleSellTicket(id, parseFloat(resalePriceInput));
    setSellingId(null);
  };

  return (
    <div className="max-w-4xl mx-auto pb-24">
      {myTickets.length === 0 ? (
        <div className="text-center py-20">
          <div className="bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Ticket className="text-slate-500 w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">No Tickets Yet</h3>
          <p className="text-slate-400 mb-8">
             {/* Improved empty state logic */}
             {!walletAddress ? "Connect your wallet to see your tickets." : "You haven't purchased any tickets yet."}
          </p>
          <Button onClick={() => setActiveTab('market')} icon={LayoutGrid}>Go to Market</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {myTickets.map((ticket) => (
            <div key={ticket.id} className="bg-white rounded-xl overflow-hidden flex shadow-lg">
              {/* Stub */}
              <div className="bg-indigo-600 p-6 flex flex-col justify-between items-center w-24 relative">
                <div className="border-2 border-dashed border-white/30 rounded-full w-4 h-4 absolute -top-2 left-1/2 -translate-x-1/2 bg-slate-900" />
                <div className="border-2 border-dashed border-white/30 rounded-full w-4 h-4 absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-900" />
                {/* Safe ID rendering */}
                <span className="text-white/80 font-mono text-xs rotate-180" style={{writingMode: 'vertical-rl'}}>#{String(ticket.id).substring(0,6)}</span>
                <Ticket className="text-white" />
              </div>

              {/* Info */}
              <div className="flex-1 p-5 flex flex-col justify-between relative bg-slate-50">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">{ticket.eventName}</h3>
                  <div className="flex items-center text-slate-500 text-sm gap-4 mb-4">
                    <span className="flex items-center gap-1"><Calendar size={14} /> {ticket.eventDate}</span>
                    <span className="bg-slate-200 px-2 py-0.5 rounded text-xs">{ticket.timeSlot || 'Standard'}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200">
                   {ticket.isForSale ? (
                     <div className="flex justify-between items-center">
                       <span className="text-orange-500 font-bold text-sm">Listed for {ticket.resalePrice} ETH</span>
                       <button onClick={() => cancelListing(ticket.id)} className="text-slate-400 hover:text-red-500 text-xs font-medium">Cancel</button>
                     </div>
                   ) : (
                     sellingId === ticket.id ? (
                        <div className="flex gap-2">
                           <input 
                              type="number" 
                              placeholder="Price" 
                              className="w-20 bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 text-sm"
                              value={resalePriceInput}
                              onChange={(e) => setResalePriceInput(e.target.value)}
                           />
                           <button onClick={() => confirmSell(ticket.id)} className="bg-indigo-600 text-white px-2 py-1 rounded text-xs">List</button>
                           <button onClick={() => setSellingId(null)} className="text-slate-400 px-2 text-xs">X</button>
                        </div>
                     ) : (
                       <div className="flex justify-between items-center">
                         <span className="text-emerald-600 font-bold text-sm">Active</span>
                         <button onClick={() => initiateSell(ticket.id)} className="bg-slate-200 text-slate-600 hover:bg-slate-300 px-3 py-1.5 rounded text-sm font-medium">Sell Ticket</button>
                       </div>
                     )
                   )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Main App Component ---

export default function EventTicketingApp() {
  const [user, setUser] = useState(null); 
  const [activeTab, setActiveTab] = useState('market');
  const [walletAddress, setWalletAddress] = useState(null);
  const [balance, setBalance] = useState('0.00');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState(null);

  // Data from Firestore
  const [events, setEvents] = useState([]);
  const [allTickets, setAllTickets] = useState([]);

  // --- 1. Robust Auth Connection ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Auth Initialization Warning:", error);
      }
    };
    initAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  // --- 2. Real-time Data Sync ---
  useEffect(() => {
    // Note: Checking user is restored to follow strict rules, but logic allows public reads if rules permit
    if (isEnvAvailable && !user) return; 

    // Sync Events
    const eventsRef = getCollection('events');
    const unsubEvents = onSnapshot(eventsRef, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setEvents(list.sort((a, b) => b.createdAt - a.createdAt));
    }, (err) => {
      console.error("Event Sync Error", err);
      if (err.code === 'permission-denied') {
         setNotification({ message: "Database permission denied. Enable Anonymous Auth or open Security Rules.", type: "error" });
      }
    });

    // Sync Tickets
    const ticketsRef = getCollection('tickets');
    const unsubTickets = onSnapshot(ticketsRef, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setAllTickets(list);
    }, (err) => console.error("Ticket Sync Error", err));

    return () => {
      unsubEvents();
      unsubTickets();
    };
  }, [user]);

  // --- 3. Wallet Logic ---
  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') return showNotification("MetaMask not found", "error");
    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWalletAddress(accounts[0]);
      await refreshBalance(accounts[0]);
      showNotification("Wallet Connected", "success");
    } catch (error) {
      showNotification("Connection failed", "error");
    } finally {
      setIsConnecting(false);
    }
  };

  const refreshBalance = async (address) => {
    if (!address || !window.ethereum) return;
    try {
      const balanceWei = await window.ethereum.request({ method: 'eth_getBalance', params: [address, 'latest'] });
      setBalance((parseInt(balanceWei, 16) / 10**18).toFixed(4));
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accs) => {
        setWalletAddress(accs[0] || null);
        if(accs[0]) refreshBalance(accs[0]);
      });
    }
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- 4. Transaction & Database Logic ---

  const handleCreateEvent = async (eventDataFromView) => {
    setIsProcessing(true);
    
    // Calculate total capacity from the slot list
    const totalCapacity = eventDataFromView.slotList.reduce((acc, curr) => acc + curr.capacity, 0);
    
    // Create map for fast lookup: "10:00": 50
    const slotAvailability = {};
    const slotTotalCapacity = {};
    
    eventDataFromView.slotList.forEach(slot => {
        slotAvailability[slot.time] = slot.capacity;
        slotTotalCapacity[slot.time] = slot.capacity;
    });

    const eventPayload = {
        name: eventDataFromView.name,
        date: eventDataFromView.date,
        price: parseFloat(eventDataFromView.price),
        totalSeats: totalCapacity, 
        remainingSeats: totalCapacity, 
        
        // New structure for per-slot logic
        slotAvailability: slotAvailability,
        slotTotalCapacity: slotTotalCapacity,
        
        location: eventDataFromView.location,
        description: eventDataFromView.description,
        timeSlots: eventDataFromView.timeSlots,
        organizer: walletAddress,
        image: ['blue', 'purple', 'pink'][Math.floor(Math.random() * 3)],
        createdAt: Date.now()
    };

    try {
        await sendEthTransaction(walletAddress, walletAddress, "0"); // Fake Deploy Gas
        await addDoc(getCollection('events'), eventPayload);
        showNotification("Event Published Globally!", "success");
        setTimeout(() => refreshBalance(walletAddress), 3000);
    } catch (err) {
        console.error(err);
        showNotification("Failed to create event", "error");
    } finally {
        setIsProcessing(false);
    }
  };

  const buyTicket = async (event, slot, quantity = 1) => {
    if (!walletAddress) return showNotification("Connect wallet first", "error");
    // Ensure we have a slot unless it is a legacy event without slots
    if (!slot && event.timeSlots && event.timeSlots.length > 0) return showNotification("Select a time slot", "error");
    
    setIsProcessing(true);
    try {
        const totalEthCost = (event.price * quantity).toFixed(4);
        
        // 1. Transaction
        await sendEthTransaction(walletAddress, event.organizer, totalEthCost);
        
        // 2. Optimistic Balance Update
        setBalance(prev => (parseFloat(prev) - parseFloat(totalEthCost)).toFixed(4));

        // 3. Create Ticket Docs (Bulk)
        // Use a batch write or multiple addDocs. For simplicity here: multiple awaits or Promise.all
        // Using Promise.all is faster.
        const batchPromises = [];
        for (let i = 0; i < quantity; i++) {
            batchPromises.push(addDoc(getCollection('tickets'), {
                eventId: event.id,
                eventName: event.name,
                eventDate: event.date,
                timeSlot: slot || 'Standard', // Fallback for legacy
                purchasePrice: event.price,
                resalePrice: 0,
                isForSale: false,
                owner: walletAddress,
                createdAt: Date.now()
            }));
        }
        await Promise.all(batchPromises);

        // 4. Update Event Seat Count (Transactional Update)
        const eventRef = getDocRef('events', event.id);
        
        await runTransaction(db, async (transaction) => {
            const eventDoc = await transaction.get(eventRef);
            if (!eventDoc.exists()) throw "Event does not exist!";
            
            const data = eventDoc.data();
            let newUpdateData = {};
            
            if (data.slotAvailability && slot) {
                const currentSlotSeats = data.slotAvailability[slot] || 0;
                if (currentSlotSeats < quantity) throw "Not enough seats!";
                
                const newSlotSeats = currentSlotSeats - quantity;
                const newTotalRemaining = Math.max(0, (data.remainingSeats || 0) - quantity);
                
                newUpdateData = {
                    [`slotAvailability.${slot}`]: newSlotSeats,
                    remainingSeats: newTotalRemaining
                };
            } else {
                // Legacy fallback
                const currentTotal = data.remainingSeats || 0;
                if (currentTotal < quantity) throw "Not enough seats!";
                newUpdateData = { remainingSeats: currentTotal - quantity };
            }
            
            transaction.update(eventRef, newUpdateData);
        });

        showNotification(`${quantity} Ticket(s) Minted!`, "success");
        setTimeout(() => refreshBalance(walletAddress), 4000);
    } catch (err) {
        console.error(err);
        showNotification("Purchase failed: " + (typeof err === 'string' ? err : "Unknown Error"), "error");
    } finally {
        setIsProcessing(false);
    }
  };

  const handleSell = async (ticketId, price) => {
    try {
        const ref = getDocRef('tickets', ticketId);
        await updateDoc(ref, { isForSale: true, resalePrice: price });
        showNotification("Listed on Global Market", "success");
    } catch(e) { showNotification("Error listing ticket", "error"); }
  };

  const handleBuyResale = async (ticket) => {
    if (!walletAddress) return showNotification("Connect wallet", "error");
    
    setIsProcessing(true);
    try {
        await sendEthTransaction(walletAddress, ticket.owner, ticket.resalePrice.toString());
        setBalance(prev => (parseFloat(prev) - ticket.resalePrice).toFixed(4));

        const ref = getDocRef('tickets', ticket.id);
        await updateDoc(ref, { 
            owner: walletAddress, 
            isForSale: false, 
            resalePrice: 0, 
            purchasePrice: ticket.resalePrice 
        });
        showNotification("Ticket Transferred!", "success");
        setTimeout(() => refreshBalance(walletAddress), 4000);
    } catch(e) {
        showNotification("Transfer failed", "error");
    } finally {
        setIsProcessing(false);
    }
  };

  const handleEventUpdate = async (updatedData) => {
    try {
      const eventRef = getDocRef('events', updatedData.id);
      
      // Calculate new total
      const totalCapacity = updatedData.slotList.reduce((acc, curr) => acc + curr.capacity, 0);
      
      const slotAvailability = {};
      const slotTotalCapacity = {};
      
      updatedData.slotList.forEach(slot => {
          slotAvailability[slot.time] = slot.capacity;
          slotTotalCapacity[slot.time] = slot.capacity;
      });

      await updateDoc(eventRef, {
          name: updatedData.name,
          date: updatedData.date,
          location: updatedData.location,
          description: updatedData.description,
          price: parseFloat(updatedData.price),
          timeSlots: updatedData.timeSlots,
          totalSeats: totalCapacity,
          remainingSeats: totalCapacity, 
          slotAvailability: slotAvailability,
          slotTotalCapacity: slotTotalCapacity
      });
      showNotification("Event updated!", "success");
    } catch(e) {
      console.error(e);
      showNotification("Update failed", "error");
    }
  };

  const handleEventDelete = async (id) => {
      if(confirm("Delete this event?")) {
          const ref = getDocRef('events', id);
          await deleteDoc(ref);
          showNotification("Event deleted", "success");
      }
  };

  const cancelListing = async (ticketId) => {
    try {
      const ref = getDocRef('tickets', ticketId);
      await updateDoc(ref, { isForSale: false, resalePrice: 0 });
      showNotification("Listing cancelled", "success");
    } catch(e) { showNotification("Error cancelling", "error"); }
  };

  // --- Filtering ---
  const myTickets = walletAddress 
    ? allTickets.filter(t => t.owner && t.owner.toLowerCase() === walletAddress.toLowerCase()) 
    : [];
  
  const resaleTickets = allTickets.filter(t => t.isForSale);

  return (
    <div className="min-h-screen bg-slate-950 font-sans selection:bg-indigo-500/30">
      {notification && (
        <div className={`fixed top-24 right-4 z-[60] flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl animate-in slide-in-from-right duration-300 border ${
          notification.type === 'error' ? 'bg-red-900/90 border-red-800 text-red-100' : 'bg-emerald-900/90 border-emerald-800 text-emerald-100'
        }`}>
          {notification.type === 'error' ? <AlertCircle size={18} /> : <ShieldCheck size={18} />}
          <span className="font-medium text-sm">{notification.message}</span>
        </div>
      )}

      {/* Navbar */}
      <nav className="border-b border-slate-700 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-lg"><Ticket className="text-white h-6 w-6" /></div>
              <h1 className="text-xl font-bold text-white tracking-tight hidden sm:block">BlockTix</h1>
            </div>

            <div className="flex items-center gap-4">
               <div className="hidden md:flex gap-1 bg-slate-800 p-1 rounded-lg">
                {[
                  { id: 'market', label: 'Market', icon: LayoutGrid },
                  { id: 'tickets', label: 'My Tickets', icon: Tag },
                  { id: 'organizer', label: 'Organizer', icon: Users },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      activeTab === tab.id 
                        ? 'bg-indigo-600 text-white shadow-md' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {walletAddress ? (
                <div className="flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-full pl-4 pr-1 py-1">
                  <div className="flex flex-col items-end mr-2">
                    <span className="text-xs text-slate-400 font-mono">{formatAddress(walletAddress)}</span>
                    <span className="text-sm font-bold text-indigo-400">{balance} ETH</span>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 border-2 border-slate-900" />
                </div>
              ) : (
                <Button onClick={connectWallet} icon={Wallet} loading={isConnecting}>Connect Wallet</Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile Nav */}
        <div className="md:hidden flex justify-around border-t border-slate-800 bg-slate-900 p-2">
           {[{ id: 'market', icon: LayoutGrid }, { id: 'tickets', icon: Tag }, { id: 'organizer', icon: Users }].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`p-2 rounded-lg ${activeTab === tab.id ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-400'}`}>
                <tab.icon size={20} />
              </button>
           ))}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {activeTab === 'market' && (
          <MarketView 
            events={events} 
            buyTicket={buyTicket} 
            resaleTickets={resaleTickets}
            buyResaleTicket={handleBuyResale}
            walletAddress={walletAddress}
            isProcessing={isProcessing}
          />
        )}
        
        {activeTab === 'organizer' && (
          <OrganizerView 
            events={events} 
            onEventCreate={handleCreateEvent} 
            onEventUpdate={handleEventUpdate}
            onEventDelete={handleEventDelete}
            walletAddress={walletAddress} 
            showNotification={showNotification}
            isProcessing={isProcessing}
          />
        )}
        
        {activeTab === 'tickets' && (
          <TicketsView 
            myTickets={myTickets} 
            handleSellTicket={handleSell} 
            cancelListing={cancelListing}
            setActiveTab={setActiveTab} 
            walletAddress={walletAddress}
          />
        )}
      </main>
    </div>
  );
}