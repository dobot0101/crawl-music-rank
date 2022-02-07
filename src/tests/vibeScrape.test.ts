import { VibeScraper } from '../classes/vibeScraper';
import { Database } from '../classes/database';
import { MusicInfo } from '../common/types';

let musicInfos: MusicInfo[] = [];
beforeAll(async () => {
  const db = new Database('db.test.json').db;
  try {
    musicInfos = db.getData('/vibe/items');
  } catch (error) {
    const vibeScraper = new VibeScraper();
    musicInfos = await vibeScraper.scrape();
  }
});

describe('vibe scrape test group', () => {
  test('check if exist empty property', async () => {
    const errorData = musicInfos.filter(result => {
      const {
        detail: { agency, publisher },
        musicId,
        summary: { album, name, ranking, singer },
      } = result;

      // vibe는 api 응답 값을 확인해보니 publisher 값이 없을 수도 있어서 아래와 같이 수정
      // return !musicId || !agency || !publisher || !album || !name || !ranking || !singer;
      return !musicId || !agency || !album || !name || !ranking || !singer;
    });
    console.log(errorData);

    expect(errorData.length).toBe(0);
  });

  test('check if total count of fetched data and total count of saved data are same', () => {
    const db = new Database('db.test.json').db;
    db.push('/vibe', musicInfos);

    expect(db.count('/vibe')).toBe(musicInfos.length);
  });
});
