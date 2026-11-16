import pg from 'pg';
const id=process.argv[2];
if(!/^[a-f0-9-]{36}$/.test(id||'')||!process.env.DATABASE_URL)throw new Error('UUID y DATABASE_URL segura requeridos');
const pool=new pg.Pool({connectionString:process.env.DATABASE_URL});
try{const {rows}=await pool.query('SELECT id,status,attempts,created_at,sent_at,next_attempt_at,trace_id FROM leads WHERE id=$1',[id]);console.log(JSON.stringify(rows));}finally{await pool.end();}
