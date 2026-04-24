      $ SET SOURCEFORMAT"FREE"
IDENTIFICATION DIVISION.
PROGRAM-ID. DueSubsRpt.
AUTHOR. Michael Coughlan.
*CS4321-96-COBOL-EXAM.

ENVIRONMENT DIVISION.
INPUT-OUTPUT SECTION.
FILE-CONTROL.
       SELECT DueSubsFile ASSIGN TO "DUESUBS.DAT"
                 ORGANIZATION IS LINE SEQUENTIAL.

       SELECT WorkFile ASSIGN TO "SORT.TMP".

       SELECT DueSubsReport ASSIGN TO "DUESUBS.RPT"
                 ORGANIZATION IS LINE SEQUENTIAL.


       SELECT SortedSubsFile ASSIGN TO "SORTSUBS.DAT"
                 ORGANIZATION IS LINE SEQUENTIAL.

       SELECT CountryFile ASSIGN TO "COUNTRY.DAT"
                 ORGANIZATION IS LINE SEQUENTIAL.

DATA DIVISION.
FILE SECTION.
FD DueSubsFile.
01 DueSubsRec.
   88   EndOfDueSubsFile    VALUE HIGH-VALUES.
   02	CustomerNameDS	PIC X(22).
   02	PayMethodDS		PIC 9.
   02	PayFreqDS		PIC 9.
   02	FILLER			PIC X(24).
   02	CountryCodeDS		PIC XX.

SD WorkFile.
01 WorkRec.
   88	EndOfWorkFile VALUE HIGH-VALUES.
   02	CustomerNameWF	PIC X(22).
   02	PayMethodWF		PIC 9.
   02	PayFreqWF		PIC 9.
   02	CountryNameWF		PIC X(25).
   02	CountryCodeWF		PIC XX.


FD DueSubsReport.
01 PrintLine			PIC X(77).

FD SortedSubsFile.
01 SortedSubsRec.
   88	EndOfSortedSubs VALUE HIGH-VALUES.
   02	CustomerNameSS	PIC X(22).
   02	PayMethodSS		PIC 9.
        88 ByVisa         VALUE 1.
        88 ByAccess       VALUE 2.
        88 ByExpress      VALUE 3.
        88 ByCheque       VALUE 4.
   02	PayFreqSS		PIC 9.
   02	CountryNameSS		PIC X(25).
   02	CountryCodeSS		PIC XX.


FD CountryFile.
01 CountryRec.
   88	EndOfCountryFile VALUE HIGH-VALUES.
   02	CountryCodeCF		PIC XX.
   02	CountryNameCF		PIC X(25).
   02	ExchangeRateCF		PIC 9(5)V9(5).


WORKING-STORAGE SECTION.

01  MethodTable VALUE "VISA     Access   AmExpressCheque   ".
    02  PayMethodMT OCCURS 4 TIMES PIC X(9).

01  FreqTable VALUE "020100180".
    02  SubsFT OCCURS 3 TIMES PIC 9(3).

01  CountryTable.
    02  Country OCCURS 242 TIMES
		ASCENDING KEY IS CountryCodeCT
                INDEXED BY CIDX.
	03 CountryCodeCT	PIC XX.
   	03 CountryNameCT	PIC X(25).
   	03 ExchangeRateCT	PIC 9(5)V9(5).



01  ReportHeadingLine.
    02	FILLER PIC X(18) VALUE SPACES.
    02  FILLER PIC X(35)  VALUE "NETNEWS  DUE  SUBSCRIPTIONS  REPORT".


01  ReportUnderline.
    02  FILLER                  PIC X(17) VALUE SPACES.
    02  FILLER                  PIC X(37) VALUE ALL "-".


01  TopicHeadingLine.
    02  FILLER                  PIC X(5)  VALUE SPACES.
    02  FILLER                  PIC X(12) VALUE "COUNTRY NAME".
    02  FILLER                  PIC X(11) VALUE SPACES.
    02  FILLER                  PIC X(13) VALUE "CUSTOMER NAME".
    02  FILLER                  PIC X(8)  VALUE SPACES.
    02  FILLER                  PIC X(12) VALUE "PAY METHOD  ".
    02  FILLER                  PIC X(8)  VALUE "SUBS    ".
    02  FILLER                  PIC X(7)  VALUE "LC SUBS".


01  CustLine.
    02  PrnCountryName		PIC X(25).
    02  PrnCustName		PIC BX(22).
    02	PrnPayMethod		PIC BX(9).
    02	PrnSubs			PIC BBB$$$9.
    02  PrnLCSubs               PIC BBZZ,ZZZ,ZZ9.

01  VisaLine.
    02	FILLER			PIC X(41) VALUE SPACES.
    02  FILLER			PIC X(17) VALUE "VISA      TOTAL  ". 
    02	PrnVisaTotal		PIC $$$,$$9.

01  AccessLine.
    02	FILLER			PIC X(41) VALUE SPACES.
    02  FILLER			PIC X(17) VALUE "ACCESS    TOTAL  ". 
    02	PrnAccessTotal  	PIC $$$,$$9.

01  AmExLine.
    02	FILLER			PIC X(41) VALUE SPACES.
    02  FILLER			PIC X(17) VALUE "AMEXPRESS TOTAL  ". 
    02	PrnAmExTotal		PIC $$$,$$9.

01  ChequeLine.
    02	FILLER			PIC X(41) VALUE SPACES.
    02  FILLER                  PIC X(17) VALUE "CHEQUE    TOTAL  ".
    02	PrnChequeTotal		PIC $$$,$$9.
               

01  VisaTotalLine.
    02	FILLER			PIC X(35) VALUE SPACES.
    02  FILLER			PIC X(23) VALUE "FINAL VISA      TOTAL  ". 
    02	PrnVisaFinalTotal	PIC $$,$$$,$$9.


01  AccessTotalLine.
    02	FILLER			PIC X(35) VALUE SPACES.
    02  FILLER			PIC X(23) VALUE "FINAL ACCESS    TOTAL  ". 
    02	PrnAccessFinalTotal	PIC $$,$$$,$$9.

01  AmExTotalLine.
    02	FILLER			PIC X(35) VALUE SPACES.
    02  FILLER			PIC X(23) VALUE "FINAL AMEXPRESS TOTAL  ". 
    02	PrnAMExFinalTotal	PIC $$,$$$,$$9.

01  ChequeTotalLine.
    02	FILLER			PIC X(35) VALUE SPACES.
    02  FILLER			PIC X(23) VALUE "FINAL CHEQUE    TOTAL  ". 
    02	PrnChequeFinalTotal	PIC $$,$$$,$$9.


01  SubTotals.
    02 VisaTotal		PIC 9(5).
    02 AccessTotal		PIC 9(5).
    02 AmExTotal		PIC 9(5).
    02 ChequeTotal		PIC 9(5).

01  FinalTotals.
    02 VisaFinalTotal		PIC 9(7) VALUE ZEROS.
    02 AccessFinalTotal		PIC 9(7) VALUE ZEROS.
    02 AmExFinalTotal		PIC 9(7) VALUE ZEROS.
    02 ChequeFinalTotal		PIC 9(7) VALUE ZEROS.

01  PrevCountryCode		PIC XX.
01  ExchangeRate		PIC 99999V99999.
01  LCSubs                      PIC 9(5).

PROCEDURE DIVISION.
ProduceSubscriptionsReport.
    PERFORM LoadCountryTable

    SORT WorkFile ON ASCENDING CountryNameWF, CustomerNameWF
         INPUT PROCEDURE IS RestructureRecords
         GIVING SortedSubsFile

    OPEN INPUT SortedSubsFile
    OPEN OUTPUT DueSubsReport

    WRITE PrintLine FROM ReportHeadingLine AFTER ADVANCING PAGE
    WRITE PrintLine FROM ReportUnderline   AFTER ADVANCING 1 LINE
    WRITE PrintLine FROM TopicHeadingLine  AFTER ADVANCING 3 LINES
    WRITE PrintLine FROM SPACES            AFTER ADVANCING 1 LINE   
    
    READ SortedSubsFile 
	AT END SET EndOfSortedSubs TO TRUE
    END-READ
    PERFORM PrintReportBody UNTIL EndOfSortedSubs
    
    PERFORM PrintFinalTotals

    CLOSE SortedSubsFile, DueSubsReport.
    STOP RUN. 


LoadCountryTable.
    MOVE HIGH-VALUES TO CountryTable
    OPEN INPUT CountryFile
    READ CountryFile
	AT END SET EndOfCountryFile TO TRUE
    END-READ
    PERFORM VARYING CIDX FROM 1 BY 1 UNTIL EndOfCountryFile
	MOVE CountryRec TO Country(CIDX)
	READ CountryFile
	   AT END SET EndOfCountryFile TO TRUE
        END-READ       
    END-PERFORM
    CLOSE CountryFile.


RestructureRecords.
    OPEN INPUT DueSubsFile
    READ DueSubsFile
	AT END SET EndOfDueSubsFile TO TRUE
    END-READ
    PERFORM UNTIL EndOfDueSubsFile
        MOVE CustomerNameDS TO CustomerNameWF
	MOVE PayMethodDS TO PayMethodWF
	MOVE PayFreqDS TO PayFreqWF
	MOVE CountryCodeDS To CountryCodeWF
        SEARCH ALL Country 
           AT END DISPLAY "Name for " CountryCodeDS " not found."
           WHEN CountryCodeCT(CIDX) = CountryCodeDS
               MOVE CountryNameCT(CIDX) TO CountryNameWF
	END-SEARCH
        RELEASE WorkRec
    	READ DueSubsFile
 	   AT END SET EndOfDueSubsFile TO TRUE
    	END-READ
    END-PERFORM
    CLOSE DueSubsFile.


PrintReportBody.
    MOVE CountryNameSS TO PrnCountryName
    MOVE CountryCodeSS TO PrevCountryCode
    SEARCH ALL Country 
        AT END DISPLAY "Name for " CountryCodeSS " not found."
        WHEN CountryCodeCT(CIDX) = CountryCodeSS
	MOVE ExchangeRateCT(CIDX) TO ExchangeRate
    END-SEARCH
    MOVE ZEROS TO SubTotals

    PERFORM PrintCountryLines UNTIL
		CountryCodeSS NOT EQUAL TO PrevCountryCode
		OR EndOfSortedSubs

    MOVE VisaTotal TO PrnVisaTotal
    MOVE AccessTotal TO PrnAccessTotal
    MOVE AmExTotal TO PrnAmExTotal
    MOVE ChequeTotal TO PrnChequeTotal

    WRITE PrintLine FROM VisaLine   AFTER ADVANCING 4 LINES
    WRITE PrintLine FROM AccessLine AFTER ADVANCING 1 LINE
    WRITE PrintLine FROM AmExLine   AFTER ADVANCING 1 LINE
    WRITE PrintLine FROM ChequeLine AFTER ADVANCING 1 LINE
    WRITE PrintLine FROM SPACES AFTER ADVANCING 3 LINES.
  


PrintCountryLines.
    MOVE CustomerNameSS TO PrnCustName
    MOVE PayMethodMT(PayMethodSS) TO PrnPayMethod
    MOVE SubsFT(PayFreqSS) TO PrnSubs
    COMPUTE PrnLCSubs ROUNDED = SubsFT(PayFreqSS) * ExchangeRate

    EVALUATE TRUE
        WHEN ByVisa ADD SubsFT(PayFreqSS) TO VisaTotal, VisaFinalTotal
        WHEN ByAccess ADD SubsFT(PayFreqSS) TO AccessTotal, AccessFinalTotal
        WHEN ByExpress ADD SubsFT(PayFreqSS) TO AmExTotal, AmExFinalTotal
        WHEN ByCheque ADD SubsFT(PayFreqSS) TO ChequeTotal, ChequeFinalTotal
    END-EVALUATE
  	
    WRITE PrintLine FROM CustLine 
	AFTER ADVANCING 1 LINE	
    MOVE SPACES TO PrnCountryName

    READ SortedSubsFile 
	AT END SET EndOfSortedSubs TO TRUE
    END-READ.

PrintFinalTotals.
    MOVE VisaFinalTotal TO PrnVisaFinalTotal
    MOVE AccessFinalTotal TO PrnAccessFinalTotal
    MOVE AmExFinalTotal TO PrnAmExFinalTotal
    MOVE ChequeFinalTotal TO PrnChequeFinalTotal

    WRITE PrintLine FROM VisaTotalLine   AFTER ADVANCING 1 LINE
    WRITE PrintLine FROM AccessTotalLine AFTER ADVANCING 1 LINE
    WRITE PrintLine FROM AmExTotalLine   AFTER ADVANCING 1 LINE
    WRITE PrintLine FROM ChequeTotalLine AFTER ADVANCING 1 LINE.
