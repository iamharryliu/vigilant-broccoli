import { useTranslation } from '../i18n';
import { PARSE_KIND, ReadmePage } from '../components/ReadmePage';
import { toRawGithubUrl } from '../consts/repo';

const EXPERIENCE_NOTE_PATH =
  'notes/personal/career/personal-software-career-experience.md';

export function CareerExperiencePage() {
  const { t } = useTranslation();

  return (
    <ReadmePage
      title={t('CAREER_EXPERIENCE_PAGE.TITLE')}
      source={{
        url: toRawGithubUrl(EXPERIENCE_NOTE_PATH),
        parseKind: PARSE_KIND.TEXT,
      }}
    />
  );
}
