import { GenieScraper } from '../classes/genieScraper';
import { Database } from '../classes/database';
import { MusicInfo } from '../common/types';

describe('genie scrape test group', () => {
  let musicInfos: MusicInfo[] = [];
  beforeAll(async () => {
    const db = new Database('db.test.json').db;
    try {
      musicInfos = db.getData('/genie/items');
    } catch (error) {
      const genieScraper = new GenieScraper();
      musicInfos = await genieScraper.scrape();
    }
  });

  test('check if exist empty property', async () => {
    const dataErrCount = musicInfos.filter(result => {
      const {
        detail: { agency, publisher },
        musicId,
        summary: { album, name, ranking, singer },
      } = result;
      return !musicId || !agency || !publisher || !album || !name || !ranking || !singer;
    }).length;
    expect(dataErrCount).toBe(0);
  });

  test('check if total count of fetched data and total count of saved data are same', () => {
    const db = new Database('db.test.json').db;
    db.push('/genie', musicInfos);

    expect(db.count('/genie')).toBe(musicInfos.length);
  });
});
