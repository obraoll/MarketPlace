import { useState } from 'react'

function AccordionItem({ title, children, defaultOpen }) {
  const [open, setOpen] = useState(!!defaultOpen)
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-bold text-gray-900 sm:py-5"
      >
        <span>{title}</span>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-500 transition ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      {open ? (
        <div className="pb-5 text-sm leading-relaxed text-gray-600 whitespace-pre-wrap">{children}</div>
      ) : null}
    </div>
  )
}

function ProductAccordions({ specifications, description, specsTitle, warrantyTitle, warrantyBody, faqTitle, faqBody }) {
  const specContent = specifications && String(specifications).trim() ? String(specifications).trim() : ''
  return (
    <div className="mt-10 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
      <div className="px-5 sm:px-8">
        <AccordionItem title={specsTitle} defaultOpen>
          {specContent || description || '—'}
        </AccordionItem>
        <AccordionItem title={warrantyTitle}>{warrantyBody}</AccordionItem>
        <AccordionItem title={faqTitle}>{faqBody}</AccordionItem>
      </div>
    </div>
  )
}

export default ProductAccordions
