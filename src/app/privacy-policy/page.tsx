import React from "react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12 prose prose-lg max-w-4xl">
          <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>

          <h2>Ragable Inc. Privacy Policy</h2>

          <p>
            <strong>Effective Date:</strong> April 3, 2025
            <br />
            <strong>Last Updated:</strong> April 3, 2025
          </p>

          <h3>1. Introduction</h3>

          <p>
            Welcome to Ragable Inc. (&quot;Ragable,&quot; &quot;we,&quot;
              &quot;us,&quot; or &quot;our&quot;). We are committed to protecting
            the privacy of our users (&quot;User,&quot; &quot;you,&quot;
              &quot;your&quot;). This Privacy Policy explains how we collect, use,
            disclose, and safeguard your information when you access and use our
            website, applications, software, AI models, tools, APIs, and related
            services (collectively, the &quot;Service&quot;). Our Service
            provides an agentic co-pilot designed to help students take agency of
            their learning.
          </p>

          <p>
            This Privacy Policy applies to information collected through the
            Service. Please read this Privacy Policy carefully. By accessing or
            using our Service, you acknowledge that you have read, understood,
            and agree to the practices described in this Privacy Policy. If you
            do not agree with the terms of this Privacy Policy, please do not
            access or use the Service.
          </p>

          <p>
            This Privacy Policy should be read in conjunction with our Terms of
            Service (https://ragable.ca/tos).
          </p>

          <h3>2. Information We Collect</h3>

          <p>
            We collect information about you in various ways when you use our
            Service. This information helps us provide and improve the Service.
          </p>

          <h4>(a) Information You Provide Directly:</h4>
          <ul>
            <li>
              <strong>Account Information:</strong> When you register for an
              account, we collect information such as your name, email address,
              password, and potentially other profile details you choose to
              provide.
            </li>
            <li>
              <strong>User Content:</strong> We collect the files, documents
              (e.g., PDFs, images), text, data, prompts, and other information
              you upload, submit, or create within the Service (&quot;User
              Content&quot;). This includes content imported from third-party
              services like Google Drive if you choose to connect them.
            </li>
            <li>
              <strong>Communications:</strong> If you contact us directly (e.g.,
              for customer support, feedback), we collect information such as
              your name, email address, the content of your message, and any
              attachments you may send us.
            </li>
          </ul>

          <h4>(b) Information Collected Automatically:</h4>
          <ul>
            <li>
              <strong>Log and Usage Data:</strong> When you access the Service,
              our servers automatically record information, including your
              Internet Protocol (IP) address, browser type and settings, device
              information (e.g., operating system, device identifiers), access
              times, pages viewed, features used, and the referring webpage.
            </li>
            <li>
              <strong>Cookies and Similar Technologies:</strong> We use cookies
              (small text files placed on your device) and similar tracking
              technologies (like web beacons or pixels) to operate and
              administer the Service, gather usage data, and improve your
              experience. You can control the use of cookies at the individual
              browser level, but if you choose to disable cookies, it may limit
              your use of certain features or functions of the Service.
            </li>
            <li>
              <strong>Analytics Data:</strong> We may use third-party analytics
              services (including potentially Google Analytics, subject to their
              policies) to collect and analyze usage information to understand
              how our Service is used and to help us improve it. This information
              is often aggregated and may not personally identify you.
            </li>
          </ul>

          <h4>(c) Information from Third Parties:</h4>
          <ul>
            <li>
              <strong>Google Drive Integration:</strong> If you choose to connect
              your Google Drive account to import files or folders into Ragable
              Course Spaces, we will access and process the specific files and
              folders you authorize, solely for the purpose of providing this
              integration feature within the Service. Our access is governed by
              Google&apos;s API policies and the permissions you grant.
            </li>
          </ul>

          <h3>3. How We Use Your Information</h3>

          <p>
            We use the information we collect for various purposes, including:
          </p>
          <ul>
            <li>
              <strong>To Provide and Maintain the Service:</strong> To operate,
              maintain, administer, and provide the features and functionality of
              the Service, including processing your User Content through our AI
              models (like Google Gemini 2.5 Pro) and tools to generate
              responses, visualizations, summaries, citations, etc.
            </li>
            <li>
              <strong>To Improve and Personalize the Service:</strong> To
              understand user needs and preferences, troubleshoot issues, develop
              new features, personalize your experience, and improve the overall
              quality of the Service. User Content may be used to improve the
              Service&apos;s performance <em>for you</em>, but generally will
              not be used to train general AI models shared across users unless
              it is aggregated and anonymized or you provide explicit consent.
            </li>
            <li>
              <strong>To Communicate with You:</strong> To respond to your
              comments, questions, and requests, provide customer support, and
              send you technical notices, updates, security alerts, and
              administrative messages.
            </li>
            <li>
              <strong>For Security and Compliance:</strong> To detect and prevent
              fraud, abuse, security incidents, and other harmful activities; to
              enforce our Terms of Service; and to comply with legal obligations.
            </li>
            <li>
              <strong>For Analytics and Research:</strong> To monitor and analyze
              trends, usage, and activities in connection with our Service (often
              using aggregated or de-identified data).
            </li>
            <li>
              <strong>With Your Consent:</strong> For any other purpose disclosed
              to you at the time we collect your information or pursuant to your
              consent.
            </li>
          </ul>

          <h3>4. How We Share Your Information</h3>

          <p>
            We do not sell your personal information. We may share your
            information in the following circumstances:
          </p>
          <ul>
            <li>
              <strong>Service Providers and Vendors:</strong> We share information
              with third-party vendors, consultants, and other service providers
              who need access to such information to carry out work on our
              behalf. This includes:
              <ul>
                <li>
                  <strong>Supabase:</strong> For backend infrastructure, database
                  management, and authentication services.
                </li>
                <li>
                  <strong>Google Cloud Platform (GCP):</strong> For hosting, data
                  storage, computing infrastructure, and potentially running AI
                  models.
                </li>
                <li>
                  <strong>Google (Gemini & Search):</strong> To process prompts
                  and User Content via the Gemini AI models for generating
                  responses, and to integrate web search results when requested.
                  Information shared with Google for AI processing is subject to
                  Google&apos;s API data usage policies.
                </li>
              </ul>
              These service providers are authorized to use your personal
              information only as necessary to provide these services to us and
              are obligated to protect your information.
            </li>
            <li>
              <strong>Legal Requirements and Safety:</strong> We may disclose your
              information if required to do so by law or in the good faith belief
              that such action is necessary to: (i) comply with a legal
              obligation, regulation, or governmental request; (ii) protect and
              defend the rights or property of Ragable; (iii) prevent or
              investigate possible wrongdoing in connection with the Service; (iv)
              protect the personal safety of users of the Service or the public;
              or (v) protect against legal liability.
            </li>
            <li>
              <strong>Business Transfers:</strong> We may share or transfer your
              information in connection with, or during negotiations of, any
              merger, sale of company assets, financing, or acquisition of all or
              a portion of our business by another company. We will notify you of
              such a change in ownership or transfer of assets by posting a
              notice on our website or sending you an email.
            </li>
            <li>
              <strong>With Your Consent:</strong> We may share your information
              with third parties when we have your explicit consent to do so.
            </li>
            <li>
              <strong>Aggregated or De-identified Data:</strong> We may share
              aggregated or de-identified information, which cannot reasonably be
              used to identify you, for various purposes, including research,
              analytics, or reporting.
            </li>
          </ul>

          <h3>
            5. Legal Basis for Processing Personal Information (For users subject
            to laws like GDPR/PIPEDA)
          </h3>

          <p>
            Our legal basis for collecting and using the personal information
            described above will depend on the personal information concerned and
            the specific context in which we collect it. We generally rely on the
            following bases:
          </p>
          <ul>
            <li>
              <strong>Contractual Necessity:</strong> To perform our contract with
              you (i.e., provide the Service as described in our Terms of
              Service).
            </li>
            <li>
              <strong>Consent:</strong> Where required by law, or for certain
              optional features or communications, we will rely on your consent.
              You can withdraw your consent at any time.
            </li>
            <li>
              <strong>Legitimate Interests:</strong> Where the processing is
              necessary for our legitimate interests (e.g., improving the
              Service, security, analytics) and not overridden by your data
              protection interests or fundamental rights and freedoms.
            </li>
            <li>
              <strong>Legal Obligation:</strong> To comply with our legal
              obligations.
            </li>
          </ul>

          <h3>6. Data Retention</h3>

          <p>
            We retain personal information for as long as necessary to fulfill the
            purposes outlined in this Privacy Policy, such as maintaining your
            account and providing the Service, unless a longer retention period
            is required or permitted by law (e.g., for tax, accounting, or other
            legal requirements). When we have no ongoing legitimate business need
            to process your personal information, we will either delete or
            anonymize it, or, if this is not possible (for example, because your
            personal information has been stored in backup archives), then we
            will securely store your personal information and isolate it from any
            further processing until deletion is possible. You can typically
            delete your User Content and account through the Service settings.
          </p>

          <h3>7. Data Security</h3>

          <p>
            Ragable takes industry-standard and reasonable administrative, technical, and physical
            security measures to protect your personal information from loss,
            theft, misuse, unauthorized access, disclosure, alteration, and
            destruction. We leverage security features provided by our vendors
            like Supabase and Google Cloud Platform. However, no electronic
            transmission or storage of information can be guaranteed to be 100%
            secure. While we strive to protect your information, we cannot ensure
            or warrant the security of any information you transmit to us.
          </p>

          <h3>8. Your Privacy Rights</h3>

          <p>
            Depending on your location and applicable law (such as Canada&apos;s
            PIPEDA), you may have certain rights regarding your personal
            information, including:
          </p>
          <ul>
            <li>
              <strong>Right to Access:</strong> You may have the right to request
              access to the personal information we hold about you.
            </li>
            <li>
              <strong>Right to Correction (Rectification):</strong> You may have
              the right to request correction of inaccurate personal information
              we hold about you. You can often update your account information
              directly through your account settings.
            </li>
            <li>
              <strong>Right to Deletion (Erasure):</strong> You may have the
              right to request the deletion of your personal information, subject
              to certain exceptions (e.g., legal obligations).
            </li>
            <li>
              <strong>Right to Withdraw Consent:</strong> Where we rely on
              consent, you have the right to withdraw it at any time.
            </li>
            <li>
              <strong>Right to Object/Opt-Out:</strong> You may have the right to
              object to certain processing activities or opt-out of certain
              disclosures.
            </li>
          </ul>
          <p>
            To exercise these rights, please contact us using the details
            provided in the &quot;Contact Information&quot; section below. We
            will respond to your request in accordance with applicable law. We
            may need to verify your identity before processing your request.
          </p>

          <h3>9. International Data Transfers</h3>

          <p>
            Your information, including personal information, may be transferred
            to — and maintained on — computers located outside of your state,
            province, country, or other governmental jurisdiction where the data
            protection laws may differ from those in your jurisdiction.
            Specifically, as we utilize vendors like Supabase and Google Cloud
            Platform, your data will likely be processed in the United States and
            potentially other locations where these companies operate data
            centers. By using the Service, you consent to the transfer of your
            information to these locations. We will take appropriate steps to
            ensure that your personal information is treated securely and in
            accordance with this Privacy Policy.
          </p>

          <h3>10. Children&apos;s Privacy</h3>

          <p>
            Our Service is not directed to individuals under the age of 13. We do
            not knowingly collect personal information from children under 13. If
            you are a parent or guardian and believe your child has provided us
            with personal information without your consent, please contact us. If
            we become aware that we have collected personal information from a
            child under 13 without verification of parental consent, we will take
            steps to remove that information from our servers. Users between 13
            and the age of majority in their jurisdiction must have parental or
            guardian permission to use the Service.
          </p>

          <h3>11. Cookies and Tracking Technologies</h3>

          <p>
            As mentioned above, we use cookies and similar technologies. For more
            detailed information about the cookies we use and your choices
            regarding cookies, please see our [Link to Cookie Policy, if
            separate] or manage your preferences through your browser settings.
          </p>

          <h3>12. Third-Party Links</h3>

          <p>
            The Service may contain links to other websites or services not
            operated or controlled by Ragable (&quot;Third-Party Sites&quot;).
            The information that you share with Third-Party Sites will be governed
            by the specific privacy policies and terms of service of the
            Third-Party Sites and not by this Privacy Policy. Ragable is not
            responsible for the privacy practices of these Third-Party Sites.
          </p>

          <h3>13. Changes to This Privacy Policy</h3>

          <p>
            We may update this Privacy Policy from time to time to reflect
            changes in our practices, technology, legal requirements, or other
            factors. If we make material changes, we will notify you by posting
            the updated policy on our website, updating the &quot;Last
            Updated&quot; date, and/or providing other notice as required by
            applicable law (e.g., via email or in-app notification). Your
            continued use of the Service after any changes constitutes your
            acceptance of the revised Privacy Policy.
          </p>

          <h3>14. Contact Information</h3>

          <p>
            If you have any questions, comments, or concerns about this Privacy
            Policy or our data practices, please contact us at:
          </p>
          <p>
            Ragable Inc.
            <br />
            Toronto, Ontario, Canada
            <br />
            Email: 
            <a href="mailto:team@ragable.ca">
              team@ragable.ca
            </a>
            <br />
            Website: https://ragable.ca
          </p>

          <hr />
          <p>
            <strong>End of Privacy Policy</strong>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
