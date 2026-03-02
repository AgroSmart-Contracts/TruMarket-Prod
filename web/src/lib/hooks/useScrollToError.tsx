import { useEffect } from "react";

export const useScrollToError = (errors: any, containerRef: React.RefObject<HTMLElement>, dateNow: number) => {
  useEffect(() => {
    const errorValues: any[] = Object.values(errors);
    if (errorValues.length > 0 && containerRef.current) {
      const errorElementRef = errorValues[0]?.ref;
      const containerRect = containerRef.current.getBoundingClientRect();
      const errorRect = errorElementRef.getBoundingClientRect();

      const scrollToErrorWithinContainer = () => {
        const containerScrollTop = containerRef?.current?.scrollTop;
        const errorTopRelativeToContainer = errorRect.top - containerRect.top + containerScrollTop!;
        const scrollMargin = 20; // Optional - adjust as needed

        containerRef.current?.scrollTo({
          top: errorTopRelativeToContainer - scrollMargin,
          behavior: "smooth",
        });
      };

      if (errorElementRef) {
        // Check if the error element is within the container before scrolling
        const isElementWithinContainer = containerRef.current.contains(errorElementRef);

        if (isElementWithinContainer) {
          scrollToErrorWithinContainer();
        }
      }
    }
  }, [errors, containerRef, dateNow]);
};
