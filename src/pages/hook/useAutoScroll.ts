import { useEffect } from "react";

function useScrollToBottom(element: HTMLDivElement | null, data: unknown) {
  const scrollToBottom = () => {
    if (element) {
      console.log({ element });
      element.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  };

  useEffect(() => {
    scrollToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(data)]);
}

export default useScrollToBottom;
