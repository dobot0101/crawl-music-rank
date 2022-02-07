import axios from 'axios';
import * as cheerio from 'cheerio';
import { CheerioAPI } from 'cheerio';
import { MusicDetail, MusicInfo, MusicSummary } from '../common/types';

export class MelonScraper {
  readonly url: string = 'https://www.melon.com/chart/index.htm';
  readonly detailUrl: string = 'https://www.melon.com/album/detail.htm?albumId=';

  async scrape(): Promise<MusicInfo[]> {
    const musicInfos: MusicInfo[] = [];

    try {
      const response = await axios.get(this.url);
      const $ = cheerio.load(response.data);

      for (const el of $('div.service_list_song > table > tbody > tr')) {
        const albumId = this.getAlbumId($, el);
        let detail = null;
        if (albumId) {
          detail = await this.scrapeDetail(albumId);
        }

        const musicInfo: MusicInfo = {
          musicId: $(el).data('songNo') as string,
          summary: this.scrapeSummary($, el),
          detail: detail as MusicDetail,
        };

        musicInfos.push(musicInfo);
      }
    } catch (error) {
      console.log(error);
    }

    return musicInfos;
  }

  getAlbumId($: CheerioAPI, el: cheerio.Element) {
    let result = '';

    const td = $(el).children('td');
    const href = $(td[6]).find('a').attr('href');

    if (href) {
      result = href.replace(/[^0-9]/g, '');
    }

    return result;
  }

  scrapeSummary($: CheerioAPI, el: cheerio.Element): MusicSummary {
    const td = $(el).children('td');
    return {
      ranking: parseInt($(td[1]).find('span.rank').text()),
      name: $(td[5]).find('div.rank01 a').text(),
      singer: $(td[5]).find('div.rank02 > a').text(),
      album: $(td[6]).find('a').text(),
    };
  }

  async scrapeDetail(albumId: string): Promise<MusicDetail | null> {
    let result: MusicDetail | null = null;
    try {
      const url = this.detailUrl + albumId;
      const response = await axios.get(url, {
        headers: {
          'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.80 Safari/537.36 Edg/98.0.1108.43',
        },
      });

      const $ = cheerio.load(response.data);

      if ($('div.section_info dl.list dd').length > 0) {
        const dds = $('div.section_info dl.list dd');
        result = {
          agency: $(dds[3]).text(),
          publisher: $(dds[2]).text(),
        };
      }
    } catch (error) {
      console.log(error);
    }

    return result;
  }
}
