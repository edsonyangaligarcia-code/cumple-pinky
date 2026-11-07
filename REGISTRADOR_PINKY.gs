/**
 * Registro de pulsaciones del botón flotante de Cumple Pinky.
 * Instalar en Google Sheets > Extensiones > Apps Script.
 * IMPORTANTE: sustituir el ID solo en el proyecto PRIVADO de Apps Script.
 * No publiques aquí el ID real de la hoja.
 */
const ID_HOJA_REGISTRO = "REEMPLAZAR_CON_ID_DE_TU_GOOGLE_SHEET";
const NOMBRE_PESTANA = "Pulsaciones";
const ZONA_HORARIA = "America/Lima";
const FECHA_APERTURA_UTC = Date.UTC(2026, 10, 8, 5, 0, 0); // 08/11/2026, 00:00 Perú

function doPost(e) {
  try {
    const p = (e && e.parameter) || {};
    if (p.tipo !== "pulsacion_sorpresa") {
      return ContentService.createTextOutput("Solicitud ignorada");
    }

    const recibido = new Date(); // Hora confiable del servidor
    const estado = recibido.getTime() < FECHA_APERTURA_UTC
      ? "Antes del desbloqueo"
      : "Después del desbloqueo";
    const segundosRestantes = Math.max(
      0, Math.ceil((FECHA_APERTURA_UTC - recibido.getTime()) / 1000)
    );

    const libro = SpreadsheetApp.openById(ID_HOJA_REGISTRO);
    const hoja = libro.getSheetByName(NOMBRE_PESTANA);
    if (!hoja) throw new Error("No existe la pestaña Pulsaciones");

    const seguro = (valor, maximo) => String(valor || "")
      .slice(0, maximo)
      .replace(/[^a-zA-Z0-9_.:/-]/g, "");

    const registro = [
      Utilities.formatDate(recibido, ZONA_HORARIA, "yyyy-MM-dd"),
      Utilities.formatDate(recibido, ZONA_HORARIA, "HH:mm:ss"),
      estado,
      "Pulsación",
      recibido.toISOString(),
      segundosRestantes,
      seguro(p.sesion, 80),
      seguro(p.id_evento, 100),
      seguro(p.pagina, 120),
      seguro(p.hora_dispositivo, 40)
    ];

    const bloqueo = LockService.getScriptLock();
    bloqueo.waitLock(15000);
    try {
      hoja.appendRow(registro);
    } finally {
      bloqueo.releaseLock();
    }
    return ContentService.createTextOutput("OK");
  } catch (error) {
    console.error("Error al registrar una pulsación: " + error);
    return ContentService.createTextOutput("ERROR");
  }
}

function doGet() {
  return ContentService.createTextOutput("Servicio de registro de Cumple Pinky");
}
