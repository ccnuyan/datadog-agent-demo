import dd_trace from "dd-trace";
import { HttpError } from "http-errors";

dd_trace.init({
  logInjection: true,
});
// dd_trace.use("http");

const pino = require("pino");
require("pino-pretty");

const hasPretty = true;

// const LOG_FORMAT = "pretty";
// const stream = undefined;
const LOG_FORMAT = "json";
const stream = pino.extreme();

const LOG_FLUSH_INTERVAL = "2500";

console.log(parseInt(LOG_FLUSH_INTERVAL, 10));

const logger = pino(
  {
    level: "info",
    messageKey: "message",
    base: null,
    timestamp: true,
    levelKey: "status",
    useLevelLabels: true,
    stream,
    prettyPrint: hasPretty
  },
  pino.destination("/opt/datadog-agent/logs/nodejs.log")
);

if (stream) {
  setTimeout(() => logger.flush(), 500).unref(); // Initial flush
  setInterval(() => logger.flush(), parseInt(LOG_FLUSH_INTERVAL, 10)).unref(); // Periodic
}

const koa = require("koa");
dd_trace.trace("test-trace", () => {
  const app = new koa();

  app.use(async function (ctx: any, next: any) {
    try {
      await next();
    } catch (err) {
      ctx.status = (err as any).status || 500;
      ctx.type = "html";
      ctx.body = "<p>Something <em>exploded</em>, please contact Maru.</p>";

      // since we handled this manually we'll
      // want to delegate to the regular app
      // level error handling as well so that
      // centralized still functions correctly.
      ctx.app.emit("error", err, ctx);
    }
  });

  // response

  app.use(async function () {
    throw new Error("boom boom");
  });

  // error handler

  app.on("error", function (err: any, ctx: any) {
    // logger.error({err, ctx}, "error desc");
    logger.error("error desc", { err, ctx });
    logger.error({ err, ctx }, "error desc");
  });

  app.listen(3000);
});
