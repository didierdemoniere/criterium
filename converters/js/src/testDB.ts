import seed from './seed';

export interface User {
  name: string,
  age: number,
  is_active: boolean,
  birth_date: Date,
  interests: Array<string>
}

export default async function initDB() {
  return {
    getBaseQuery: () => seed,
    getResults: async (query: Array<User>) => query,
    destroy: async () => {}
  }
}

