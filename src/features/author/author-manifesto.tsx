"use client";

import Image from "next/image";
import Link from "next/link";
import { type ReactNode, useState, useEffect, useRef } from "react";
import styles from "./author-manifesto.module.css";
import { AuthorWebglMatrix } from "./author-webgl-matrix";

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
      <div className={styles.heroGridLines} aria-hidden="true" />
      <div className={styles.heroGhost} aria-hidden="true">
        AUTHOR
      </div>
      <div className={styles.shell}>
        <div className={styles.heroGrid}>
          <div className={styles.heroContent}>
            <div className={styles.heroKickerWrapper}>
              <span className={styles.heroStatusDot} />
              <Kicker>AUTHOR / SYSTEM CREATOR</Kicker>
            </div>
            <h1 className={styles.heroNameHeading}>
              <span className={styles.heroNameFirst}>SAMET</span>
              <span className={styles.heroNameLast}>YURTTAS</span>
            </h1>
            <div className={styles.heroSubtitle}>
              CORE SYSTEM ARCHITECT // CIVILIZATION DESIGNER
            </div>
            <p className={styles.heroLeadText}>
              Creating worlds, systems and stories beyond traditional fiction. 
              The books are only the entry point to a wider digital infrastructure.
            </p>
            <div className={styles.heroButtonWrapper}>
              <a className={styles.telemetryButton} href="#manifesto" data-hover data-magnet>
                <span className={styles.btnCmd}>CMD: /execute_manifesto</span>
                <span className={styles.btnDivider} />
                <span className={styles.btnLabel}>ENTER THE MANIFESTO</span>
                <span className={styles.btnArrow}>→</span>
              </a>
            </div>
          </div>

          <div className={styles.axisSeparator} aria-hidden="true">
            <span className={styles.axisLabel}>Y-AXIS // GRID_00</span>
            <div className={styles.axisDot} style={{ top: "20%" }} />
            <div className={styles.axisDot} style={{ top: "50%" }} />
            <div className={styles.axisDot} style={{ top: "80%" }} />
          </div>

          <div className={styles.portraitWrapper}>
            <div className={styles.telemetryDataTop}>
              <span>SYS_REF: CREATOR_ID_00</span>
              <span>LOC: 41.0082° N // 28.9784° E</span>
            </div>
            
            <div className={styles.heroPortrait}>
              {/* Sci-Fi Notches/Crosshairs */}
              <span className={`${styles.crosshair} ${styles.crosshairTL}`} />
              <span className={`${styles.crosshair} ${styles.crosshairTR}`} />
              <span className={`${styles.crosshair} ${styles.crosshairBL}`} />
              <span className={`${styles.crosshair} ${styles.crosshairBR}`} />
              
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

            <div className={styles.telemetryDataBottom}>
              <span>DECRYPT: SECURE [98.2%]</span>
              <span>SIGNAL: ACTIVE</span>
            </div>
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
              Through the IOH universe, he imagines
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

const CONSOLE_COMMANDS: Record<string, string[]> = {
  "/help": [
    "AVAILABLE SIGNALS:",
    "/creator",
    "/why_ioh",
    "/what_is_ioh",
    "/system",
    "/next_phase",
    "/quote"
  ],
  "/creator": [
    "I am not building stories.",
    "I am building systems that happen to be told as stories."
  ],
  "/why_ioh": [
    "Every civilization begins with a language.",
    "IOH is mine."
  ],
  "/what_is_ioh": [
    "A book universe.",
    "A digital economy.",
    "A future civilization.",
    "",
    "Still unfinished."
  ],
  "/system": [
    "CREATOR: ONLINE",
    "UNIVERSE: EXPANDING",
    "CIVILIZATION: INITIALIZING",
    "SIGNAL: ACTIVE"
  ],
  "/next_phase": [
    "Unknown.",
    "",
    "Even the creator cannot see beyond every horizon."
  ],
  "/quote": [
    "Every system has a creator.",
    "Every creator leaves a code."
  ]
};

function CreatorConsole() {
  const [history, setHistory] = useState<Array<{ id: number; type: "input" | "output"; lines: string[] }>>([
    {
      id: 0,
      type: "output",
      lines: [
        "CREATOR CONSOLE INITIALIZED",
        "TYPE /help TO ACCESS AVAILABLE SIGNALS"
      ]
    }
  ]);
  const [inputVal, setInputVal] = useState("");
  const consoleBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (consoleBodyRef.current) {
      consoleBodyRef.current.scrollTop = consoleBodyRef.current.scrollHeight;
    }
  }, [history]);

  const executeCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    const newHistory = [...history, { id: Date.now(), type: "input" as const, lines: [trimmed] }];
    setHistory(newHistory);
    setInputVal("");

    setTimeout(() => {
      let responseLines = ["UNKNOWN COMMAND.", "TYPE /help TO ACCESS AVAILABLE SIGNALS."];
      if (CONSOLE_COMMANDS[trimmed]) {
        responseLines = CONSOLE_COMMANDS[trimmed];
      }

      setHistory((prev) => [
        ...prev,
        { id: Date.now() + 1, type: "output" as const, lines: responseLines }
      ]);
    }, 150);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeCommand(inputVal);
  };

  const quickCommands = ["/creator", "/why_ioh", "/system", "/quote"];

  return (
    <section className={styles.consoleSection} id="console">
      <div className={styles.shell}>
        <div className={styles.consoleHeaderBlock}>
          <Kicker>01.5 / CREATOR INTERFACE</Kicker>
          <h2>THE CREATOR CONSOLE</h2>
        </div>
        
        <div className={styles.consoleContainer}>
          <div className={styles.consoleTitleBar}>
            <div className={styles.consoleDots}>
              <span className={styles.consoleDotRed} />
              <span className={styles.consoleDotYellow} />
              <span className={styles.consoleDotGreen} />
            </div>
            <div className={styles.consoleTitle}>THE CREATOR CONSOLE</div>
            <div className={styles.consoleStatus}>SYSTEM STATUS: SECURE</div>
          </div>
          
          <div className={styles.consoleBody}>
            <div ref={consoleBodyRef} className={styles.consoleOutputWrapper}>
              <div className={styles.consoleOutput}>
                {history.map((item) => (
                  <div key={item.id} className={item.type === "input" ? styles.consoleInputLine : styles.consoleOutputBlock}>
                    {item.type === "input" ? (
                      <div className={styles.consolePromptRow}>
                        <span className={styles.consolePromptText}>creator@ioh:~$</span>
                        <span className={styles.consoleUserCommand}>{item.lines[0]}</span>
                      </div>
                    ) : (
                      item.lines.map((line, idx) => (
                        <ConsoleLine key={idx} text={line} delay={idx * 60} />
                      ))
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.consoleInputRow}>
              <span className={styles.consolePromptText}>creator@ioh:~$</span>
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                className={styles.consoleInput}
                placeholder="Type /help..."
                autoComplete="off"
                spellCheck="false"
              />
            </form>
          </div>
          
          <div className={styles.consoleFooter}>
            <span className={styles.quickLabel}>QUICK SIGNALS:</span>
            <div className={styles.quickButtons}>
              {quickCommands.map((cmd) => (
                <button
                  key={cmd}
                  type="button"
                  onClick={() => executeCommand(cmd)}
                  className={styles.quickButton}
                >
                  {cmd}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ConsoleLine({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayText, setDisplayText] = useState("");
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const chars = "01#$_@%&?<>*[]{}";
    let step = 0;
    
    const run = () => {
      if (step >= text.length) {
        setDisplayText(text);
        return;
      }
      
      const scrambled = text
        .split("")
        .map((char, idx) => {
          if (idx <= step) return text[idx];
          if (char === " ") return " ";
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join("");
        
      setDisplayText(scrambled);
      step += 1;
      timer = setTimeout(run, 15);
    };
    
    const startTimer = setTimeout(run, delay);
    return () => {
      clearTimeout(startTimer);
      clearTimeout(timer);
    };
  }, [text, delay]);

  return <div className={styles.consoleOutputLine}>{displayText}</div>;
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
  const originalPart1 = "Every system has a creator.";
  const originalPart2 = "Every creator leaves a code.";
  const [part1, setPart1] = useState(originalPart1);
  const [part2, setPart2] = useState(originalPart2);
  const intervalRef1 = useRef<NodeJS.Timeout | null>(null);
  const intervalRef2 = useRef<NodeJS.Timeout | null>(null);

  const startGlitch = (
    setFn: (t: string) => void,
    originalText: string,
    intervalRef: React.MutableRefObject<NodeJS.Timeout | null>
  ) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const chars = "01#$_@%&?<>*[]{}";
    let iterations = 0;

    intervalRef.current = setInterval(() => {
      setFn(
        originalText
          .split("")
          .map((char, index) => {
            if (index < iterations) {
              return originalText[index];
            }
            if (char === " ") return " ";
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );

      if (iterations >= originalText.length) {
        clearInterval(intervalRef.current!);
      }
      iterations += 1;
    }, 20);
  };

  const handleMouseEnter = () => {
    startGlitch(setPart1, originalPart1, intervalRef1);
    startGlitch(setPart2, originalPart2, intervalRef2);
  };

  const handleMouseLeave = () => {
    if (intervalRef1.current) clearInterval(intervalRef1.current);
    if (intervalRef2.current) clearInterval(intervalRef2.current);
    setPart1(originalPart1);
    setPart2(originalPart2);
  };

  return (
    <section
      className={styles.quoteSection}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.quoteSignal} aria-hidden="true">
        IOH
      </div>
      <div className={styles.shell}>
        <Kicker>05 / CREATOR CODE</Kicker>
        <blockquote>
          <span>&ldquo;{part1}</span>
          <em>{part2}&rdquo;</em>
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
      <AuthorWebglMatrix />
      <div className={styles.vignette} aria-hidden="true" />
      <div className={styles.grain} aria-hidden="true" />
      <AuthorHero />
      <AuthorManifestoSection />
      <CreatorConsole />
      <UniverseTimeline />
      <CoreThemes />
      <CreatorStatistics />
      <AuthorQuote />
      <AuthorConnect />
    </div>
  );
}
