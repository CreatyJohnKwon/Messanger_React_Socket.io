import AccordionList from "./AccordionList";
import AccordionItem from "./AccordionItem";
import "./Accordion.style.scss";

function Accordion() {
  // 일반 아코디언
  const renderAccordionItems = ({
    handleItemExpand,
    handleAddActiveClass,
    handleAddTransition,
    currentExpandItems,
    depthInfo,
  }) => {
    return (
      <>
        <AccordionItem
          expanded={true}
          id="1"
          accordionTitleText="Title 1"
          handleItemExpand={handleItemExpand}
          handleAddActiveClass={handleAddActiveClass}
          handleAddTransition={handleAddTransition}
          currentExpandItems={currentExpandItems}
          depthInfo={depthInfo}
        >
          Content 1
        </AccordionItem>
        <AccordionItem
          id="2"
          accordionTitleText="Title 2"
          handleItemExpand={handleItemExpand}
          handleAddActiveClass={handleAddActiveClass}
          handleAddTransition={handleAddTransition}
          currentExpandItems={currentExpandItems}
        >
          Content 2
        </AccordionItem>
        <AccordionItem
          id="3"
          accordionTitleText="Title 3"
          handleItemExpand={handleItemExpand}
          handleAddActiveClass={handleAddActiveClass}
          handleAddTransition={handleAddTransition}
          currentExpandItems={currentExpandItems}
        >
          Content 3
        </AccordionItem>
        <AccordionItem
          id="4"
          accordionTitleText="Title 4"
          handleItemExpand={handleItemExpand}
          handleAddActiveClass={handleAddActiveClass}
          handleAddTransition={handleAddTransition}
          currentExpandItems={currentExpandItems}
        >
          Content 4
        </AccordionItem>
      </>
    );
  };

  // 중첩 아코디언
  const renderNestedAccordion = ({
    handleItemExpand,
    handleAddActiveClass,
    handleAddTransition,
    currentExpandItems,
  }) => {
    return (
      <>
        <AccordionItem
          id="1"
          accordionTitleText="Title 1"
          handleItemExpand={handleItemExpand}
          handleAddActiveClass={handleAddActiveClass}
          handleAddTransition={handleAddTransition}
          currentExpandItems={currentExpandItems}
        >
          <AccordionList muitipleOpen={true} render={renderAccordionItems} />
        </AccordionItem>
        <AccordionItem
          id="2"
          accordionTitleText="Title 2"
          handleItemExpand={handleItemExpand}
          handleAddActiveClass={handleAddActiveClass}
          handleAddTransition={handleAddTransition}
          currentExpandItems={currentExpandItems}
        >
          Content 5
        </AccordionItem>
      </>
    );
  };

  return (
    <div className="accordion">
      <AccordionList muitipleOpen={false} render={renderAccordionItems} />
      <AccordionList muitipleOpen={true} render={renderAccordionItems} />
      <AccordionList muitipleOpen={false} render={renderNestedAccordion} />
    </div>
  );
}

export default Accordion;
