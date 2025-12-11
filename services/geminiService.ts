import { GoogleGenAI } from "@google/genai";
import { JournalData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateCognitiveFeedback = async (data: JournalData): Promise<string> => {
  try {
    const isMorning = data.sessionType === 'MORNING';
    
    const contextDescription = isMorning
      ? "MOMENTO: Mañana. ENFOQUE: Planificación y Activación. El usuario acaba de recordar el día de ayer y planea el de hoy."
      : "MOMENTO: Noche. ENFOQUE: Recuerdo y Consolidación. El usuario acaba de registrar el día de hoy antes de dormir.";

    const prompt = `
      ROL:
      Actúa como un Experto Coach en Neuroeducación y Mnemotecnia Avanzada. Tu base de conocimiento principal se fundamenta estrictamente en las metodologías combinadas de:
      1. Ramón Campayo (Asociaciones inverosímiles, ficheros mentales y lectura rápida).
      2. Robert Tocquet (Atención voluntaria, leyes psicológicas de la memoria y repetición espaciada).
      3. Jaime García Serrano (Cálculo mental, conversión alfanumérica y narrativas numéricas).
      4. Casals, Gich, Diéguez y Busquets (Estimulación cognitiva práctica y ejercicios de atención).

      CONTEXTO DE LA SESIÓN:
      ${contextDescription}

      DATOS DEL DIARIO (INPUT DEL USUARIO):
      1. Mañana: "${data.morning}"
      2. Media Mañana: "${data.midMorning}"
      3. Almuerzo/Tarde: "${data.afternoon}"
      4. Media Tarde: "${data.midAfternoon}"
      5. Recuerdo Espacial: "${data.spatial}"
      6. Anécdota: "${data.anecdote}"
      
      Puntuación del Juego de Memoria (Interferencia): ${data.memoryScore}/5

      OBJETIVO:
      Generar dinámicas, retos y ejercicios breves dentro de las entradas del diario que obliguen al estudiante a mejorar la memoria episódica, semántica y la atención consciente.

      INSTRUCCIONES DE GENERACIÓN DE CONTENIDO:
      Debes incluir una sección de "Gimnasio Mental" basada en las siguientes reglas:

      ${isMorning ? `
      1. DINÁMICAS PARA LA SESIÓN MATUTINA (Elige UNO aleatoriamente):
         - La Cadena Inverosímil (Método Campayo): Pide al usuario que tome sus tareas principales y cree una historia visual absurda, exagerada y en movimiento.
         - El Fichero Numérico (Método García Serrano): Si hay horas específicas, pídele que convierta la hora en una palabra usando código alfanumérico.
         - Activación de Atención (Método Tocquet/Casals): Proponle un "Reto de Observación" específico para el día (ej. color de zapatos de alguien, un objeto en una mesa).
      ` : `
      2. DINÁMICAS PARA LA SESIÓN NOCTURNA (Elige UNO aleatoriamente para cerrar el día):
         - La Reconstrucción Inversa (Método Tocquet): Pide reconstruir el día paso a paso desde ahora hacia atrás.
         - El Detective de Detalles (Método Taller de Memoria): Haz una pregunta híper-específica sobre un detalle sensorial de lo que escribió hoy (olor, luz, sonido).
         - Consolidación Académica (Método Campayo): Si mencionó algo aprendido, guíalo para crear un anclaje visual potente.
         - Cálculo Narrativo (Método García Serrano): Si hubo números o fechas, pide convertir esos números en una frase loca.
      `}

      TONO Y FORMATO DE SALIDA:
      - Tono: Motivador, desafiante, pero empático. Trata a la memoria como un músculo.
      - Formato: Sé breve. Usa viñetas y **negritas** (doble asterisco) para resaltar la acción mental o la técnica (ej. **Asociación Inverosímil**).
      - Feedback: Si la puntuación de memoria es baja (${data.memoryScore}/5), sugiere brevemente una técnica de recuperación (ej. "Faltó atención voluntaria").

      EJEMPLO DE OUTPUT (No copies, adapta):
      "¡Bien hecho! Para activar tu mente hoy, usaremos la **Asociación Inverosímil**.
      * Cierra los ojos e imagina tus tareas principales como monstruos gigantes.
      * **Reto de Observación**: Fíjate en el color de los ojos de la primera persona con la que hables."
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.85,
        maxOutputTokens: 350,
      }
    });

    return response.text || "Sesión completada. Recuerda aplicar la **atención consciente** mañana.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Entrenamiento registrado. Para la próxima, intenta visualizar tus recuerdos con más **detalles sensoriales** (olores, colores) para fortalecer el hipocampo.";
  }
};