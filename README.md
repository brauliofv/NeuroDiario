# 🧠 NeuroLog - Gimnasio de Memoria Episódica

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)

> **NeuroLog** no es solo un diario; es un entrenamiento cognitivo diseñado para fortalecer tu hipocampo y mejorar tu retención de memoria a través de la evocación deliberada y estructurada.

---

## 📖 Descripción del Proyecto

**NeuroLog** es una Aplicación Web Progresiva (PWA) diseñada bajo principios de neuroeducación. Su objetivo principal es combatir el deterioro cognitivo leve y mejorar la atención plena mediante la **escritura reflexiva estructurada**.

A diferencia de un diario convencional donde solo "vuelcas" pensamientos, NeuroLog te guía por secciones cronológicas y espaciales específicas (Mañana, Mediodía, Tarde, Espacio Físico), obligando a tu cerebro a realizar un esfuerzo consciente para recuperar detalles sensoriales, nombres y secuencias de eventos.

### 🎯 Objetivo Científico
El ejercicio se basa en la **Recuperación Activa**. Al forzar a tu mente a recordar detalles triviales (qué desayunaste, de qué color era la ropa de tu compañero, qué ruta tomaste), fortaleces las conexiones neuronales asociadas a la memoria episódica a corto y largo plazo.

---

## ⚙️ ¿Cómo Funciona?

La aplicación divide el entrenamiento en dos modalidades principales:

### 1. ☀️ Sesión Matutina (Recuperación Diferida)
*   **El Reto:** Al despertar, debes recordar con detalle el día de **ayer**.
*   **Por qué:** La memoria de ayer ya ha pasado por un ciclo de sueño (consolidación). Intentar recuperarla al día siguiente es un ejercicio de mayor intensidad para el cerebro.

### 2. 🌙 Sesión Nocturna (Recuperación Inmediata)
*   **El Reto:** Antes de dormir, repasas el día de **hoy**.
*   **Por qué:** Ayuda a organizar la información antes del sueño, facilitando que el cerebro decida qué guardar y qué descartar.

### 🔄 El Flujo de Entrenamiento
1.  **Codificación (Encoding):** Se te presentan 5 objetos aleatorios (ej. 🚲, 🍕, 🚀) que debes memorizar visualmente.
2.  **Escritura Guiada:** Completas las secciones del diario (Mañana, Tarde, Espacial, Anécdota). Mientras escribes, tu memoria de trabajo está ocupada, lo que añade dificultad a retener los objetos del paso 1.
3.  **Recuperación (Retrieval):** Al finalizar, sin ver la lista original, debes seleccionar los 5 objetos que memorizaste al principio entre una lista de distractores.
4.  **Feedback Neuroeducativo:** Recibes una puntuación (0-5) y un consejo técnico basado en tu desempeño.

---

## 🛠️ Stack Tecnológico

Este proyecto destaca por su simplicidad y portabilidad. Utiliza una arquitectura **"Buildless"** (sin procesos de compilación complejos de Node.js en el despliegue), lo que permite que funcione en cualquier servidor estático (GitHub Pages, Vercel, Netlify) instantáneamente.

*   **Core:** React 18 (vía CDN).
*   **Estilos:** Tailwind CSS (vía CDN).
*   **Iconos:** Lucide React.
*   **Transpilación:** Babel Standalone (en el navegador).
*   **Almacenamiento:** LocalStorage + Google Drive API (Sincronización opcional).
*   **PWA:** Service Workers para soporte Offline completo.

---

## 🚀 Instalación y Despliegue

No necesitas instalar `npm` ni `node_modules` para probar esto.

### Opción A: Ejecutar Localmente
1.  Clona el repositorio.
2.  Abre el archivo `index.html` en tu navegador.
    *   *Nota:* Para que funcionen los módulos ES6 y el Service Worker correctamente, se recomienda usar una extensión como "Live Server" en VS Code o correr un servidor local simple con Python:
    ```bash
    python3 -m http.server
    ```

### Opción B: Despliegue en GitHub Pages / Vercel
1.  Sube los archivos a tu repositorio.
2.  Activa GitHub Pages en la configuración del repositorio apuntando a la rama `main` (root).
3.  ¡Listo! La app funcionará automáticamente.

---

## 💡 Recomendaciones de Uso

1.  **Constancia sobre Intensidad:** Es mejor hacer 5 minutos todos los días que 30 minutos una vez a la semana.
2.  **Detalle Sensorial:** No escribas "fui a comer". Escribe "fui a comer, el lugar olía a café tostado, hacía frío y la mesa cojeaba un poco". Los detalles anclan la memoria.
3.  **No te frustres:** Si un día olvidas los 5 objetos, es normal. El fallo es parte del entrenamiento.

---

## 🔮 Siguientes Pasos (Roadmap)

*   [ ] Integración real con **Gemini API** para analizar lo que escribes y detectar patrones emocionales o lagunas de memoria.
*   [ ] Gráficos de progreso semanal.
*   [ ] Modo "Hardcore": Aumentar a 10 objetos para memorizar.
*   [ ] Exportación a PDF del diario mensual.

---

## ☕ Apoya el Proyecto

El desarrollo de herramientas de salud mental accesibles y gratuitas requiere tiempo y café. Si **NeuroLog** te ha ayudado a recordar dónde dejaste las llaves o simplemente disfrutas del ejercicio mental, considera hacer una donación.

Tu apoyo ayuda a mantener el dominio, mejorar la sincronización con la nube y desarrollar nuevas funcionalidades de IA.

<a href="https://www.buymeacoffee.com/brauliofv" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

*(Reemplaza el enlace de arriba con tu enlace real de BuyMeACoffee o PayPal)*

---

Hecho con ❤️ y 🧠 por [BraulioFV](https://github.com/brauliofv)
