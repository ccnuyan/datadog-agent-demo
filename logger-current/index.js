const dd_trace = require("dd-trace");
const fetch = require("cross-fetch");

dd_trace.init({ logInjection: true });

const pino = require("pino");
require("pino-pretty");

const hasPretty = false;
const logFormat = "json";

let stream;
if (logFormat === "json") {
  stream = pino.extreme();
}

const logger = stream
  ? pino(
      {
        level: "info",
        messageKey: "message",
        base: null,
        timestamp: true,
        levelKey: "status",
        useLevelLabels: true,
        prettyPrint: hasPretty,
      },
      // pino.destination("/opt/datadog-agent/logs/nodejs.log")
    )
  : pino(
      {
        level: "info",
        messageKey: "message",
        base: null,
        timestamp: true,
        levelKey: "status",
        useLevelLabels: true,
        prettyPrint: hasPretty,
      },
      // pino.destination("/opt/datadog-agent/logs/nodejs.log")
    );

const LOG_FLUSH_INTERVAL = "2500";

console.log(parseInt(LOG_FLUSH_INTERVAL, 10));

if (stream) {
  setTimeout(() => logger.flush(), 500).unref(); // Initial flush
  setInterval(() => logger.flush(), parseInt(LOG_FLUSH_INTERVAL, 10)).unref(); // Periodic
}

dd_trace.trace("test-trace", async () => {
  fetch("abc").catch((err) => {
    console.log('\n-- logger.error("error desc", { err }) --');
    logger.error("error desc", { err });

    console.log('\n-- logger.error({ err}, "error desc"); --');
    logger.error({ err }, "error desc");

    console.log("\n-- after bindings -----");

    logger.child({a:'b'})

    const logerr = logger.error.bind(logger)

    console.log('\n-- console.error("error desc", { err }) --');
    logerr("error desc", { err });

    console.log('\n-- errr( { err }, "error desc"); --');
    logerr({ err }, "error desc");
  });
});
