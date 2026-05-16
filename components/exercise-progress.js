// Single source of truth for the exercise sequence.
// Loaded before exercises-nav.js so the component can read window.COBOL_EXERCISES.
// Paths are relative to the exercises/ root (subdir/file.html).

window.COBOL_EXERCISES = Object.freeze([
	// --- Simple Programming Exercises ---
	{ file: "GettingStarted.html", title: "Getting Started" },
	{ file: "CountDown.html", title: "The Calculator and Countdown" },
	{ file: "SeqRead.html", title: "Reading Sequential Files" },
	{ file: "SeqReadIf.html", title: "Counting Records in a Sequential File" },
	{ file: "SeqWrite.html", title: "Writing Records to a Sequential File" },
	{ file: "SeqInsert.html", title: "Inserting Records in a Sequential File" },
	{ file: "SeqUpdate.html", title: "Updating a Sequential File" },
	{ file: "SortIP.html", title: "Sorting a Sequential File" },
	{ file: "MonthTable.html", title: "Using Tables" },
	// --- Programming Exam Specifications ---
	{ file: "Exm-StudFeesRpt/Exm-StudPay.html", title: "Student Fees Report" },
	{ file: "Exm-AromaSalesRpt/Exm-AromaSalesSummaryRpt.html", title: "Aromamora Summary Sales" },
	{ file: "Exm-FlyByNightTravel/Exm-FlyByNight.html", title: "FlyByNight Summary File" },
	{ file: "Exm-AromaOilFileMainRpt/Exm-AromaOilFileMainRpt.html", title: "AromamoraMaint&Report" },
	{ file: "Exm-BookshopLectReqRpt/Exm-BookshopLectReqRpt.html", title: "Bookshop Lecturer Req Report" },
	{ file: "Exm-AcmeStockReorder/Exm-AcmeStockReorder.html", title: "ACME Stock Reorder" },
	{ file: "Exm-FileConversion/Exm-FileConversion.html", title: "File Conversion" },
	{ file: "Exm-USSRshipRpt/Exm-USSRshipRpt.html", title: "USSR Ship Report" },
	{ file: "Exm-SFbyMail/Exm-SFbyMail.html", title: "Science Fiction by Mail" },
	{ file: "Exm-CSISEmailDomain/Exm-CSISEmailDomain.html", title: "CSIS Email Domain" },
	{ file: "Exm-RoyaltyPaymentsRpt/Exm-LibRoyaltyRpt.html", title: "Library Royalties Report" },
	{ file: "Exm-TopSupplierRpt/Exm-TopSupplierRpt.html", title: "Top Supplier Report" },
	{ file: "Exm-BestSellersRpt/Exm-FolioBestSellersRpt.html", title: "Folio Best Sellers Report" },
	{ file: "Exm-DueSubsRpt/Exm-DueSubsRpt.html", title: "Due Subscriptions Report" },
	// --- Programming Project Specifications ---
	{ file: "Proj-CSISEvalform/CSISEvalForm.html", title: "CSIS Evaluation Form Report" },
	{ file: "Prj-AromaSalesRpt/Prj-AromaSalesRpt.html", title: "Aroma Sales Report" },
	{ file: "Prj-NewtronicsFileMaint/Prj-NewtronicsFileMaint.html", title: "Newtronics File Maintenance" },
	{ file: "Prj-AromaInvoicesRpt/Prj-AromaInvoicesRpt.html", title: "Aroma Invoices Report" },
	{ file: "Prj-MunsterSurnamesFreqRpt/Prj-MunsterSurnamesFreqRpt.html", title: "Munster Surnames Frequency Report" },
	{ file: "Prj-CAOPointsCalc/Prj-CAOcalculator.html", title: "CAO Points Calculator" },
]);
