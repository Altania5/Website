import { useEffect } from "react";

const useRevealOnScroll = (selector = "[data-reveal]", options = {}) => {
  useEffect(() => {
    const elements = document.querySelectorAll(selector);
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px", ...options }
    );

    elements.forEach(element => observer.observe(element));

    return () => observer.disconnect();
  }, [selector, options]);
};

export default useRevealOnScroll;

