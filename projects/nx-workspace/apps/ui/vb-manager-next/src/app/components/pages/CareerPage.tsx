'use client';

import { Button } from '@vigilant-broccoli/react-lib';
import { DownloadIcon } from '@radix-ui/react-icons';
import { ResumeViewComponent } from '../resume-view.component';
import { resumeData } from '@vigilant-broccoli/resume';

export const CareerPage = () => {
  return (
    <div className="max-w-[850px] mx-auto print:max-w-none">
      <div className="print:hidden flex justify-end mb-3">
        <div className="text-right">
          <Button onClick={() => window.print()}>
            <DownloadIcon /> Download PDF
          </Button>
          <p className="text-xs text-muted-foreground mt-1">
            Opens your browser&apos;s print dialog — choose &quot;Save as
            PDF&quot;.
          </p>
        </div>
      </div>
      <ResumeViewComponent resume={resumeData} />
    </div>
  );
};
