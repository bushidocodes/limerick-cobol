// Auto-injects the sticky site header across every page that loads this script.
// Computes its own base URL from the script tag's src so it works regardless of
// page depth (root, course/, examples/Subdir/, exercises/Sub/Subsub/, etc.) and
// regardless of deployment prefix (e.g. /limerick-cobol/ on GitHub Pages).
//
// Loads theme-toggle.js and site-search.js on demand if they haven't already
// been included by the host page, so callers only need a single <script> tag.
import { siteBaseUrl } from "./util/base.js";
import { onReady } from "./util/dom.js";

(function () {
	const baseUrl = siteBaseUrl(import.meta.url);

	const componentsBase = baseUrl + "components/";
	const homeUrl = baseUrl + "index.html";
	const faviconUrl = baseUrl + "favicon.svg";

	// Primary nav verticals exposed in the header — mirrors MDN's top tabs.
	// `dir` is the first URL segment used to detect the active section.
	// `entry` is the section's index page. Keep in sync with
	// TOP_LEVEL_SECTIONS in breadcrumbs.js.
	const NAV_SECTIONS = [
		{ label: "Course", dir: "course", entry: "course/index.html" },
		{ label: "Exercises", dir: "exercises", entry: "exercises/index.html" },
		{ label: "Examples", dir: "examples", entry: "examples/index.html" },
		{ label: "Lectures", dir: "lectures", entry: "lectures/index.html" },
	];

	const MOBILE_NAV_ID = "site-nav-mobile";

	function ensureScript(filename, { module = false } = {}) {
		if (document.querySelector(`script[src*="components/${filename}"]`)) return;
		const s = document.createElement("script");
		s.src = componentsBase + filename;
		if (module) s.type = "module";
		else s.defer = true;
		document.head.appendChild(s);
	}

	// theme-toggle is no longer in the site-header — it lives in the
	// secondary breadcrumb bar (mounted by breadcrumbs.js). Still loaded
	// here so it's available across every page that ships site-header.js.
	// breadcrumbs.js and course-sidebar.js are ES modules and must be injected
	// with type="module"; theme-toggle.js and site-search.js are classic scripts.
	ensureScript("theme-toggle.js");
	ensureScript("site-search.js");
	ensureScript("breadcrumbs.js", { module: true });
	ensureScript("course-sidebar.js", { module: true });

	function buildNavUl() {
		const navPath = location.pathname;
		const ul = document.createElement("ul");
		NAV_SECTIONS.forEach((s) => {
			const isActive = new RegExp("/" + s.dir + "/").test(navPath);
			const li = document.createElement("li");
			const a = document.createElement("a");
			a.href = baseUrl + s.entry;
			if (isActive) {
				a.setAttribute("data-active", "");
				a.setAttribute("aria-current", "page");
			}
			a.textContent = s.label;
			li.appendChild(a);
			ul.appendChild(li);
		});
		return ul;
	}

	function inject() {
		if (document.querySelector(".site-header")) return;
		const header = document.createElement("header");
		header.className = "site-header";

		const logo = document.createElement("a");
		logo.className = "site-header__logo";
		logo.href = homeUrl;
		const logoImg = document.createElement("img");
		logoImg.src = faviconUrl;
		logoImg.alt = "COBOL Tutorial";
		logoImg.width = 32;
		logoImg.height = 28;
		logo.appendChild(logoImg);
		header.appendChild(logo);

		const nav = document.createElement("nav");
		nav.className = "site-nav";
		nav.setAttribute("aria-label", "Primary");
		nav.appendChild(buildNavUl());
		header.appendChild(nav);

		header.appendChild(document.createElement("site-search"));

		const btn = document.createElement("button");
		btn.className = "site-header__hamburger";
		btn.type = "button";
		btn.setAttribute("aria-expanded", "false");
		btn.setAttribute("aria-controls", MOBILE_NAV_ID);
		btn.setAttribute("aria-label", "Open navigation");
		const hamburgerSpan = document.createElement("span");
		hamburgerSpan.setAttribute("aria-hidden", "true");
		hamburgerSpan.textContent = "☰";
		btn.appendChild(hamburgerSpan);
		header.appendChild(btn);

		const mobileNav = document.createElement("nav");
		mobileNav.id = MOBILE_NAV_ID;
		mobileNav.className = "site-nav-mobile";
		mobileNav.setAttribute("aria-label", "Primary");
		mobileNav.hidden = true;
		mobileNav.appendChild(buildNavUl());
		header.appendChild(mobileNav);

		const skipLink = document.body.querySelector("a.skip-link");
		if (skipLink) {
			skipLink.insertAdjacentElement("afterend", header);
		} else {
			document.body.prepend(header);
		}

		function openMenu() {
			mobileNav.removeAttribute("hidden");
			btn.setAttribute("aria-expanded", "true");
			btn.setAttribute("aria-label", "Close navigation");
			const first = mobileNav.querySelector("a");
			if (first) first.focus();
		}

		function closeMenu(returnFocus) {
			mobileNav.setAttribute("hidden", "");
			btn.setAttribute("aria-expanded", "false");
			btn.setAttribute("aria-label", "Open navigation");
			if (returnFocus) btn.focus();
		}

		btn.addEventListener("click", () => {
			if (btn.getAttribute("aria-expanded") === "true") {
				closeMenu(true);
			} else {
				openMenu();
			}
		});

		mobileNav.addEventListener("keydown", (e) => {
			if (e.key === "Escape") {
				closeMenu(true);
			}
		});

		document.addEventListener("click", (e) => {
			if (btn.getAttribute("aria-expanded") === "true" && !header.contains(e.target)) {
				closeMenu(false);
			}
		});

		measureStickyHeights(header);
	}

	// The breadcrumb bar sticks at `top: var(--site-header-height)` and the
	// course-sidebar / page-toc stick at `top: calc(var(--site-bar-height) +
	// 1em)`. Both variables have safe em-based defaults in course.css, but the
	// header's actual rendered height depends on font, padding, and which
	// children are present — em math can drift by a few pixels and leave a
	// gap. Write the measured pixel heights back to the variables so the
	// bars stack with no visible seam.
	function measureStickyHeights(header) {
		const root = document.documentElement;
		const update = () => {
			const headerH = header.getBoundingClientRect().height;
			root.style.setProperty("--site-header-height", `${headerH}px`);
			const bar = document.querySelector("page-breadcrumbs");
			const barH = bar ? bar.getBoundingClientRect().height : 0;
			root.style.setProperty("--site-bar-height", `${headerH + barH}px`);
		};
		update();
		// Re-measure on resize (mobile/desktop layout switch changes header
		// children) and when the breadcrumb bar finishes upgrading.
		if (typeof ResizeObserver === "function") {
			const ro = new ResizeObserver(update);
			ro.observe(header);
			const observeBar = () => {
				const bar = document.querySelector("page-breadcrumbs");
				if (bar) ro.observe(bar);
				else setTimeout(observeBar, 50);
			};
			observeBar();
		}
	}

	onReady(inject);
})();
