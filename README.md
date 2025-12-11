<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1UXUfI27oib94BCPHDGJN_cXR69ZQZH6y

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

# 🧠 NeuroLog - Gimnasio de Memoria & Diario Cognitivo

**NeuroLog** es una aplicación web progresiva (PWA) diseñada científicamente para estimular la retención de memoria episódica y semántica a través de la escritura de un diario estructurado. 

A diferencia de un diario convencional, NeuroLog actúa como un "entrenador personal" para tu cerebro, intercalando ejercicios de codificación y recuperación de memoria dentro de la rutina de escritura, potenciado por Inteligencia Artificial (Google Gemini) para ofrecer feedback neuroeducativo personalizado.

![React](https://img.shields.io/badge/React-19-blue) ![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC) ![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini-8E75B2) ![PWA](https://img.shields.io/badge/Mobile-PWA%20Ready-success)

## 🚀 Funcionalidades Principales

### 1. Modos de Sesión Contextuales
La aplicación adapta su interfaz y sus preguntas según el momento del día, optimizando la experiencia visual y cognitiva:

*   **☀️ Sesión Matutina (Recuperación Diferida):** Enfocada en recordar el día **de ayer**. Ejercita la memoria a largo plazo. La interfaz se presenta en modo claro para activar la atención.
*   **🌙 Sesión Nocturna (Consolidación):** Enfocada en recordar el día **de hoy** antes de dormir. Ayuda a transferir recuerdos al hipocampo. Activa automáticamente el **Modo Oscuro (Dark Mode)** para reducir la fatiga visual y no alterar el ciclo de sueño.

### 2. Dinámica de "Interferencia Cognitiva"
Para entrenar la memoria de trabajo, la app utiliza una técnica de interferencia:
1.  **Codificación:** A mitad de la sesión, se presentan 5 objetos aleatorios (ej. 🚲, 🎸, 🌵) que el usuario debe memorizar en 30 segundos.
2.  **Interferencia:** El usuario continúa escribiendo su diario (secciones de tarde/noche), lo que obliga al cerebro a mantener los objetos en "segundo plano".
3.  **Recuperación:** Al finalizar, el usuario debe seleccionar los objetos correctos de una lista mezclada, poniendo a prueba su retención tras la distracción.

### 3. Secciones de Estimulación Específica
El diario no es libre, sino guiado por secciones clave para la neurobiología:
*   **Cronología:** Divide el día en bloques (Mañana, Mediodía, Tarde) para forzar el orden secuencial.
*   **📍 Recuerdo Espacial:** Solicita visualizar trayectos o lugares visitados en 3D, una tarea que activa intensamente el hipocampo (nuestro GPS interno).
*   **✨ Anécdota Emocional:** Busca fijar recuerdos mediante la emoción (amígdala).

### 4. Feedback con IA (Google Gemini)
Al finalizar, la IA analiza lo escrito y actúa como un **Coach de Neuroeducación**.
*   Utiliza metodologías de expertos (Ramón Campayo, Robert Tocquet, García Serrano).
*   Sugiere ejercicios mentales (ej. "Asociaciones Inverosímiles", "Reconstrucción Inversa").
*   **Feedback Interactivo:** Los términos técnicos en la respuesta de la IA son clicables, mostrando explicaciones educativas sobre cómo funciona el cerebro.

### 5. Historial y Calendario
*   **Vista de Calendario:** Visualización mensual con indicadores de sesiones completadas (puntos sol/luna).
*   **Filtrado:** Permite revisar remembranzas de fechas específicas.
*   **Gamificación:** Sistema de niveles ("Novato", "Arquitecto de Memoria") basado en la constancia.

### 6. Diseño "Mobile-First" & PWA
*   Diseño totalmente responsivo y estético (Tailwind CSS).
*   **Modo Oscuro/Claro:** Automático según la sesión o manual mediante toggle.
*   Preparada para instalarse como App nativa en Android/iOS (Manifest, meta tags de viewport y touch icons).

---

## 🛠️ Stack Tecnológico

*   **Frontend:** React 19 (TypeScript).
*   **Estilos:** Tailwind CSS (Diseño editorial limpio, paleta Stone/Amber).
*   **Iconografía:** Lucide React.
*   **IA:** Google Generative AI SDK (Gemini 2.5 Flash).
*   **Persistencia:** LocalStorage (con opción de Exportar/Importar Backup en JSON).

## 🧪 Metodología Científica Implementada

La app se basa en principios de:
1.  **Recuperación Activa (Active Recall):** Forzar al cerebro a buscar la información fortalece las conexiones neuronales más que la relectura pasiva.
2.  **Repetición Espaciada:** Al recordar el día anterior (sesión matutina), reforzamos la huella de memoria tras un periodo de sueño.
3.  **Atención Consciente:** Los "tips" visuales durante la escritura guían al usuario a recordar detalles sensoriales (olores, luces), mejorando la calidad del recuerdo (Qualia).

## 📱 Instalación (Como Usuario)

Esta aplicación es una **Progressive Web App (PWA)**.
1.  Abre la web en tu navegador móvil (Chrome en Android o Safari en iOS).
2.  Abre el menú de opciones.
3.  Selecciona **"Agregar a pantalla de inicio"** (Android) o **"Compartir > Agregar al inicio"** (iOS).
4.  La app se instalará como una aplicación nativa, a pantalla completa y sin barras de navegación.

---

> *"La memoria no es un almacén, es un músculo que se debe ejercitar a diario."*
