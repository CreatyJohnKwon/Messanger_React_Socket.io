import AccordionList from "./AccordionList";
import AccordionItem from "./AccordionItem";

const AccordionNested = ({
  nestedAccordionData,
  innerComponent: InnerComponent,
  noDataMessage,
}) => {
  const renderNestedAccordion = ({
    handleItemExpand,
    handleAddActiveClass,
    handleAddTransition,
    currentExpandItems,
  }) => {
    return (
      <>
        {nestedAccordionData.map((item) => (
          <AccordionItem
            id={item.index}
            current={item.currentTotalOnlinedCount}
            total={item.groupTotalMember}
            accordionTitleText={item.categoryName}
            handleItemExpand={handleItemExpand}
            handleAddActiveClass={handleAddActiveClass}
            handleAddTransition={handleAddTransition}
            currentExpandItems={currentExpandItems}
          >
            {Array.isArray(item.subCategoryContent) ? (
              <AccordionList
                multipleOpen={true}
                isNested={true}
                render={({
                  handleItemExpand,
                  handleAddActiveClass,
                  handleAddTransition,
                  currentExpandItems,
                  depthInfo,
                }) => (
                  <>
                    {item.subCategoryContent.map((nestedItem) => (
                      <AccordionItem
                        id={nestedItem.index}
                        current={nestedItem.currentOnlinedCount}
                        total={nestedItem.teamTotalMember}
                        accordionTitleText={nestedItem.teamName}
                        handleItemExpand={handleItemExpand}
                        handleAddActiveClass={handleAddActiveClass}
                        handleAddTransition={handleAddTransition}
                        currentExpandItems={currentExpandItems}
                        depthInfo={depthInfo}
                      >
                        {nestedItem.membersToGroup.map((employee) => {
                          return (
                            <InnerComponent
                              key={employee.id}
                              componentData={employee.employeeData}
                            />
                          );
                        })}
                      </AccordionItem>
                     )
                    )}
                  </>
                )}
              />
            ) : (
              <p>{noDataMessage}</p>
            )}
          </AccordionItem>
        ))}
      </>
    );
  };

  return (
    <>
      <div className="accordion">
        <AccordionList multipleOpen={false} render={renderNestedAccordion} />
      </div>
    </>
  );
}

export default AccordionNested;
