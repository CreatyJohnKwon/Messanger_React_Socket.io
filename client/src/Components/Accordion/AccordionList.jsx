import { useState, useEffect } from "react";
import useInitialExpandItemIndex from "./useInitialExpandItemIndex";

function AccordionList({ multipleOpen, render, accordionDepth, isNested }) {
  const expandPropsTrueArray = useInitialExpandItemIndex(render);
  const [currentExpandItems, setCurrentExpandItems] =
    useState(expandPropsTrueArray);
  const [transitionStyle, setTransitionStyle] = useState(false);

  useEffect(() => {
    setCurrentExpandItems(expandPropsTrueArray);
  }, [expandPropsTrueArray]);

  const handleAddTransition = () => {
    return transitionStyle ? "acd-transition" : "";
  };

  const handleItemExpand = (itemIndex) => {
    const isItemOpenedPropsExpand = currentExpandItems.indexOf(itemIndex);

    const toggleAccordion = (itemIndex, indexIsMatchWithPropsExpand) => {
      let expandedItemList = [...currentExpandItems];

      if (multipleOpen) {
        if (indexIsMatchWithPropsExpand !== -1) {
          expandedItemList.splice(indexIsMatchWithPropsExpand, 1);
        } else {
          expandedItemList.push(itemIndex);
        }
      } else {
        expandedItemList =
          indexIsMatchWithPropsExpand !== -1 ? [] : [itemIndex];
      }

      setCurrentExpandItems(expandedItemList);
    };

    const updateAccordionState = () => {
      if (!transitionStyle) {
        setTransitionStyle(true);
      }
    };

    toggleAccordion(itemIndex, isItemOpenedPropsExpand);
    updateAccordionState();
  };

  const handleAddActiveClass = (itemIndex) => {
    return currentExpandItems.includes(itemIndex) ? "actived" : "";
  };

  const checkAccordionDepth = (level = 0) => {
    if (typeof level !== "number") return " ";
    switch (level) {
      case 0:
        return " ";
      case 1:
        return "accordion_depth01";
      case 2:
        return "accordion_depth02";
      default:
        return " ";
    }
  };

  return (
    <ul
      className={`list_accordion ${checkAccordionDepth(accordionDepth)}  ${
        isNested ? "list_nested" : ""
      } `}
    >
      {render({
        handleItemExpand,
        handleAddActiveClass,
        handleAddTransition,
        currentExpandItems,
      })}
    </ul>
  );
}

export default AccordionList;
