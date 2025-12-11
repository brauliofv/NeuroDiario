import { JournalData } from "../types.js";

// Base de datos local de consejos neuroeducativos (Reemplaza a la IA)
const MORNING_TIPS = [
  "¡Gran comienzo! Para hoy, aplica la **Visualización Creativa**: Antes de hacer una tarea, imagínala terminada con éxito en tu mente.",
  "Bien recordado. Hoy usa el **Fichero Mental**: Asocia tus tareas pendientes a objetos de tu habitación para no olvidarlas.",
  "Excelente. Hoy practica la **Observación Consciente**: Fíjate en el color de ojos de la primera persona con la que hables.",
  "Buen trabajo. Para mantener el enfoque, usa la **Técnica Pomodoro**: 25 minutos de foco total, 5 de descanso.",
  "Activación completada. Intenta hoy la **Lectura Activa**: Si lees algo, detente cada página y resume mentalmente lo leído.",
  "Para hoy: **Ruta Nueva**. Intenta cambiar tu ruta habitual al trabajo o estudio para despertar nuevas conexiones neuronales."
];

const EVENING_TIPS = [
  "¡Día registrado! Para consolidar, haz una **Reconstrucción Inversa**: Repasa tu día desde este momento hacia atrás hasta que despertaste.",
  "Muy bien. Ahora practica la **Gratitud Visual**: Cierra los ojos y recrea nítidamente el mejor momento de hoy.",
  "Sesión completada. Mañana intenta recordar los **Detalles Sensoriales**: olores y temperaturas que pasaste por alto hoy.",
  "Buena disciplina. Antes de dormir, da una orden a tu subconsciente: 'Mañana despertaré con energía y recordaré mis sueños'.",
  "Ejercicio nocturno: **Palacio de la Memoria**. Ubica los 3 eventos principales de hoy en 3 muebles de tu habitación mentalmente.",
  "Para relajar el cerebro: **Respiración 4-7-8**. Inhala en 4s, retén 7s, exhala en 8s antes de cerrar los ojos."
];

const RECOVERY_TIPS = [
  "Parece que hubo distracciones. Mañana intenta la **Atención Voluntaria**: Di en voz alta lo que haces (ej. 'Estoy dejando las llaves en la mesa').",
  "No te preocupes. La memoria fluctúa. Prueba hacer **Asociaciones Absurdas** para recordar mejor las listas de objetos.",
  "Para mejorar la retención, intenta reducir la multitarea mañana. El cerebro codifica mejor **una cosa a la vez**."
];

export const generateCognitiveFeedback = async (data: JournalData): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 1500));

  const isMorning = data.sessionType === 'MORNING';
  const score = data.memoryScore;
  
  let feedbackPrefix = "";
  let tipPool: string[] = [];

  if (score === 5) {
    feedbackPrefix = "¡Memoria perfecta (5/5)! Tu hipocampo está en plena forma. ";
    tipPool = isMorning ? MORNING_TIPS : EVENING_TIPS;
  } else if (score >= 3) {
    feedbackPrefix = "Buen rendimiento de memoria. Has retenido la mayoría de la información. ";
    tipPool = isMorning ? MORNING_TIPS : EVENING_TIPS;
  } else {
    feedbackPrefix = "Hoy ha sido un reto para tu memoria de trabajo. ";
    tipPool = [...RECOVERY_TIPS, ...(isMorning ? MORNING_TIPS.slice(0, 2) : EVENING_TIPS.slice(0, 2))];
  }

  const randomIndex = Math.floor(Math.random() * tipPool.length);
  const selectedTip = tipPool[randomIndex];

  return `${feedbackPrefix} ${selectedTip}`;
};