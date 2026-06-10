import { GeneralLayout } from '../layouts/general-layout';
import { ContactSection } from '../features/contact-section';

export function ContactPage() {
  return (
    <GeneralLayout>
      <div className="w-11/12 mx-auto pt-8">
        <ContactSection />
      </div>
    </GeneralLayout>
  );
}
