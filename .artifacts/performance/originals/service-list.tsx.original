"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import home from "@/components/sections/homepage.module.css";
import page from "@/components/sections/page.module.css";
import { previewCopy, previewKind } from "./preview-content";
import { ServicePreview } from "./service-preview";
import styles from "./service-list.module.css";
import type { ServiceScope } from "@/content/service-scope";

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
  const pointer = useRef({ x: -1, y: -1 });
  const pointerFocus = useRef(false);
  const list = useRef<HTMLDivElement>(null);
  const c = previewCopy[locale];
  const clearIntent = () => {
    if (intent.current) clearTimeout(intent.current);
    intent.current = null;
  };
  useEffect(() => {
    const keyboard = () => {
      pointerFocus.current = false;
    };
    document.addEventListener("keydown", keyboard, true);
    return () => document.removeEventListener("keydown", keyboard, true);
  }, []);
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
      else if (entered) setActive(null);
    });
    observer.observe(row);
    const visibility = () => {
      if (document.hidden) setActive(null);
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [active]);
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
              setActive(selected ? null : service.id);
            }}
          >
            {selected ? c.close : c.preview}
            <span aria-hidden="true">{selected ? "−" : "+"}</span>
          </button>
        );
        const handlers = {
          onPointerDown: () => {
            pointerFocus.current = true;
          },
          onPointerEnter: (event: React.PointerEvent) => {
            if (event.pointerType !== "mouse" || !kind) return;
            // Expanding a sibling can move a boundary under a stationary cursor.
            // Only an intentional pointer movement should select another row.
            if (
              pointer.current.x === event.clientX &&
              pointer.current.y === event.clientY
            )
              return;
            clearIntent();
            intent.current = setTimeout(() => {
              intent.current = null;
              setActive(service.id);
            }, 90);
          },
          onPointerMove: (event: React.PointerEvent) => {
            const moved =
              pointer.current.x !== event.clientX ||
              pointer.current.y !== event.clientY;
            pointer.current = { x: event.clientX, y: event.clientY };
            if (
              event.pointerType === "mouse" &&
              moved &&
              kind &&
              !selected &&
              !intent.current
            ) {
              intent.current = setTimeout(() => {
                intent.current = null;
                setActive(service.id);
              }, 90);
            }
          },
          onPointerLeave: (event: React.PointerEvent<HTMLElement>) => {
            if (event.pointerType !== "mouse") return;
            if (
              pointer.current.x === event.clientX &&
              pointer.current.y === event.clientY
            )
              return;
            clearIntent();
            if (
              !(event.relatedTarget instanceof Node) ||
              !list.current?.contains(event.relatedTarget)
            )
              pointer.current = { x: event.clientX, y: event.clientY };
            if (!event.currentTarget.contains(document.activeElement))
              setActive((id) => (id === service.id ? null : id));
          },
          onFocusCapture: () => {
            if (kind && !pointerFocus.current) {
              clearIntent();
              setActive(service.id);
            }
          },
          onPointerUp: (event: React.PointerEvent<HTMLElement>) => {
            if (event.pointerType === "mouse" || !kind) return;
            if ((event.target as HTMLElement).closest("a,button")) return;
            clearIntent();
            setActive(selected ? null : service.id);
          },
          onBlurCapture: (event: React.FocusEvent<HTMLElement>) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              clearIntent();
              setActive((id) => (id === service.id ? null : id));
            }
          },
          onKeyDown: (event: React.KeyboardEvent) => {
            pointerFocus.current = false;
            if (
              event.key === " " &&
              (event.target as HTMLElement).tagName === "A" &&
              kind
            ) {
              event.preventDefault();
              clearIntent();
              setActive(service.id);
            }
            if (event.key === "Escape") {
              clearIntent();
              setActive(null);
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
                setActive(selected ? null : service.id);
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
            className={`${page.serviceDetail} ${styles.detail}`}
            data-service-row={service.id}
            data-active={selected}
            {...handlers}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <h2>{service.title}</h2>
              <p>{service.outcome}</p>
            </div>
            <div className={styles.detailBody}>
              <p>{service.body}</p>
              {service.scope && scopeLabels && (
                <dl className={styles.scope}>
                  {(Object.keys(scopeLabels) as (keyof ServiceScope)[]).map((key) => (
                    <div key={key}><dt>{scopeLabels[key]}</dt><dd>{service.scope?.[key]}</dd></div>
                  ))}
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
