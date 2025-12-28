import React, { useState, useEffect, useRef } from 'react';
import { 
  Wallet, 
  Calendar, 
  Ticket, 
  Plus, 
  Search, 
  Clock, 
  MapPin, 
  LayoutGrid, 
  Coins,
  Users,
  Tag,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  MessageSquare,
  X,
  Send,
  Loader2,
  Trash2,
  Repeat,
  Pencil,
  ArrowRightLeft
} from 'lucide-react';

// --- Gemini API Setup ---
const apiKey = ""; // API Key provided by runtime environment

// --- Utility Functions ---

const callGemini = async (prompt, systemInstruction = "") => {
  try {
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
    };
    if (systemInstruction) {
        payload.systemInstruction = { parts: [{ text: systemInstruction }] };
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    if (!response.ok) throw new Error("API Error");
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm having trouble thinking right now.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Sorry, I couldn't connect to the AI service. Please try again.";
  }
};

const formatAddress = (addr) => addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : '';

// --- Ethereum Transaction Helper ---
const sendEthTransaction = async (fromAddress, toAddress, amountEth) => {
  if (!window.ethereum) throw new Error("MetaMask not found");
  
  // Convert ETH to Wei (1 ETH = 10^18 Wei) and then to Hex
  const weiValue = BigInt(Math.floor(parseFloat(amountEth) * 1e18));
  const valueHex = '0x' + weiValue.toString(16);

  const params = [{
    from: fromAddress,
    to: toAddress,
    value: valueHex,
  }];

  try {
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params,
    });
    return txHash;
  } catch (error) {
    console.error("Transaction Error:", error);
    throw error;
  }
};

// --- Shared Components ---

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

// --- Sub-Components ---

const Navbar = ({ activeTab, setActiveTab, walletAddress, balance, connectWallet, isConnecting }) => (
  <nav className="border-b border-slate-700 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Ticket className="text-white h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">BlockTix</h1>
            <p className="text-xs text-slate-400 -mt-1 font-mono">Decentralized Events</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex gap-1 bg-slate-800 p-1 rounded-lg">
            {[
              { id: 'market', label: 'Marketplace', icon: LayoutGrid },
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
    
    <div className="md:hidden flex justify-around border-t border-slate-800 bg-slate-900 p-2">
       {[
          { id: 'market', icon: LayoutGrid },
          { id: 'tickets', icon: Tag },
          { id: 'organizer', icon: Users },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`p-2 rounded-lg ${activeTab === tab.id ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-400'}`}
          >
            <tab.icon size={20} />
          </button>
        ))}
    </div>
  </nav>
);

const MarketView = ({ events, buyTicket, resaleTickets, buyResaleTicket, walletAddress, isProcessing }) => {
  const [selectedSlots, setSelectedSlots] = useState({});

  const handleSlotSelect = (eventId, slot) => {
    setSelectedSlots(prev => ({...prev, [eventId]: slot}));
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
            {events.map((event) => (
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
                    <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Seats</div>
                    <div className={`font-mono font-bold ${event.remainingSeats < 20 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {event.remainingSeats}/{event.totalSeats}
                    </div>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="text-xs text-slate-500 uppercase font-bold tracking-wider block mb-2">Select Time</label>
                    <div className="flex flex-wrap gap-2">
                    {event.timeSlots.map(slot => (
                        <button
                        key={slot}
                        onClick={() => handleSlotSelect(event.id, slot)}
                        className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                            selectedSlots[event.id] === slot 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                        >
                        {slot}
                        </button>
                    ))}
                    </div>
                </div>

                <p className="text-slate-400 text-sm mb-6 line-clamp-2">{event.description}</p>

                <div className="flex gap-3">
                    <Button 
                    onClick={() => buyTicket(event, selectedSlots[event.id])} 
                    className="flex-1"
                    loading={isProcessing}
                    disabled={event.remainingSeats === 0 || !selectedSlots[event.id] || isProcessing}
                    >
                    {event.remainingSeats === 0 ? 'Sold Out' : 'Mint Ticket'}
                    </Button>
                </div>
                </div>
            </Card>
            ))}
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
                  <span className="font-mono text-xs text-slate-500">#{ticket.id}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{ticket.eventName}</h3>
                <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                  <span>{ticket.eventDate}</span>
                  <span className="bg-slate-700 px-2 rounded">{ticket.timeSlot}</span>
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
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [tempTimeSlot, setTempTimeSlot] = useState('');
  
  const [newEvent, setNewEvent] = useState({
    name: '',
    date: '',
    timeSlots: [],
    location: '',
    price: '',
    totalSeats: '',
    description: ''
  });

  const resetForm = () => {
    setNewEvent({ name: '', date: '', timeSlots: [], location: '', price: '', totalSeats: '', description: '' });
    setEditingId(null);
    setIsCreatingEvent(false);
  };

  const handleEditClick = (event) => {
    setNewEvent({
        name: event.name,
        date: event.date,
        timeSlots: event.timeSlots,
        location: event.location,
        price: event.price,
        totalSeats: event.totalSeats,
        description: event.description
    });
    setEditingId(event.id);
    setIsCreatingEvent(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!walletAddress) return showNotification("Please connect wallet first", "error");
    if (newEvent.timeSlots.length === 0) return showNotification("Please add at least one time slot", "error");
    
    if (editingId) {
        onEventUpdate({ ...newEvent, id: editingId });
        resetForm();
    } else {
        onEventCreate(newEvent, resetForm);
    }
  };

  const addTimeSlot = () => {
    if (tempTimeSlot && !newEvent.timeSlots.includes(tempTimeSlot)) {
      setNewEvent(prev => ({...prev, timeSlots: [...prev.timeSlots, tempTimeSlot]}));
      setTempTimeSlot('');
    }
  };

  const removeTimeSlot = (slot) => {
    setNewEvent(prev => ({...prev, timeSlots: prev.timeSlots.filter(s => s !== slot)}));
  };

  const handleGenerateDescription = async () => {
    if (!newEvent.name) return showNotification("Please enter an event name first", "error");
    setIsGeneratingDesc(true);
    const prompt = `Write a creative, high-energy, and short description (max 2 sentences) for an event named "${newEvent.name}" happening at "${newEvent.location || 'a secret location'}". The tone should be exciting and urge people to buy tickets. Use emojis.`;
    const text = await callGemini(prompt);
    setNewEvent(prev => ({ ...prev, description: text }));
    setIsGeneratingDesc(false);
  };

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
              <label className="block text-sm font-medium text-slate-400 mb-2">Time Slots</label>
              <div className="flex gap-2 mb-2">
                <input 
                  type="time" 
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={tempTimeSlot}
                  onChange={(e) => setTempTimeSlot(e.target.value)}
                />
                <Button onClick={addTimeSlot} icon={Plus} variant="secondary" />
              </div>
              <div className="flex flex-wrap gap-2">
                {newEvent.timeSlots.map(slot => (
                  <span key={slot} className="bg-indigo-600/20 text-indigo-400 px-2 py-1 rounded text-sm flex items-center gap-1">
                    {slot}
                    <button type="button" onClick={() => removeTimeSlot(slot)}><X size={12} /></button>
                  </span>
                ))}
              </div>
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

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Total Supply</label>
              <input 
                required
                type="number" 
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                value={newEvent.totalSeats}
                onChange={(e) => setNewEvent({...newEvent, totalSeats: e.target.value})}
              />
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
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-slate-400">Description</label>
                <button
                  type="button"
                  onClick={handleGenerateDescription}
                  disabled={isGeneratingDesc}
                  className="text-xs flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/10 px-2 py-1 rounded-md border border-indigo-500/20"
                >
                  {isGeneratingDesc ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  Generate with AI
                </button>
              </div>
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
              <th className="px-6 py-4 font-medium">Sold / Total</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700 text-slate-300">
            {events.map((e) => (
              <tr key={e.id} className="hover:bg-slate-700/30 transition-colors">
                <td className="px-6 py-4 font-medium text-white">{e.name}</td>
                <td className="px-6 py-4 text-sm">{e.date}</td>
                <td className="px-6 py-4 text-xs font-mono">{e.timeSlots.length} Slots</td>
                <td className="px-6 py-4 font-mono text-sm">{e.totalSeats - e.remainingSeats} / {e.totalSeats}</td>
                <td className="px-6 py-4">
                  <Badge color={e.remainingSeats > 0 ? 'green' : 'red'}>
                    {e.remainingSeats > 0 ? 'Active' : 'Ended'}
                  </Badge>
                </td>
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

const TicketsView = ({ myTickets, handleSellTicket, cancelListing, setActiveTab }) => {
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
             {myTickets.length === 0 ? "Connect your wallet to see your tickets or purchase from the market." : ""}
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
                <span className="text-white/80 font-mono text-xs rotate-180" style={{writingMode: 'vertical-rl'}}>#{ticket.id}</span>
                <Ticket className="text-white" />
              </div>

              {/* Info */}
              <div className="flex-1 p-5 flex flex-col justify-between relative bg-slate-50">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">{ticket.eventName}</h3>
                  <div className="flex items-center text-slate-500 text-sm gap-4 mb-4">
                    <span className="flex items-center gap-1"><Calendar size={14} /> {ticket.eventDate}</span>
                    <span className="bg-slate-200 px-2 py-0.5 rounded text-xs">{ticket.timeSlot}</span>
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

const ChatWidget = ({ events }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: 'Hello! I am your BlockTix Concierge. Ask me about upcoming events or finding tickets!' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatOpen]);

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setIsChatLoading(true);

    const eventContext = events.map(e => 
      `- Event: ${e.name} (${e.date})\n  Slots: ${e.timeSlots.join(', ')}\n  Location: ${e.location}\n  Price: ${e.price} ETH`
    ).join('\n\n');

    const systemPrompt = `You are the AI Concierge for BlockTix. Here is the live data: \n${eventContext}\n Help users find events.`;
    
    const response = await callGemini(userMsg, systemPrompt);
    setChatMessages(prev => [...prev, { role: 'assistant', text: response }]);
    setIsChatLoading(false);
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex flex-col items-end transition-all ${isChatOpen ? 'w-full md:w-96' : 'w-auto'}`}>
      {isChatOpen && (
        <div className="mb-4 w-full bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden h-[400px]">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex justify-between items-center">
            <h3 className="text-white font-bold flex gap-2"><Sparkles className="text-yellow-300 w-5 h-5" /> Concierge AI</h3>
            <button onClick={() => setIsChatOpen(false)} className="text-white"><X size={20} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-200'}`}>{msg.text}</div>
              </div>
            ))}
            {isChatLoading && <Loader2 className="animate-spin text-slate-500" />}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={handleChatSubmit} className="p-3 border-t border-slate-700 bg-slate-800 flex gap-2">
            <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask..." className="flex-1 bg-slate-900 text-white rounded-full px-4 py-2 text-sm outline-none" />
            <button type="submit" disabled={isChatLoading} className="p-2 bg-indigo-600 rounded-full text-white"><Send size={16} /></button>
          </form>
        </div>
      )}
      <button onClick={() => setIsChatOpen(!isChatOpen)} className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
        {isChatOpen ? <X /> : <MessageSquare />}
      </button>
    </div>
  );
};

// --- Main App Component ---

export default function EventTicketingApp() {
  const [activeTab, setActiveTab] = useState('market');
  const [walletAddress, setWalletAddress] = useState(null);
  const [balance, setBalance] = useState('0.00');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState(null);

  // --- Persistent State ---
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('blocktix_events');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [allTickets, setAllTickets] = useState(() => {
    const saved = localStorage.getItem('blocktix_tickets');
    return saved ? JSON.parse(saved) : [];
  });

  // Derived State
  const myTickets = walletAddress 
    ? allTickets.filter(t => t.owner && t.owner.toLowerCase() === walletAddress.toLowerCase()) 
    : [];
  
  const resaleTickets = allTickets.filter(t => t.isForSale);

  // --- Persistence Effects ---
  useEffect(() => {
    localStorage.setItem('blocktix_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('blocktix_tickets', JSON.stringify(allTickets));
  }, [allTickets]);

  // --- Actions ---

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const refreshBalance = async (address) => {
    if (!address || !window.ethereum) return;
    try {
      const balanceWei = await window.ethereum.request({ 
        method: 'eth_getBalance', 
        params: [address, 'latest'] 
      });
      const balanceEth = (parseInt(balanceWei, 16) / 10**18).toFixed(4);
      setBalance(balanceEth);
    } catch (e) { console.error("Balance refresh failed", e); }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      showNotification("MetaMask not detected. Please install it.", "error");
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];
      setWalletAddress(account);
      
      await refreshBalance(account);
      
      showNotification("Wallet Connected", "success");
    } catch (error) {
      console.error(error);
      showNotification("Connection Failed", "error");
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          connectWallet(); 
        } else {
          setWalletAddress(null);
          setBalance('0.00');
        }
      });
    }
  }, []);

  const handleEventCreate = async (newEventData, onSuccess) => {
    setIsProcessing(true);
    try {
        await sendEthTransaction(walletAddress, walletAddress, "0");

        const event = {
          id: Date.now(), 
          organizer: walletAddress,
          ...newEventData,
          price: parseFloat(newEventData.price),
          totalSeats: parseInt(newEventData.totalSeats),
          remainingSeats: parseInt(newEventData.totalSeats),
          image: ['blue', 'purple', 'pink'][Math.floor(Math.random() * 3)]
        };
        setEvents(prev => [event, ...prev]);
        showNotification("Contract Deployed & Event Created!", "success");
        if(onSuccess) onSuccess();
        
        // Refresh balance (Gas fees used)
        setTimeout(() => refreshBalance(walletAddress), 3000);
    } catch (error) {
        showNotification("Transaction Rejected", "error");
    } finally {
        setIsProcessing(false);
    }
  };

  const handleEventUpdate = (updatedData) => {
    const oldEvent = events.find(e => e.id === updatedData.id);
    const seatDiff = parseInt(updatedData.totalSeats) - parseInt(oldEvent.totalSeats);
    
    const updatedEvent = {
        ...oldEvent,
        ...updatedData,
        price: parseFloat(updatedData.price),
        totalSeats: parseInt(updatedData.totalSeats),
        remainingSeats: parseInt(oldEvent.remainingSeats) + seatDiff
    };

    setEvents(events.map(e => e.id === updatedData.id ? updatedEvent : e));
    showNotification("Event block updated!", "success");
  };

  const handleEventDelete = (id) => {
    if (confirm("Are you sure you want to delete this event from the blockchain?")) {
        setEvents(events.filter(e => e.id !== id));
        showNotification("Event deleted", "success");
    }
  };

  const buyTicket = async (event, selectedSlot) => {
    if (!walletAddress) return showNotification("Please connect wallet first", "error");
    if (!selectedSlot) return showNotification("Please select a time slot", "error");
    
    setIsProcessing(true);
    try {
        await sendEthTransaction(walletAddress, event.organizer, event.price.toString());

        // Optimistically update balance instantly
        setBalance(prev => (parseFloat(prev) - event.price).toFixed(4));

        setEvents(events.map(e => e.id === event.id ? {...e, remainingSeats: e.remainingSeats - 1} : e));

        const newTicket = {
            id: Math.floor(Math.random() * 1000000),
            eventId: event.id,
            eventName: event.name,
            eventDate: event.date,
            timeSlot: selectedSlot,
            purchasePrice: event.price,
            isForSale: false,
            resalePrice: 0,
            owner: walletAddress
        };
        
        setAllTickets(prev => [newTicket, ...prev]);
        showNotification(`Transaction Confirmed! Ticket Minted.`, "success");

        // Sync real balance after delay (to catch gas fees)
        setTimeout(() => refreshBalance(walletAddress), 4000);
    } catch (error) {
        showNotification("Purchase Failed/Rejected", "error");
    } finally {
        setIsProcessing(false);
    }
  };

  const handleSellTicket = (ticketId, price) => {
    setAllTickets(prev => prev.map(t => 
        t.id === ticketId ? { ...t, isForSale: true, resalePrice: price } : t
    ));
    showNotification(`Ticket #${ticketId} listed for ${price} ETH`, "success");
  };

  const cancelListing = (ticketId) => {
    setAllTickets(prev => prev.map(t => 
        t.id === ticketId ? { ...t, isForSale: false, resalePrice: 0 } : t
    ));
    showNotification("Listing cancelled", "success");
  };

  const buyResaleTicket = async (ticket) => {
    if (!walletAddress) return showNotification("Connect Wallet", "error");
    
    setIsProcessing(true);
    try {
        await sendEthTransaction(walletAddress, ticket.owner, ticket.resalePrice.toString());

        // Optimistically update balance instantly
        setBalance(prev => (parseFloat(prev) - ticket.resalePrice).toFixed(4));

        // Transfer ownership
        setAllTickets(prev => prev.map(t => 
            t.id === ticket.id 
            ? { ...t, owner: walletAddress, isForSale: false, purchasePrice: ticket.resalePrice, resalePrice: 0 } 
            : t
        ));
        
        showNotification(`Secondary Market Purchase Successful!`, "success");

        // Sync real balance after delay
        setTimeout(() => refreshBalance(walletAddress), 4000);
    } catch (error) {
        showNotification("Transaction Rejected", "error");
    } finally {
        setIsProcessing(false);
    }
  };

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

      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        walletAddress={walletAddress} 
        balance={balance} 
        connectWallet={connectWallet}
        isConnecting={isConnecting}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {activeTab === 'market' && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Explore Events</h1>
            <p className="text-slate-400">Discover and book tickets on the blockchain.</p>
          </div>
        )}
        
        {activeTab === 'market' && (
          <MarketView 
            events={events} 
            buyTicket={buyTicket} 
            resaleTickets={resaleTickets}
            buyResaleTicket={buyResaleTicket}
            walletAddress={walletAddress}
            isProcessing={isProcessing}
          />
        )}
        
        {activeTab === 'organizer' && (
          <OrganizerView 
            events={events} 
            onEventCreate={handleEventCreate} 
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
            handleSellTicket={handleSellTicket} 
            cancelListing={cancelListing}
            setActiveTab={setActiveTab} 
          />
        )}

        <ChatWidget events={events} />
      </main>
    </div>
  );
}