      $ SET SOURCEFORMAT"FREE"
IDENTIFICATION DIVISION.
PROGRAM-ID.  SetUpInxFiles.
AUTHOR.  MICHAEL COUGHLAN.
*Originally written for VAX COBOL 1991
*Converted to Microfocus COBOL 2002
*Sets up the indexed files for the DP291-91-EXAM
*The Campus Bookshop Purchase Requirements Report
*DP291-91-EXAM

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

	SELECT In-Pr  ASSIGN TO "IN-PREQ.DAT"
                 ORGANIZATION IS LINE SEQUENTIAL.

	SELECT In-Book ASSIGN TO "IN-BOOK.DAT"
                 ORGANIZATION IS LINE SEQUENTIAL.

	SELECT In-Pub ASSIGN TO "IN-PUB.DAT"
                 ORGANIZATION IS LINE SEQUENTIAL.
		

DATA DIVISION.
FILE SECTION.
FD 	Purchase-Req-File.
01	Pr-Rec.
	02	Pr-Number		PIC 9(4).
	02	Pr-Lecturer-Name	PIC X(20).
	02	Pr-Book-Num		PIC 9(4).
	02	Pr-Module-Code		PIC X(5).
	02	Pr-Copies-Required	PIC 9(3).
	02	Pr-Term			PIC 9.
	
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

FD	In-Pr.
01	In-Pr-Rec			PIC X(37).

FD	In-Book.
01	In-Book-Rec			PIC X(38).

FD	In-Pub.
01	In-Pub-Rec			PIC X(64).


WORKING-STORAGE SECTION.
01	File-Stati.
	02	Pr-Status		PIC X(2).
	02	Bf-Status		PIC X(2).
	02	Pf-Status		PIC X(2).

01	Current-Term			PIC 9.

01	Eof-Names.
	02	FILLER			PIC 9 	VALUE 0.
		88	End-Of-Pr-File     VALUE 1.
		88	Not-End-Of-Pr-File VALUE 0.
	02	FILLER			PIC 9 	VALUE 0.
		88	End-Of-Books	   VALUE 1.
		88	Not-End-Of-Books   VALUE 0.
	02	FILLER			PIC 9 	VALUE 0.
		88	End-Of-Publishers  VALUE 1.


PROCEDURE DIVISION.
BEGIN.
	OPEN OUTPUT Purchase-Req-File.
	OPEN OUTPUT Book-File.
	OPEN OUTPUT Publisher-File.
	OPEN INPUT In-Pr.
        OPEN INPUT In-Book.
        OPEN INPUT In-Pub.
        READ In-Pr INTO Pr-Rec
		AT END SET End-Of-Pr-File TO TRUE
	END-READ
	PERFORM UNTIL End-Of-Pr-File
		WRITE Pr-Rec
			INVALID KEY DISPLAY "Error in Pr status = " Pr-Status
		END-WRITE
	        READ In-Pr INTO Pr-Rec
			AT END SET End-Of-Pr-File TO TRUE
		END-READ
	END-PERFORM

	READ In-Book INTO Book-Rec
		AT END SET End-Of-Books TO TRUE
	END-READ
	PERFORM UNTIL End-Of-Books
		WRITE Book-Rec
			INVALID KEY DISPLAY "Error in Books = " Bf-Status
		END-WRITE
		READ In-Book INTO Book-Rec
			AT END SET End-Of-Books TO TRUE
		END-READ
	END-PERFORM

	READ In-Pub INTO Publisher-Rec
		AT END SET End-Of-Publishers TO TRUE
	END-READ
	PERFORM UNTIL End-Of-Publishers
		WRITE Publisher-Rec 
			INVALID KEY DISPLAY "Pub error = " Pf-Status
		END-WRITE
		READ In-Pub INTO Publisher-Rec
			AT END SET End-Of-Publishers TO TRUE
		END-READ
	END-PERFORM
			
	CLOSE   Purchase-Req-File,
		Book-File,
		Publisher-File,
		In-Pr,
		In-Book,
		In-Pub.
	STOP RUN.
