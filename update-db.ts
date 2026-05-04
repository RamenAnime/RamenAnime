import { createConnection } from 'mysql2/promise';
import * as url from 'url';
import * as fs from 'fs';

async function main() {
  const envContent = fs.readFileSync('.env', 'utf-8');
  const dbUrl = envContent.split('\n').find(l => l.startsWith('DATABASE_URL='))?.split('=')?.slice(1).join('=');
  const parsed = new url.URL(dbUrl);
  const conn = await createConnection({
    host: parsed.hostname,
    port: parseInt(parsed.port || '4000'),
    user: parsed.username,
    password: parsed.password,
    database: parsed.pathname.replace('/', '').split('?')[0],
    ssl: { rejectUnauthorized: true },
    multipleStatements: true
  });

  const [cols] = await conn.execute("SHOW COLUMNS FROM users LIKE 'username'");
  if ((cols as any[]).length === 0) {
    await conn.execute(`
      ALTER TABLE users 
      ADD COLUMN username varchar(50),
      ADD COLUMN password_hash varchar(255),
      ADD COLUMN auth_type enum('oauth','local') NOT NULL DEFAULT 'oauth'
    `);
    await conn.execute('ALTER TABLE users ADD UNIQUE KEY users_username_unique (username)');
    console.log('Added username, password_hash, auth_type');
  } else {
    console.log('Columns already exist - skipping ALTER');
  }

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS forum_comments (
      id bigint unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
      postId bigint unsigned NOT NULL,
      authorId bigint unsigned NOT NULL,
      content text COLLATE utf8mb4_unicode_ci NOT NULL,
      likes int NOT NULL DEFAULT '0',
      createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log('Ensured forum_comments table exists');
  await conn.end();
}

main();
