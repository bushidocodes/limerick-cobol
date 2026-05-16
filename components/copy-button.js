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
			const onSuccess = () => {
				btn.textContent = "Copied!";
				btn.classList.add("is-success");
				setTimeout(() => {
					btn.textContent = "Copy";
					btn.classList.remove("is-success");
				}, 1500);
			};
			const onFailure = () => {
				btn.textContent = "Copy failed";
				setTimeout(() => {
					btn.textContent = "Copy";
				}, 1500);
			};

			if (navigator.clipboard) {
				navigator.clipboard.writeText(code.textContent).then(onSuccess).catch(onFailure);
			} else {
				const selection = window.getSelection();
				const range = document.createRange();
				range.selectNodeContents(code);
				selection.removeAllRanges();
				selection.addRange(range);
				const ok = document.execCommand("copy");
				selection.removeAllRanges();
				ok ? onSuccess() : onFailure();
			}
		});

		pre.appendChild(btn);
	});
});
