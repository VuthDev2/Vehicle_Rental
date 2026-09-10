import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import * as fs from 'fs';
import * as path from 'path';

export class ServerTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    const base = process.cwd();
    // Dev path
    const devPath = path.join(base, 'public', 'i18n', `${lang}.json`);
    // Prod path (assuming standard Angular output structure)
    const prodPath = path.join(base, '..', 'browser', 'i18n', `${lang}.json`);
    
    const filePath = fs.existsSync(devPath) ? devPath : prodPath;
    try {
      if (fs.existsSync(filePath)) {
        return of(JSON.parse(fs.readFileSync(filePath, 'utf8')));
      }
    } catch (e) {
      console.warn(`[SSR] Failed to load translation for ${lang}:`, e);
    }
    return of({});
  }
}

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    { provide: TranslateLoader, useClass: ServerTranslateLoader }
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
