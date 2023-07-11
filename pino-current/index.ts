import dd_trace from "dd-trace";

dd_trace.init({
  logInjection: true,
});
// dd_trace.use("http");

const pino = require("pino");
// require("pino-pretty");

const logger = pino({
  level: "info",
  // prettyPrint: true,
});

dd_trace.trace("test-trace", () => {
  try {
    throw new Error("Error Message");
  } catch (e) {
    logger.error(e, "error desc");
  }
});
