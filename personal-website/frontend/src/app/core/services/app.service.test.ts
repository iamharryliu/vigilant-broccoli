import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { NGX_TRANSLATE_LANGUAGE } from '@utils/translate.util';
import { AppService } from '@services/app.service';

describe('AppService', () => {
  let service: AppService;
  let translateService: TranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AppService,
        {
          provide: TranslateService,
          useValue: {
            use: jest.fn(),
          },
        },
      ],
    });

    service = TestBed.inject(AppService);
    translateService = TestBed.inject(TranslateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with default language', () => {
    const useSpy = jest.spyOn(translateService, 'use');

    service.init();

    expect(useSpy).toHaveBeenCalledWith(NGX_TRANSLATE_LANGUAGE.DEFAULT);
  });
});
