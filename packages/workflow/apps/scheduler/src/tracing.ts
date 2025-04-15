import { ZipkinExporter } from '@opentelemetry/exporter-zipkin';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { PrismaInstrumentation } from '@prisma/instrumentation';
import { Tracing } from '@amplication/opentelemetry-nestjs';

const NEW_RELIC_API_KEY = process.env.NEW_RELIC_API_KEY;

const exporter = new ZipkinExporter({
  serviceName: 'braille-scheduler',
  url: NEW_RELIC_API_KEY
    ? `https://trace-api.newrelic.com/trace/v1?Api-Key=${NEW_RELIC_API_KEY}&Data-Format=zipkin&Data-Format-Version=2`
    : undefined,
});

Tracing.init({
  serviceName: 'braille-scheduler',
  instrumentations: [new PrismaInstrumentation()],
  spanProcessor: new SimpleSpanProcessor(exporter),
});
