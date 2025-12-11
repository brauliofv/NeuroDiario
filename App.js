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

const MEMORY_ITEMS_POOL: MemoryItem[] = [
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

interface InteractiveFeedbackProps {
  text: string;
  isDarkMode: boolean;
}

const InteractiveFeedback: React.FC<InteractiveFeedbackProps> = ({ text, isDarkMode }) => {
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);

  if (!text) return null;

  const parts = text.split(/\*\*(.*?)\*\*/g);

  return (
    <>
      <div className="leading-relaxed">
        {parts.map((part, index) => {
          if (index % 2 === 1) {
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

interface CalendarProps {
  history: JournalData[];
  onSelectDate: (date: string | null) => void;
  selectedDate: string | null;
  isDarkMode: boolean;
}

const CalendarWidget: React.FC<CalendarProps> = ({ history, onSelectDate, selectedDate, isDarkMode }) => {
  const [viewDate, setViewDate] = useState(new Date());

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay(); 
  };

  const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
  const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
  
  const sessionsByDay = history.reduce((acc, session) => {
    const dateObj = new Date(session.timestamp);
    const dayKey = `${dateObj.getFullYear()}-${dateObj.getMonth()}-${dateObj.getDate()}`;
    if (!acc[dayKey]) acc[dayKey] = [];
    acc[dayKey].push(session);
    return acc;
  }, {} as Record<string, JournalData[]>);

  const prevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  const today = new Date();
  
  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`pad-${i}`} className="h-14 sm:h-16"></div>);
  }
  
  for (let d = 1; d <= daysInMonth; d++) {
    const dayKey = `${currentYear}-${currentMonth}-${d}`;
    const sessions = sessionsByDay[dayKey] || [];
    const hasMorning = sessions.some(s => s.sessionType === 'MORNING');
    const hasEvening = sessions.some(s => s.sessionType === 'EVENING');
    
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
  const [step, setStep] = useState<AppStep>(AppStep.WELCOME);
  const [sessionMode, setSessionMode] = useState<SessionMode>('EVENING');
  const [isPaused, setIsPaused] = useState(false); 
  const [isDarkMode, setIsDarkMode] = useState(false); 
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };
  
  const [data, setData] = useState<JournalData>({
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
  
  const [targetItems, setTargetItems] = useState<MemoryItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<JournalData[]>([]);
  const [selectedHistoryDate, setSelectedHistoryDate] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleOnline = () => {
        setIsOnline(true);
        attemptAutoSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, [history]);

  const attemptAutoSync = async () => {
      const hasUnsynced = history.some(item => !item.synced);
      if (hasUnsynced && navigator.onLine) {
          console.log("Conexión detectada. Intentando sincronización automática...");
          try {
              const gapi = (window as any).gapi;
              if (gapi && gapi.client && gapi.client.getToken()) {
                   setIsSyncing(true);
                   const syncedData = await syncWithDrive(history);
                   
                   const updatedHistory = syncedData.map(item => ({...item, synced: true}));
                   setHistory(updatedHistory);
                   localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
              }
          } catch (e) {
              console.log("Auto-sync skipped or failed");
          } finally {
              setIsSyncing(false);
          }
      }
  };

  useEffect(() => {
    setTargetItems(getRandomItems());
    const savedHistory = localStorage.getItem(STORAGE_KEY);
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        parsedHistory.sort((a: JournalData, b: JournalData) => b.timestamp - a.timestamp);
        setHistory(parsedHistory);
      } catch (e) {
        console.error("Error loading history", e);
      }
    }

    initGoogleDrive((success) => {
        console.log("Google Drive Initialized:", success);
        if (success) attemptAutoSync();
    });
  }, []);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const startSession = (mode: SessionMode) => {
    setSessionMode(mode);
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
    const finalScore = Math.max(0, correctCount - (selectedItems.length - correctCount));
    
    const preAnalysisData = { ...data, memoryScore: finalScore };
    setData(preAnalysisData);
    setStep(AppStep.ANALYSIS);
    setIsLoading(true);
    
    const aiFeedback = await generateCognitiveFeedback(preAnalysisData);
    
    const finalData = { 
        ...preAnalysisData, 
        feedback: aiFeedback, 
        synced: false
    };
    setFeedback(aiFeedback);
    
    const updatedHistory = [finalData, ...history];
    const uniqueHistory = Array.from(new Map(updatedHistory.map(item => [item.id, item])).values());
    
    setHistory(uniqueHistory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(uniqueHistory));

    if (navigator.onLine) {
        attemptAutoSync().catch(err => console.log("Background sync failed, data is safe locally."));
    }

    setIsLoading(false);
    setStep(AppStep.COMPLETED);
  }, [data, selectedItems, targetItems, history]);

  const handleNext = useCallback(() => {
    if (isPaused) return; 
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

  const toggleSelection = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleDriveSync = async () => {
    if (!navigator.onLine) {
        alert("No hay conexión a internet. Tus datos están guardados localmente y se sincronizarán cuando recuperes la conexión.");
        return;
    }

    setIsSyncing(true);
    try {
        await handleGoogleAuth(); 
        const syncedData = await syncWithDrive(history);
        
        const markedData = syncedData.map(item => ({...item, synced: true}));
        
        setHistory(markedData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(markedData));
    } catch (e) {
        console.log("Sync cancelled or failed", e);
    } finally {
        setIsSyncing(false);
    }
  };

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

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedData = JSON.parse(content);
        
        if (Array.isArray(parsedData)) {
          const currentMap = new Map<string, JournalData>();
          history.forEach(item => currentMap.set(item.id, item));
          
          let addedCount = 0;
          parsedData.forEach((item: JournalData) => {
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

  const getConnectivityIcon = () => {
      if (isSyncing) return <RefreshCw size={18} className="animate-spin text-blue-500" />;
      if (isOnline) {
          const unsyncedCount = history.filter(h => !h.synced).length;
          if (unsyncedCount > 0) return <CloudOff size={18} className="text-orange-500" />; 
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

  return (
    <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-500 relative ${
      isDarkMode ? 'bg-stone-950' : 'bg-[#E7E5E4]'
    }`}>
      
      <button 
        onClick={toggleDarkMode}
        className={`fixed top-6 right-6 z-50 p-3 rounded-full shadow-lg transition-all transform hover:scale-110 ${
          isDarkMode 
            ? 'bg-stone-800 text-amber-400 hover:bg-stone-700' 
            : 'bg-white text-stone-600 hover:text-amber-600 hover:bg-amber-50'
        }`}
        title={isDarkMode ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className={`fixed top-6 left-6 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full shadow-lg text-xs font-bold border transition-colors ${
          isDarkMode 
            ? 'bg-stone-900 border-stone-700 text-stone-300' 
            : 'bg-white border-stone-200 text-stone-600'
      }`}>
          {getConnectivityIcon()}
          <span>{getConnectivityText()}</span>
      </div>

      <div className="max-w-4xl mx-auto relative">
        {step !== AppStep.WELCOME && step !== AppStep.COMPLETED && step !== AppStep.HISTORY && step !== AppStep.ANALYSIS && (
          <button
            onClick={togglePause}
            className={`fixed bottom-8 right-8 z-50 p-4 rounded-full shadow-2xl transition-all transform hover:scale-110 focus:outline-none focus:ring-4 ${
              isDarkMode 
                ? 'bg-stone-700 text-white hover:bg-stone-600 focus:ring-stone-600' 
                : 'bg-stone-800 text-white hover:bg-stone-700 focus:ring-stone-300'
            }`}
            title={isPaused ? "Reanudar Sesión" : "Pausar Sesión"}
          >
            {isPaused ? <Play size={28} /> : <Pause size={28} />}
          </button>
        )}

        {isPaused && (
          <div className="fixed inset-0 z-40 bg-stone-950/90 backdrop-blur-sm flex flex-col items-center justify-center text-white fade-in">
            <div className="bg-stone-900 p-8 rounded-2xl shadow-2xl text-center max-w-sm border border-stone-800">
              <Pause size={64} className="mx-auto mb-6 text-amber-500" />
              <h2 className="text-3xl font-serif font-bold mb-4 text-stone-200">Sesión Pausada</h2>
              <p className="text-stone-400 mb-8">Tómate un respiro. Tu progreso está seguro.</p>
              <button 
                onClick={togglePause}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-8 rounded-xl transition-all w-full flex items-center justify-center gap-2"
              >
                <Play size={20} /> Continuar
              </button>
            </div>
          </div>
        )}

        {step !== AppStep.WELCOME && step !== AppStep.COMPLETED && step !== AppStep.HISTORY && (
          <div className="w-full mb-12 px-2">
            <div className={`flex justify-between text-xs font-bold uppercase tracking-wider mb-3 ${
              isDarkMode ? 'text-stone-500' : 'text-stone-400'
            }`}>
              <span>Inicio</span>
              <span>Media M.</span>
              <span>Codif.</span>
              <span>Tarde</span>
              <span>Media T.</span>
              <span>Espacial</span>
              <span>Anécdota</span>
              <span>Recup.</span>
            </div>
            <div className={`h-3 rounded-full overflow-hidden shadow-inner ${
              isDarkMode ? 'bg-stone-900' : 'bg-stone-200'
            }`}>
              <div 
                className={`h-full transition-all duration-700 ease-in-out relative ${
                  isDarkMode ? 'bg-stone-500' : 'bg-stone-600'
                }`}
                style={{ 
                  width: `${
                    step === AppStep.MORNING_RECALL ? 10 :
                    step === AppStep.MID_MORNING_RECALL ? 22 :
                    step === AppStep.MEMORY_ENCODING ? 35 :
                    step === AppStep.AFTERNOON_RECALL ? 48 :
                    step === AppStep.MID_AFTERNOON_RECALL ? 60 :
                    step === AppStep.SPATIAL_RECALL ? 72 : 
                    step === AppStep.ANECDOTE ? 85 : 100
                  }%` 
                }}
              >
                <div className="absolute top-0 right-0 bottom-0 w-full bg-gradient-to-l from-white/20 to-transparent"></div>
              </div>
            </div>
          </div>
        )}

        {step === AppStep.WELCOME && renderWelcome()}
        
        {step === AppStep.MORNING_RECALL && renderSection(
          AppStep.MORNING_RECALL,
          data.morning,
          'morning',
          120, 
          <Sun size={24}/>
        )}

        {step === AppStep.MID_MORNING_RECALL && renderSection(
          AppStep.MID_MORNING_RECALL,
          data.midMorning,
          'midMorning',
          120,
          <Coffee size={24}/>
        )}

        {step === AppStep.MEMORY_ENCODING && renderMemoryEncoding()}

        {step === AppStep.AFTERNOON_RECALL && renderSection(
          AppStep.AFTERNOON_RECALL,
          data.afternoon,
          'afternoon',
          120,
          <Sun size={24} className="text-orange-500"/>
        )}

        {step === AppStep.MID_AFTERNOON_RECALL && renderSection(
          AppStep.MID_AFTERNOON_RECALL,
          data.midAfternoon,
          'midAfternoon',
          120,
          <CloudRain size={24}/>
        )}

        {step === AppStep.SPATIAL_RECALL && renderSection(
          AppStep.SPATIAL_RECALL,
          data.spatial,
          'spatial',
          120,
          <MapPin size={24}/>
        )}
        
        {step === AppStep.ANECDOTE && renderSection(
          AppStep.ANECDOTE,
          data.anecdote,
          'anecdote',
          120,
          <Sparkles size={24}/>
        )}

        {step === AppStep.MEMORY_RETRIEVAL && renderMemoryRetrieval()}
        
        {step === AppStep.ANALYSIS && renderAnalysis()}
        
        {step === AppStep.COMPLETED && renderCompleted()}

      </div>
    </div>
  );
}