import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./author-manifesto.module.css";

const timeline = [
  {
    accent: "gold",
    book: "BOOK I",
    description:
      "Memory becomes architecture. Algus wakes inside System and begins tracing the code behind identity.",
    number: "01",
    title: "GODCODE"
  },
  {
    accent: "red",
    book: "BOOK II",
    description:
      "Power becomes infrastructure. Centrium, Iohcoin and the red operational line collide in one conflict.",
    number: "02",
    title: "CODEWAR"
  },
  {
    accent: "blue",
    book: "BOOK III",
    description:
      "Control becomes invisible. The blue architecture of security asks whether order is protection or captivity.",
    number: "03",
    title: "SYSGOD"
  }
] as const;

const themes = [
  {
    description: "The tools that reshape life also reshape the meaning of being alive.",
    number: "01",
    title: "Technology"
  },
  {
    description: "Memory, awareness and the fragile border between mind and machine.",
    number: "02",
    title: "Consciousness"
  },
  {
    description: "Invisible structures that organise, protect and quietly control existence.",
    number: "03",
    title: "Systems"
  },
  {
    description: "Who owns the architecture when human life becomes programmable?",
    number: "04",
    title: "Power"
  },
  {
    description: "The self that remains when the body, history and memory can all be replaced.",
    number: "05",
    title: "Identity"
  },
  {
    description: "Not a prediction, but a mirror held in front of the worlds being built today.",
    number: "06",
    title: "Future"
  }
] as const;

const statistics = [
  { label: "Books in the universe", value: "03" },
  { label: "Connected universe", value: "01" },
  { label: "Core human themes", value: "06" },
  { label: "IOH Universe status", value: "ACTIVE" }
] as const;

const connectLinks = [
  { href: "/books", label: "Books", number: "01" },
  { href: "/collections", label: "Collections", number: "02" },
  { href: "/token-sale", label: "IOHCoin", number: "03" },
  { href: "/contact", label: "Contact", number: "04" }
] as const;

function Kicker({ children }: { children: ReactNode }) {
  return <p className={styles.kicker}>{children}</p>;
}

function AuthorHero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroGhost} aria-hidden="true">
        AUTHOR
      </div>
      <div className={styles.shell}>
        <div className={styles.heroGrid}>
          <div className={styles.heroContent}>
            <Kicker>AUTHOR / CREATOR / IOH UNIVERSE</Kicker>
            <h1>
              <span>SAMET</span>
              <em>YURTTAS</em>
            </h1>
            <p>
              Creating worlds, systems and stories beyond traditional fiction.
            </p>
            <a className={styles.textLink} href="#manifesto">
              Enter the manifesto <span aria-hidden="true">-&gt;</span>
            </a>
          </div>
          <div className={styles.heroPortrait}>
            <Image
              alt="Samet Yurttas, author and creator of IOH Universe"
              className={styles.heroImage}
              fill
              priority
              sizes="(min-width: 1024px) 384px, (min-width: 760px) 320px, 100vw"
              src="/media/author/samet-yurttas-portrait.jpeg"
            />
            <div className={styles.heroPortraitShade} aria-hidden="true" />
          </div>
        </div>
      </div>
      <div className={styles.heroIndex} aria-hidden="true">
        <span>CREATOR FILE</span>
        <b>00 / 07</b>
      </div>
    </section>
  );
}

function AuthorManifestoSection() {
  return (
    <section className={styles.manifesto} id="manifesto">
      <div className={`${styles.shell} ${styles.manifestoGrid}`}>
        <div className={styles.sectionHeading}>
          <Kicker>01 / MANIFESTO</Kicker>
          <h2>
            WHY IOH
            <em>EXISTS</em>
          </h2>
        </div>
        <div className={styles.manifestoCopy}>
          <p className={styles.manifestoLead}>
            Samet Yurttas is an author exploring what it means to be human in
            an age of rapidly advancing technology.
          </p>
          <div className={styles.copyColumns}>
            <p>
              Artificial intelligence, digital consciousness, immortality,
              power structures, and human psychology form the foundation of
              his stories.
            </p>
            <p>
              Through the IOH (Immortal Online Humanity) universe, he imagines
              a future where death is no longer permanent and human existence
              extends beyond the limits of the physical world.
            </p>
            <p>
              Yet at the heart of these stories lies not technology, but
              humanity itself. Loss, choice, memory, love, freedom, and the
              search for meaning remain at the centre.
            </p>
            <p>
              While his worlds are set in the future, his stories reflect the
              questions people face today.
            </p>
          </div>
          <p className={styles.manifestoClose}>
            He writes science fiction not to predict the future, but to explore
            the possibilities and consequences of the worlds we are creating.
          </p>
        </div>
      </div>
    </section>
  );
}

function UniverseTimeline() {
  return (
    <section className={styles.timelineSection}>
      <div className={styles.shell}>
        <div className={styles.timelineHeader}>
          <Kicker>02 / THE UNIVERSE</Kicker>
          <h2>ONE UNIVERSE. THREE PRESSURE POINTS.</h2>
        </div>
        <div className={styles.timeline}>
          {timeline.map((item) => (
            <article
              className={`${styles.timelineItem} ${styles[item.accent]}`}
              key={item.title}
            >
              <span className={styles.timelineNumber}>{item.number}</span>
              <div className={styles.timelineTitle}>
                <p>{item.book}</p>
                <h3>{item.title}</h3>
              </div>
              <p className={styles.timelineDescription}>{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CoreThemes() {
  return (
    <section className={styles.themesSection}>
      <div className={styles.shell}>
        <div className={styles.themesHeader}>
          <Kicker>03 / CORE THEMES</Kicker>
          <h2>THE QUESTIONS INSIDE THE MACHINE.</h2>
        </div>
        <div className={styles.themeGrid}>
          {themes.map((theme) => (
            <article className={styles.theme} key={theme.title}>
              <span>{theme.number}</span>
              <h3>{theme.title}</h3>
              <p>{theme.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CreatorStatistics() {
  return (
    <section className={styles.statisticsSection}>
      <div className={styles.shell}>
        <Kicker>04 / CREATOR INDEX</Kicker>
        <div className={styles.statistics}>
          {statistics.map((stat) => (
            <div className={styles.statistic} key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AuthorQuote() {
  return (
    <section className={styles.quoteSection}>
      <div className={styles.quoteSignal} aria-hidden="true">
        IOH
      </div>
      <div className={styles.shell}>
        <Kicker>05 / CREATOR CODE</Kicker>
        <blockquote>
          <span>&ldquo;Every system has a creator.</span>
          <em>Every creator leaves a code.&rdquo;</em>
        </blockquote>
      </div>
    </section>
  );
}

function AuthorConnect() {
  return (
    <section className={styles.connectSection}>
      <div className={styles.shell}>
        <div className={styles.connectIntro}>
          <Kicker>06 / CONTINUE</Kicker>
          <h2>ENTER THE UNIVERSE.</h2>
          <p>
            Follow the stories, systems and objects connected to the IOH core.
          </p>
        </div>
        <nav className={styles.connectLinks} aria-label="IOH Universe links">
          {connectLinks.map((link) => (
            <Link href={link.href} key={link.href}>
              <span>{link.number}</span>
              <strong>{link.label}</strong>
              <i aria-hidden="true">-&gt;</i>
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}

export function AuthorManifesto() {
  return (
    <div className={styles.page}>
      <AuthorHero />
      <AuthorManifestoSection />
      <UniverseTimeline />
      <CoreThemes />
      <CreatorStatistics />
      <AuthorQuote />
      <AuthorConnect />
    </div>
  );
}
