import { Shield, Lock, Eye, FileText, ScanEye, Server, Fingerprint } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto py-12 pt-28 px-4 text-slate-300 animate-in fade-in duration-500 pb-20">

      {/* Header */}
      <div className="mb-12 border-b border-white/5 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyber/10 border border-cyber/20 clip-chamfer mb-4">
          <Shield className="text-cyber" size={14} />
          <span className="text-[10px] font-code font-bold text-cyber uppercase tracking-widest">Confidentiality Level: High</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-mech font-bold text-white mb-4 uppercase">Security Protocols</h1>
        <p className="text-slate-500 font-code text-xs uppercase tracking-wide">Last System Update: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="space-y-12">

        {/* Section 1 */}
        <div className="bg-void-800 border border-white/5 clip-chamfer p-1">
          <div className="bg-void-900 p-8 clip-chamfer">
            <h2 className="text-xl font-mech font-bold text-white flex items-center gap-3 mb-4 uppercase tracking-wider">
              <ScanEye className="text-cyber" size={24} /> 1. Data Interception Logs
            </h2>
            <p className="text-sm font-ui mb-4">We only capture data streams necessary for system functionality:</p>
            <ul className="list-disc pl-6 space-y-2 marker:text-cyber text-sm font-code text-slate-400">
              <li><strong className="text-white">ID_DATA:</strong> Email, User ID, Profile Visuals, Sector Location.</li>
              <li><strong className="text-white">TELEMETRY:</strong> Interaction logs, Exchange listings, and Uplink activity.</li>
              <li><strong className="text-white">COMMS:</strong> Encrypted message packets stored for trade verification.</li>
            </ul>
          </div>
        </div>

        {/* Section 2 */}
        <div className="bg-void-800 border border-white/5 clip-chamfer p-1">
          <div className="bg-void-900 p-8 clip-chamfer">
            <h2 className="text-xl font-mech font-bold text-white flex items-center gap-3 mb-4 uppercase tracking-wider">
              <Server className="text-purple-500" size={24} /> 2. Data Utilization Protocols
            </h2>
            <p className="text-sm font-ui mb-4">Captured intelligence is utilized for:</p>
            <ul className="list-disc pl-6 space-y-2 marker:text-purple-500 text-sm font-code text-slate-400">
              <li><strong className="text-white">GRID_MATCHING:</strong> Utilizing location data to identify local assets. Precise coordinates are masked.</li>
              <li><strong className="text-white">REPUTATION_SYSTEM:</strong> Public logs build operator trust ratings.</li>
              <li><strong className="text-white">THREAT_MITIGATION:</strong> Monitoring for rogue signals (spam/fraud).</li>
            </ul>
          </div>
        </div>

        {/* Section 3 */}
        <div className="bg-void-800 border border-white/5 clip-chamfer p-1">
          <div className="bg-void-900 p-8 clip-chamfer">
            <h2 className="text-xl font-mech font-bold text-white flex items-center gap-3 mb-4 uppercase tracking-wider">
              <Lock className="text-emerald-500" size={24} /> 3. Encryption Standards
            </h2>
            <p className="text-sm font-ui leading-relaxed">
              We deploy military-grade encryption for all authentication protocols. 
              However, no data transmission across the open web is 100% impenetrable. 
              Operators transmit data at their own risk.
            </p>
          </div>
        </div>

        {/* Section 4 */}
        <div className="bg-void-800 border border-white/5 clip-chamfer p-1">
          <div className="bg-void-900 p-8 clip-chamfer">
            <h2 className="text-xl font-mech font-bold text-white flex items-center gap-3 mb-4 uppercase tracking-wider">
              <Fingerprint className="text-flux" size={24} /> 4. Third-Party Uplinks
            </h2>
            <p className="text-sm font-ui mb-4">
              <strong className="text-white">WE DO NOT SELL OPERATOR DATA.</strong> External uplinks are limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2 marker:text-flux text-sm font-code text-slate-400">
              <li><strong className="text-white">CORE_DATABASE:</strong> Secure cloud storage for system integrity.</li>
              <li><strong className="text-white">VISUAL_HOSTING:</strong> Asset storage for game covers and ID cards.</li>
            </ul>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-cyber/10 p-8 clip-chamfer border border-cyber/30 mt-12 text-center">
          <h3 className="text-xl font-mech font-bold text-white mb-2 uppercase">Inquiries</h3>
          <p className="text-slate-400 font-code text-xs">
            Direct security concerns to <a href="mailto:privacy@gameroam.com" className="text-cyber hover:underline">PRIVACY@GAMEROAM.COM</a>.
          </p>
        </div>

      </div>
    </div>
  );
}