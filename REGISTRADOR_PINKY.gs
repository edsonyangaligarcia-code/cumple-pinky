// Configura el ID únicamente en el proyecto privado de Apps Script.
const ID_HOJA_REGISTRO = 'REEMPLAZAR_CON_ID_DE_TU_GOOGLE_SHEET';
const NOMBRE_PESTANA = 'Pulsaciones';
const ZONA_HORARIA = 'America/Lima';
const FECHA_APERTURA_UTC = Date.UTC(2026, 10, 8, 5, 0, 0);

function doPost(e) {
  const p = (e && e.parameter) || {};
  const id = String(p.id_evento || '');
  const sesion = String(p.sesion || '');
  const valido = /^[a-zA-Z0-9-]{8,80}$/;
  if (p.tipo !== 'pulsacion_sorpresa' || !valido.test(id) || !valido.test(sesion)) return ContentService.createTextOutput('IGNORADO');
  const recibido = new Date();
  const bloqueo = LockService.getScriptLock();
  if (!bloqueo.tryLock(15000)) return ContentService.createTextOutput('OCUPADO');
  try {
    const cache = CacheService.getScriptCache();
    if (cache.get('evento:' + id)) return ContentService.createTextOutput('DUPLICADO');
    const minuto = Math.floor(recibido.getTime() / 60000);
    const clave = 'limite:' + sesion + ':' + minuto;
    const cantidad = Number(cache.get(clave) || 0);
    if (cantidad >= 300) return ContentService.createTextOutput('LIMITE');
    const hoja = SpreadsheetApp.openById(ID_HOJA_REGISTRO).getSheetByName(NOMBRE_PESTANA);
    if (!hoja) throw new Error('No existe la pestaña Pulsaciones');
    const seguro = (valor, maximo) => String(valor || '').slice(0, maximo).replace(/[^a-zA-Z0-9_.:/-]/g, '');
    hoja.appendRow([
      Utilities.formatDate(recibido, ZONA_HORARIA, 'yyyy-MM-dd'),
      Utilities.formatDate(recibido, ZONA_HORARIA, 'HH:mm:ss'),
      recibido.getTime() < FECHA_APERTURA_UTC ? 'Antes del desbloqueo' : 'Después del desbloqueo',
      id.indexOf('PRUEBA-') === 0 ? 'PRUEBA' : 'Pulsación',
      recibido.toISOString(),
      Math.max(0, Math.ceil((FECHA_APERTURA_UTC - recibido.getTime()) / 1000)),
      sesion, id, seguro(p.pagina, 120), seguro(p.hora_dispositivo, 40)
    ]);
    SpreadsheetApp.flush();
    cache.put('evento:' + id, '1', 21600);
    cache.put(clave, String(cantidad + 1), 120);
    return ContentService.createTextOutput('OK');
  } catch (error) {
    console.error('Error al registrar: ' + error);
    return ContentService.createTextOutput('ERROR');
  } finally {
    bloqueo.releaseLock();
  }
}

function doGet() { return ContentService.createTextOutput('Servicio de registro de Cumple Pinky'); }
