"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type CookiePreferences = {
  analytics: boolean;
  marketing: boolean;
};

const COOKIE_NAME = "ioh_cookie_preferences";

function readPreferences(): CookiePreferences {
  if (typeof document === "undefined") {
    return { analytics: false, marketing: false };
  }

  const raw = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${COOKIE_NAME}=`))
    ?.split("=")[1];

  if (!raw) {
    return { analytics: false, marketing: false };
  }

  try {
    return JSON.parse(decodeURIComponent(raw)) as CookiePreferences;
  } catch {
    return { analytics: false, marketing: false };
  }
}

export function CookiePreferencesForm() {
  const [preferences, setPreferences] = useState<CookiePreferences>(() => readPreferences());
  const [saved, setSaved] = useState(false);

  function savePreferences(next: CookiePreferences) {
    const value = encodeURIComponent(JSON.stringify(next));
    document.cookie = `${COOKIE_NAME}=${value}; Path=/; Max-Age=31536000; SameSite=Lax`;
    setPreferences(next);
    setSaved(true);
    window.dispatchEvent(new CustomEvent("ioh:cookie-preferences", { detail: next }));
  }

  return (
    <div className="grid gap-4 rounded-lg border border-border bg-card p-5 shadow-panel">
      <div className="grid gap-3">
        <label className="flex items-start gap-3 rounded-md border border-border bg-ink-soft p-4">
          <input checked disabled className="mt-1 h-4 w-4 accent-gold" type="checkbox" />
          <span>
            <span className="block font-medium text-paper">Zorunlu cerezler</span>
            <span className="mt-1 block text-sm leading-6 text-muted-foreground">
              Sepet, oturum, guvenlik ve tercih kaydi icin gereklidir; kapatilamaz.
            </span>
          </span>
        </label>
        <label className="flex items-start gap-3 rounded-md border border-border bg-ink-soft p-4">
          <input
            checked={preferences.analytics}
            className="mt-1 h-4 w-4 accent-gold"
            onChange={(event) =>
              setPreferences((current) => ({ ...current, analytics: event.target.checked }))
            }
            type="checkbox"
          />
          <span>
            <span className="block font-medium text-paper">Analitik cerezleri</span>
            <span className="mt-1 block text-sm leading-6 text-muted-foreground">
              Site performansini ve icerik etkilesimini olcmek icin kullanilir.
            </span>
          </span>
        </label>
        <label className="flex items-start gap-3 rounded-md border border-border bg-ink-soft p-4">
          <input
            checked={preferences.marketing}
            className="mt-1 h-4 w-4 accent-gold"
            onChange={(event) =>
              setPreferences((current) => ({ ...current, marketing: event.target.checked }))
            }
            type="checkbox"
          />
          <span>
            <span className="block font-medium text-paper">Pazarlama cerezleri</span>
            <span className="mt-1 block text-sm leading-6 text-muted-foreground">
              Kampanya olcumu ve ileride eklenecek reklam/yeniden hedefleme akislari icindir.
            </span>
          </span>
        </label>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => savePreferences(preferences)} type="button">
          Tercihleri kaydet
        </Button>
        <Button
          onClick={() => savePreferences({ analytics: false, marketing: false })}
          type="button"
          variant="outline"
        >
          Sadece zorunlu
        </Button>
        <Button
          onClick={() => savePreferences({ analytics: true, marketing: true })}
          type="button"
          variant="secondary"
        >
          Tumunu kabul et
        </Button>
      </div>

      {saved ? (
        <p className="rounded-md border border-gold/30 bg-gold/10 p-3 text-sm text-gold">
          Cerez tercihleriniz bu tarayici icin kaydedildi.
        </p>
      ) : null}
    </div>
  );
}
