import type AssistantModuleTranslation from './base';

const es: AssistantModuleTranslation = {
  speech: {
    title: "Artículos de Compras",
    howToUseTitle: "Cómo usar",
    intro1: "Hable naturalmente sobre los artículos que ya tiene y los que necesita comprar. El asistente entenderá sus frases para agregar, quitar o actualizar artículos y separará lo que posee de la lista de compras.",
    intro2: "Puede mencionar el nombre, vencimiento, si está abierto/en uso, cantidad, cuánto pagó, dónde está guardado, etc.",
    examplesTitle: "Ejemplos:",
    examples: [
      "necesito comprar huevos y leche",
      "compré 2 paquetes de arroz",
      "tengo 3 paquetes de pasta en el armario",
      "tengo jamón y queso abiertos en la nevera y se echarán a perder en 3 días",
      "el paquete de café vence en 2 meses",
      "ya no tengo frijoles"
    ],
    micStart: "Iniciar escucha",
    micStop: "Detener escucha",
    placeholderListeningHasItems: "Habla libremente",
    placeholderListeningNoItems: "Empieza a hablar",
    placeholderNotListening: "Presione el botón para hablar",
    haveListTitle: "Tengo",
    toBuyListTitle: "Por Comprar",
    browserNotSupported: "El navegador no soporta reconocimiento de voz.",
    changeLangTooltip: "Haga clic para cambiar el idioma",
    tokensUsed: (tokens,price)=>`Usados: ${tokens} Tokens, R$ ${price}`
  },
  aiMic: {
    onboarding: {
      info: {
        title: "Prueba de reconocimiento de voz",
        p1: "El reconocimiento de voz usado en la app es nativo y depende de la compatibilidad de tu dispositivo.",
        p2: "Hagamos una prueba rápida para comprobar que todo funciona."
      },
      lang: {
        title: "Confirme el idioma",
        p1: "Confirme que el idioma de la app es correcto y que el idioma que hablas coincide con el configurado en tu dispositivo."
      },
      verification: {
        title: "Repite la frase",
        instructions: "Di la frase mostrada abajo para validar el reconocimiento de voz.",
        retry: "No coincidió, inténtalo de nuevo.",
        success: "¡Perfecto! Sigamos con la siguiente frase.",
        waiting: "Esperando que hables...",
        targetLabel: "Frase esperada",
        transcriptLabel: "Transcripción",
        scoreLabel: "Puntuación"
      },
      progress: (passed,target)=>`${passed} de ${target}`,
      success: {
        title: "¡Todo listo!",
        p1: "Tu dispositivo es compatible con el reconocimiento de voz."
      },
      fail: {
        title: "No fue posible validar",
        p1: "No pudimos confirmar la compatibilidad del reconocimiento de voz en este momento."
      },
      actions: {
        start: "Iniciar prueba",
        confirm: "Confirmar idioma",
        back: "Volver",
        imDone: "Listo",
        tryAgain: "Intentar de nuevo",
        close: "Cerrar"
      }
    },
    onboardingCases: ()=>["Probando una transferencia de doce reales desde la cuenta salario hacia los ahorros.","Prueba de voz para el importe R$ 20,00 registrado como gasto r\xE1pido.","Segunda prueba diciendo solo veinte reales para ver si funciona sin el s\xEDmbolo.","Di transferir doce BRL a la cuenta de reserva para confirmar el manejo del c\xF3digo de moneda.","Pide mover cincuenta USD de la cuenta corriente al fondo de viajes y confirma la palabra USD.","Intenta agregar un d\xE9bito de treinta euros a la categor\xEDa supermercado para observar el soporte multimoneda.","Dicta registrar un retiro de efectivo de setenta y cinco d\xF3lares con nota ATM B3 para revisar importe y nota.","Pronuncia pagar la suscripci\xF3n USB y mira si se confunde con USD.","Di registrar un reembolso de ciento veinte pesos mexicanos para probar monedas extranjeras.","Habla buscar cuentas de la clienta Mar\xEDa da Silva para poner a prueba el reconocimiento de nombre completo.","Pide mostrar el l\xEDmite de la tarjeta corporativa Visa en BRL mezclando idiomas a prop\xF3sito.","Ordena generar un informe que compare los totales de cr\xE9dito y d\xE9bito de abril para probar los reportes.","Intenta marcar la factura dos cero cuatro cinco como pagada en d\xF3lares para validar los d\xEDgitos hablados.","Di capturar el pago recurrente de R$ 99,90 para Spotify y verificar decimales.","Experimenta convirtiendo doscientos BRL a USD y registrando la diferencia para estresar las conversiones."]
  },
  assistant: {
    onboarding: {
      title: "Comienza con el asistente financiero",
      description: "Deja que el asistente te guíe por la configuración inicial y personalice tu experiencia.",
      microRequirement: "Primero verificaremos tu micrófono para asegurar que todo funcione correctamente.",
      start: "Iniciar ahora",
      dismiss: "No mostrar de nuevo"
    },
    voiceOverlay: {
      userLabel: "tú:",
      assistantLabel: "asistente:",
      infoLabel: "info:",
      listeningPlaceholder: "Hablando...",
      inputPlaceholder: "Escribe tu mensaje aquí...",
      continuePrompt: "Responde con el micrófono o escribe para continuar.",
      closeLabel: "finalizar"
    },
    voiceRuntime: {
      speakError: "Error al reproducir el mensaje",
      processError: "Error al procesar el comando del asistente",
      tokenUsageTitle: "Uso de tokens",
      askUserTitle: "Pregunta para el usuario",
      askUserHint: "Responde con el micrófono para continuar.",
      warningsTitle: "Avisos",
      callsHistoryTitle: "Historial de llamadas"
    }
  }
};

export default es;
