import { createLogger, format, transports } from "winston";

export const logger = createLogger({
  level: "info",
  defaultMeta: { service: "braille-application" },
  transports: [
    new transports.Console({
      format: format.json(),
    }),
  ],
});
