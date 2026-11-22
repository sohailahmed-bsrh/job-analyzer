import { createClient } from '@libsql/client';

const libsql = createClient({ url: 'file:./dev.db' });
libsql.execute('SELECT 1').then(console.log).catch(console.error);
