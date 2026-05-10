function TrustBlocks({ deliveryTitle, deliveryText, returnTitle, returnText, warrantyTitle, warrantyText }) {
  const Item = ({ icon, title, text }) => (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-sky-100 bg-gradient-to-b from-sky-50/90 to-white px-4 py-5 text-center shadow-sm sm:items-start sm:text-left">
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-xl shadow-sm ring-1 ring-sky-100"
        aria-hidden
      >
        {icon}
      </span>
      <div>
        <p className="text-sm font-bold text-gray-900">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-gray-600">{text}</p>
      </div>
    </div>
  )

  return (
    <div className="mt-8 grid gap-3 sm:grid-cols-3">
      <Item icon="🚚" title={deliveryTitle} text={deliveryText} />
      <Item icon="↩️" title={returnTitle} text={returnText} />
      <Item icon="🛡️" title={warrantyTitle} text={warrantyText} />
    </div>
  )
}

export default TrustBlocks
