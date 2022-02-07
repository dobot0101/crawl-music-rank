import axios from 'axios';
import * as cheerio from 'cheerio';
import { CheerioAPI } from 'cheerio';
import { MusicDetail, MusicInfo, MusicSummary } from '../common/types';

export class GenieScraper {
  readonly url: string = 'https://www.genie.co.kr/chart/top200';
  readonly detailUrl: string = 'https://www.genie.co.kr/detail/albumInfo?axnm=';

  async scrape(): Promise<MusicInfo[]> {
    const musicInfos: MusicInfo[] = [];

    try {
      const response = await axios.get(this.url);

      if (response === null) {
        throw new Error('response is null');
      }

      const $ = cheerio.load(response.data);

      for (const el of $('table tbody tr')) {
        let detail = null;
        const albumId = this.getAlbumId($, el);
        if (albumId) {
          detail = await this.scrapeDetail(albumId);
        }

        const musicInfo: MusicInfo = {
          musicId: $(el).attr('songid') as string,
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
    const attr = $(td[4]).find('a.albumtitle').attr('onclick');
    if (attr) {
      result = attr.replace(/[^0-9]/g, '');
    }

    return result;
  }

  scrapeSummary($: CheerioAPI, el: cheerio.Element): MusicSummary {
    const td = $(el).children('td');
    return {
      ranking: parseInt(
        $(td[1])
          .contents()
          .filter((idx, val) => val.type === 'text')
          .text()
          .trim()
      ),
      name: $(td[4]).find('a.title').text().trim(),
      singer: $(td[4]).find('a.artist').text(),
      album: $(td[4]).find('a.albumtitle').text(),
    };
  }

  async scrapeDetail(albumId: string): Promise<MusicDetail | null> {
    let detail: MusicDetail | null = null;
    try {
      const response = await axios.get(this.detailUrl + albumId);
      const $ = cheerio.load(response.data);

      const lis = $('div.album-detail-infos ul.info-data li');
      if (lis.length > 0) {
        detail = {
          publisher: $(lis[2]).find('span.value').text(),
          agency: $(lis[3]).find('span.value').text(),
        };
      }
    } catch (error) {
      console.log(error);
    }
    return detail;
  }
}
