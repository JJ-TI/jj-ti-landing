import { NodeSDK } from '@opentelemetry/sdk-node';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { metrics, trace, context, logs, SeverityNumber } from '@opentelemetry/api';
export function startTelemetry(config) {
  const sdk = new NodeSDK({
    autoDetectResources: false,
    resource: resourceFromAttributes({ 'service.name': 'jjti-web', 'service.version': config.version, 'deployment.environment.name': config.environment }),
    metricReaders: [new PrometheusExporter({ port: config.metricsPort, host: '0.0.0.0' })],
    ...(process.env.OTEL_EXPORTER_OTLP_ENDPOINT ? { traceExporter: new OTLPTraceExporter(), logRecordProcessors: [new BatchLogRecordProcessor({exporter:new OTLPLogExporter()})] } : { spanProcessors: [], logRecordProcessors: [] }),
  });
  sdk.start();
  return sdk;
}
export function makeTelemetry(config, store, output = (line) => process.stdout.write(`${line}\n`)) {
  const meter=metrics.getMeter('jjti-web');
  const requests=meter.createCounter('jjti_http_requests', { description: 'Solicitudes HTTP por ruta normalizada' });
  const duration=meter.createHistogram('jjti_http_request_duration_seconds', { unit: 's', advice: { explicitBucketBoundaries: [.005,.01,.025,.05,.1,.25,.5,1,2,5] } });
  const delivery=meter.createCounter('jjti_mail_attempts', { description: 'Intentos SMTP; aceptación no acredita entrega final' });
  const uptime=meter.createObservableGauge('jjti_process_uptime_seconds');
  uptime.addCallback(r=>r.observe(process.uptime()));
  const heap=meter.createObservableGauge('jjti_process_heap_bytes'); heap.addCallback(r=>r.observe(process.memoryUsage().heapUsed));
  const db=meter.createObservableGauge('jjti_store_up');
  const active=meter.createObservableGauge('jjti_active_sessions');
  const browsers=meter.createObservableGauge('jjti_active_browsers');
  const queued=meter.createObservableGauge('jjti_mail_queue');
  const failed=meter.createObservableGauge('jjti_mail_failed');
  const oldest=meter.createObservableGauge('jjti_mail_oldest_seconds');
  meter.addBatchObservableCallback(async r=>{
    try {const c=await store.counts();r.observe(db,1);r.observe(active,Number(c.active));r.observe(browsers,Number(c.browsers));r.observe(queued,Number(c.queued));r.observe(failed,Number(c.failed));r.observe(oldest,Number(c.oldest));}
    catch {r.observe(db,0);}
  },[db,active,browsers,queued,failed,oldest]);
  const tracer=trace.getTracer('jjti-web');
  return {
    tracer,
    request(route,method,status,seconds) {const labels={route,method,status:String(status)};requests.add(1,labels);duration.record(seconds,labels);},
    delivery(status) {delivery.add(1,{status});},
    log(event, attributes={}, ctx=context.active()) {
      const span=trace.getSpan(ctx)?.spanContext();
      // Solo atributos internos permitidos: nunca req, body, query, errores crudos o cabeceras.
      const safe={};
      for(const key of ['request_id','route','method','status','duration_ms','code','attempt','version']) if(attributes[key]!==undefined)safe[key]=attributes[key];
      const severity=attributes.status>=500||event.endsWith('failed')?'ERROR':'INFO';
      const line={timestamp:new Date().toISOString(),severity,service:'jjti-web',environment:config.environment,version:config.version,event,trace_id:span?.traceId||null,span_id:span?.spanId||null,...safe};
      output(JSON.stringify(line));
      context.with(ctx,()=>logs.getLogger('jjti-web').emit({body:JSON.stringify(line),severityNumber:severity==='ERROR'?SeverityNumber.ERROR:SeverityNumber.INFO,attributes:safe}));
    },
  };
}
