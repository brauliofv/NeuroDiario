import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Timer } from './components/Timer.js';
import { generateCognitiveFeedback } from './services/geminiService.js';
import { handleGoogleAuth, initGoogleDrive, syncWithDrive } from './services/googleDriveService.js';
import { AppStep, JournalData, MemoryItem, SessionMode } from './types.js';
import { 
  Brain, ChevronRight, Save, CheckCircle2, AlertCircle, Eye, EyeOff, 
  MapPin, Sun, Sunset, Coffee, BookOpen, ArrowLeft, Calendar as CalendarIcon, 
  Download, Upload, Award, CloudRain, Sparkles, Moon, Pause, Play, X, Lightbulb,
  ChevronLeft, Cloud, CloudOff, Wifi, WifiOff, RefreshCw
} from 'lucide-react';

// Pool of objects for memory exercise
const MEMORY_ITEMS_POOL = [
  { id: '1', emoji: '🚲', name: 'Bicicleta' },
  { id: '2', emoji: '🎸', name: 'Guitarra' },
  { id: '3', emoji: '🌵', name: 'Cactus' },
  { id: '4', emoji: '🍕', name: 'Pizza' },
  { id: '5', emoji: '🚀', name: 'Cohete' },
  { id: '6', emoji: '🎈', name: 'Globo' },
  { id: '7', emoji: '⏰', name: 'Reloj' },
  { id: '8', emoji: '🔑', name: 'Llave' },
  { id: '9', emoji: '🍦', name: 'Helado' },
  { id: '10', emoji: '📚', name: 'Libros' },
  { id: '11', emoji: '☂️', name: 'Paraguas' },
  { id: '12', emoji: '👓', name: 'Gafas' },
  { id: '13', emoji: '🐱', name: 'Gato' },
  { id: '14', emoji: '🍎', name: 'Manzana' },
  { id: '15', emoji: '📷', name: 'Cámara' },
];

const STORAGE_KEY = 'neurolog_sessions';

// Dynamic texts based on mode
const PROMPTS = {
  [AppStep.MORNING_RECALL]: {
    EVENING: {
      title: "Mañana de Hoy",
      prompt: "¿Cuál fue tu primera interacción o experiencia al despertar hoy? Intenta recordar detalles específicos (el sabor del desayuno, el sonido de la alarma).",
      tip: "Cierra los ojos. ¿A qué olía el café de hoy? ¿Cómo estaba la luz?"
    },
    MORNING: {
      title: "Mañana de Ayer",
      prompt: "Viaja mentalmente a ayer por la mañana. ¿Cómo empezó tu día? ¿Qué fue lo primero que hiciste al levantarte?",
      tip: "La recuperación diferida (de ayer) ejercita más profundamente tu memoria a largo plazo."
    }
  },
  [AppStep.MID_MORNING_RECALL]: {
    EVENING: {
      title: "Media Mañana (Hoy)",
      prompt: "¿Qué sucedió hoy entre el desayuno y el almuerzo? ¿Hiciste alguna llamada? ¿Trabajaste en algo específico?",
      tip: "Intenta recordar el orden cronológico exacto de hoy."
    },
    MORNING: {
      title: "Media Mañana (Ayer)",
      prompt: "Piensa en ayer, entre el desayuno y el almuerzo. ¿Qué tareas realizaste? ¿Con quién hablaste?",
      tip: "Trata de visualizar dónde estabas ayer a las 11:00 AM."
    }
  },
  [AppStep.AFTERNOON_RECALL]: {
    EVENING: {
      title: "Almuerzo y Mediodía",
      prompt: "Piensa en tu almuerzo de hoy. ¿Qué comiste exactamente? ¿Con quién hablaste? ¿Cuál fue el tema?",
      tip: "Intenta reconstruir el sabor de la comida de hoy."
    },
    MORNING: {
      title: "Almuerzo de Ayer",
      prompt: "¿Qué comiste ayer? ¿Recuerdas el lugar y la compañía? ¿De qué hablaron?",
      tip: "Si te cuesta recordar, piensa en dónde estabas sentado."
    }
  },
  [AppStep.MID_AFTERNOON_RECALL]: {
    EVENING: {
      title: "Media Tarde (Hoy)",
      prompt: "¿Qué pasó después de comer hasta ahora? ¿Te sentiste cansado? ¿Hubo algún evento inesperado?",
      tip: "¿Cambió la luz del día hoy? ¿Tomaste alguna merienda?"
    },
    MORNING: {
      title: "Tarde de Ayer",
      prompt: "Recorre la tarde de ayer. ¿Qué hiciste al terminar tus obligaciones principales? ¿Cómo terminó la tarde?",
      tip: "Conecta los eventos de ayer secuencialmente."
    }
  },
  [AppStep.SPATIAL_RECALL]: {
    EVENING: {
      title: "Conciencia Espacial (Hoy)",
      prompt: "Describe un trayecto que hiciste hoy (ej. de tu escritorio a la cocina). ¿Qué objetos pasaste?",
      tip: "Visualiza el camino de hoy en 3D como si fueras una cámara flotante."
    },
    MORNING: {
      title: "Recorrido Espacial (Ayer)",
      prompt: "Piensa en un trayecto que hiciste ayer. Trata de recordar los objetos y personas que viste en el camino.",
      tip: "Recuperar espacios visitados ayer fortalece el hipocampo."
    }
  },
  [AppStep.ANECDOTE]: {
    EVENING: {
      title: "Anécdota de Hoy",
      prompt: "Escribe libremente sobre un momento destacado, curioso o divertido de hoy. Algo que quieras atesorar.",
      tip: "Consolida la memoria episódica emocional del día."
    },
    MORNING: {
      title: "Anécdota de Ayer",
      prompt: "¿Hubo algún momento especial ayer que merezca ser recordado? Escríbelo aquí.",
      tip: "Rescatar emociones pasadas ayuda a fijar el recuerdo."
    }
  }
};

const getRandomItems = () => {
  const shuffled = [...MEMORY_ITEMS_POOL].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 5);
};

// --- Component for Interactive Feedback ---
const InteractiveFeedback = ({ text, isDarkMode }) => {
  const [selectedTerm, setSelectedTerm] = useState(null);

  if (!text) return null;

  // Split text by double asterisks
  const parts = text.split(/\*\*(.*?)\*\*/g);

  return (
    <>
      <div className="leading-relaxed">
        {parts.map((part, index) => {
          if (index % 2 === 1) {
            // Bold part -> Interactive Button
            return (
              <button
                key={index}
                onClick={() => setSelectedTerm(part)}
                className={`inline-flex items-center px-1.5 py-0.5 mx-1 rounded-md font-bold cursor-pointer transition-colors border-b-2 
                  ${isDarkMode 
                    ? 'bg-amber-900/40 text-amber-200 border-amber-700 hover:bg-amber-900/60' 
                    : 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                  }`}
                title="Clic para ver consejo técnico"
              >
                {part} <Lightbulb size={12} className="ml-1 opacity-60" />
              </button>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </div>

      {/* Modal for selected term */}
      {selectedTerm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className={`rounded-xl shadow-2xl max-w-sm w-full p-6 border-2 relative transition-colors ${
            isDarkMode 
              ? 'bg-stone-900 border-stone-700 text-stone-200' 
              : 'bg-white border-amber-100 text-stone-800'
          }`}>
            <button 
              onClick={() => setSelectedTerm(null)}
              className={`absolute top-3 right-3 transition-colors ${
                isDarkMode ? 'text-stone-500 hover:text-stone-300' : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              <X size={20} />
            </button>
            
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-full ${
                isDarkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-600'
              }`}>
                <Brain size={24} />
              </div>
              <h3 className="text-xl font-bold font-serif">{selectedTerm}</h3>
            </div>
            
            <div className={`space-y-3 ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
              <p><strong>Entrenamiento Cognitivo:</strong></p>
              <p className={`text-sm p-3 rounded-lg border italic ${
                isDarkMode 
                  ? 'bg-stone-950 border-stone-800 text-stone-400' 
                  : 'bg-stone-50 border-stone-100'
              }`}>
                "Esta técnica o concepto es fundamental para fortalecer las conexiones neuronales. Al prestar atención consciente a '{selectedTerm}', obligas a tu cerebro a salir del piloto automático."
              </p>
            </div>
            
            <button
              onClick={() => setSelectedTerm(null)}
              className={`mt-6 w-full py-2 rounded-lg font-medium transition-colors ${
                isDarkMode
                  ? 'bg-stone-700 hover:bg-stone-600 text-white'
                  : 'bg-stone-800 hover:bg-stone-700 text-white'
              }`}
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// --- Calendar Component ---
const CalendarWidget = ({ history, onSelectDate, selectedDate, isDarkMode }) => {
  const [viewDate, setViewDate] = useState(new Date());

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay(); 
  };

  const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
  const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
  
  // Group sessions by day
  const sessionsByDay = history.reduce((acc, session) => {
    const dateObj = new Date(session.timestamp);
    const dayKey = `${dateObj.getFullYear()}-${dateObj.getMonth()}-${dateObj.getDate()}`;
    if (!acc[dayKey]) acc[dayKey] = [];
    acc[dayKey].push(session);
    return acc;
  }, {});

  const prevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  const today = new Date();
  
  // Generate calendar grid
  const days = [];
  // Padding for start
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`pad-${i}`} className="h-14 sm:h-16"></div>);
  }
  
  for (let d = 1; d <= daysInMonth; d++) {
    const dayKey = `${currentYear}-${currentMonth}-${d}`;
    const sessions = sessionsByDay[dayKey] || [];
    const hasMorning = sessions.some(s => s.sessionType === 'MORNING');
    const hasEvening = sessions.some(s => s.sessionType === 'EVENING');
    
    // Check local sync status
    const allSynced = sessions.every(s => s.synced);

    const dateStrForComparison = new Date(currentYear, currentMonth, d).toDateString();
    const isSelected = selectedDate === dateStrForComparison;
    const isToday = today.getDate() === d && today.getMonth() === currentMonth && today.getFullYear() === currentYear;

    let buttonClasses = `h-14 sm:h-16 rounded-xl border flex flex-col items-center justify-center relative transition-all duration-200 `;
    
    if (isDarkMode) {
      if (isSelected) {
        buttonClasses += 'bg-stone-700 text-white border-stone-600 shadow-md transform scale-105 z-10';
      } else {
        buttonClasses += 'bg-stone-900 border-stone-800 text-stone-400 hover:bg-stone-800 hover:border-stone-700';
      }
      if (isToday && !isSelected) buttonClasses += ' ring-2 ring-amber-700 ring-offset-2 ring-offset-stone-950';
    } else {
      if (isSelected) {
        buttonClasses += 'bg-stone-800 text-white border-stone-800 shadow-md transform scale-105 z-10';
      } else {
        buttonClasses += 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50 hover:border-stone-300';
      }
      if (isToday && !isSelected) buttonClasses += ' ring-2 ring-amber-200 ring-offset-2';
    }

    days.push(
      <button 
        key={d} 
        onClick={() => onSelectDate(isSelected ? null : dateStrForComparison)}
        className={buttonClasses}
      >
        <span className={`font-medium text-sm ${isSelected ? 'text-white' : (isDarkMode ? 'text-stone-300' : 'text-stone-700')}`}>{d}</span>
        
        {/* Dots Container */}
        <div className="flex gap-1 mt-1">
          {hasMorning && (
            <div 
              className={`w-2 h-2 rounded-full ${isSelected ? 'bg-amber-400' : 'bg-amber-400'} shadow-sm`} 
              title="Sesión Matutina"
            />
          )}
          {hasEvening && (
            <div 
              className={`w-2 h-2 rounded-full ${isSelected ? (isDarkMode ? 'bg-stone-400' : 'bg-stone-400') : (isDarkMode ? 'bg-stone-500' : 'bg-stone-700')} shadow-sm`} 
              title="Sesión Nocturna"
            />
          )}
        </div>
        
        {/* Unsynced indicator */}
        {(sessions.length > 0 && !allSynced) && (
            <div className="absolute top-1 right-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            </div>
        )}
      </button>
    );
  }

  const monthName = viewDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  return (
    <div className={`p-6 rounded-2xl shadow-sm border mb-8 transition-colors ${
      isDarkMode 
        ? 'bg-stone-950 border-stone-800' 
        : 'bg-[#FAF9F6] border-stone-200'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <button onClick={prevMonth} className={`p-2 rounded-full transition-colors ${
          isDarkMode ? 'hover:bg-stone-800 text-stone-400' : 'hover:bg-stone-200 text-stone-600'
        }`}>
          <ChevronLeft size={20} />
        </button>
        <h3 className={`text-xl font-bold font-serif capitalize ${
          isDarkMode ? 'text-stone-200' : 'text-stone-800'
        }`}>{monthName}</h3>
        <button onClick={nextMonth} className={`p-2 rounded-full transition-colors ${
          isDarkMode ? 'hover:bg-stone-800 text-stone-400' : 'hover:bg-stone-200 text-stone-600'
        }`}>
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2 text-center">
        {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, i) => (
          <div key={i} className={`text-xs font-bold uppercase ${
            isDarkMode ? 'text-stone-600' : 'text-stone-400'
          }`}>{day}</div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {days}
      </div>

      <div className={`flex items-center justify-center gap-6 mt-6 text-xs ${
        isDarkMode ? 'text-stone-500' : 'text-stone-500'
      }`}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-400"></div> Matutina
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-stone-500' : 'bg-stone-700'}`}></div> Nocturna
        </div>
      </div>
    </div>
  );
};


export default function App() {
  const [step, setStep] = useState(AppStep.WELCOME);
  const [sessionMode, setSessionMode] = useState('EVENING');
  const [isPaused, setIsPaused] = useState(false); // Global Pause State
  const [isDarkMode, setIsDarkMode] = useState(false); // Theme State
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Safe UUID generation with fallback
  const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback for older browsers or insecure contexts
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };
  
  const [data, setData] = useState({
    id: generateId(),
    date: new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    timestamp: Date.now(),
    sessionType: 'EVENING',
    morning: '',
    midMorning: '',
    afternoon: '',
    midAfternoon: '',
    spatial: '',
    anecdote: '',
    memoryScore: 0,
    synced: false,
  });
  
  const [targetItems, setTargetItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [selectedHistoryDate, setSelectedHistoryDate] = useState(null); // For calendar filtering
  
  const fileInputRef = useRef(null);

  // Network status listeners
  useEffect(() => {
    const handleOnline = () => {
        setIsOnline(true);
        // Attempt auto-sync when back online
        attemptAutoSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, [history]); // Depend on history to have latest data for auto-sync logic if needed

  // Auto-sync function (silent)
  const attemptAutoSync = async () => {
      // Check if we have unsynced items
      const hasUnsynced = history.some(item => !item.synced);
      if (hasUnsynced && navigator.onLine) {
          console.log("Conexión detectada. Intentando sincronización automática...");
          try {
              // Only try if we have a token (pseudo-check: try calling sync)
              // We rely on the service to handle auth state. If it throws, we catch it.
              // Note: We avoid prompts here. If prompt needed, user must click button.
              const gapi = (window).gapi;
              if (gapi && gapi.client && gapi.client.getToken()) {
                   setIsSyncing(true);
                   const syncedData = await syncWithDrive(history);
                   
                   // Mark all as synced locally
                   const updatedHistory = syncedData.map(item => ({...item, synced: true}));
                   setHistory(updatedHistory);
                   localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
              }
          } catch (e) {
              console.log("Auto-sync skipped or failed (User auth needed or network error)");
          } finally {
              setIsSyncing(false);
          }
      }
  };

  useEffect(() => {
    setTargetItems(getRandomItems());
    // Load history
    const savedHistory = localStorage.getItem(STORAGE_KEY);
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        // Sort descending
        parsedHistory.sort((a, b) => b.timestamp - a.timestamp);
        setHistory(parsedHistory);
      } catch (e) {
        console.error("Error loading history", e);
      }
    }

    // Init Google Drive if possible
    initGoogleDrive((success) => {
        console.log("Google Drive Initialized:", success);
        if (success) attemptAutoSync(); // Try sync on load if online and authed
    });
  }, []);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const startSession = (mode) => {
    setSessionMode(mode);
    
    // Automatic theme adjustment based on session type
    if (mode === 'EVENING') {
      setIsDarkMode(true);
    } else {
      setIsDarkMode(false);
    }

    setData(prev => ({
      ...prev,
      id: generateId(),
      sessionType: mode,
      timestamp: Date.now(),
      date: new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      synced: false
    }));
    setStep(AppStep.MORNING_RECALL);
  };

  const handleSubmit = useCallback(async () => {
    const correctCount = selectedItems.filter(id => targetItems.some(t => t.id === id)).length;
    // Simple penalty
    const finalScore = Math.max(0, correctCount - (selectedItems.length - correctCount));
    
    const preAnalysisData = { ...data, memoryScore: finalScore };
    setData(preAnalysisData);
    setStep(AppStep.ANALYSIS);
    setIsLoading(true);
    
    // Offline local generation
    const aiFeedback = await generateCognitiveFeedback(preAnalysisData);
    
    // Create final object
    const finalData = { 
        ...preAnalysisData, 
        feedback: aiFeedback, 
        synced: false // Default to false until pushed to cloud
    };
    setFeedback(aiFeedback);
    
    // Save locally IMMEDIATELY (Offline First strategy)
    const updatedHistory = [finalData, ...history];
    const uniqueHistory = Array.from(new Map(updatedHistory.map(item => [item.id, item])).values());
    
    setHistory(uniqueHistory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(uniqueHistory));

    // Try to sync if online
    if (navigator.onLine) {
        // We trigger the sync process but don't block the UI
        attemptAutoSync().catch(err => console.log("Background sync failed, data is safe locally."));
    }

    setIsLoading(false);
    setStep(AppStep.COMPLETED);
  }, [data, selectedItems, targetItems, history]);

  const handleNext = useCallback(() => {
    if (isPaused) return; // Prevent next if paused
    window.scrollTo({ top: 0, behavior: 'smooth' });
    switch (step) {
      case AppStep.MORNING_RECALL: setStep(AppStep.MID_MORNING_RECALL); break;
      case AppStep.MID_MORNING_RECALL: setStep(AppStep.MEMORY_ENCODING); break;
      case AppStep.MEMORY_ENCODING: setStep(AppStep.AFTERNOON_RECALL); break;
      case AppStep.AFTERNOON_RECALL: setStep(AppStep.MID_AFTERNOON_RECALL); break;
      case AppStep.MID_AFTERNOON_RECALL: setStep(AppStep.SPATIAL_RECALL); break;
      case AppStep.SPATIAL_RECALL: setStep(AppStep.ANECDOTE); break;
      case AppStep.ANECDOTE: setStep(AppStep.ANECDOTE); break;
      case AppStep.ANECDOTE: setStep(AppStep.MEMORY_RETRIEVAL); break;
      case AppStep.MEMORY_RETRIEVAL: handleSubmit(); break;
      default: break;
    }
  }, [step, isPaused, handleSubmit]);

  const toggleSelection = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // --- Sync Logic ---

  const handleDriveSync = async () => {
    if (!navigator.onLine) {
        alert("No hay conexión a internet. Tus datos están guardados localmente y se sincronizarán cuando recuperes la conexión.");
        return;
    }

    setIsSyncing(true);
    try {
        await handleGoogleAuth(); // Force auth prompt if needed
        const syncedData = await syncWithDrive(history);
        
        // Mark items as synced
        const markedData = syncedData.map(item => ({...item, synced: true}));
        
        setHistory(markedData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(markedData));
        // alert("¡Sincronización con Google Drive completada!"); 
    } catch (e) {
        console.log("Sync cancelled or failed", e);
    } finally {
        setIsSyncing(false);
    }
  };

  // --- Export/Import Logic ---

  const exportData = () => {
    const dataStr = JSON.stringify(history, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `neurolog-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const triggerImport = () => {
    fileInputRef.current?.click();
  };

  const importData = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result;
        const parsedData = JSON.parse(content);
        
        if (Array.isArray(parsedData)) {
          const currentMap = new Map();
          history.forEach(item => currentMap.set(item.id, item));
          
          let addedCount = 0;
          parsedData.forEach((item) => {
            if (!currentMap.has(item.id)) {
              currentMap.set(item.id, item);
              addedCount++;
            }
          });

          const mergedHistory = Array.from(currentMap.values()).sort((a, b) => b.timestamp - a.timestamp);
          
          setHistory(mergedHistory);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedHistory));
          alert(`Se han importado ${addedCount} registros nuevos correctamente. Tu historial ahora contiene ${mergedHistory.length} entradas.`);
        } else {
          alert("El archivo no tiene el formato correcto.");
        }
      } catch (error) {
        console.error("Error al importar:", error);
        alert("Error al leer el archivo. Asegúrate de que sea un archivo .json válido.");
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const calculateLevel = () => {
    const entries = history.length;
    if (entries < 5) return "Novato Cognitivo";
    if (entries < 15) return "Aprendiz de Mnémosine";
    if (entries < 30) return "Arquitecto de Memoria";
    return "Maestro del Recuerdo";
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  // --- UI Helpers ---
  const getConnectivityIcon = () => {
      if (isSyncing) return <RefreshCw size={18} className="animate-spin text-blue-500" />;
      if (isOnline) {
          const unsyncedCount = history.filter(h => !h.synced).length;
          if (unsyncedCount > 0) return <CloudOff size={18} className="text-orange-500" />; // Online but pending sync
          return <Wifi size={18} className="text-green-500" />;
      }
      return <WifiOff size={18} className="text-stone-400" />;
  };

  const getConnectivityText = () => {
      if (isSyncing) return "Sincronizando...";
      if (isOnline) {
          const unsyncedCount = history.filter(h => !h.synced).length;
          if (unsyncedCount > 0) return `${unsyncedCount} por subir`;
          return "En línea";
      }
      return "Offline";
  };

  // --- Render Components ---

  const renderWelcome = () => (
    <div className="text-center max-w-lg mx-auto fade-in pt-6">
      <div className={`p-8 rounded-full inline-block mb-6 shadow-inner border-4 ${
        isDarkMode ? 'bg-stone-800 border-stone-700' : 'bg-[#E7E5E4] border-white'
      }`}>
        <Brain size={64} className={isDarkMode ? "text-stone-400" : "text-stone-700"} />
      </div>
      <h1 className={`text-5xl font-bold mb-4 font-serif tracking-tight ${
        isDarkMode ? 'text-stone-100' : 'text-stone-800'
      }`}>NeuroLog</h1>
      <div className="flex items-center justify-center gap-2 mb-8">
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
          isDarkMode 
            ? 'bg-stone-800 text-stone-400 border-stone-700' 
            : 'bg-stone-200 text-stone-600 border-stone-300'
        }`}>
          Nivel: {calculateLevel()}
        </span>
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
          isDarkMode
            ? 'bg-amber-900/30 text-amber-500 border-amber-900/50'
            : 'bg-amber-100 text-amber-700 border-amber-200'
        }`}>
          Sesiones: {history.length}
        </span>
      </div>
      <p className={`text-xl mb-10 leading-relaxed ${
        isDarkMode ? 'text-stone-400' : 'text-stone-600'
      }`}>
        Tu gimnasio mental personal. Elige tu momento para entrenar la memoria episódica.
      </p>
      <div className="flex flex-col gap-4">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => startSession('MORNING')}
            className={`group border-2 p-6 rounded-xl shadow-sm hover:shadow-md transition-all text-left flex flex-col gap-3 ${
              isDarkMode 
                ? 'bg-stone-900 border-stone-700 hover:border-amber-700 hover:bg-stone-800 text-stone-200' 
                : 'bg-white hover:bg-amber-50 border-amber-200 text-stone-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full transition-transform group-hover:scale-110 ${
                isDarkMode ? 'bg-amber-900/40 text-amber-500' : 'bg-amber-100 text-amber-600'
              }`}>
                <Sun size={24} />
              </div>
              <span className="font-bold text-lg font-serif">Sesión Matutina</span>
            </div>
            <p className={`text-sm ${isDarkMode ? 'text-stone-500' : 'text-stone-500'}`}>
              Ideal para planificar y activar la atención. Recordarás <strong>ayer</strong> para calentar.
            </p>
          </button>

          <button 
            onClick={() => startSession('EVENING')}
            className={`group p-6 rounded-xl shadow-lg hover:shadow-xl transition-all text-left flex flex-col gap-3 border-2 ${
               isDarkMode 
                ? 'bg-stone-800 border-stone-600 hover:border-stone-500 text-stone-100'
                : 'bg-stone-800 hover:bg-stone-700 text-[#FAF9F6] border-stone-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full transition-transform group-hover:scale-110 ${
                isDarkMode ? 'bg-stone-700 text-indigo-300' : 'bg-stone-700 text-stone-300'
              }`}>
                <Moon size={24} />
              </div>
              <span className="font-bold text-lg font-serif">Sesión Nocturna</span>
            </div>
            <p className={`text-sm ${isDarkMode ? 'text-stone-400' : 'text-stone-400'}`}>
              Ideal para consolidar y archivar recuerdos. Recordarás <strong>hoy</strong>.
            </p>
          </button>
        </div>
        
        <div className="flex flex-wrap gap-3 justify-center mt-6">
          {/* Botón de Google Drive / Login */}
          <button 
            onClick={handleDriveSync}
            disabled={isSyncing}
            className={`font-medium py-3 px-6 rounded-xl border transition-all flex items-center justify-center gap-2 text-sm w-full sm:w-auto shadow-sm hover:shadow-md ${
              isDarkMode 
                ? 'bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 border-indigo-800/50' 
                : 'bg-white hover:bg-indigo-50 text-indigo-600 border-indigo-100'
            }`}
          >
            {isSyncing ? <RefreshCw size={18} className="animate-spin"/> : <Cloud size={18} />}
            <span>{isSyncing ? "Sincronizando..." : "Iniciar Sesión con Google"}</span>
          </button>

          {history.length > 0 && (
            <button 
              onClick={() => setStep(AppStep.HISTORY)}
              className={`font-medium py-3 px-6 rounded-xl border transition-all flex items-center justify-center gap-2 text-sm w-full sm:w-auto ${
                isDarkMode 
                  ? 'bg-transparent hover:bg-stone-800 text-stone-400 border-stone-700' 
                  : 'bg-transparent hover:bg-stone-200 text-stone-600 border-stone-300'
              }`}
            >
              <BookOpen size={18} /> Ver Remembranzas
            </button>
          )}
          
          <button 
            onClick={triggerImport}
            className={`font-medium py-3 px-6 rounded-xl border transition-all flex items-center justify-center gap-2 text-sm w-full sm:w-auto ${
              isDarkMode 
                ? 'bg-transparent hover:bg-stone-800 text-stone-400 border-stone-700' 
                : 'bg-transparent hover:bg-stone-200 text-stone-600 border-stone-300'
            }`}
          >
            <Upload size={18} /> Cargar Respaldo
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={importData} 
            className="hidden" 
            accept=".json"
          />
        </div>
      </div>
    </div>
  );
}