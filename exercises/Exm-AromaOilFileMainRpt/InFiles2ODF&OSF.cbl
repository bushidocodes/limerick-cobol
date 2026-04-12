      $ SET SOURCEFORMAT "FREE"
IDENTIFICATION DIVISION.
PROGRAM-ID.  InFiles2ODFandOSF.
AUTHOR.  Michael Coughlan.

ENVIRONMENT DIVISION.
INPUT-OUTPUT SECTION.
FILE-CONTROL.
   SELECT Oil-Details-File ASSIGN TO "ODF.DAT"
          ORGANIZATION IS INDEXED   
          ACCESS MODE IS DYNAMIC
          RECORD KEY IS Oil-Num-ODF
          ALTERNATE RECORD KEY IS Oil-Name-ODF
                      WITH DUPLICATES
          FILE STATUS IS ODF-Status.

   SELECT Oil-Stock-File ASSIGN TO "OSF.DAT"
          ORGANIZATION IS RELATIVE   
          ACCESS MODE IS DYNAMIC
          RELATIVE KEY IS Rel-Rec-Num 
          FILE STATUS IS OSF-Status.

   SELECT OSF-in ASSIGN TO "OSF-IN.DAT"
        ORGANIZATION IS LINE SEQUENTIAL.   

   SELECT ODF-in ASSIGN TO "ODF-IN.DAT"
        ORGANIZATION IS LINE SEQUENTIAL.  

DATA DIVISION.
FILE SECTION.
FD Oil-Details-File.
01 ODF-Rec.
   02 Oil-Num-ODF               PIC 9(4).
   02 Oil-Name-ODF              PIC X(20).
   02 Unit-Size-ODF		PIC 9(2).
   02 Unit-Cost-ODF		PIC 99V99.

FD ODF-in.
01 ODF-in-Rec 			PIC X(30).
   88 End-Of-ODF		VALUE HIGH-VALUES.

FD OSF-in.
01 OSF-in-Rec.
   88 End-Of-OSF		VALUE HIGH-VALUES.
   02 Oil-Num-OSF-in.
      03 Rel-Rec-Num		PIC 9(3).
      03 FILLER			PIC 9.
   02 Qty-In-Stock-OSF-in	PIC 9(5).


FD Oil-Stock-File.
01 OSF-Rec.
   02 Oil-Num-OSF		PIC 9(4).
   02 Qty-In-Stock-OSF		PIC 9(5).


WORKING-STORAGE SECTION.
01 Status-Codes.
   02 ODF-Status                PIC X(2).
   02 OSF-Status                PIC X(2).
      88 No-Error-Found		VALUE "00".
      88 Rec-Not-Found		VALUE "23".

PROCEDURE DIVISION.
Begin.
   OPEN OUTPUT Oil-Details-File.
   OPEN OUTPUT Oil-Stock-File.
   OPEN INPUT OSF-in.
   OPEN INPUT ODF-in.
   
   READ OSF-in
      AT END SET End-Of-OSF TO TRUE
   END-READ.
   PERFORM UNTIL End-Of-OSF
      WRITE OSF-Rec FROM OSF-in-Rec
         INVALID KEY DISPLAY "Problem with OSF write FS = " OSF-Status
      END-WRITE
      READ OSF-in
         AT END SET End-Of-OSF TO TRUE
      END-READ
   END-PERFORM.

   READ ODF-in
      AT END SET End-Of-ODF TO TRUE
   END-READ.
   PERFORM UNTIL End-OF-ODF
      WRITE ODF-Rec FROM ODF-in-Rec
         INVALID KEY DISPLAY "Problem with ODF write FS = " ODF-Status
      END-WRITE
      READ ODF-in
         AT END SET End-Of-ODF TO TRUE
      END-READ
    END-PERFORM.

   CLOSE Oil-Details-File.
   CLOSE Oil-Stock-File.
   CLOSE ODF-in.
   CLOSE OSF-in. 
  STOP RUN.

