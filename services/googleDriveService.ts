import { JournalData } from "../types.ts";

// IMPORTANTE: Para que esto funcione en producción, debes crear un proyecto en Google Cloud Console
// y obtener tu CLIENT_ID. Habilita la "Google Drive API".
// Si no hay CLIENT_ID configurado, el servicio mostrará un aviso.
const CLIENT_ID = ''; // <--- AQUÍ IRÍA TU CLIENT ID (ej. "123456789-abcde.apps.googleusercontent.com")
const API_KEY = '';   // <--- AQUÍ TU API KEY (Opcional si usas solo el flujo implícito, pero recomendado para GAPI)
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/drive.file";

let tokenClient: any;
let gapiInited = false;
let gisInited = false;

export const initGoogleDrive = (onInit: (success: boolean) => void) => {
  if (!CLIENT_ID) {
    console.warn("Google Drive: No CLIENT_ID configured.");
    return;
  }

  const gapi = (window as any).gapi;
  const google = (window as any).google;

  if (!gapi || !google) return;

  gapi.load("client", async () => {
    try {
      await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: DISCOVERY_DOCS,
      });
      gapiInited = true;
      checkInit(onInit);
    } catch (err) {
      console.error("Error init GAPI client", err);
    }
  });

  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: '', // defined later
  });
  gisInited = true;
  checkInit(onInit);
};

const checkInit = (cb: (s: boolean) => void) => {
  if (gapiInited && gisInited) cb(true);
};

export const handleGoogleAuth = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!CLIENT_ID) {
      alert("Para usar Google Drive, necesitas configurar un CLIENT_ID en el código fuente (archivo googleDriveService.ts). Por ahora, el modo offline funciona perfectamente.");
      reject("No Client ID");
      return;
    }

    tokenClient.callback = async (resp: any) => {
      if (resp.error !== undefined) {
        reject(resp);
      }
      resolve();
    };

    if ((window as any).gapi.client.getToken() === null) {
      // Prompt the user to select a Google Account and ask for consent to share their data
      tokenClient.requestAccessToken({prompt: 'consent'});
    } else {
      // Skip display of account chooser and consent dialog for an existing session.
      tokenClient.requestAccessToken({prompt: ''});
    }
  });
};

const FILENAME = 'neurolog_backup.json';

// Buscar si ya existe el archivo en Drive
const findFile = async () => {
  const response = await (window as any).gapi.client.drive.files.list({
    q: `name = '${FILENAME}' and trashed = false`,
    fields: 'files(id, name)',
    spaces: 'drive',
  });
  const files = response.result.files;
  if (files && files.length > 0) {
    return files[0].id;
  }
  return null;
};

export const syncWithDrive = async (localData: JournalData[]): Promise<JournalData[]> => {
  try {
    const fileId = await findFile();
    let driveData: JournalData[] = [];

    // 1. Leer datos de Drive si existe archivo
    if (fileId) {
      const response = await (window as any).gapi.client.drive.files.get({
        fileId: fileId,
        alt: 'media',
      });
      driveData = response.result || [];
    }

    // 2. Mezclar datos (Merge)
    const combinedMap = new Map();
    driveData.forEach((item) => combinedMap.set(item.id, item));
    localData.forEach((item) => combinedMap.set(item.id, item)); // Local sobrescribe si es más reciente o igual, simplificado
    
    const mergedData = Array.from(combinedMap.values()).sort((a: any, b: any) => b.timestamp - a.timestamp);

    // 3. Guardar de nuevo en Drive
    const fileContent = JSON.stringify(mergedData);
    const file = new Blob([fileContent], {type: 'application/json'});
    const metadata = {
      name: FILENAME,
      mimeType: 'application/json',
    };

    const accessToken = (window as any).gapi.client.getToken().access_token;
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
    form.append('file', file);

    const updateUrl = fileId 
      ? `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`
      : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

    const method = fileId ? 'PATCH' : 'POST';

    await fetch(updateUrl, {
      method: method,
      headers: new Headers({'Authorization': 'Bearer ' + accessToken}),
      body: form,
    });

    return mergedData;

  } catch (err) {
    console.error("Error syncing with Drive", err);
    throw err;
  }
};