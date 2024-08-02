/* eslint no-console: 0 */
import { AnalogyxBIClient } from '@analogyxbi/connection';

export default function setupClient(csrf, url) {
  // success response is the csrf itself
  AnalogyxBIClient.configure({
    protocol: 'http:',
    host: url,
    csrfToken: csrf,
  })
    .init()
    .catch((error) => {
      console.log('Error initializing Analogyx BI Client', error);
    });
}
