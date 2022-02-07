import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig';

export class Database {
  private _db;
  constructor(dbFileName: string) {
    this._db = new JsonDB(new Config(dbFileName, true, false, '/'));
  }

  get db() {
    return this._db;
  }
}
