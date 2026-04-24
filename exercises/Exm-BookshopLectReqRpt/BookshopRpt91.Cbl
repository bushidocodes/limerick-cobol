      $ SET SOURCEFORMAT"FREE"
IDENTIFICATION DIVISION.
PROGRAM-ID. BookshopRpt91.Cbl.
AUTHOR.  MICHAEL COUGHLAN.
*Originally written for VAX COBOL 1991
*Converted to Microfocus COBOL 2002
*The Campus Bookshop Purchase Requirements Report (DP291-91-EXAM)

ENVIRONMENT DIVISION.
INPUT-OUTPUT SECTION.
FILE-CONTROL.
	SELECT Purchase-Req-File  ASSIGN TO "PRFILE.DAT"
		ORGANIZATION IS INDEXED
		FILE STATUS IS Pr-Status
		ACCESS MODE IS DYNAMIC
		RECORD KEY IS Pr-Number
		ALTERNATE RECORD KEY IS Pr-Lecturer-Name
				WITH DUPLICATES
		ALTERNATE RECORD KEY IS Pr-Book-Num
				WITH DUPLICATES.

	SELECT Book-File ASSIGN TO "BOOKFILE.DAT"
		ORGANIZATION IS INDEXED
		FILE STATUS IS Bf-Status
		ACCESS MODE IS DYNAMIC
		RECORD KEY IS Bf-Book-Num
		ALTERNATE RECORD KEY IS Bf-Publisher-Num
				WITH DUPLICATES.

	SELECT Publisher-File ASSIGN TO "PUBFILE.DAT"
		ORGANIZATION IS INDEXED
		FILE STATUS IS Pf-Status
		ACCESS MODE IS DYNAMIC
		RECORD KEY IS Pf-Publisher-Num
		ALTERNATE RECORD KEY IS Pf-Publisher-Name.

	SELECT REPORT-FILE ASSIGN TO "BOOKSHOP.RPT".

DATA DIVISION.
FILE SECTION.
FD 	Purchase-Req-File.
01	Pr-Rec.
	02	Pr-Number		PIC 9(4).
	02	Pr-Lecturer-Name	PIC X(20).
	02	Pr-Book-Num		PIC 9(4).
	02	Pr-Module-Code		PIC X(5).
	02	Pr-Copies-Required	PIC 9(3).
        02      Pr-Semester             PIC 9.
	
FD 	Book-File.
01	Book-Rec.
	02	Bf-Book-Num		PIC 9(4).
	02	Bf-Publisher-Num	PIC 9(4).
	02	Bf-Book-Title		PIC X(30).	


FD  Publisher-File.
01	Publisher-Rec.
	02	Pf-Publisher-Num	PIC 9(4).
	02	Pf-Publisher-Name	PIC X(20).
	02	Pf-Publisher-Address	PIC X(40).

FD	REPORT-FILE
	     REPORT IS Purchase-Requirements-Report.

WORKING-STORAGE SECTION.
01	File-Stati.
	02	Pr-Status		PIC X(2).
		88 Pr-Rec-Not-Found	VALUE "23".
	02	Bf-Status		PIC X(2).
		88 Bf-Rec-Not-Found	VALUE "23".
	02	Pf-Status		PIC X(2).
		

01      Current-Semester                PIC 9.

01	Eof-Names.
	02	FILLER			PIC 9 	VALUE 0.
		88	End-Of-Pr-File     VALUE 1.
		88	Not-End-Of-Pr-File VALUE 0.
	02	FILLER			PIC 9 	VALUE 0.
		88	End-Of-Books	   VALUE 1.
		88	Not-ENd-Of-Books   VALUE 0.
	02	FILLER			PIC 9 	VALUE 0.
		88	End-Of-Publishers  VALUE 1.



REPORT SECTION.
RD	Purchase-Requirements-Report
	CONTROLS ARE 	FINAL 
			Pf-Publisher-Name
	PAGE LIMIT IS 66
	HEADING 2
	FIRST DETAIL 8
	LAST DETAIL 50
	FOOTING 55.


01	TYPE IS REPORT FOOTING.
	02	LINE 56.
		03	COLUMN 29	PIC X(23)
					VALUE "*** END  OF  REPORT ***".

01	TYPE IS PAGE HEADING.
	02	LINE 2.
		03	COLUMN 27	PIC X(30)
					VALUE "PURCHASE  REQUIREMENTS  REPORT".
		03	COLUMN 77	PIC X(6)
					VALUE "PAGE :".
		03	COLUMN 84	PIC Z9 SOURCE PAGE-COUNTER.

	02	LINE 3.
		03	COLUMN 26	PIC X(32) VALUE ALL "-".

	02	LINE 6.
		03	COLUMN 2	PIC X(24) VALUE "PUBLISHER NAME".
		03	COLUMN 33	PIC X(11) VALUE "BOOK  TITLE".
		03	COLUMN 57	PIC X(3)  VALUE "QTY".
		03	COLUMN 65	PIC X(14) VALUE "LECTURER  NAME".


01 	Pr-Print-Line TYPE IS DETAIL.
	02	LINE IS PLUS 2.
		03	COLUMN 1	PIC X(20) SOURCE Pf-Publisher-Name
						GROUP INDICATE.
		03	COLUMN 24	PIC X(30)  SOURCE Bf-Book-Title.
		03	COLUMN 57	PIC ZZ9    SOURCE Pr-Copies-Required.
		03	COLUMN 63	PIC X(20)  SOURCE Pr-Lecturer-Name.

PROCEDURE DIVISION.
BEGIN.
        DISPLAY "Enter the semester number.".
        DISPLAY "First or second -> "
		WITH NO ADVANCING.
        ACCEPT Current-Semester.
	OPEN INPUT Purchase-Req-File.
	OPEN INPUT Book-File.
	OPEN INPUT Publisher-File.
	OPEN OUTPUT Report-File.
	INITIATE Purchase-Requirements-Report.

	MOVE LOW-VALUES TO Pf-Publisher-Name.
	START Publisher-File
	     KEY IS GREATER THAN Pf-Publisher-Name
	     INVALID KEY DISPLAY "START Pub file status" Pf-Status
	END-START.
        READ Publisher-File NEXT RECORD
 		AT END SET End-Of-Publishers TO TRUE
        END-READ.
	PERFORM Print-Requirements-Report UNTIL End-Of-Publishers.

	TERMINATE Purchase-Requirements-Report.
	CLOSE   Purchase-Req-File,
		Book-File,
		Publisher-File,
		Report-File.
	STOP RUN.

Print-Requirements-Report.
	SET Not-End-Of-Books TO TRUE.
	MOVE Pf-Publisher-Num TO Bf-Publisher-Num.	
	READ Book-File
		KEY IS Bf-Publisher-Num
		INVALID KEY
			DISPLAY "Book file error 1 Bf-status = " Bf-Status
			DISPLAY "Publisher Rec = " Publisher-Rec
			MOVE ZEROS TO Bf-Publisher-Num
	END-READ
	DISPLAY "bfstatus = " Bf-Status
	PERFORM Process-Publisher 
		UNTIL Pf-Publisher-Num NOT EQUAL TO Bf-Publisher-Num 
			  OR End-Of-Books
	
	READ Publisher-File NEXT RECORD
		AT END SET End-OF-Publishers TO TRUE
	END-READ.
	DISPLAY "Pub Rec" Publisher-Rec.

Process-Publisher.
	SET Not-End-Of-Pr-File TO TRUE.
	MOVE Bf-Book-Num TO Pr-Book-Num.
	READ Purchase-Req-File
		KEY IS Pr-Book-Num
		INVALID KEY
		   DISPLAY "Pr-File error 1 Pr-status = " Pr-Status
		   DISPLAY "Book Rec = " Book-Rec
		   MOVE ZEROS TO Pr-Book-Num
	END-READ
	DISPLAY "PrStatus = " Pr-Status
	PERFORM UNTIL Bf-Book-Num NOT EQUAL TO Pr-Book-Num
			OR End-OF-Pr-File
                IF Current-Semester = Pr-Semester THEN
			Generate Pr-Print-Line
		END-IF
		READ Purchase-Req-File NEXT RECORD
			AT END SET End-Of-Pr-File TO TRUE
		END-READ
	END-PERFORM
	
	READ Book-File NEXT RECORD
		AT END SET End-Of-Books TO TRUE
	END-READ.
	DISPLAY "book rec " Book-Rec.
