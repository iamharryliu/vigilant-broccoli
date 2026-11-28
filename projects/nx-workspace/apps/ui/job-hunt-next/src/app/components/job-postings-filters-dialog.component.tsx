'use client';

import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Select,
} from '@vigilant-broccoli/react-lib';
import { useTranslation } from '../i18n';
import {
  LEVEL_FILTER_ALL,
  MATCH_LEVEL,
  SPOKEN_LANGUAGES,
  type LevelFilter,
} from '../utils/posting-match.utils';
import { SECTION_HEADING_CLASS } from './application-brief.component';

const LEVEL_KEYS = {
  [MATCH_LEVEL.STRONG]: 'JOB_POSTINGS.STRONG',
  [MATCH_LEVEL.OKAY]: 'JOB_POSTINGS.OKAY',
  [MATCH_LEVEL.WEAK]: 'JOB_POSTINGS.WEAK',
  [MATCH_LEVEL.UNKNOWN]: 'JOB_POSTINGS.UNKNOWN',
} as const;

type JobPostingsFiltersDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  level: LevelFilter;
  onLevelChange: (level: LevelFilter) => void;
  languages: string[];
  onLanguagesChange: (languages: string[]) => void;
  hideInternships: boolean;
  onHideInternshipsChange: (hide: boolean) => void;
  hideGraduate: boolean;
  onHideGraduateChange: (hide: boolean) => void;
};

export const JobPostingsFiltersDialog = ({
  open,
  onOpenChange,
  level,
  onLevelChange,
  languages,
  onLanguagesChange,
  hideInternships,
  onHideInternshipsChange,
  hideGraduate,
  onHideGraduateChange,
}: JobPostingsFiltersDialogProps) => {
  const { t } = useTranslation();
  const toggleLanguage = (language: string) =>
    onLanguagesChange(
      languages.includes(language)
        ? languages.filter(selected => selected !== language)
        : [...languages, language],
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{t('JOB_POSTINGS.FILTERS_TITLE')}</DialogTitle>
          <DialogDescription>
            {t('JOB_POSTINGS.FILTERS_DESCRIPTION')}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className={SECTION_HEADING_CLASS}>
              {t('JOB_POSTINGS.FILTER_LEVEL')}
            </h2>
            <Select
              aria-label={t('JOB_POSTINGS.FILTER_LEVEL')}
              options={[LEVEL_FILTER_ALL, ...Object.values(MATCH_LEVEL)]}
              value={level}
              onValueChange={onLevelChange}
              displayMapper={{
                [LEVEL_FILTER_ALL]: t('JOB_POSTINGS.FILTER_ALL_LEVELS'),
                ...Object.fromEntries(
                  Object.entries(LEVEL_KEYS).map(([key, label]) => [
                    key,
                    t(label),
                  ]),
                ),
              }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className={SECTION_HEADING_CLASS}>
              {t('JOB_POSTINGS.FILTER_ROLE_TYPES')}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t('JOB_POSTINGS.FILTER_ROLE_TYPES_HINT')}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={hideInternships ? 'default' : 'outline'}
                aria-pressed={hideInternships}
                onClick={() => onHideInternshipsChange(!hideInternships)}
              >
                {t('JOB_POSTINGS.HIDE_INTERNSHIPS')}
              </Button>
              <Button
                variant={hideGraduate ? 'default' : 'outline'}
                aria-pressed={hideGraduate}
                onClick={() => onHideGraduateChange(!hideGraduate)}
              >
                {t('JOB_POSTINGS.HIDE_GRADUATE')}
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className={SECTION_HEADING_CLASS}>
              {t('JOB_POSTINGS.FILTER_LANGUAGES')}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t('JOB_POSTINGS.FILTER_LANGUAGES_HINT')}
            </p>
            <div className="flex flex-wrap gap-1">
              {SPOKEN_LANGUAGES.map(language => {
                const selected = languages.includes(language);
                return (
                  <button
                    key={language}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleLanguage(language)}
                  >
                    <Badge
                      color={selected ? 'blue' : 'gray'}
                      variant={selected ? 'soft' : 'outline'}
                      size="1"
                    >
                      {language}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
