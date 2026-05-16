#!/usr/bin/env node
// One-time script: move <related-content> from after <page-hero> to inside a
// <div class="page-footer"> at the bottom of the page, matching the course-tutorial
// footer pattern. Fixes https://github.com/bushidocodes/limerick-cobol/issues/567.

const fs = require("fs");
const path = require("path");

const FILES = [
	// simple exercises (depth 1, no exercises-nav)
	"exercises/CountDown.html",
	"exercises/GettingStarted.html",
	"exercises/MonthTable.html",
	"exercises/SeqInsert.html",
	"exercises/SeqRead.html",
	"exercises/SeqReadIf.html",
	"exercises/SeqUpdate.html",
	"exercises/SeqWrite.html",
	"exercises/SortIP.html",
	// exam spec pages (depth 2, with exercises-nav)
	"exercises/Exm-AcmeStockReorder/Exm-AcmeStockReorder.html",
	"exercises/Exm-AromaOilFileMainRpt/Exm-AromaOilFileMainRpt.html",
	"exercises/Exm-AromaSalesRpt/Exm-AromaSalesSummaryRpt.html",
	"exercises/Exm-BestSellersRpt/Exm-FolioBestSellersRpt.html",
	"exercises/Exm-BookshopLectReqRpt/Exm-BookshopLectReqRpt.html",
	"exercises/Exm-CSISEmailDomain/Exm-CSISEmailDomain.html",
	"exercises/Exm-DueSubsRpt/Exm-DueSubsRpt.html",
	"exercises/Exm-FileConversion/Exm-FileConversion.html",
	"exercises/Exm-FlyByNightTravel/Exm-FlyByNight.html",
	"exercises/Exm-RoyaltyPaymentsRpt/Exm-LibRoyaltyRpt.html",
	"exercises/Exm-SFbyMail/Exm-SFbyMail.html",
	"exercises/Exm-StudFeesRpt/Exm-StudPay.html",
	"exercises/Exm-TopSupplierRpt/Exm-TopSupplierRpt.html",
	"exercises/Exm-USSRshipRpt/Exm-USSRshipRpt.html",
	// exam program pages (depth 2, no exercises-nav)
	"exercises/Exm-AcmeStockReorder/Prg-AcmeStockReorder.html",
	"exercises/Exm-AromaOilFileMainRpt/Prg-AromaOilFileMainRpt.html",
	"exercises/Exm-AromaSalesRpt/Prg-AromaSalesSummaryRpt.html",
	"exercises/Exm-BestSellersRpt/Prg-FolioBestSellersRpt.html",
	"exercises/Exm-BookshopLectReqRpt/Prg-BookshopLectReqRpt.html",
	"exercises/Exm-CSISEmailDomain/Prg-CSISEmailDomain.html",
	"exercises/Exm-DueSubsRpt/Prg-DueSubsRpt.html",
	"exercises/Exm-FileConversion/Prg-FileConversion.html",
	"exercises/Exm-FlyByNightTravel/Prg-FlyByNight.html",
	"exercises/Exm-RoyaltyPaymentsRpt/Prg-LibRoyaltyRpt.html",
	"exercises/Exm-SFbyMail/Prg-SFbyMail.html",
	"exercises/Exm-StudFeesRpt/Prg-StudPay.html",
	"exercises/Exm-TopSupplierRpt/Prg-TopSupplierRpt.html",
	"exercises/Exm-USSRshipRpt/Prg-USSRshipRpt.html",
	// project pages (depth 2, with exercises-nav)
	"exercises/Prj-AromaInvoicesRpt/Prj-AromaInvoicesRpt.html",
	"exercises/Prj-AromaSalesRpt/Prj-AromaSalesRpt.html",
	"exercises/Prj-CAOPointsCalc/Prj-CAOcalculator.html",
	"exercises/Prj-MunsterSurnamesFreqRpt/Prj-MunsterSurnamesFreqRpt.html",
	"exercises/Prj-NewtronicsFileMaint/Prj-NewtronicsFileMaint.html",
	"exercises/Proj-CSISEvalform/CSISEvalForm.html",
];

const T5 = "\t\t\t\t\t"; // 5 tabs — children of .page-content
const T6 = "\t\t\t\t\t\t"; // 6 tabs — children of .page-footer

function transformFile(filePath) {
	const raw = fs.readFileSync(filePath, "utf8");

	// ── Step 1: capture the <related-content> block ─────────────────────────
	// Matches: T5<related-content\n  (one or more T6 attribute lines)\n  T5></related-content>\n
	const rcRe = new RegExp(`(${T5}<related-content\n(?:${T6}[^\n]+\n)+${T5}><\\/related-content>)\n`);
	const rcMatch = raw.match(rcRe);
	if (!rcMatch) {
		console.error(`  SKIP (no related-content block found): ${filePath}`);
		return false;
	}
	const rcBlock = rcMatch[1]; // block without trailing newline
	// Re-indent: each line gains one leading tab
	const rcBlockIndented = rcBlock
		.split("\n")
		.map((l) => "\t" + l)
		.join("\n");

	// ── Step 2: remove the block from after <page-hero> ─────────────────────
	let content = raw.replace(rcBlock + "\n", "");

	// ── Step 3: wrap footer elements in <div class="page-footer"> ───────────
	// Footer sequence (optional exercises-nav, then copyright-notice through
	// the back-link paragraph), then the closing T4</div> for .page-content.
	const footerRe = new RegExp(
		`(` +
			`(?:${T5}<exercises-nav><\\/exercises-nav>\n)?` +
			`${T5}<copyright-notice[^\n]+\n` +
			`${T5}<last-updated><\\/last-updated>\n` +
			`${T5}<edit-on-github><\\/edit-on-github>\n` +
			`${T5}<p class="center-block">[^\n]+\n` +
			`)` +
			`(\t{4}<\\/div>)`, // closing tag for .page-content
	);
	const footerMatch = content.match(footerRe);
	if (!footerMatch) {
		console.error(`  SKIP (no footer sequence found): ${filePath}`);
		return false;
	}

	const oldFooterLines = footerMatch[1]; // footer elements, still at T5
	const closingDiv = footerMatch[2]; // \t\t\t\t</div>

	// Re-indent footer elements to T6
	const newFooterLines = oldFooterLines
		.split("\n")
		.filter((l) => l.length > 0)
		.map((l) => "\t" + l)
		.join("\n");

	const newFooter =
		`${T5}<div class="page-footer">\n` +
		`${rcBlockIndented}\n` +
		`${T6}<hr />\n` +
		`${newFooterLines}\n` +
		`${T5}</div>\n` +
		closingDiv;

	content = content.replace(footerRe, newFooter);

	fs.writeFileSync(filePath, content, "utf8");
	return true;
}

let ok = 0;
let skip = 0;
for (const f of FILES) {
	const fullPath = path.join(__dirname, "..", f);
	process.stdout.write(`Processing ${f} … `);
	if (transformFile(fullPath)) {
		console.log("OK");
		ok++;
	} else {
		skip++;
	}
}
console.log(`\nDone: ${ok} transformed, ${skip} skipped.`);
