const Privacy = () => {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: 29 April 2026</p>

        <div className="prose prose-sm max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-2">1. Introduction</h2>
            <p>Clean Fit ("we", "our", "us") operates the Clean Fit mobile application and website (the "Service"). This Privacy Policy explains how we collect, use, and protect your personal information when you use our Service in the United Kingdom.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">2. Information We Collect</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Account info:</strong> Name, phone number, email, profile photo.</li>
              <li><strong>Address & location:</strong> Service address, postcode, and live GPS location (cleaners only, while on a job) for matching and ETA.</li>
              <li><strong>Booking data:</strong> Service history, before/after job photos, ratings, reviews.</li>
              <li><strong>Payment data:</strong> Processed via secure third-party providers; we do not store full card details.</li>
              <li><strong>Verification data (cleaners):</strong> DBS check, Right to Work documents, training records.</li>
              <li><strong>Device data:</strong> Device type, OS, app version, and crash logs.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To match customers with verified cleaners and deliver bookings.</li>
              <li>To process payments, refunds, and loyalty rewards.</li>
              <li>To send booking notifications, reminders, and service updates.</li>
              <li>To verify cleaner identity, eligibility, and training compliance.</li>
              <li>To improve, secure, and troubleshoot the Service.</li>
              <li>To comply with UK legal obligations (GDPR, Data Protection Act 2018).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">4. Sharing Your Information</h2>
            <p>We share data only with: (a) the matched cleaner/customer for the specific booking, (b) payment processors, (c) verification providers (DBS, Right to Work), and (d) authorities where required by law. We never sell your personal data.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">5. Data Retention</h2>
            <p>Account and booking data is retained while your account is active. If you delete your account, personal identifiers are removed within 30 days; anonymised booking records may be retained for tax and audit purposes (up to 6 years).</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">6. Your Rights (UK GDPR)</h2>
            <p>You have the right to access, correct, delete, or export your data, and to withdraw consent. Contact us at <a href="mailto:privacy@cleanfit.app" className="text-primary underline">privacy@cleanfit.app</a> to exercise any right. You may also lodge a complaint with the ICO (ico.org.uk).</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">7. Security</h2>
            <p>We use encryption in transit (TLS), encrypted storage, row-level access controls, and verified-cleaner background checks. No system is 100% secure, but we follow industry best practice.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">8. Children</h2>
            <p>Clean Fit is not intended for users under 18. We do not knowingly collect data from children.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">9. Changes to this Policy</h2>
            <p>We may update this Policy. Material changes will be notified in-app at least 7 days before they take effect.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">10. Contact</h2>
            <p>Clean Fit Ltd, London, United Kingdom<br />
            Email: <a href="mailto:privacy@cleanfit.app" className="text-primary underline">privacy@cleanfit.app</a><br />
            Support: <a href="mailto:support@cleanfit.app" className="text-primary underline">support@cleanfit.app</a></p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
