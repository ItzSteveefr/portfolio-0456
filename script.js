// script.js — Main orchestration of preloader to gradient hero transition

console.log("Main script loaded ✅");

gsap.registerPlugin(SplitText);

// Import gradient module
let gradientModule;

// Preload assets function
function preloadAssets() {
  const assets = ["logo_01.png", "mask.svg"];
  const promises = assets.map(src => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = reject;
      img.src = src;
    });
  });

  return Promise.all(promises);
}

// Warm-up gradient in background
function warmupGradient() {
  import("./gradient-script.js").then(mod => {
    gradientModule = mod;
    mod.initGradient();
    console.log("🌈 Gradient warmed up in background");
  }).catch(err => {
    console.error("Failed to load gradient module:", err);
  });
}

// Main animation sequence
document.fonts.ready.then(() => {
  preloadAssets().then(() => {
    console.log("✅ All assets preloaded");

    // Create split text instances
    function createSplitTexts(elements) {
      const splits = {};
      elements.forEach(({ key, selector, type }) => {
        const element = document.querySelector(selector);
        if (element) {
          const config = { type, mask: type };
          if (type === "chars") config.charsClass = "char";
          if (type === "lines") config.linesClass = "line";
          splits[key] = SplitText.create(selector, config);
        }
      });
      return splits;
    }

    const splitElements = [
      { key: "logoChars", selector: ".preloader-logo h1", type: "chars" },
      { key: "footerLines", selector: ".preloader-footer p", type: "lines" },
      { key: "heroFooter", selector: ".hero-footer p", type: "lines" }
    ];

    const splits = createSplitTexts(splitElements);

    // Initial GSAP state setup
    gsap.set([splits.logoChars?.chars].filter(Boolean), { x: "100%" });
    gsap.set([
      splits.footerLines?.lines,
      splits.heroFooter?.lines
    ].filter(Boolean).flat(), { y: "100%" });

    // Progress bar animation
    function animateProgress(duration = 3) {
      const tl = gsap.timeline();
      const counterSteps = 5;
      let currentProgress = 0;

      for (let i = 0; i < counterSteps; i++) {
        const finalStep = i === counterSteps - 1;
        const targetProgress = finalStep
          ? 1
          : Math.min(currentProgress + Math.random() * 0.3 + 0.1, 0.9);
        currentProgress = targetProgress;

        tl.to(".preloader-progress-bar", {
          scaleX: targetProgress,
          duration: duration / counterSteps,
          ease: "power2.out"
        });
      }

      return tl;
    }

    // Main animation timeline
    const tl = gsap.timeline({ delay: 0.5 });

    tl
      // Preloader entrance
      .to(splits.logoChars?.chars || [], {
        x: "0%",
        stagger: 0.05,
        duration: 1,
        ease: "power4.inOut"
      })
      .to(splits.footerLines?.lines || [], {
        y: "0%",
        stagger: 0.1,
        duration: 1,
        ease: "power4.inOut"
      }, "0.25")
      .add(animateProgress(), "<")
      .set(".preloader-progress", { backgroundColor: "var(--base-300)" })

      // Start gradient warmup during preloader
      .call(() => {
        setTimeout(warmupGradient, 1000);
      })

      // Preloader exit
      .to(splits.logoChars?.chars || [], {
        x: "-100%",
        stagger: 0.05,
        duration: 1,
        ease: "power4.inOut"
      }, "-=0.5")
      .to(splits.footerLines?.lines || [], {
        y: "-100%",
        stagger: 0.1,
        duration: 1,
        ease: "power4.inOut"
      }, "<")
      .to(".preloader-progress", {
        opacity: 0,
        duration: 0.5,
        ease: "power3.out"
      }, "-=0.25")

      // Mask expansion and hero reveal
      .to(".preloader-mask", {
        scale: 5,
        duration: 2.5,
        ease: "power3.out"
      }, "<")
      .to(splits.heroFooter?.lines || [], {
        y: "0%",
        stagger: 0.1,
        duration: 1,
        ease: "power4.out"
      }, "-=0.8")

      // Start gradient rendering
      .call(() => {
        if (gradientModule) {
          gradientModule.startGradient();
        }
      })

      // Clean up preloader elements
      .to([".preloader-progress", ".preloader-mask", ".preloader-content"], {
        display: "none",
        duration: 0
      }, "+=1");

  }).catch(err => {
    console.error("Asset preloading failed:", err);
    // Fallback: start without preloaded assets
    setTimeout(warmupGradient, 500);
  });
}).catch(err => {
  console.error("Font loading failed:", err);
});

// Handle window resize
window.addEventListener('resize', () => {
  // Debounce resize events
  clearTimeout(window.resizeTimeout);
  window.resizeTimeout = setTimeout(() => {
    if (gradientModule) {
      // Gradient module handles its own resize
    }
  }, 100);
});

// Handle visibility change
document.addEventListener('visibilitychange', () => {
  if (document.hidden && gradientModule) {
    gradientModule.stopGradient();
  } else if (!document.hidden && gradientModule) {
    gradientModule.startGradient();
  }
});
