      $ SET SOURCEFORMAT"FREE"
IDENTIFICATION DIVISION.
PROGRAM-ID.  CreateRelativeFromSeq.
AUTHOR.  MICHAEL COUGHLAN.
* Creates a Relative file from a sequential file.

ENVIRONMENT DIVISION.
INPUT-OUTPUT SECTION.
FILE-CONTROL.
	SELECT SupplierFile ASSIGN TO "SUPP.DAT"
		ORGANIZATION IS RELATIVE
		ACCESS MODE IS RANDOM
		RELATIVE KEY IS SupplierKey
		FILE STATUS IS Supplierstatus.

	SELECT SupplierFileSeq ASSIGN TO "INSUPP.DAT".
		

DATA DIVISION.
FILE SECTION.

FD  SupplierFile.
01	SupplierRecord.
	02	SupplierCode		PIC 99.
	02	SupplierName		PIC X(20).
	02	SupplierAddress		PIC X(60).


FD  SupplierFileSeq.
01	SupplierRecordSeq.
	88	EndOfFile			VALUE HIGH-VALUES.
	02	SupplierCodeSeq     PIC 99.
	02	SupplierNameSeq		PIC X(20).
	02	upplierAddressSeqS	PIC X(60).


WORKING-STORAGE SECTION.
01	Supplierstatus			PIC X(2).

01  SupplierKey             PIC 99.


PROCEDURE DIVISION.
Begin.
	OPEN OUTPUT SupplierFile.
	OPEN INPUT SupplierFileSeq.
	
	READ SupplierFileSeq 
		AT END SET EndOfFile TO TRUE
	END-READ
	PERFORM UNTIL EndOfFile
	    MOVE SupplierCodeSeq TO SupplierKey
		MOVE SupplierRecordSeq TO SupplierRecord
		WRITE SupplierRecord
			INVALID KEY DISPLAY "SUPP STATUS :-", Supplierstatus
		END-WRITE
		READ SupplierFileSeq 
			AT END SET EndOfFile TO TRUE
		END-READ
	END-PERFORM.	

	CLOSE  SupplierFile, SupplierFileSeq.
	STOP RUN.
