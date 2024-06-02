import pg from 'pg';
import { GenericContainer } from 'testcontainers';

export const connectingClient: Promise<pg.Pool> = new GenericContainer('postgres')
  .withEnvironment({
    POSTGRES_USER: 'test',
    POSTGRES_PASSWORD: 'test'
  })
  .withExposedPorts(5432)
  .start()
  .then((container) => {
    const pool = new pg.Pool({
      user: 'test',
      password: 'test',
      host: container.getHost(),
      port: container.getMappedPort(5432),
      database: 'postgres',
    });

    pool.on('release', async () => {
      if (pool.totalCount === 0) {
        await container.stop();
      }
    });

    pool.on('error', (err) => console.log('Postgres Client Error', err));

    return pool;
  });
