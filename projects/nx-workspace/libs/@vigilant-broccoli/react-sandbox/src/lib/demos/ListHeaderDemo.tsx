import {
  CardContainer,
  ListHeader,
  SortSelect,
  Text,
} from '@vigilant-broccoli/react-lib';
import { useState } from 'react';
import { useTranslation } from '../i18n';
import { DemoSection } from './DemoSection';

const SORT = { DEFAULT: 'default', NAME: 'name', NEWEST: 'newest' } as const;
type Sort = (typeof SORT)[keyof typeof SORT];

const SORT_OPTIONS = Object.values(SORT);
const SORT_LABELS: Record<Sort, string> = {
  [SORT.DEFAULT]: 'Default',
  [SORT.NAME]: 'Name',
  [SORT.NEWEST]: 'Newest',
};

export const ListHeaderDemo = () => {
  const { t } = useTranslation();
  const [sort, setSort] = useState<Sort>(SORT.DEFAULT);
  const sortSelect = (
    <SortSelect
      value={sort}
      onValueChange={setSort}
      options={SORT_OPTIONS}
      labels={SORT_LABELS}
    />
  );

  return (
    <div className="flex flex-col gap-6">
      <DemoSection title={t('DEMO_SECTION.LIST_HEADER.TITLE_ROW')}>
        <ListHeader
          title={
            <Text size="5" weight="bold">
              {t('DEMO_SECTION.LIST_HEADER.LIST_TITLE')}
            </Text>
          }
        >
          {sortSelect}
        </ListHeader>
      </DemoSection>
      <DemoSection title={t('DEMO_SECTION.LIST_HEADER.CARD_HEADER_ACTION')}>
        <CardContainer
          title={t('DEMO_SECTION.LIST_HEADER.LIST_TITLE')}
          headerAction={sortSelect}
        >
          <Text size="2" color="gray">
            {t('FOUNDATION_DEMO.SELECTED', { value: SORT_LABELS[sort] })}
          </Text>
        </CardContainer>
      </DemoSection>
    </div>
  );
};
