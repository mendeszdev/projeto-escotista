function initAxisBars() {
  const bars = document.querySelectorAll(".axis-bar[data-width]");

  const animate = (bar) => {
    requestAnimationFrame(() => {
      bar.style.width = bar.dataset.width;
    });
  };

  if (!("IntersectionObserver" in window)) {
    bars.forEach(animate);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.25 },
  );

  bars.forEach((bar) => observer.observe(bar));
}

document.addEventListener("DOMContentLoaded", initAxisBars);
