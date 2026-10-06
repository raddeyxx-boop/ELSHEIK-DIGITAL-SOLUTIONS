import { notFound } from "next/navigation";import { PageHero } from "@/components/sections/page-hero";import { ContactForm } from "@/components/forms/contact-form";import styles from "@/components/sections/page.module.css";import { getDictionary } from "@/content/dictionaries";import { isLocale } from "@/lib/i18n/config";import { contactContext } from "@/content/contact-context";import context from "./contact-context.module.css";
export default async function ContactPage({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();const d=getDictionary(locale),c=contactContext[locale];return <><PageHero preset="contact" eyebrow={d.contact.eyebrow} title={d.contact.title} lead={d.contact.lead}/><section className={styles.content}><div className="shell">
  <aside className={context.context} aria-label={c.label}>
    <p className={context.label}>{c.label}</p>
    <div className={context.columns}>
      <div><h2>{c.topicsTitle}</h2><ul>{c.topics.map((item,i)=><li key={item}><span aria-hidden="true">{String(i+1).padStart(2,"0")}</span>{item}</li>)}</ul></div>
      <div><h2>{c.prepareTitle}</h2><ul>{c.prepare.map((item,i)=><li key={item}><span aria-hidden="true">{String(i+1).padStart(2,"0")}</span>{item}</li>)}</ul></div>
      <div><h2>{c.nextTitle}</h2><ol>{c.next.map((item,i)=><li key={item}><span aria-hidden="true">{String(i+1).padStart(2,"0")}</span>{item}</li>)}</ol></div>
    </div>
  </aside>
  <ContactForm dictionary={{contact:d.contact}}/></div></section></>}
