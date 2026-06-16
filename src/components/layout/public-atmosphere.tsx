export function PublicAtmosphere() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(242,201,109,0.16),transparent_26rem),radial-gradient(circle_at_86%_22%,rgba(70,189,235,0.12),transparent_30rem),radial-gradient(circle_at_14%_72%,rgba(214,74,58,0.1),transparent_28rem)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,7,0.08),rgba(5,5,7,0.8)),radial-gradient(circle_at_center,transparent_0,rgba(0,0,0,0.72)_78%)]" />
      <div className="absolute inset-0 opacity-[0.055] [background-image:linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="absolute inset-0 opacity-[0.16] [background-image:radial-gradient(rgba(255,255,255,.68)_0.65px,transparent_0.65px)] [background-size:3px_3px]" />
    </div>
  );
}
