import { NodeSDK } from "@opentelemetry/sdk-node";
import { ZipkinExporter } from "@opentelemetry/exporter-zipkin";
import { Resource } from "@opentelemetry/resources";
import { SEMRESATTRS_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { PrismaInstrumentation } from "@prisma/instrumentation";

const NEW_RELIC_API_KEY = process.env.NEW_RELIC_API_KEY;

const exporter = new ZipkinExporter({
  serviceName: "braille-application",
  url: NEW_RELIC_API_KEY
    ? `https://trace-api.newrelic.com/trace/v1?Api-Key=${NEW_RELIC_API_KEY}&Data-Format=zipkin&Data-Format-Version=2`
    : undefined,
});

const sdk = new NodeSDK({
  resource: new Resource({
    [SEMRESATTRS_SERVICE_NAME]: "braille-application",
  }),
  instrumentations: [new PrismaInstrumentation()],
  spanProcessors: [new SimpleSpanProcessor(exporter)],
});

sdk.start();
