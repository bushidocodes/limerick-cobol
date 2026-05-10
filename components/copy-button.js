// Injects a "Copy" button into every Prism-highlighted code block.
// Targets pre[class*="language-"] to match Prism's own selector convention.
// The button is positioned absolutely inside the <pre>, so the <pre> needs
// position:relative — that rule lives in course-components.css under .copy-button.
//
// Light DOM: no shadow root needed. The button only writes to the clipboard and
// toggles its own text label; no global style isolation is required.
document.addEventListener("DOMContentLoaded", () => {
	document.querySelectorAll('pre[class*="language-"]').forEach((pre) => {
		const code = pre.querySelector("code");
		if (!code) return;

		const btn = document.createElement("button");
		btn.className = "copy-button";
		btn.setAttribute("aria-label", "Copy code to clipboard");
		btn.textContent = "Copy";

		btn.addEventListener("click", () => {
			navigator.clipboard.writeText(code.textContent).then(() => {
				btn.textContent = "Copied!";
				setTimeout(() => {
					btn.textContent = "Copy";
				}, 1500);
			});
		});

		pre.appendChild(btn);
	});
});
