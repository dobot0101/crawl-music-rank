import { MelonScraper } from '../classes/melonScraper';
import { Database } from '../classes/database';
import { MusicInfo } from '../common/types';

let musicInfos: MusicInfo[] = [];
beforeAll(async () => {
  const db = new Database('db.test.json').db;
  try {
    musicInfos = db.getData('/melon/items');
  } catch (error) {
    const melonScraper = new MelonScraper();
    musicInfos = await melonScraper.scrape();
  }
});

describe('melon scrape test group', () => {
  test('check if exist empty property', async () => {
    const dataErrCount = musicInfos.filter((result: MusicInfo) => {
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
    db.push('/melon', musicInfos);

    expect(db.count('/melon')).toBe(musicInfos.length);
  });
});
