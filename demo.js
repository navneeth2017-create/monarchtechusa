(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const showToast = (toast, text) => {
    if (!toast) return;
    toast.textContent = text;
    toast.hidden = false;
    window.clearTimeout(toast._hideTimer);
    toast._hideTimer = window.setTimeout(() => {
      toast.hidden = true;
    }, 4400);
  };

  const wireLeadActions = (root = document) => {
    $$("[data-lead-action]", root).forEach((button) => {
      const action = button.textContent.trim();
      const name = button.dataset.leadName || "Prospect";
      button.title = "Demo only — no message is sent.";
      button.setAttribute("aria-label", `Demo only: ${action} ${name}`);
      button.addEventListener("click", () => {
        if (button.disabled) return;
        button.textContent = "Queued ✓";
        button.disabled = true;
        button.classList.add("is-queued");
        button.setAttribute("aria-label", `${name} queued — demo only`);
        const host = button.closest(".app-main") || button.closest("[data-finder]") || document;
        showToast(
          $("[data-demo-toast]", host),
          `Demo only — ${name} would be added to the assessment follow-up. No message was sent.`
        );
      });
    });
  };

  wireLeadActions();

  /* Home — tabbed product preview */
  const productDemo = $("[data-product-demo]");
  if (productDemo) {
    const tabs = $$("[data-demo-tab]", productDemo);
    const panels = $$("[data-demo-panel]", productDemo);
    const rails = $$("[data-demo-nav]", productDemo);
    const label = $("[data-demo-label]", productDemo);
    const url = $("[data-demo-url]", productDemo);
    const labels = {
      find: "Inside the system · Lead finder",
      reach: "Inside the system · Sequences",
      close: "Inside the system · Pipeline",
    };
    const urls = {
      find: "app.monarch / lead finder",
      reach: "app.monarch / sequences",
      close: "app.monarch / pipeline",
    };

    const activate = (key, focusTab = false) => {
      tabs.forEach((tab) => {
        const on = tab.dataset.demoTab === key;
        tab.classList.toggle("is-active", on);
        tab.setAttribute("aria-selected", String(on));
        tab.tabIndex = on ? 0 : -1;
        if (on && focusTab) tab.focus();
      });
      panels.forEach((panel) => {
        const on = panel.dataset.demoPanel === key;
        panel.hidden = !on;
        panel.classList.toggle("is-active", on);
      });
      rails.forEach((rail) => rail.classList.toggle("is-active", rail.dataset.demoNav === key));
      if (label) label.textContent = labels[key] || labels.find;
      if (url) url.textContent = urls[key] || urls.find;
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activate(tab.dataset.demoTab));
      tab.addEventListener("keydown", (event) => {
        const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
        if (!keys.includes(event.key)) return;
        event.preventDefault();
        let next = index;
        if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
        if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = tabs.length - 1;
        activate(tabs[next].dataset.demoTab, true);
      });
    });

    const initial = tabs.find((tab) => tab.classList.contains("is-active")) || tabs[0];
    if (initial) activate(initial.dataset.demoTab);
  }

  /* Platform — filterable lead finder */
  const finder = $("[data-finder]");
  if (finder) {
    const radius = $("[data-finder-radius]", finder);
    const radiusOut = $("[data-finder-radius-out]", finder);
    const radiusLabel = $("[data-finder-label]", finder);
    const badge = $("[data-finder-badge]", finder);
    const count = $("[data-finder-count]", finder);
    const countLabel = $("[data-finder-count-label]", finder);
    const legend = $("[data-finder-legend]", finder);
    const chips = $$("[data-finder-filter]", finder);
    const pins = $$("[data-finder-pin]", finder);
    const rows = $$("[data-finder-row]", finder);
    const outerRing = $("[data-finder-ring='outer']", finder);
    const innerRing = $("[data-finder-ring='inner']", finder);
    const empty = $("[data-finder-empty]", finder);
    const baseCounts = { all: 148, hotels: 19, restaurants: 42, gyms: 28, property: 31, other: 28 };
    const labels = { all: "commercial prospects", hotels: "hotels", restaurants: "restaurants", gyms: "gyms", property: "properties" };
    const categories = [
      ["Hotels", "hotels"],
      ["Restaurants", "restaurants"],
      ["Gyms", "gyms"],
      ["Property mgmt", "property"],
      ["Other", "other"],
    ];
    const averages = {
      hotels: "2.2 mi average",
      restaurants: "3.8 mi average",
      gyms: "4.1 mi average",
      property: "5.6 mi average",
    };
    let filter = "all";

    const applyFilter = () => {
      if (!radius) return;
      const distance = Number(radius.value);
      const base = baseCounts[filter] || baseCounts.all;
      const scaled = Math.max(1, Math.round(base * Math.pow(distance / 25, 2)));
      if (count) count.textContent = String(scaled);
      if (countLabel) countLabel.textContent = labels[filter] || labels.all;
      if (radiusOut) radiusOut.textContent = `${distance} mi`;
      if (radiusLabel) radiusLabel.textContent = `${distance} mile radius`;
      if (badge) badge.textContent = `${distance} mi radius`;
      const ringSize = Math.round(42 + (distance - 5) * 2.4);
      if (outerRing) outerRing.setAttribute("r", String(ringSize));
      if (innerRing) innerRing.setAttribute("r", String(Math.round(ringSize * 0.62)));
      if (legend) {
        const scale = Math.pow(distance / 25, 2);
        const items = filter === "all" ? categories : categories.filter(([, key]) => key === filter);
        const parts = items.map(
          ([label, key]) => `<span>${label} ${Math.round(baseCounts[key] * scale)}</span>`
        );
        if (filter !== "all" && averages[filter]) parts.push(`<span>${averages[filter]}</span>`);
        legend.innerHTML = parts.join("");
      }

      let visible = 0;
      rows.forEach((row) => {
        const show =
          (filter === "all" || row.dataset.category === filter) &&
          Number(row.dataset.distance || 0) <= distance;
        row.hidden = !show;
        if (show) visible += 1;
      });
      pins.forEach((pin) => {
        const show =
          (filter === "all" || pin.dataset.category === filter) &&
          Number(pin.dataset.distance || 0) <= distance;
        pin.hidden = !show;
      });
      if (empty) empty.hidden = visible > 0;
    };

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        filter = chip.dataset.finderFilter || "all";
        chips.forEach((item) => {
          const on = item === chip;
          item.classList.toggle("is-active", on);
          item.setAttribute("aria-pressed", String(on));
        });
        applyFilter();
      });
    });
    if (radius) radius.addEventListener("input", applyFilter);
    applyFilter();
  }

  /* Custom — module build */
  const config = $("[data-config-demo]");
  if (config) {
    const toggles = $$("[data-config-toggle]", config);
    const lines = $$("[data-config-line]", config);
    const count = $("[data-config-count]", config);
    const summary = $("[data-config-summary]", config);
    const reset = $("[data-config-reset]", config);
    const labels = { voice: "Voice", routing: "Routing", reporting: "Reporting", integrations: "Integrations" };
    const defaults = { voice: true, routing: true, reporting: true, integrations: false };

    const updateConfig = () => {
      const active = toggles
        .filter((toggle) => toggle.getAttribute("aria-pressed") === "true")
        .map((toggle) => toggle.dataset.configToggle);
      toggles.forEach((toggle) => {
        toggle.classList.toggle("is-on", toggle.getAttribute("aria-pressed") === "true");
      });
      lines.forEach((line) => {
        line.hidden = !active.includes(line.dataset.configLine);
      });
      if (count) count.textContent = `${active.length} of 4 add-ons on`;
      if (summary) {
        summary.textContent = active.length
          ? `Core + ${active.map((key) => labels[key]).join(" + ")}`
          : "Core system only";
      }
    };

    toggles.forEach((toggle) => {
      toggle.addEventListener("click", () => {
        const on = toggle.getAttribute("aria-pressed") === "true";
        toggle.setAttribute("aria-pressed", String(!on));
        updateConfig();
      });
    });
    if (reset) {
      reset.addEventListener("click", () => {
        toggles.forEach((toggle) => {
          toggle.setAttribute("aria-pressed", String(Boolean(defaults[toggle.dataset.configToggle])));
        });
        updateConfig();
      });
    }
    updateConfig();
  }

  /* Process — phase tabs */
  const processDemo = $("[data-process-demo]");
  if (processDemo) {
    const tabs = $$("[data-phase-tab]", processDemo);
    const panels = $$("[data-phase-panel]", processDemo);

    const activate = (key, focusTab = false, updateHash = true) => {
      tabs.forEach((tab) => {
        const on = tab.dataset.phaseTab === key;
        tab.classList.toggle("is-active", on);
        tab.setAttribute("aria-selected", String(on));
        tab.tabIndex = on ? 0 : -1;
        if (on && focusTab) tab.focus();
      });
      panels.forEach((panel) => {
        const on = panel.dataset.phasePanel === key;
        panel.hidden = !on;
        panel.classList.toggle("is-active", on);
      });
      if (updateHash && window.history && window.history.replaceState) {
        window.history.replaceState(null, "", `#${key}`);
      }
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activate(tab.dataset.phaseTab));
      tab.addEventListener("keydown", (event) => {
        const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
        if (!keys.includes(event.key)) return;
        event.preventDefault();
        let next = index;
        if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
        if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = tabs.length - 1;
        activate(tabs[next].dataset.phaseTab, true);
      });
    });

    window.addEventListener("hashchange", () => {
      const key = window.location.hash.replace("#", "");
      if (tabs.some((tab) => tab.dataset.phaseTab === key)) activate(key, false, false);
    });

    const hash = window.location.hash.replace("#", "");
    const initial = tabs.find((tab) => tab.dataset.phaseTab === hash) || tabs.find((tab) => tab.classList.contains("is-active")) || tabs[0];
    if (initial) activate(initial.dataset.phaseTab, false, false);
  }

  /* Contact — build a mailto draft */
  const noteForm = $("[data-note-form]");
  if (noteForm) {
    const chips = $$("[data-note-chip]", noteForm);
    const status = $("[data-note-status]", noteForm);

    const selectedTopics = () =>
      chips
        .filter((chip) => chip.getAttribute("aria-pressed") === "true")
        .map((chip) => chip.dataset.noteChip);

    const updateStatus = () => {
      const topics = selectedTopics();
      if (!status) return;
      if (topics.length) {
        status.textContent = `Draft topics: ${topics.join(" · ")}`;
        status.classList.add("is-ready");
      } else {
        status.textContent = "Pick a topic or write your own line.";
        status.classList.remove("is-ready");
      }
    };

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const on = chip.getAttribute("aria-pressed") === "true";
        chip.setAttribute("aria-pressed", String(!on));
        chip.classList.toggle("is-active", !on);
        updateStatus();
      });
    });
    updateStatus();

    noteForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const business = $("[data-note-business]", noteForm)?.value.trim() || "Not provided";
      const area = $("[data-note-area]", noteForm)?.value.trim() || "Not provided";
      const oneLine = $("[data-note-text]", noteForm)?.value.trim() || "Not provided";
      const topics = selectedTopics();
      const body = [
        "Hi Monarch,",
        "",
        `What we do: ${business}`,
        `Service area: ${area}`,
        `What keeps slipping: ${topics.length ? topics.join(", ") : "Not provided"}`,
        "",
        oneLine,
        "",
        "Thanks,",
      ].join("\n");
      if (status) {
        status.textContent = "Opening your email app…";
        status.classList.add("is-ready");
      }
      window.location.href = `mailto:team@monarchtechusa.com?subject=${encodeURIComponent("Working session with Monarch")}&body=${encodeURIComponent(body)}`;
    });
  }
})();
