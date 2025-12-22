import { Gavel, AlertTriangle, UserCheck, ShieldAlert } from 'lucide-react';

export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 text-slate-300 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="mb-12 border-b border-slate-800 pb-8">
        <h1 className="text-4xl font-extrabold text-white mb-4">Terms & Conditions</h1>
        <p className="text-slate-400">Last updated: {new Date().toLocaleDateString()}</p>
        <p className="mt-4 text-lg text-slate-300">
          Welcome to GameRoam. By accessing our website, you agree to these terms. Please read them carefully.
        </p>
      </div>

      <div className="space-y-12">
        
        {/* Section 1 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <UserCheck className="text-indigo-500" size={24}/> 1. User Responsibilities
          </h2>
          <p>By creating an account, you agree that:</p>
          <ul className="list-disc pl-6 space-y-2 marker:text-indigo-500">
            <li>You are at least 13 years of age.</li>
            <li>You will provide accurate information about yourself and the items you list.</li>
            <li>You are solely responsible for keeping your account password secure.</li>
            <li>You will not use the platform for any illegal activities or to harass others.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Gavel className="text-indigo-500" size={24}/> 2. Marketplace & Trading Rules
          </h2>
          <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
            <p className="mb-4 text-white font-medium">GameRoam acts as a venue for users to connect. We are not a direct party to transactions.</p>
            <ul className="list-disc pl-6 space-y-2 marker:text-indigo-500">
              <li><strong>Honesty:</strong> Sellers must accurately describe the condition of games (e.g., scratches, missing manuals).</li>
              <li><strong>Safety:</strong> When meeting for local trades, always meet in a public, safe location.</li>
              <li><strong>Disputes:</strong> GameRoam is not liable for items that are lost, damaged, or not as described during a peer-to-peer exchange.</li>
              <li><strong>Prohibited Items:</strong> You may only list video games and related peripherals. Illegal items, pirated software, or non-gaming content will be removed.</li>
            </ul>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="text-indigo-500" size={24}/> 3. Content Guidelines
          </h2>
          <p>
            GameRoam encourages open discussion in "The Village", but we have zero tolerance for:
          </p>
          <ul className="list-disc pl-6 space-y-2 marker:text-indigo-500">
            <li>Hate speech, racism, or discrimination of any kind.</li>
            <li>Explicit sexual content or gore.</li>
            <li>Spamming, phishing, or malicious links.</li>
          </ul>
          <p className="text-sm text-slate-500 mt-2">
            Violation of these guidelines will result in immediate account suspension or termination.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="text-indigo-500" size={24}/> 4. Limitation of Liability
          </h2>
          <p>
            To the fullest extent permitted by law, GameRoam shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service or any interactions with other users of the service.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">5. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. We will notify users of significant changes via the platform. Continued use of GameRoam constitutes acceptance of the new terms.
          </p>
        </section>

      </div>
    </div>
  );
}