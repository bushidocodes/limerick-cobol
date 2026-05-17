// Single source of truth for the exercise sequence.
// Loaded before exercises-nav.js so the component can read window.COBOL_EXERCISES.
// Paths are relative to the exercises/ root (subdir/file.html).

// `topic` groups entries in <exercises-sidebar>. The order of first appearance
// also defines the topic order shown in the sidebar.
window.COBOL_EXERCISES = Object.freeze([
	// --- Simple Programming Exercises ---
	{ topic: "Simple Exercises", file: "GettingStarted.html", title: "Getting Started" },
	{ topic: "Simple Exercises", file: "CountDown.html", title: "The Calculator and Countdown" },
	{ topic: "Simple Exercises", file: "SeqRead.html", title: "Reading Sequential Files" },
	{ topic: "Simple Exercises", file: "SeqReadIf.html", title: "Counting Records in a Sequential File" },
	{ topic: "Simple Exercises", file: "SeqWrite.html", title: "Writing Records to a Sequential File" },
	{ topic: "Simple Exercises", file: "SeqInsert.html", title: "Inserting Records in a Sequential File" },
	{ topic: "Simple Exercises", file: "SeqUpdate.html", title: "Updating a Sequential File" },
	{ topic: "Simple Exercises", file: "SortIP.html", title: "Sorting a Sequential File" },
	{ topic: "Simple Exercises", file: "MonthTable.html", title: "Using Tables" },
	// --- Programming Exam Specifications ---
	{ topic: "Exam Specifications", file: "Exm-StudFeesRpt/Exm-StudPay.html", title: "Student Fees Report" },
	{
		topic: "Exam Specifications",
		file: "Exm-AromaSalesRpt/Exm-AromaSalesSummaryRpt.html",
		title: "Aromamora Summary Sales",
	},
	{
		topic: "Exam Specifications",
		file: "Exm-FlyByNightTravel/Exm-FlyByNight.html",
		title: "FlyByNight Summary File",
	},
	{
		topic: "Exam Specifications",
		file: "Exm-AromaOilFileMainRpt/Exm-AromaOilFileMainRpt.html",
		title: "AromamoraMaint&Report",
	},
	{
		topic: "Exam Specifications",
		file: "Exm-BookshopLectReqRpt/Exm-BookshopLectReqRpt.html",
		title: "Bookshop Lecturer Req Report",
	},
	{
		topic: "Exam Specifications",
		file: "Exm-AcmeStockReorder/Exm-AcmeStockReorder.html",
		title: "ACME Stock Reorder",
	},
	{ topic: "Exam Specifications", file: "Exm-FileConversion/Exm-FileConversion.html", title: "File Conversion" },
	{ topic: "Exam Specifications", file: "Exm-USSRshipRpt/Exm-USSRshipRpt.html", title: "USSR Ship Report" },
	{ topic: "Exam Specifications", file: "Exm-SFbyMail/Exm-SFbyMail.html", title: "Science Fiction by Mail" },
	{ topic: "Exam Specifications", file: "Exm-CSISEmailDomain/Exm-CSISEmailDomain.html", title: "CSIS Email Domain" },
	{
		topic: "Exam Specifications",
		file: "Exm-RoyaltyPaymentsRpt/Exm-LibRoyaltyRpt.html",
		title: "Library Royalties Report",
	},
	{ topic: "Exam Specifications", file: "Exm-TopSupplierRpt/Exm-TopSupplierRpt.html", title: "Top Supplier Report" },
	{
		topic: "Exam Specifications",
		file: "Exm-BestSellersRpt/Exm-FolioBestSellersRpt.html",
		title: "Folio Best Sellers Report",
	},
	{ topic: "Exam Specifications", file: "Exm-DueSubsRpt/Exm-DueSubsRpt.html", title: "Due Subscriptions Report" },
	// --- Programming Project Specifications ---
	{
		topic: "Project Specifications",
		file: "Proj-CSISEvalform/CSISEvalForm.html",
		title: "CSIS Evaluation Form Report",
	},
	{ topic: "Project Specifications", file: "Prj-AromaSalesRpt/Prj-AromaSalesRpt.html", title: "Aroma Sales Report" },
	{
		topic: "Project Specifications",
		file: "Prj-NewtronicsFileMaint/Prj-NewtronicsFileMaint.html",
		title: "Newtronics File Maintenance",
	},
	{
		topic: "Project Specifications",
		file: "Prj-AromaInvoicesRpt/Prj-AromaInvoicesRpt.html",
		title: "Aroma Invoices Report",
	},
	{
		topic: "Project Specifications",
		file: "Prj-MunsterSurnamesFreqRpt/Prj-MunsterSurnamesFreqRpt.html",
		title: "Munster Surnames Frequency Report",
	},
	{
		topic: "Project Specifications",
		file: "Prj-CAOPointsCalc/Prj-CAOcalculator.html",
		title: "CAO Points Calculator",
	},
]);
