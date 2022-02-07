// import { Database } from './classes/database';
import axios from 'axios';
import * as cheerio from 'cheerio';
import moment from 'moment';
import { Database } from './classes/database';
import { GenieScraper } from './classes/genieScraper';
import { MelonScraper } from './classes/melonScraper';
import { VibeScraper } from './classes/vibeScraper';
import { MusicInfo } from './common/types';

async function main() {
  const db = new Database('db.json').db;

  // const result = await axios.get('https://www.melon.com/album/detail.htm?albumId=10816959');
  // const $ = cheerio.load(result.data);
  // if ($('div.section_info dl.list dd').length > 0) {
  //   const dds = $('div.section_info dl.list dd');
  //   console.log($(dds[2]).text(), $(dds[3]).text());
  // }

  // 멜론 스크랩
  const melonScraper = new MelonScraper();
  db.push('/melon', await melonScraper.scrape());
  db.push('/melon/updateItem', moment().format('YYYY-MM-DD HH:mm'));

  // Genie 스크랩
  const genieScraper = new GenieScraper();
  db.push('/genie/scrapeTime', moment().format('YYYY-MM-DD HH:mm'));
  db.push('/genie', { items: await genieScraper.scrape(), scrapeTime: moment().format('YYYY-MM-DD HH:mm') });
  console.log(db.getData('/genie/items').map((data: MusicInfo) => data.summary));

  // Vibe 스크랩
  const vibeScraper = new VibeScraper();
  db.push('/vibe', await vibeScraper.scrape());
  db.push('/vibe/updateItem', moment().format('YYYY-MM-DD HH:mm'));
}

main().catch(console.error);
