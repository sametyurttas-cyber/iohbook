import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import {
  IohSceneHeader,
  type IohSceneHeaderUser
} from "@/components/layout/ioh-scene-header";
import { BooksIndexFooter } from "@/features/catalog/books-index-scene";
import { IohIndexStyles } from "@/features/home/ioh-index-landing";
import { characters, cities, factions, technologies, timeline } from "./encyclopedia-data";
import styles from "./encyclopedia-scene.module.css";

function ArchiveKicker({ children }: { children: ReactNode }) {
  return <p className={styles.kicker}>{children}</p>;
}

function SectionHeading({
  chapter,
  description,
  title
}: {
  chapter: string;
  description: string;
  title: string;
}) {
  return (
    <div className={styles.sectionHeading}>
      <div>
        <ArchiveKicker>{chapter}</ArchiveKicker>
        <h2>{title}</h2>
      </div>
      <p>{description}</p>
    </div>
  );
}

function ArchiveRail() {
  const sections = [
    ["01", "Characters", "characters"],
    ["02", "Cities", "cities"],
    ["03", "Factions", "factions"],
    ["04", "Technologies", "technologies"],
    ["05", "Timeline", "timeline"]
  ] as const;

  return (
    <nav className={styles.rail} aria-label="Encyclopedia bolumleri">
      {sections.map(([number, label, id]) => (
        <a href={`#${id}`} key={id}>
          <span>{number}</span>
          <b>{label}</b>
        </a>
      ))}
    </nav>
  );
}

function EncyclopediaHero() {
  return (
    <section className={styles.hero} id="archive">
      <Image
        alt="IOH Universe sehir ve sistem haritasi"
        className={styles.heroImage}
        fill
        priority
        sizes="100vw"
        src="/media/encyclopedia/cities/archive-map.webp"
      />
      <div className={styles.heroShade} aria-hidden="true" />
      <div className={styles.heroGrid} aria-hidden="true" />
      <div className={styles.heroGhost} aria-hidden="true">
        ARCHIVE
      </div>
      <div className={styles.shell}>
        <div className={styles.heroCopy}>
          <ArchiveKicker>IOH Universe Archive</ArchiveKicker>
          <h1>Encyclopedia</h1>
          <p className={styles.heroLead}>
            2303 yilinda insanlik artik yalnizca sehirlerde degil, sistemlerin
            icinde yasamaktadir.
          </p>
          <p className={styles.heroBody}>
            Bu ansiklopedi IOH Universe&apos;in karakterlerini, sehirlerini,
            organizasyonlarini ve teknolojilerini icerir.
          </p>
          <a className={styles.heroAction} href="#characters">
            Arsivi kesfet <span aria-hidden="true">-&gt;</span>
          </a>
        </div>
        <div className={styles.heroCoordinates} aria-hidden="true">
          <span>EARTH / SYSTEM GRID</span>
          <span>YEAR 2303</span>
          <span>ARCHIVE STATUS: OPEN</span>
        </div>
      </div>
      <div className={styles.scrollCue} aria-hidden="true">
        <span>DISCOVER</span>
        <i />
      </div>
    </section>
  );
}

function CharactersSection() {
  return (
    <section className={styles.characters} id="characters">
      <div className={styles.shell}>
        <SectionHeading
          chapter="Archive 01 / People"
          description="Five lives moving through the same system from different positions of power, resistance and memory."
          title="Characters"
        />
      </div>
      <div className={styles.characterSequence}>
        {characters.map((character, index) => (
          <article
            className={styles.characterScene}
            id={character.id}
            key={character.id}
            style={{ "--archive-accent": character.accent } as CSSProperties}
          >
            <div className={styles.characterNumber} aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </div>
            <div className={styles.characterImageStage}>
              <Image
                alt={`${character.name} karakter portresi`}
                className={styles.characterImage}
                fill
                sizes="(max-width: 760px) 100vw, 58vw"
                src={character.image}
              />
            </div>
            <div className={styles.characterCopy}>
              <ArchiveKicker>{character.role}</ArchiveKicker>
              <h3>{character.name}</h3>
              <p>{character.summary}</p>
              <dl>
                <div>
                  <dt>Organization</dt>
                  <dd>{character.organization}</dd>
                </div>
                <div>
                  <dt>Role</dt>
                  <dd>{character.role}</dd>
                </div>
              </dl>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function CitiesSection() {
  return (
    <section className={styles.cities} id="cities">
      <div className={styles.shell}>
        <SectionHeading
          chapter="Archive 02 / Places"
          description="The cities of 2303 are not backgrounds. Each one is a machine for organizing power, identity and daily life."
          title="Cities"
        />
      </div>
      <div className={styles.citySequence}>
        {cities.map((city, index) => (
          <article
            className={styles.cityScene}
            id={city.id}
            key={city.id}
            style={{ "--archive-accent": city.accent } as CSSProperties}
          >
            <Image
              alt={`${city.name} sehir gorunumu`}
              className={styles.cityImage}
              fill
              sizes="100vw"
              src={city.image}
            />
            <div className={styles.cityShade} aria-hidden="true" />
            <div className={styles.cityIndex} aria-hidden="true">
              CITY / {String(index + 1).padStart(2, "0")}
            </div>
            <div className={`${styles.shell} ${styles.cityInner}`}>
              <div className={styles.cityCopy}>
                <ArchiveKicker>{city.organization}</ArchiveKicker>
                <h3>{city.name}</h3>
                <p>{city.summary}</p>
              </div>
              <dl className={styles.cityFacts}>
                <div>
                  <dt>Population</dt>
                  <dd>{city.population}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{city.status}</dd>
                </div>
                <div>
                  <dt>Authority</dt>
                  <dd>{city.organization}</dd>
                </div>
              </dl>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function FactionsSection() {
  return (
    <section className={styles.factions} id="factions">
      <div className={styles.shell}>
        <SectionHeading
          chapter="Archive 03 / Power"
          description="Institutions that do not simply rule territory; they define the systems through which reality is experienced."
          title="Factions"
        />
        <div className={styles.factionRegistry}>
          {factions.map((faction, index) => (
            <article
              className={styles.factionRow}
              key={faction.name}
              style={{ "--archive-accent": faction.accent } as CSSProperties}
            >
              <span className={styles.factionIndex}>{String(index + 1).padStart(2, "0")}</span>
              <span className={styles.factionMark} aria-hidden="true">
                {faction.mark}
              </span>
              <div className={styles.factionName}>
                <h3>{faction.name}</h3>
                <span>{faction.domain}</span>
              </div>
              <p>{faction.summary}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function TechnologiesSection() {
  return (
    <section className={styles.technologies} id="technologies">
      <div className={styles.shell}>
        <SectionHeading
          chapter="Archive 04 / Systems"
          description="Technology in IOH is never neutral. Every protocol extends human possibility while creating a new form of control."
          title="Technologies"
        />
        <div className={styles.technologyStage}>
          <div className={styles.technologyCore} aria-hidden="true">
            <span>IOH</span>
            <i />
            <b>CORE</b>
          </div>
          <div className={styles.technologyList}>
            {technologies.map((technology) => (
              <article
                className={styles.technologyRow}
                key={technology.name}
                style={{ "--archive-accent": technology.accent } as CSSProperties}
              >
                <span className={styles.technologyIcon} aria-hidden="true">
                  {technology.code}
                </span>
                <div>
                  <ArchiveKicker>{technology.category}</ArchiveKicker>
                  <h3>{technology.name}</h3>
                </div>
                <p>{technology.summary}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TimelineSection() {
  return (
    <section className={styles.timeline} id="timeline">
      <div className={styles.timelineGhost} aria-hidden="true">
        2303
      </div>
      <div className={styles.shell}>
        <SectionHeading
          chapter="Archive 05 / Time"
          description="A fragmentary chronology of the ideas and thresholds that lead from a question in the present to a civilization in the system."
          title="Timeline"
        />
        <ol className={styles.timelineLine}>
          {timeline.map((entry) => (
            <li key={entry.year}>
              <span className={styles.timelineNode} aria-hidden="true" />
              <time>{entry.year}</time>
              <h3>{entry.title}</h3>
              <p>{entry.event}</p>
            </li>
          ))}
        </ol>
        <div className={styles.archiveOutro}>
          <ArchiveKicker>End of current record</ArchiveKicker>
          <h2>
            The archive is not complete. <em>It is alive.</em>
          </h2>
          <div>
            <Link href="/books">Read the books</Link>
            <Link href="/collections">Enter collections</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function EncyclopediaScene({ user }: { user: IohSceneHeaderUser }) {
  return (
    <div className={styles.page}>
      <IohIndexStyles />
      <style
        dangerouslySetInnerHTML={{
          __html: "body{cursor:auto!important}a,button,[data-hover],[data-magnet]{cursor:pointer!important}"
        }}
      />
      <div className={styles.vignette} aria-hidden="true" />
      <div className={styles.grain} aria-hidden="true" />
      <IohSceneHeader user={user} />
      <ArchiveRail />
      <main className={styles.main} id="main-content">
        <EncyclopediaHero />
        <CharactersSection />
        <CitiesSection />
        <FactionsSection />
        <TechnologiesSection />
        <TimelineSection />
        <BooksIndexFooter context="encyclopedia" />
      </main>
    </div>
  );
}
