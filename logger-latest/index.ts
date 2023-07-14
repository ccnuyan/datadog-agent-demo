import dd_trace from 'dd-trace';

dd_trace.init();
// dd_trace.use("http");

import pino from "pino";
// import "pino-pretty";

const logger = pino({
  level: "info",
  // transport: {
  //   target: "pino-pretty",
  // },
});

dd_trace.trace("test-trace", () => {
  try {
    throw new Error("Error Message");
  } catch (e) {
    logger.error(e, "error desc");
    logger.error("error desc", e);
  }
});
