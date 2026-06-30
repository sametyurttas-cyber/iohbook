export function PublicAtmosphere() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden bg-[#05060a]">
      {/* Dynamic Cosmic Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(242,201,109,0.08),transparent_35rem),radial-gradient(circle_at_86%_22%,rgba(111,155,255,0.06),transparent_35rem),radial-gradient(circle_at_14%_72%,rgba(255,91,91,0.05),transparent_30rem)]" />
      
      {/* Vignette Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_45%,transparent_55%,rgba(2,3,6,0.75)_100%)]" />
      
      {/* Noise Grain Overlay */}
      <div 
        className="absolute inset-[-50%] w-[200%] h-[200%] opacity-[0.035] pointer-events-none bg-[url('data:image/svg+xml,%3Csvg_xmlns=\'http://www.w3.org/2000/svg\'_width=\'240\'_height=\'240\'%3E%3Cfilter_id=\'n\'%3E%3CfeTurbulence_type=\'fractalNoise\'_baseFrequency=\'0.9\'_numOctaves=\'2\'/%3E%3C/filter%3E%3Crect_width=\'240\'_height=\'240\'_filter=\'url(%23n)\'/%3E%3C/svg%3E')]"
      />
    </div>
  );
}
