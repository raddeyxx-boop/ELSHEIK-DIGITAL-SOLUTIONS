"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowUpRight } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import home from "@/components/sections/homepage.module.css";
import page from "@/components/sections/page.module.css";
import { previewCopy, previewKind } from "./preview-content";
import styles from "./service-list.module.css";
import type { ServiceScope } from "@/content/service-scope";

const loadPreview = () => import("./service-preview");
const ServicePreview = dynamic(() => loadPreview().then(module => module.ServicePreview), {
  // Keep suspension inside the optional panel instead of hiding the whole route.
  loading: () => null,
});

type Service = {
  id: string;
  title: string;
  body: string;
  outcome: string;
  tech: string;
  scope?: ServiceScope;
};
export function ServiceList({
  services,
  locale,
  variant = "compact",
  contactLabel = "",
  scopeLabels,
}: {
  services: Service[];
  locale: Locale;
  variant?: "compact" | "detail";
  contactLabel?: string;
  scopeLabels?: Record<keyof ServiceScope, string>;
}) {
  const [active, setActive] = useState<string | null>(null);
  const intent = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRef = useRef<string | null>(null);
  const pending = useRef<string | null>(null);
  const pointerFocus = useRef(false);
  const list = useRef<HTMLDivElement>(null);
  const c = previewCopy[locale];
  const clearIntent = useCallback(() => {
    if (intent.current) clearTimeout(intent.current);
    intent.current = null;
    pending.current = null;
  }, []);
  const select = useCallback((id: string | null) => {
    activeRef.current = id;
    setActive(id);
  }, []);
  const close = useCallback(() => {
    clearIntent();
    select(null);
  }, [clearIntent, select]);
  const toggle = (id: string) => {
    clearIntent();
    select(activeRef.current === id ? null : id);
  };
  const leave = (id: string, row: HTMLElement) => {
    if (pending.current === id) clearIntent();
    if (
      activeRef.current !== id ||
      (!pointerFocus.current && row.contains(document.activeElement))
    )
      return;
    clearIntent();
    pending.current = id;
    intent.current = setTimeout(() => {
      clearIntent();
      select(null);
    }, 180);
  };
  useEffect(() => {
    const keyboard = (event: KeyboardEvent) => {
      pointerFocus.current = false;
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", keyboard, true);
    return () => {
      document.removeEventListener("keydown", keyboard, true);
    };
  }, [close]);
  useEffect(
    () => () => {
      if (intent.current) clearTimeout(intent.current);
    },
    [],
  );
  useEffect(() => {
    if (!active) return;
    const row = Array.from(
      list.current?.querySelectorAll<HTMLElement>("[data-service-row]") ?? [],
    ).find((el) => el.dataset.serviceRow === active);
    if (!row) return;
    let entered = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) entered = true;
      else if (entered) close();
    });
    observer.observe(row);
    const visibility = () => {
      if (document.hidden) close();
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [active, close]);
  return (
    <div
      ref={list}
      className={variant === "compact" ? home.serviceList : undefined}
      data-service-list={variant}
    >
      {services.map((service, index) => {
        const kind = previewKind(service.id);
        const selected = active === service.id && !!kind;
        const previewId = `service-preview-${variant}-${service.id}`;
        const preview = (
          <div
            id={previewId}
            className={styles.previewSlot}
            data-preview-slot="true"
            role="region"
            aria-label={`${service.title}: ${c.preview}`}
            aria-hidden={!selected}
            inert={!selected}
          >
            <AnimatePresence>
              {selected && kind && (
                <ServicePreview key={service.id} kind={kind} locale={locale} />
              )}
            </AnimatePresence>
          </div>
        );
        const button = kind && (
          <button
            type="button"
            className={styles.previewButton}
            aria-expanded={selected}
            aria-controls={previewId}
            aria-label={`${selected ? c.close : c.preview}: ${service.title}`}
            onClick={() => {
              clearIntent();
              toggle(service.id);
            }}
          >
            {selected ? c.close : c.preview}
            <span aria-hidden="true">{selected ? "−" : "+"}</span>
          </button>
        );
        const handlers = {
          onPointerDown: () => {
            pointerFocus.current = true;
            if (kind) void loadPreview().catch(() => {});
          },
          onPointerEnter: (event: React.PointerEvent) => {
            if (event.pointerType !== "mouse" || !kind) return;
            // Fetch the optional scene during the dwell, without changing its timing.
            void loadPreview().catch(() => {});
            clearIntent();
            if (activeRef.current === service.id) return;
            // A new trigger starts a fresh dwell; never transfer elapsed time.
            if (activeRef.current) select(null);
            pending.current = service.id;
            intent.current = setTimeout(() => {
              clearIntent();
              select(service.id);
            }, 1500);
          },
          onPointerLeave: (event: React.PointerEvent<HTMLElement>) => {
            if (event.pointerType !== "mouse") return;
            if (
              event.relatedTarget instanceof Node &&
              event.currentTarget.contains(event.relatedTarget)
            )
              return;
            leave(service.id, event.currentTarget);
          },
          onFocusCapture: () => {
            if (kind && !pointerFocus.current) {
              clearIntent();
              select(service.id);
            }
          },
          onPointerUp: (event: React.PointerEvent<HTMLElement>) => {
            if (event.pointerType === "mouse" || !kind) return;
            if (
              (event.target as HTMLElement).closest(
                "a,button,input,select,textarea,[data-preview-slot]",
              )
            )
              return;
            clearIntent();
            toggle(service.id);
          },
          onBlurCapture: (event: React.FocusEvent<HTMLElement>) => {
            // Tapping a non-focusable scene can blur its toggle button. Touch
            // dismissal belongs to the toggle; mouse dismissal to pointer leave.
            if (
              !pointerFocus.current &&
              !event.currentTarget.contains(event.relatedTarget)
            ) {
              clearIntent();
              leave(service.id, event.currentTarget);
            }
          },
          onKeyDown: (event: React.KeyboardEvent) => {
            pointerFocus.current = false;
            if (
              (event.key === " " ||
                (event.key === "Enter" &&
                  event.target === event.currentTarget)) &&
              ((event.target as HTMLElement).tagName === "A" ||
                event.target === event.currentTarget) &&
              !(event.target as HTMLElement).closest("[data-preview-slot]") &&
              kind
            ) {
              event.preventDefault();
              toggle(service.id);
            }
            if (event.key === "Escape") {
              close();
            }
          },
        };
        return variant === "compact" ? (
          <div
            key={service.id}
            className={styles.compact}
            data-service-row={service.id}
            data-active={selected}
            {...handlers}
          >
            <Link
              href={`/${locale}/services#${service.id}`}
              className={`${home.serviceRow} ${styles.rowLink}`}
              aria-expanded={kind ? selected : undefined}
              aria-controls={kind ? previewId : undefined}
              onClick={(event) => {
                // Keyboard activation retains the link's native navigation.
                if (event.detail === 0) return;
                if (
                  !kind ||
                  !window.matchMedia("(hover: none), (max-width: 900px)")
                    .matches
                )
                  return;
                if ((event.target as Element).closest("svg")) return;
                event.preventDefault();
                clearIntent();
                toggle(service.id);
              }}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{service.title}</h3>
              <p>{service.outcome || service.body}</p>
              <small>{service.tech}</small>
              <ArrowUpRight />
            </Link>
            {button}
            {preview}
          </div>
        ) : (
          <section
            key={service.id}
            id={service.id}
            role="group"
            aria-label={service.title}
            className={`${page.serviceDetail} ${styles.detail}`}
            data-service-row={service.id}
            data-active={selected}
            {...handlers}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <h2>
                {kind ? (
                  <button
                    type="button"
                    className={styles.titleTrigger}
                    aria-expanded={selected}
                    aria-controls={previewId}
                    onClick={(event) => {
                      if (
                        event.detail === 0 ||
                        window.matchMedia("(hover: none)").matches
                      )
                        toggle(service.id);
                    }}
                  >
                    {service.title}
                  </button>
                ) : (
                  service.title
                )}
              </h2>
              <p>{service.outcome}</p>
            </div>
            <div className={styles.detailBody}>
              <p>{service.body}</p>
              {service.scope && scopeLabels && (
                <dl className={styles.scope}>
                  {(Object.keys(scopeLabels) as (keyof ServiceScope)[]).map(
                    (key) => (
                      <div key={key}>
                        <dt>{scopeLabels[key]}</dt>
                        <dd>{service.scope?.[key]}</dd>
                      </div>
                    ),
                  )}
                </dl>
              )}
              {service.tech && (
                <ul>
                  {service.tech.split(" · ").map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              <Link className="button button-ghost" href={`/${locale}/contact`}>
                {contactLabel}
              </Link>
              {button}
            </div>
            {preview}
          </section>
        );
      })}
    </div>
  );
}
