import { Gavel, AlertTriangle, UserCheck, ShieldAlert, FileWarning, Scale } from 'lucide-react';

export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto py-12 pt-28 px-4 text-slate-300 animate-in fade-in duration-500 pb-20">

      {/* Header */}
      <div className="mb-12 border-b border-white/5 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-flux/10 border border-flux/20 clip-chamfer mb-4">
          <FileWarning className="text-flux" size={14} />
          <span className="text-[10px] font-code font-bold text-flux uppercase tracking-widest">Mandatory Compliance</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-mech font-bold text-white mb-4 uppercase">Operator Agreement</h1>
        <p className="text-slate-500 font-code text-xs uppercase tracking-wide">
          By accessing the GameRoam Grid, you agree to these terms.
        </p>
      </div>

      <div className="space-y-8">

        {/* Section 1 */}
        <div className="bg-void-900 border-l-4 border-cyber p-6 clip-chamfer">
          <h2 className="text-lg font-mech font-bold text-white flex items-center gap-2 mb-4 uppercase tracking-wider">
            <UserCheck className="text-cyber" size={20} /> 1. Operator Eligibility
          </h2>
          <ul className="list-disc pl-6 space-y-2 marker:text-cyber text-sm font-code text-slate-400">
            <li>Must be Minimum Level 13 (Age 13+).</li>
            <li>Must provide accurate telemetry data regarding assets.</li>
            <li>Account credentials must be secured. Unauthorized access is your liability.</li>
          </ul>
        </div>

        {/* Section 2 */}
        <div className="bg-void-900 border-l-4 border-purple-500 p-6 clip-chamfer">
          <h2 className="text-lg font-mech font-bold text-white flex items-center gap-2 mb-4 uppercase tracking-wider">
            <Scale className="text-purple-500" size={20} /> 2. Exchange Regulations
          </h2>
          <div className="bg-void-950 p-4 border border-white/5 clip-chamfer text-sm font-ui text-slate-400">
            <p className="mb-4">GameRoam is a neutral venue. We do not oversee physical handovers.</p>
            <ul className="list-disc pl-6 space-y-2 marker:text-purple-500">
              <li><strong className="text-white">INTEGRITY:</strong> Asset condition (scratches, manuals) must be logged accurately.</li>
              <li><strong className="text-white">SAFETY:</strong> Local exchanges must occur in secure, public sectors.</li>
              <li><strong className="text-white">CONTRABAND:</strong> Only video game assets permitted. Illegal/Pirated goods will result in immediate ban.</li>
            </ul>
          </div>
        </div>

        {/* Section 3 */}
        <div className="bg-void-900 border-l-4 border-flux p-6 clip-chamfer">
          <h2 className="text-lg font-mech font-bold text-white flex items-center gap-2 mb-4 uppercase tracking-wider">
            <AlertTriangle className="text-flux" size={20} /> 3. Comms Discipline
          </h2>
          <p className="text-sm font-ui mb-3 text-slate-400">
            Zero tolerance policy for the following violations:
          </p>
          <ul className="list-disc pl-6 space-y-2 marker:text-flux text-sm font-code text-slate-400">
            <li>Hate speech or discrimination.</li>
            <li>Posting explicit or gore content.</li>
            <li>Phishing or malicious data injection.</li>
          </ul>
          <p className="text-[10px] font-code text-flux mt-4 uppercase tracking-widest">
            **VIOLATION RESULTS IN IMMEDIATE TERMINATION OF SIGNAL.**
          </p>
        </div>

        {/* Section 4 */}
        <div className="bg-void-900 border-l-4 border-slate-600 p-6 clip-chamfer">
          <h2 className="text-lg font-mech font-bold text-white flex items-center gap-2 mb-4 uppercase tracking-wider">
            <ShieldAlert className="text-slate-400" size={20} /> 4. Liability Protocols
          </h2>
          <p className="text-sm font-ui text-slate-400 leading-relaxed">
            GameRoam Systems is not liable for indirect, incidental, or consequential damages resulting from user interactions or asset exchanges.
          </p>
        </div>

        {/* Section 5 */}
        <div className="bg-void-900 border-l-4 border-slate-600 p-6 clip-chamfer">
          <h2 className="text-lg font-mech font-bold text-white mb-2 uppercase tracking-wider">5. Protocol Updates</h2>
          <p className="text-sm font-ui text-slate-400">
            We reserve the right to patch these terms. Continued use of the grid constitutes acceptance of new protocols.
          </p>
        </div>

      </div>
    </div>
  );
}