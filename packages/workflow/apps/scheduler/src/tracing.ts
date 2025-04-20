import { ZipkinExporter } from '@opentelemetry/exporter-zipkin';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { PrismaInstrumentation } from '@prisma/instrumentation';
import { Tracing } from '@amplication/opentelemetry-nestjs';

// Metrics
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';

const NEW_RELIC_API_KEY = process.env.NEW_RELIC_API_KEY;

const exporter = new ZipkinExporter({
  serviceName: 'braille-scheduler',
  url: NEW_RELIC_API_KEY
    ? `https://trace-api.newrelic.com/trace/v1?Api-Key=${NEW_RELIC_API_KEY}&Data-Format=zipkin&Data-Format-Version=2`
    : undefined,
});

// Metrics
const collectorOptions = {
  url: 'https://otlp.nr-data.net:4318/v1/metrics', // url is optional and can be omitted - default is http://localhost:4318/v1/metrics
  headers: {
    'api-key': NEW_RELIC_API_KEY ?? '',
  },
};
const metricExporter = new OTLPMetricExporter(collectorOptions);
const metricReader = new PeriodicExportingMetricReader({
  exporter: metricExporter,
  exportIntervalMillis: 15_000,
});

Tracing.init({
  serviceName: 'braille-scheduler',
  instrumentations: [new PrismaInstrumentation()],
  spanProcessor: new SimpleSpanProcessor(exporter),
  metricReader: metricReader,
});
