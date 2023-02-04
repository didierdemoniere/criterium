import { createClient } from 'redis';
import { GenericContainer } from 'testcontainers';

type ConnectingClient = Promise<ReturnType<typeof createClient>>;

export { ConnectingClient };

export const connectingClient: ConnectingClient = new GenericContainer(
  'redis/redis-stack-server:latest',
)
  .withExposedPorts(6379)
  .start()
  .then((container) => {
    const client = createClient({
      url: `redis://${container.getHost()}:${container.getMappedPort(6379)}`,
    });

    client.on('end', async () => {
      await container.stop();
    });

    client.on('error', (err) => console.log('Redis Client Error', err));

    return client.connect().then(() => client);
  });
