// Niveaux de log disponibles
export const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

// Configuration du logger
const config = {
  level: LogLevel.INFO, // Niveau par défaut
  enableConsole: true,
  enableTimestamp: true,
  prefix: "[BowlingGame]",
};

// Fonction pour configurer le logger
export const configureLogger = (options) => {
  Object.assign(config, options);
};

// Formatage du message de log
const formatMessage = (level, message, data) => {
  let formattedMessage = "";

  if (config.enableTimestamp) {
    formattedMessage += `${new Date().toISOString()} `;
  }

  formattedMessage += `${config.prefix} [${levelToString(level)}] ${message}`;

  return formattedMessage;
};

// Conversion du niveau en chaîne
const levelToString = (level) => {
  switch (level) {
    case LogLevel.DEBUG:
      return "DEBUG";
    case LogLevel.INFO:
      return "INFO";
    case LogLevel.WARN:
      return "WARN";
    case LogLevel.ERROR:
      return "ERROR";
    default:
      return "UNKNOWN";
  }
};

// Fonctions de log
export const debug = (message, data) => {
  if (config.level <= LogLevel.DEBUG && config.enableConsole) {
    console.debug(formatMessage(LogLevel.DEBUG, message, data), data || "");
  }
};

export const info = (message, data) => {
  if (config.level <= LogLevel.INFO && config.enableConsole) {
    console.info(formatMessage(LogLevel.INFO, message, data), data || "");
  }
};

export const warn = (message, data) => {
  if (config.level <= LogLevel.WARN && config.enableConsole) {
    console.warn(formatMessage(LogLevel.WARN, message, data), data || "");
  }
};

export const error = (message, data) => {
  if (config.level <= LogLevel.ERROR && config.enableConsole) {
    console.error(formatMessage(LogLevel.ERROR, message, data), data || "");
  }
};

// Export d'un objet logger
export const logger = {
  debug,
  info,
  warn,
  error,
  configure: configureLogger,
};

export default logger;
