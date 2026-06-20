import { Github, Globe, Linkedin } from "lucide-react";

const developerLinks = [
  {
    label: "GitHub",
    href: "https://github.com/syedaqdas",
    icon: Github
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/syedaqdas",
    icon: Linkedin
  },
  {
    label: "Portfolio",
    href: "https://syedaqdas.github.io/Portfolio-Website/",
    icon: Globe
  }
];

const AboutDeveloper = () => (
  <section className="border-y border-line py-8" aria-labelledby="about-developer">
    <p className="text-sm font-medium uppercase tracking-wide text-cyan">About Developer</p>
    <h2 id="about-developer" className="sr-only">About Developer</h2>
    <dl className="mt-3 space-y-1 text-sm">
      <div className="flex flex-wrap gap-2">
        <dt className="font-semibold text-white">Developer:</dt>
        <dd className="text-zinc-300">Syed Aqdas Imam</dd>
      </div>
      <div className="flex flex-wrap gap-2">
        <dt className="font-semibold text-white">Role:</dt>
        <dd className="text-zinc-300">Software Developer</dd>
      </div>
    </dl>
    <div className="mt-5 flex flex-wrap gap-3">
      {developerLinks.map(({ label, href, icon: Icon }) => (
        <a className="btn-secondary" href={href} target="_blank" rel="noreferrer" key={label}>
          <Icon size={18} />
          {label}
        </a>
      ))}
    </div>
  </section>
);

export default AboutDeveloper;
