import { CTASection } from '@/components/common/CTASection';
import {
  GridLayout,
  SingleColumnSection,
} from '@/components/layout/GridLayout';

export default function LegalPage() {
  return (
    <>
      {/* Header Section */}
      <div className="relative z-10 mx-auto max-w-4xl pb-16">
        <div className="container mx-auto px-4 py-12 sm:px-6 md:px-12 md:py-20 lg:px-16 xl:px-20">
          <div className="mx-auto max-w-6xl text-left">
            <h1 className="mb-8 font-medium text-3xl leading-[0.9] tracking-tight md:text-5xl lg:text-6xl">
              Legal Information
            </h1>
            <p className="mx-auto mb-12 max-w-4xl font-light text-muted-foreground text-xl leading-relaxed md:text-2xl">
              Impressum and legal information in accordance with German law (§5
              TMG).
            </p>
          </div>
        </div>
      </div>

      {/* Main Content with Grid Layout */}
      <div className="relative z-10">
        <GridLayout maxWidth="lg">
          {/* Impressum */}
          <SingleColumnSection className="scroll-mt-32" id="impressum">
            <div className="mx-auto max-w-4xl text-left">
              <h2 className="mb-6 font-medium text-2xl tracking-tight md:text-3xl">
                Impressum
              </h2>
              <div className="prose prose-lg max-w-none">
                <p className="mb-4 text-muted-foreground">
                  Information according to § 5 TMG (Telemediengesetz):
                </p>

                <div className="mb-6 rounded-lg bg-muted/30 p-6">
                  <h3 className="mb-4 font-medium text-lg">
                    Publisher / Responsible Person
                  </h3>
                  <div className="space-y-1 text-muted-foreground">
                    <p>Julian Fleck</p>
                    <p>Lausitzer Platz 12A</p>
                    <p>10997 Berlin</p>
                    <p>Germany</p>
                  </div>
                </div>

                <div className="mb-6 rounded-lg bg-muted/30 p-6">
                  <h3 className="mb-4 font-medium text-lg">
                    Contact Information
                  </h3>
                  <div className="space-y-1 text-muted-foreground">
                    <p>
                      Email:{' '}
                      <a
                        className="text-primary hover:underline"
                        href="mailto:mail@julianfleck.net"
                      >
                        mail@julianfleck.net
                      </a>
                    </p>
                    <p>
                      Website:{' '}
                      <a
                        className="text-primary hover:underline"
                        href="https://recurse.cc"
                      >
                        recurse.cc
                      </a>
                    </p>
                  </div>
                </div>

                <div className="rounded-lg bg-muted/30 p-6">
                  <h3 className="mb-4 font-medium text-lg">
                    Responsible for Content
                  </h3>
                  <div className="space-y-1 text-muted-foreground">
                    <p>Julian Fleck (Address as above)</p>
                    <p>Responsible for content according to § 55 Abs. 2 RStV</p>
                  </div>
                </div>
              </div>
            </div>
          </SingleColumnSection>

          {/* Disclaimer */}
          <SingleColumnSection>
            <div className="mx-auto max-w-4xl text-left">
              <h2 className="mb-6 font-medium text-2xl tracking-tight md:text-3xl">
                Disclaimer
              </h2>
              <div className="prose prose-lg max-w-none space-y-4 text-muted-foreground">
                <div>
                  <h3 className="mb-2 font-medium text-foreground text-lg">
                    Liability for Content
                  </h3>
                  <p>
                    As a service provider, we are responsible for our own
                    content on these pages according to § 7 para.1 TMG (German
                    Telemedia Act). However, according to §§ 8 to 10 TMG, we are
                    not under obligation to monitor transmitted or stored
                    third-party information or to investigate circumstances that
                    indicate illegal activity.
                  </p>
                  <p>
                    Obligations to remove or block the use of information under
                    general law remain unaffected. However, liability in this
                    regard is only possible from the point in time at which
                    knowledge of a specific infringement of law is obtained.
                    Upon notification of corresponding violations of law, we
                    will remove this content immediately.
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 font-medium text-foreground text-lg">
                    Liability for Links
                  </h3>
                  <p>
                    Our offer contains links to external websites of third
                    parties, on whose contents we have no influence. Therefore,
                    we cannot assume any liability for these external contents.
                    The respective provider or operator of the pages is always
                    responsible for the contents of the linked pages.
                  </p>
                  <p>
                    The linked pages were checked for possible violations of law
                    at the time of linking. Illegal contents were not
                    recognizable at the time of linking. However, permanent
                    monitoring of the contents of the linked pages is not
                    reasonable without concrete evidence of a violation of law.
                    Upon notification of violations of law, we will remove such
                    links immediately.
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 font-medium text-foreground text-lg">
                    Copyright
                  </h3>
                  <p>
                    The contents and works created by the site operators on
                    these pages are subject to German copyright law.
                    Duplication, processing, distribution, or any form of
                    commercialization of such material beyond the scope of the
                    copyright law shall require the prior written consent of its
                    respective author or creator.
                  </p>
                  <p>
                    Downloads and copies of this site are only permitted for
                    private, non-commercial use. Insofar as the content on this
                    site was not created by the operator, the copyrights of
                    third parties are respected. In particular, third-party
                    content is identified as such. Should you nevertheless
                    become aware of a copyright infringement, please inform us
                    accordingly. Upon notification of violations, we will remove
                    such content immediately.
                  </p>
                </div>
              </div>
            </div>
          </SingleColumnSection>

          {/* Privacy */}
          <SingleColumnSection className="scroll-mt-32" id="privacy-policy">
            <div className="mx-auto max-w-4xl text-left">
              <h2 className="mb-6 font-medium text-2xl tracking-tight md:text-3xl">
                Privacy Policy
              </h2>
              <div className="prose prose-lg max-w-none space-y-4 text-muted-foreground">
                <div>
                  <h3 className="mb-2 font-medium text-foreground text-lg">
                    Data Collection and Processing
                  </h3>
                  <p>
                    This website collects and processes personal data only to
                    the extent necessary for the operation of the website and
                    the provision of our services. We process personal data in
                    accordance with the applicable data protection regulations,
                    in particular the EU General Data Protection Regulation
                    (GDPR).
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 font-medium text-foreground text-lg">
                    Contact Forms and Email
                  </h3>
                  <p>
                    When you contact us via contact form or email, the data you
                    provide (email address, name, message) will be stored by us
                    for the purpose of processing your inquiry and in case of
                    follow-up questions. We do not pass on this data without
                    your consent.
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 font-medium text-foreground text-lg">
                    Server Log Files
                  </h3>
                  <p>
                    The website provider automatically collects and stores
                    information in server log files, which your browser
                    automatically transmits to us. These are: browser type and
                    version, operating system used, referrer URL, host name of
                    the accessing computer, and time of the server request. This
                    data cannot be assigned to specific persons and is not
                    merged with other data sources.
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 font-medium text-foreground text-lg">
                    Your Rights
                  </h3>
                  <p>
                    You have the right to information about your stored personal
                    data, its origin and recipients, and the purpose of data
                    processing, as well as a right to correction, blocking, or
                    deletion of this data. For this purpose and for further
                    questions on the subject of personal data, you can contact
                    us at any time at the address given in the imprint.
                  </p>
                </div>
              </div>
            </div>
          </SingleColumnSection>

          {/* Beta Service Notice */}
          <SingleColumnSection>
            <div className="mx-auto max-w-4xl text-left">
              <h2 className="mb-6 font-medium text-2xl tracking-tight md:text-3xl">
                Beta Service Notice
              </h2>
              <div className="prose prose-lg max-w-none text-muted-foreground">
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-6">
                  <p className="mb-4">
                    <strong className="text-foreground">Important:</strong>{' '}
                    Recurse.cc is currently in closed beta. The service is
                    provided &quot;as is&quot; for testing and evaluation
                    purposes only.
                  </p>
                  <ul className="space-y-2">
                    <li>
                      • No warranties or guarantees are provided regarding
                      service availability or data persistence
                    </li>
                    <li>
                      • The service may be modified, suspended, or discontinued
                      at any time
                    </li>
                    <li>
                      • Beta users should not rely on the service for production
                      or critical applications
                    </li>
                    <li>
                      • Data uploaded during beta testing may be subject to
                      deletion or loss
                    </li>
                  </ul>
                  <p className="mt-4">
                    By using the beta service, you acknowledge and accept these
                    limitations.
                  </p>
                </div>
              </div>
            </div>
          </SingleColumnSection>
        </GridLayout>
      </div>

      {/* CTA Section */}
      <CTASection />
    </>
  );
}
