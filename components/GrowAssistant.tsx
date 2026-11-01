import React, { useState, useRef, useEffect } from 'react';
import { Send, Sprout, Bot, Loader2, Plus, Trash2, Clock, Settings, Zap, BarChart3, Wind, Leaf, Thermometer, Droplets, Activity, LayoutGrid, Sun, Grip, Microscope, AlertTriangle, Timer, Power, Fingerprint, Warehouse, ToggleLeft, ToggleRight, Edit2, X, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, Product, GrowPlant, PlantStage, LightSchedule, EnvironmentStats, Farm } from '../types';
import { streamMessageToGemini } from '../services/geminiService';
import { SEED_CATALOG } from '../constants';
import StrainArt from './StrainArt';
import { ui } from '../lib/ui';

interface GrowAssistantProps {
  onProductClick?: (product: Product) => void;
}

const GrowAssistant: React.FC<GrowAssistantProps> = ({ onProductClick }) => {
  // --- AI Chat State ---
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: "System Online. Select a Farm or Tent to begin analysis.",
      timestamp: new Date()
    }
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Farm State ---
  const [farms, setFarms] = useState<Farm[]>(() => {
    const savedFarms = localStorage.getItem('clean_genetics_farms_v2');
    if (savedFarms) return JSON.parse(savedFarms);

    // Migration: Move existing flat plants into a default farm
    const oldPlants = localStorage.getItem('clean_genetics_phenotypes');
    if (oldPlants) {
        const plants = JSON.parse(oldPlants);
        return [{
            id: 'default-tent',
            name: 'Main Tent',
            type: 'Tent',
            isOn: true,
            plants: plants
        }];
    }
    
    // Default empty state
    return [{
        id: 'default-tent',
        name: 'Main Tent',
        type: 'Tent',
        isOn: true,
        plants: []
    }];
  });

  const [activeFarmId, setActiveFarmId] = useState<string>(farms[0]?.id || '');

  // Derived Active Farm
  const activeFarm = farms.find(f => f.id === activeFarmId) || farms[0];
  
  // UI States
  const [showAddPlantModal, setShowAddPlantModal] = useState(false);
  const [showFarmSettings, setShowFarmSettings] = useState(false);
  const [editingPlantId, setEditingPlantId] = useState<string | null>(null);
  
  // Mobile Tab State
  const [activeMobileTab, setActiveMobileTab] = useState<'FARM' | 'AI'>('FARM');

  // Timer State
  const [now, setNow] = useState(new Date());

  // Persistence
  useEffect(() => {
    localStorage.setItem('clean_genetics_farms_v2', JSON.stringify(farms));
  }, [farms]);

  useEffect(() => {
     if (!activeFarmId && farms.length > 0) setActiveFarmId(farms[0].id);
  }, [farms, activeFarmId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => scrollToBottom(), [messages]);

  // Timer Tick
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // --- Calculations ---
  const calculateVPD = (tempF: number, rh: number): number => {
    const tempC = (tempF - 32) * 5/9;
    const svp = 0.6108 * Math.exp((17.27 * tempC) / (tempC + 237.3));
    const avp = svp * (rh / 100);
    return parseFloat((svp - avp).toFixed(2));
  };

  const getLightCountdown = (schedule: LightSchedule, startHour: number) => {
      if (schedule === 'Outdoor') return { status: 'SUN', text: 'Sunrise Cycle', isLightOn: true };
      if (schedule === '24/0') return { status: 'ON', text: 'Always On', isLightOn: true };
      
      const [onHoursStr] = schedule.split('/');
      const onHours = parseInt(onHoursStr);
      
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const currentSeconds = now.getSeconds();
      const startMinutes = startHour * 60;
      
      let elapsedMinutes = currentMinutes - startMinutes;
      if (elapsedMinutes < 0) elapsedMinutes += 24 * 60; 
      
      const onDurationMinutes = onHours * 60;
      
      let isLightOn = false;
      let timeRemainingMinutes = 0;
      
      if (elapsedMinutes < onDurationMinutes) {
          isLightOn = true;
          timeRemainingMinutes = onDurationMinutes - elapsedMinutes;
      } else {
          isLightOn = false;
          timeRemainingMinutes = (24 * 60) - elapsedMinutes;
      }
      
      const totalSecondsRemaining = (timeRemainingMinutes * 60) - currentSeconds;
      if (totalSecondsRemaining < 0) return { status: 'SYNC', text: 'Syncing...', isLightOn };

      const h = Math.floor(totalSecondsRemaining / 3600);
      const m = Math.floor((totalSecondsRemaining % 3600) / 60);
      const s = Math.floor(totalSecondsRemaining % 60);
      
      return {
          status: isLightOn ? 'ON' : 'OFF',
          text: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`,
          isLightOn
      };
  };

  // --- Actions ---

  const createFarm = () => {
    const newFarm: Farm = {
        id: Date.now().toString(),
        name: `New Tent ${farms.length + 1}`,
        type: 'Tent',
        isOn: true,
        plants: []
    };
    setFarms(prev => [...prev, newFarm]);
    setActiveFarmId(newFarm.id);
  };

  const updateFarmSettings = (updates: Partial<Farm>) => {
    setFarms(prev => prev.map(f => f.id === activeFarmId ? { ...f, ...updates } : f));
  };

  const toggleFarmPower = (id: string) => {
    setFarms(prev => prev.map(f => f.id === id ? { ...f, isOn: !f.isOn } : f));
  };

  const deleteFarm = async (id: string) => {
      if (farms.length === 1) return ui.toast("Cannot delete the last farm.", "error");
      const ok = await ui.confirm("Delete this farm?", { description: "All plants in this farm will be lost.", confirmLabel: "Delete farm", danger: true });
      if (ok) {
          const newFarms = farms.filter(f => f.id !== id);
          setFarms(newFarms);
          setActiveFarmId(newFarms[0].id);
      }
  };

  const extractCommand = (fullText: string): { cleanedText: string; command: ChatMessage['command'] | undefined } => {
    const commandRegex = /:::COMMAND([\s\S]*?):::/;
    const match = fullText.match(commandRegex);
    
    if (match && match[1]) {
      try {
        const commandData = JSON.parse(match[1]);
        const cleanedText = fullText.replace(commandRegex, '').trim();
        return { cleanedText, command: commandData };
      } catch (e) {
        console.error("Failed to parse AI command", e);
      }
    }
    return { cleanedText: fullText, command: undefined };
  };

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);

    try {
      const placeholderMsg: ChatMessage = { role: 'model', text: '', timestamp: new Date() };
      setMessages(prev => [...prev, placeholderMsg]);

      // Context includes active farm info
      const contextData = JSON.stringify({
        activeFarm: {
            name: activeFarm.name,
            type: activeFarm.type,
            status: activeFarm.isOn ? "ONLINE" : "OFFLINE",
            avgTemp: Math.round(activeFarm.plants.reduce((acc, p) => acc + p.environment.temp, 0) / (activeFarm.plants.length || 1)),
            avgHumidity: Math.round(activeFarm.plants.reduce((acc, p) => acc + p.environment.humidity, 0) / (activeFarm.plants.length || 1))
        },
        plants: activeFarm.plants.map(p => ({
            name: p.name,
            uniqueId: p.uniqueId,
            stage: p.stage,
            health: p.health,
            environment: p.environment,
            light: p.lightSchedule
        }))
      }, null, 2);

      const stream = streamMessageToGemini(messages, input, contextData);
      let fullResponse = '';

      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev => {
          const newHistory = [...prev];
          const lastMsg = newHistory[newHistory.length - 1];
          lastMsg.text = fullResponse; // Temporarily show full response including command
          return newHistory;
        });
      }

      // Post-process for commands
      const { cleanedText, command } = extractCommand(fullResponse);
      setMessages(prev => {
          const newHistory = [...prev];
          const lastMsg = newHistory[newHistory.length - 1];
          lastMsg.text = cleanedText;
          lastMsg.command = command;
          return newHistory;
      });

    } catch (err) {
      console.error(err);
    } finally {
      setIsStreaming(false);
    }
  };

  const addPlant = (product: Product) => {
    // Generate sequential ID based on total plants across all farms to keep them unique
    const totalPlants = farms.reduce((acc, f) => acc + f.plants.length, 0);
    const uniqueId = `#${(totalPlants + 1).toString().padStart(2, '0')}`;
    const uniqueName = `${product.name} ${uniqueId}`;

    const newPlant: GrowPlant = {
      id: Date.now().toString(),
      catalogId: product.id,
      name: uniqueName,
      uniqueId: uniqueId,
      stage: 'Seedling',
      plantedDate: Date.now(),
      lastWatered: Date.now(),
      wateringIntervalHours: 24,
      autoWater: false,
      health: 100,
      lightSchedule: '18/6',
      lightStartHour: 6,
      ppfd: 300,
      ec: 0.8,
      ph: 6.0,
      environment: {
          temp: 78,
          humidity: 65,
          co2: 400,
          vpd: 0.8
      },
      notes: 'Germinated unique seed.'
    };
    
    setFarms(prev => prev.map(f => f.id === activeFarmId ? { ...f, plants: [...f.plants, newPlant] } : f));
    setShowAddPlantModal(false);
  };

  const addPlantById = (id: string) => {
      const product = SEED_CATALOG.find(p => p.id === id);
      if (product) addPlant(product);
  };

  const deletePlant = async (plantId: string) => {
      const ok = await ui.confirm("Terminate this phenotype?", { description: "This plant's data cannot be recovered.", confirmLabel: "Terminate", danger: true });
      if (ok) {
          setFarms(prev => prev.map(f => f.id === activeFarmId ? { ...f, plants: f.plants.filter(p => p.id !== plantId) } : f));
      }
  };

  const updatePlantData = (plantId: string, updates: Partial<GrowPlant> | { environment: Partial<EnvironmentStats> }) => {
    setFarms((prev: Farm[]) => prev.map((f: Farm) => {
        if (f.id !== activeFarmId) return f;
        return {
            ...f,
            plants: f.plants.map((p: GrowPlant) => {
                if (p.id !== plantId) return p;
                if ('environment' in updates && updates.environment) {
                    const newEnv: EnvironmentStats = { ...p.environment, ...updates.environment };
                    newEnv.vpd = calculateVPD(newEnv.temp, newEnv.humidity);
                    return { ...p, environment: newEnv };
                }
                return { ...p, ...updates as Partial<GrowPlant> };
            })
        };
    }));
  };

  // --- Renderers ---
  
  const renderChatCommand = (command: ChatMessage['command']) => {
      if (!command) return null;

      if (command.type === 'SUGGEST_PRODUCTS') {
          const ids = command.data.ids || [];
          const products = SEED_CATALOG.filter(p => ids.includes(p.id));
          if (products.length === 0) return null;

          return (
              <div className="mt-4 grid grid-cols-1 gap-3">
                  {products.map(p => (
                      <div key={p.id} className="bg-black/40 border border-zinc-800 p-3 rounded-xl flex items-center justify-between group hover:border-emerald-500/30 transition-all">
                          <div className="flex items-center gap-3">
                              <StrainArt id={p.id} type={p.type} still glyph={0.7} className="w-10 h-10 rounded-lg flex-shrink-0" />
                              <div>
                                  <div className="text-xs font-bold text-white">{p.name}</div>
                                  <div className="text-[10px] text-zinc-500">{p.type} • {p.floweringTime}</div>
                              </div>
                          </div>
                          <button 
                            onClick={() => addPlant(p)}
                            disabled={!activeFarm.isOn}
                            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-black text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                          >
                             <Plus className="w-3 h-3" /> Add
                          </button>
                      </div>
                  ))}
              </div>
          );
      }

      if (command.type === 'OPEN_MODAL') {
          return (
              <div className="mt-4">
                  <button 
                    onClick={() => setShowAddPlantModal(true)}
                    disabled={!activeFarm.isOn}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 border border-zinc-700 transition-colors"
                  >
                      <Plus className="w-4 h-4" /> Open Genetics Selector
                  </button>
              </div>
          );
      }

      if (command.type === 'TOGGLE_POWER') {
          return (
              <div className="mt-4">
                  <button 
                    onClick={() => toggleFarmPower(activeFarm.id)}
                    className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-colors ${activeFarm.isOn ? 'bg-red-900/30 text-red-500 border border-red-900/50 hover:bg-red-900/50' : 'bg-emerald-900/30 text-emerald-500 border border-emerald-900/50 hover:bg-emerald-900/50'}`}
                  >
                      <Power className="w-4 h-4" /> {activeFarm.isOn ? 'Turn System OFF' : 'Turn System ON'}
                  </button>
              </div>
          );
      }

      return null;
  };

  const renderDashboardHeader = () => {
    const plants = activeFarm.plants;
    const avgTemp = plants.length ? Math.round(plants.reduce((acc, p) => acc + p.environment.temp, 0) / plants.length) : 0;
    const avgRh = plants.length ? Math.round(plants.reduce((acc, p) => acc + p.environment.humidity, 0) / plants.length) : 0;
    
    return (
      <div className={`border rounded-2xl p-6 mb-6 transition-colors ${activeFarm.isOn ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-950 border-zinc-900 opacity-75'}`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full md:w-auto">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-colors flex-shrink-0 ${activeFarm.isOn ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-zinc-800 border-zinc-700 text-zinc-600'}`}>
                      <Warehouse className="w-6 h-6" />
                  </div>
                  <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-2xl font-black text-white tracking-tight break-all">{activeFarm.name}</h2>
                        <button onClick={() => toggleFarmPower(activeFarm.id)} className="focus:outline-none transition-transform active:scale-95 flex-shrink-0">
                            {activeFarm.isOn ? <ToggleRight className="w-8 h-8 text-emerald-500" /> : <ToggleLeft className="w-8 h-8 text-zinc-600" />}
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1">
                          {activeFarm.type} • {plants.length} Plants • <span className={activeFarm.isOn ? "text-emerald-500" : "text-zinc-600"}>{activeFarm.isOn ? "ONLINE" : "OFFLINE"}</span>
                      </div>
                  </div>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                  <button onClick={() => setShowFarmSettings(true)} className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-400 hover:text-white transition-colors">
                      <Settings className="w-4 h-4" />
                  </button>
                  <button onClick={() => setShowAddPlantModal(true)} disabled={!activeFarm.isOn} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 rounded-xl text-xs font-bold text-black transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:shadow-none whitespace-nowrap">
                      <Plus className="w-4 h-4" /> Add Plant
                  </button>
              </div>
          </div>

          {/* Aggregate Stats (Only if plants exist and farm is on) */}
          {plants.length > 0 && activeFarm.isOn && (
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-black/40 rounded-xl p-4 border border-zinc-800/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                      <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1">Avg Canopy Temp</div>
                      <div className="text-2xl sm:text-3xl font-mono text-white tracking-tighter">{avgTemp}°F</div>
                  </div>
                  <Thermometer className="w-6 h-6 sm:w-8 sm:h-8 text-zinc-700 self-end sm:self-center" />
               </div>
               <div className="bg-black/40 rounded-xl p-4 border border-zinc-800/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                   <div>
                      <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1">Avg Humidity</div>
                      <div className="text-2xl sm:text-3xl font-mono text-blue-200 tracking-tighter">{avgRh}%</div>
                   </div>
                   <Droplets className="w-6 h-6 sm:w-8 sm:h-8 text-blue-900/40 self-end sm:self-center" />
               </div>
            </div>
          )}
      </div>
    );
  };

  const renderPlantGrid = () => (
      <div className="grid grid-cols-1 gap-4">
          {activeFarm.plants.length === 0 && (
               <div className="border-2 border-dashed border-zinc-800 rounded-2xl p-12 text-center flex flex-col items-center">
                   <Sprout className="w-12 h-12 text-zinc-700 mb-4" />
                   <h3 className="text-xl font-bold text-white mb-2">No Plants in this {activeFarm.type}</h3>
                   <p className="text-zinc-500 mb-6 max-w-sm">Every plant is unique. Start by assigning a genetics ID to your first seed.</p>
                   <button onClick={() => setShowAddPlantModal(true)} disabled={!activeFarm.isOn} className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-black font-bold px-6 py-2 rounded-lg">Select Genetics</button>
               </div>
          )}
          {activeFarm.plants.map(plant => {
              const timer = getLightCountdown(plant.lightSchedule, plant.lightStartHour ?? 6);
              const isOffline = !activeFarm.isOn;
              
              return (
              <div key={plant.id} className={`bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden transition-all group ${isOffline ? 'opacity-50 grayscale pointer-events-none' : 'hover:border-emerald-500/30'}`}>
                  {/* Plant Header */}
                  <div className="bg-black/30 p-4 flex flex-wrap gap-4 justify-between items-center border-b border-zinc-800">
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center border flex-shrink-0 ${plant.health < 70 ? 'bg-red-900/20 border-red-500/30 text-red-500' : 'bg-emerald-900/20 border-emerald-500/30 text-emerald-500'}`}>
                              <span className="font-mono font-bold text-xs">{plant.uniqueId || '#??'}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-bold text-white text-lg truncate max-w-full">{plant.name}</h3>
                                {/* Light Timer Badge */}
                                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-bold border whitespace-nowrap ${timer.isLightOn ? 'bg-emerald-950 text-emerald-400 border-emerald-900' : 'bg-zinc-950 text-zinc-500 border-zinc-800'}`}>
                                    <Power className="w-3 h-3" />
                                    <span>{timer.status}</span>
                                    <span className="font-mono opacity-80 border-l border-white/10 pl-1.5 ml-0.5">{timer.text}</span>
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-zinc-500 uppercase mt-1">
                                  <span>{plant.stage}</span>
                                  <span className="hidden sm:inline">•</span>
                                  <span>Day {Math.floor((Date.now() - plant.plantedDate) / (1000 * 60 * 60 * 24))}</span>
                                  <span className="hidden sm:inline">•</span>
                                  <span className={plant.health > 90 ? 'text-emerald-500' : 'text-yellow-500'}>Health: {plant.health}%</span>
                              </div>
                          </div>
                      </div>
                      <div className="flex items-center gap-2 ml-auto flex-shrink-0">
                        <button onClick={() => setEditingPlantId(editingPlantId === plant.id ? null : plant.id)} className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${editingPlantId === plant.id ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}>
                            {editingPlantId === plant.id ? 'Done' : 'Adjust'}
                        </button>
                        <button onClick={() => deletePlant(plant.id)} className="p-1.5 text-zinc-600 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                  </div>

                  {/* Plant Telemetry / Controls */}
                  <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      
                      {/* Light Schedule */}
                      <div className="space-y-1">
                          <span className="text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1"><Clock className="w-3 h-3" /> Light Cycle</span>
                          {editingPlantId === plant.id ? (
                              <div className="space-y-2">
                                <select 
                                    value={plant.lightSchedule} 
                                    onChange={(e) => updatePlantData(plant.id, { lightSchedule: e.target.value as LightSchedule })}
                                    className="bg-zinc-950 border border-zinc-700 rounded w-full p-1 text-white text-xs"
                                >
                                    {['18/6', '12/12', '20/4', '24/0', 'Outdoor'].map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                                <div className="flex items-center gap-1">
                                    <span className="text-[10px] text-zinc-500">Start (Hr):</span>
                                    <input 
                                        type="number" 
                                        min="0" max="23"
                                        value={plant.lightStartHour ?? 6}
                                        onChange={(e) => updatePlantData(plant.id, { lightStartHour: parseInt(e.target.value) })}
                                        className="bg-zinc-950 border border-zinc-700 rounded w-full p-1 text-white text-xs"
                                    />
                                </div>
                              </div>
                          ) : (
                              <div className="text-white font-mono bg-zinc-950/50 px-2 py-1 rounded border border-zinc-800 flex justify-between items-center">
                                  <span>{plant.lightSchedule}</span>
                                  {plant.lightSchedule !== '24/0' && plant.lightSchedule !== 'Outdoor' && (
                                    <span className="text-[9px] text-zinc-500">@{plant.lightStartHour ?? 6}:00</span>
                                  )}
                              </div>
                          )}
                      </div>

                      {/* PPFD */}
                      <div className="space-y-1">
                          <span className="text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1"><Sun className="w-3 h-3" /> PPFD</span>
                          {editingPlantId === plant.id ? (
                              <div className="flex items-center gap-2">
                                <input 
                                    type="range" min="0" max="1500" step="50" 
                                    value={plant.ppfd} 
                                    onChange={(e) => updatePlantData(plant.id, { ppfd: parseInt(e.target.value) })}
                                    className="w-full accent-emerald-500 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                                />
                                <span className="w-10 text-right font-mono text-zinc-300">{plant.ppfd}</span>
                              </div>
                          ) : (
                              <div className="text-yellow-200 font-mono bg-zinc-950/50 px-2 py-1 rounded border border-zinc-800">{plant.ppfd} µmol</div>
                          )}
                      </div>

                      {/* Temp Control */}
                      <div className="space-y-1">
                          <span className="text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1"><Thermometer className="w-3 h-3" /> Temp (°F)</span>
                          {editingPlantId === plant.id ? (
                               <div className="flex items-center gap-2">
                                    <button onClick={() => updatePlantData(plant.id, { environment: { temp: plant.environment.temp - 1 }})} className="bg-zinc-800 w-6 h-6 rounded flex items-center justify-center">-</button>
                                    <span className="font-mono text-white w-8 text-center">{plant.environment.temp}</span>
                                    <button onClick={() => updatePlantData(plant.id, { environment: { temp: plant.environment.temp + 1 }})} className="bg-zinc-800 w-6 h-6 rounded flex items-center justify-center">+</button>
                               </div>
                          ) : (
                              <div className="text-white font-mono bg-zinc-950/50 px-2 py-1 rounded border border-zinc-800">{plant.environment.temp}°F</div>
                          )}
                      </div>

                      {/* RH Control */}
                      <div className="space-y-1">
                          <span className="text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1"><Droplets className="w-3 h-3" /> RH (%)</span>
                          {editingPlantId === plant.id ? (
                               <div className="flex items-center gap-2">
                                    <button onClick={() => updatePlantData(plant.id, { environment: { humidity: plant.environment.humidity - 1 }})} className="bg-zinc-800 w-6 h-6 rounded flex items-center justify-center">-</button>
                                    <span className="font-mono text-white w-8 text-center">{plant.environment.humidity}</span>
                                    <button onClick={() => updatePlantData(plant.id, { environment: { humidity: plant.environment.humidity + 1 }})} className="bg-zinc-800 w-6 h-6 rounded flex items-center justify-center">+</button>
                               </div>
                          ) : (
                              <div className="text-blue-200 font-mono bg-zinc-950/50 px-2 py-1 rounded border border-zinc-800">{plant.environment.humidity}%</div>
                          )}
                      </div>
                      
                      {/* EC / pH */}
                      <div className="space-y-1">
                          <span className="text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1"><Microscope className="w-3 h-3" /> EC / pH</span>
                           <div className="text-zinc-300 font-mono bg-zinc-950/50 px-2 py-1 rounded border border-zinc-800 flex justify-between">
                              <span>{plant.ec.toFixed(1)}</span>
                              <span className="text-zinc-600">|</span>
                              <span>{plant.ph.toFixed(1)}</span>
                           </div>
                      </div>

                      {/* VPD Readout */}
                      <div className="space-y-1">
                          <span className="text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1"><Wind className="w-3 h-3" /> VPD</span>
                          <div className={`font-mono px-2 py-1 rounded border border-zinc-800 flex justify-between ${
                              plant.environment.vpd < 0.8 || plant.environment.vpd > 1.6 ? 'bg-red-900/20 text-red-400 border-red-900/50' : 'bg-emerald-900/10 text-emerald-400'
                          }`}>
                              {plant.environment.vpd} kPa
                              {(plant.environment.vpd < 0.8 || plant.environment.vpd > 1.6) && <AlertTriangle className="w-3 h-3" />}
                          </div>
                      </div>

                  </div>
              </div>
          )})}
      </div>
  );

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 relative">
      
      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 mb-4 flex-shrink-0">
          <button 
            onClick={() => setActiveMobileTab('FARM')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors ${activeMobileTab === 'FARM' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
          >
              <Warehouse className="w-4 h-4" /> Farm
          </button>
          <button 
            onClick={() => setActiveMobileTab('AI')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors ${activeMobileTab === 'AI' ? 'bg-emerald-900/30 text-emerald-500' : 'text-zinc-500'}`}
          >
              <Bot className="w-4 h-4" /> AI Assistant
          </button>
      </div>

      {/* Farm Settings Modal */}
      {showFarmSettings && (
        <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
             <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">Adjust Farm</h3>
                    <button onClick={() => setShowFarmSettings(false)}><X className="w-5 h-5 text-zinc-500" /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase block mb-2">Farm Name</label>
                        <input 
                            type="text" 
                            value={activeFarm.name} 
                            onChange={(e) => updateFarmSettings({ name: e.target.value })}
                            className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none" 
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase block mb-2">Environment Type</label>
                        <select 
                            value={activeFarm.type} 
                            onChange={(e) => updateFarmSettings({ type: e.target.value as any })}
                            className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
                        >
                            <option value="Tent">Grow Tent</option>
                            <option value="Room">Sealed Room</option>
                            <option value="Greenhouse">Greenhouse</option>
                            <option value="Outdoor">Outdoor</option>
                        </select>
                    </div>
                </div>
                <div className="mt-8 flex gap-3">
                    <button onClick={() => deleteFarm(activeFarm.id)} className="flex-1 bg-red-950/30 text-red-500 py-3 rounded-lg font-bold hover:bg-red-900/50 transition-colors">Delete Farm</button>
                    <button onClick={() => setShowFarmSettings(false)} className="flex-1 bg-emerald-600 text-black py-3 rounded-lg font-bold hover:bg-emerald-500 transition-colors">Save Changes</button>
                </div>
             </div>
        </div>
      )}

      {/* Plant Add Modal */}
      {showAddPlantModal && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
                <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">Select Genetics for New ID</h3>
                    <button onClick={() => setShowAddPlantModal(false)}><span className="text-zinc-500 hover:text-white">Close</span></button>
                </div>
                <div className="p-4 bg-zinc-950/50 border-b border-zinc-800 text-xs text-zinc-400">
                    *Assigning new unique identifier: <span className="text-emerald-500 font-mono font-bold">#{ (farms.reduce((acc,f)=>acc+f.plants.length,0) + 1).toString().padStart(2, '0') }</span>
                </div>
                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {SEED_CATALOG.map(product => (
                        <button key={product.id} onClick={() => addPlant(product)} className="flex items-center gap-4 bg-black/40 border border-zinc-800 p-4 rounded-xl hover:border-emerald-500/50 hover:bg-emerald-900/10 transition-all group text-left">
                            <StrainArt id={product.id} type={product.type} still glyph={0.7} className="w-12 h-12 rounded-xl flex-shrink-0" />
                            <div>
                                <div className="font-bold text-white group-hover:text-emerald-400">{product.name}</div>
                                <div className="text-xs text-zinc-500">{product.type}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
      )}

      {/* LEFT PANEL: FARM MANAGER */}
      <div className={`flex-1 lg:flex-[1.5] flex flex-col h-[calc(100svh-15rem)] lg:h-full overflow-y-auto scrollbar-none pb-20 ${activeMobileTab === 'FARM' ? 'flex' : 'hidden lg:flex'}`}>
          
          {/* Farm Switcher */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar">
             {farms.map(farm => (
                 <button 
                    key={farm.id}
                    onClick={() => setActiveFarmId(farm.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap transition-all border ${
                        activeFarmId === farm.id 
                        ? 'bg-emerald-500 text-black border-emerald-500' 
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                    }`}
                 >
                    <Warehouse className="w-3 h-3" />
                    {farm.name}
                    {!farm.isOn && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                 </button>
             ))}
             <button onClick={createFarm} className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-500 hover:text-emerald-500 hover:border-emerald-500 transition-colors">
                <Plus className="w-4 h-4" />
             </button>
          </div>

          {renderDashboardHeader()}
          {renderPlantGrid()}
      </div>

      {/* RIGHT PANEL: AI CONSOLE */}
      <div className={`flex-1 h-[calc(100svh-15rem)] lg:h-full flex-col glass rounded-[2rem] overflow-hidden relative ${activeMobileTab === 'AI' ? 'flex' : 'hidden lg:flex'}`}>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(20,184,166,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.035)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        
        {/* Chat Header */}
        <div className="bg-black/50 p-4 border-b border-zinc-800 flex items-center justify-between z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Bot className="text-emerald-500 w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white tracking-wider uppercase">Gene <span className="text-zinc-500">//</span> Pheno Specialist</h2>
              <div className="flex items-center gap-2 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[9px] text-emerald-500 font-mono tracking-wide">ACTIVE: {activeFarm.name.toUpperCase()}</span>
              </div>
            </div>
          </div>
          {isStreaming && <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 z-10 scrollbar-thin scrollbar-thumb-zinc-800">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2`}>
               <div className={`max-w-[90%] p-4 rounded-2xl text-xs leading-relaxed shadow-lg ${
                 msg.role === 'user' 
                 ? 'bg-gradient-to-br from-emerald-600/80 to-teal-600/70 text-white rounded-tr-md border border-white/20' 
                 : 'bg-white/[0.06] border border-white/10 text-zinc-200 rounded-tl-md'
               }`}>
                 {msg.role === 'model' ? <div className="md-body"><ReactMarkdown>{msg.text}</ReactMarkdown></div> : msg.text}
                 {/* Render Command Widgets (Interactive AI) */}
                 {renderChatCommand(msg.command)}
               </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-zinc-900 border-t border-zinc-800 z-10">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={`Ask about ${activeFarm.name}...`}
              className="w-full bg-black/50 border border-zinc-700 rounded-xl pl-4 pr-12 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono transition-all"
            />
            <button
              onClick={handleSend}
              disabled={isStreaming || !input.trim()}
              className="absolute right-2 top-2 bottom-2 aspect-square bg-emerald-600 hover:bg-emerald-500 text-black rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 shadow-lg shadow-emerald-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrowAssistant;