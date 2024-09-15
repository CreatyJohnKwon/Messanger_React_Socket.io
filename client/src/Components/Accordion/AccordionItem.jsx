function AccordionItem({
  handleAddActiveClass,
  id,
  current,
  total,
  handleAddTransition,
  handleItemExpand,
  accordionTitleText,
  children,
  currentExpandItems,
}) {
  return (
    <li
      className={`item_accordion ${handleAddActiveClass(
        id
      )} ${handleAddTransition()}`}
    >
      <div
        className="accordion_title"
        onClick={() => {
          handleItemExpand(id);
        }}
      >
        <button
          type="button"
          className="button_arrow"
          aria-controls="accordion_content"
          aria-pressed={currentExpandItems.includes(id) ? "true" : "false"}
        >
          <span className="offscreen">{`${accordionTitleText} 컨텐츠 보기`}</span>
        </button>
        <div className="accordion_head">
          <span className="accordion_text">{accordionTitleText}</span>
          <div className="accordion_numbers">
            {/* <span className="accordion_current">{current}</span>
            <span className="accordion_seperator"> / </span> */}
            <span className="accordion_total">{total}</span>
          </div>
        </div>
      </div>

      <div
        className="accordion_content"
        id="accordion_content"
        aria-expanded={currentExpandItems.includes(id) ? "true" : "false"}
      >
        {children}
      </div>
    </li>
  );
}

export default AccordionItem;
