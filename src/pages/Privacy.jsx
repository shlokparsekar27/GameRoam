import { Shield, Lock, Eye, FileText } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 text-slate-300 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="mb-12 border-b border-slate-800 pb-8">
        <h1 className="text-4xl font-extrabold text-white mb-4">Privacy Policy</h1>
        <p className="text-slate-400">Last updated: {new Date().toLocaleDateString()}</p>
        <p className="mt-4 text-lg text-slate-300">
          Your privacy is critically important to us. At GameRoam, we have a few fundamental principles:
        </p>
      </div>

      <div className="space-y-12">
        
        {/* Section 1 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Eye className="text-indigo-500" size={24}/> 1. Information We Collect
          </h2>
          <p>We only collect information that is necessary to provide our service. This includes:</p>
          <ul className="list-disc pl-6 space-y-2 marker:text-indigo-500">
            <li><strong>Account Information:</strong> When you sign up, we collect your email address and create a user ID. You may optionally provide a username, profile picture, and location.</li>
            <li><strong>Usage Data:</strong> We collect data on how you interact with the community, including posts, likes, and marketplace listings.</li>
            <li><strong>Communication Data:</strong> Messages sent via our chat system are stored securely to enable communication between buyers and sellers.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="text-indigo-500" size={24}/> 2. How We Use Your Information
          </h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-6 space-y-2 marker:text-indigo-500">
            <li><strong>Facilitate Trades:</strong> Your location (City/Region) is used to show you relevant listings nearby. We never share your precise GPS coordinates.</li>
            <li><strong>Build Community:</strong> Your profile data helps other gamers identify who they are interacting with, building trust in the ecosystem.</li>
            <li><strong>Safety & Moderation:</strong> We monitor public posts and reports to prevent harassment, spam, and fraudulent activity.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Lock className="text-indigo-500" size={24}/> 3. Data Security
          </h2>
          <p>
            We implement industry-standard security measures to protect your data. All user authentication is handled via secure, encrypted protocols. 
            However, no method of transmission over the Internet is 100% secure. While we strive to protect your personal data, we cannot guarantee its absolute security.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="text-indigo-500" size={24}/> 4. Third-Party Sharing
          </h2>
          <p>
            <strong>We do not sell your personal data.</strong> We only share data with third-party services that enable our app to function, such as:
          </p>
          <ul className="list-disc pl-6 space-y-2 marker:text-indigo-500">
            <li><strong>Database Providers:</strong> To store your account and content data securely.</li>
            <li><strong>Image Hosting Services:</strong> To store and serve your uploaded game covers and profile pictures.</li>
          </ul>
        </section>

        {/* Contact */}
        <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 mt-12">
          <h3 className="text-xl font-bold text-white mb-2">Questions?</h3>
          <p className="text-slate-400">
            If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@gameroam.com" className="text-indigo-400 hover:underline">privacy@gameroam.com</a>.
          </p>
        </div>

      </div>
    </div>
  );
}