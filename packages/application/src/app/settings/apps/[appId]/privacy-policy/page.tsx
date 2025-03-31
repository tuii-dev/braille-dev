import { Scrollbars } from "@/components/scrollbars";

export default function Page() {
  return (
    <Scrollbars>
      <div className="w-full p-12 m-auto max-w-4xl">
        <h1 className="text-2xl mb-8 font-bold">Privacy Policy</h1>
        <p>
          Braille (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) is
          committed to protecting your privacy. This Privacy Policy explains how
          we collect, use, disclose, and safeguard your information when you use
          our Braille software and any related services (collectively, the
          &ldquo;Service&rdquo;).
        </p>

        <div className="mt-12 w-full flex flex-col gap-y-4">
          <div>
            <h2 className="text-lg mb-3 font-semibold">
              1. Information We Collect
            </h2>
            <div>
              <h3 className="font-semibold mt-4">1.1 Personal Information:</h3>
              <p>
                We may collect personally identifiable information, such as your
                name, email address, phone number, and payment information, when
                you voluntarily provide it to us or when necessary for the
                operation of the Service.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mt-4">
                1.2 Non-Personal Information:
              </h3>
              <p>
                We may collect non-personal information about you such as usage
                data, preferences, and interactions with the Service, which may
                be anonymized or aggregated.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-lg mb-3 font-semibold">
              2. How We Use Your Information
            </h2>
            <div>
              <h3 className="font-semibold mt-4">
                2.1 Operate and Improve the Service:
              </h3>
              <p>
                We use your information to operate, maintain, and improve the
                Service, including providing customer support, troubleshooting
                issues, and analyzing usage trends.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mt-4">2.2 Communications:</h3>
              <p>
                We may use your information to communicate with you, including
                sending emails or notifications related to your use of the
                Service, updates, promotional messages, and administrative
                information.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-lg mb-3 font-semibold">
              3. Disclosure of Your Information
            </h2>
            <div>
              <h3 className="font-semibold mt-4">
                3.1 Third-Party Service Providers:
              </h3>
              <p>
                We may share your information with third-party service providers
                who perform services on our behalf, such as payment processing,
                data analysis, and hosting services.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mt-4">3.2 Compliance with Laws:</h3>
              <p>
                We may disclose your information to comply with applicable laws,
                regulations, legal processes, or government requests.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-lg mb-3 font-semibold">4. Data Security</h2>
            <div>
              <h3 className="font-semibold mt-4">4.1 Security Measures:</h3>
              <p>
                We implement reasonable security measures to protect your
                information from unauthorized access, alteration, disclosure, or
                destruction.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-lg mb-3 font-semibold">
              5. Your Choices and Rights
            </h2>
            <div>
              <h3 className="font-semibold mt-4">5.1 Opt-Out:</h3>
              <p>
                You may opt-out of receiving promotional emails from us by
                following the instructions provided in those emails. Even if you
                opt-out, we may still send you non-promotional communications.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mt-4">5.2 Access and Correction:</h3>
              <p>
                You may access and update your personal information by
                contacting us directly. You may also request that we delete your
                personal information, subject to applicable laws and
                regulations.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-lg mb-3 font-semibold">
              6. Children&rsquo;s Privacy
            </h2>
            <div>
              <h3 className="font-semibold mt-4">6.1 Age Limitation:</h3>
              <p>
                The Service is not intended for use by individuals under the age
                of 18. We do not knowingly collect personal information from
                children under 18 years of age.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-lg mb-3 font-semibold">
              7. Changes to This Privacy Policy
            </h2>
            <div>
              <h3 className="font-semibold mt-4">7.1 Updates:</h3>
              <p>
                We may update this Privacy Policy from time to time by posting a
                new version on our website or notifying you through the Service.
                Your continued use of the Service after such changes constitutes
                your acceptance of the updated Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Scrollbars>
  );
}
