import { readFile } from 'node:fs/promises';
import pg from 'pg';
import { randomUUID } from 'node:crypto';
export function makeStore(databaseUrl) {
  const pool = new pg.Pool({ connectionString: databaseUrl, max: 10, connectionTimeoutMillis: 3000, statement_timeout: 5000 });
  return {
    pool,
    async migrate() {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query('SELECT pg_advisory_xact_lock(247137)');
        await client.query(await readFile(new URL('./schema.sql', import.meta.url), 'utf8'));
        await client.query('COMMIT');
      } catch (e) { await client.query('ROLLBACK'); throw e; } finally { client.release(); }
    },
    async ping() { await pool.query('SELECT 1'); },
    async lead({ idempotencyKey, payloadHash, payloadCipher, traceId, spanId }) {
      const id = randomUUID();
      await pool.query('INSERT INTO leads(id,idempotency_key,payload_hash,payload_cipher,trace_id,span_id) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(idempotency_key) DO NOTHING', [id,idempotencyKey,payloadHash,payloadCipher,traceId,spanId]);
      const { rows } = await pool.query('SELECT id,status,payload_hash FROM leads WHERE idempotency_key=$1', [idempotencyKey]);
      if (rows[0].payload_hash !== payloadHash) return null;
      return rows[0];
    },
    async startSession(visitorHash) {
      const id=randomUUID(),c=await pool.connect();
      try {
        await c.query('BEGIN');
        await c.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[visitorHash]);
        const existing=await c.query("SELECT id FROM analytics_visits WHERE visitor_hash=$1 AND last_seen>now()-interval '30 minutes' ORDER BY last_seen DESC LIMIT 1 FOR UPDATE",[visitorHash]);
        const visit=existing.rows[0]?.id||randomUUID();
        await c.query('INSERT INTO analytics_visits(id,visitor_hash) VALUES($1,$2) ON CONFLICT(id) DO UPDATE SET last_seen=now()',[visit,visitorHash]);
        await c.query('INSERT INTO analytics_sessions(id,visitor_hash,visit_id) VALUES($1,$2,$3)',[id,visitorHash,visit]);
        await c.query('COMMIT');return id;
      } catch(e){await c.query('ROLLBACK');throw e;} finally{c.release();}
    },
    async heartbeat(id, visibleMs, ended) {
      const {rowCount}=await pool.query(`WITH updated AS (UPDATE analytics_sessions SET visible_ms=visible_ms+LEAST($2::bigint,GREATEST(0,EXTRACT(EPOCH FROM(now()-last_seen))*1000)::bigint),last_seen=now(),ended=$3
        WHERE id=$1 AND ended=false AND last_seen>now()-interval '30 minutes' RETURNING visit_id)
        UPDATE analytics_visits SET last_seen=now() WHERE id IN(SELECT visit_id FROM updated)`,[id,visibleMs,ended]);
      return rowCount>0;
    },
    async events(id, events) {
      const c=await pool.connect();
      try {
        await c.query('BEGIN');
        const {rows}=await c.query("SELECT id FROM analytics_sessions WHERE id=$1 AND ended=false AND last_seen>now()-interval '30 minutes' FOR UPDATE",[id]);
        if (!rows.length) { await c.query('ROLLBACK'); return false; }
        for (const e of events) await c.query('INSERT INTO analytics_events(event_id,session_id,kind,target) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING',[e.id,id,e.kind,e.target]);
        await c.query('COMMIT'); return true;
      } catch(e){await c.query('ROLLBACK'); throw e;} finally{c.release();}
    },
    async forget(id) {
      await pool.query('DELETE FROM analytics_visits WHERE visitor_hash=(SELECT visitor_hash FROM analytics_sessions WHERE id=$1)',[id]);
    },
    async counts() {
      const {rows}=await pool.query(`SELECT
        (SELECT count(*) FROM analytics_sessions WHERE ended=false AND last_seen>now()-interval '90 seconds') AS active,
        (SELECT count(DISTINCT visitor_hash) FROM analytics_sessions WHERE ended=false AND last_seen>now()-interval '90 seconds') AS browsers,
        (SELECT count(*) FROM leads WHERE status='queued') AS queued,
        (SELECT count(*) FROM leads WHERE status='failed') AS failed,
        (SELECT COALESCE(EXTRACT(EPOCH FROM(now()-min(created_at))),0) FROM leads WHERE status='queued') AS oldest`);
      return rows[0];
    },
    async prune() {
      await pool.query("DELETE FROM leads WHERE created_at<now()-interval '30 days'");
      await pool.query("DELETE FROM analytics_visits WHERE created_at<now()-interval '90 days'");
    },
    close: () => pool.end(),
  };
}
