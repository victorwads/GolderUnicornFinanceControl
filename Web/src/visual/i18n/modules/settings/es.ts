import type SettingsModuleTranslation from './base';

const es: SettingsModuleTranslation = {
  settings: {
    title: "Configuraciones",
    data: "Datos",
    myData: "Mis Datos",
    exportData: "Exportar Mis Datos",
    exportingData: (filename,current,max)=>`Exportando ${filename} (${current}/${max})%`,
    exportDataError: "No pudimos exportar tus datos. Inténtalo de nuevo.",
    deleteData: "Eliminar todos mis datos",
    deleteDataConfirm: "¿Estás seguro? Tus datos se exportarán y se eliminarán permanentemente.",
    deleteDataPrompt: phrase=>`Escribe "${phrase}" para confirmar.`,
    deleteDataMismatch: "La frase ingresada no coincide. No se eliminó nada.",
    deleteDataSuccess: "Todos tus datos se eliminaron. Tu sesión se cerrará enseguida.",
    deleteDataError: "No pudimos completar la eliminación de datos. Inténtalo de nuevo.",
    deleteDataPhrases: ()=>["Acepto eliminar todos mis datos","Quiero borrar definitivamente mis datos","Entiendo que esta acci\xF3n es irreversible","Deseo remover todo sobre mi cuenta","S\xED, borra todos mis datos ahora"],
    deletingData: (filename,current,max)=>`Eliminando ${filename} (${current}/${max})...`,
    auth: "Autenticación",
    logout: "Cerrar sesión",
    clearLocalCaches: "Borrar cachés locales",
    resetOnboarding: "Reiniciar onboarding",
    theme: "Tema",
    density: "Densidad",
    loadingDatabaseUsage: "Cargando uso de la base de datos...",
    language: "Idioma",
    toggleEncryption: disabled=>disabled?"Habilitar Cifrado (DEV only)":"Deshabilitar Cifrado (DEV only)",
    resavingWithEncryption: (filename,current,max)=>`Guardando nuevamente ${filename} (${current}/${max})...`,
    timelineMode: "Modo (para definir el nombre del mes financiero)",
    timelineModeStart: day=>`Nombre del mes actual hasta el d\xEDa ${day}`,
    timelineModeNext: day=>`Nombre del pr\xF3ximo mes despu\xE9s del d\xEDa ${day}`,
    timelineCutoffDay: "Día de corte",
    appVersion: "Versión de la app",
    checkUpdates: "Buscar actualizaciones",
    checkingUpdates: "Buscando actualizaciones...",
    newUpdateAvailable: "Nueva versión disponible",
    installUpdate: "Actualizar ahora",
    upToDate: "Ya usas la última versión",
    offlineReady: "Disponible sin conexión",
    speechRate: "Velocidad de Voz",
    speechRateSlow: "Lento",
    speechRateNormal: "Normal",
    speechRateFast: "Rápido",
    enableVoice: "Activar voz",
    testSpeech: "Probar Voz",
    selectVoice: "Seleccionar voz",
    testSpeechMessage: "Este es un mensaje de prueba para ejemplificar mi habla.",
    listVoices: "Listar Voces",
    hideVoices: "Ocultar Voces",
    availableVoices: "Voces Disponibles",
    assistantMode: {
      title: "Modo del asistente",
      live: {
        name: "Modo en vivo",
        description: "El asistente escucha continuamente y responde automáticamente cuando dejas de hablar. Ideal para conversaciones naturales y fluidas.",
      },
      manual: {
        name: "Modo manual",
        description: "Tú controlas cuándo el asistente debe escuchar. Presiona el botón del micrófono para hablar y de nuevo para enviar. Más control y privacidad.",
      },
    },
    microphoneMode: {
      title: "Modo del micrófono",
      helper: "Estas opciones solo aparecen en modo manual, donde eliges exactamente cómo iniciar y detener la captura.",
      hold: {
        name: "Mantener para hablar",
        description: "Mantén presionado el botón mientras hablas",
      },
      click: {
        name: "Clic para iniciar / Clic para detener",
        description: "Haz clic una vez para iniciar y nuevamente para finalizar",
      },
    }
  }
};

export default es;
