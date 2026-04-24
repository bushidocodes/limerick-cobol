      $ SET SOURCEFORMAT "FREE"
IDENTIFICATION DIVISION.
PROGRAM-ID.  Aroma96exam.
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

   SELECT Trans-File ASSIGN TO "TRANS.DAT"
        ORGANIZATION IS LINE SEQUENTIAL.   

   SELECT Report-File ASSIGN TO "OILSTOCK.RPT".

   SELECT Error-File ASSIGN TO "ERROR.DAT"
        ORGANIZATION IS LINE SEQUENTIAL. 

  

DATA DIVISION.
FILE SECTION.
FD Oil-Details-File.
01 ODF-Rec.
   88 End-Of-ODF		VALUE HIGH-VALUES.
   02 Oil-Num-ODF               PIC 9(4).
   02 Oil-Name-ODF              PIC X(20).
   02 Unit-Size-ODF		PIC 9(2).
   02 Unit-Cost-ODF		PIC 99V99.

FD Oil-Stock-File.
01 OSF-Rec.
   02 Oil-Num-OSF		PIC 9(4).
   02 Qty-In-Stock-OSF		PIC 9(5).

FD Trans-File.
01 Trans-Rec.
   88 End-Of-Trans		VALUE HIGH-VALUES.
   02 Type-Code			PIC 9.
      88 Add-To-Stock		VALUE 1.
      88 Remove-From-Stock      VALUE 2.
   02 Oil-Num.
      03  Rel-Rec-Num		PIC 9(3).
      03  FILLER		PIC 9.
   02 Qty			PIC 9(5).

FD Error-File.
01 Error-Rec			PIC X(10).

FD Report-File REPORT IS Oil-Stock-Report.


WORKING-STORAGE SECTION.
01 Status-Codes.
   02 ODF-Status                PIC X(2).
   02 OSF-Status                PIC X(2).
      88 No-Error-Found		VALUE "00".
      88 Rec-Not-Found		VALUE "23".


01 Stock-Value			PIC 9(5)V99.

REPORT SECTION.
RD Oil-Stock-Report
   CONTROLS ARE FINAL
                Oil-Name-ODF
   PAGE LIMIT IS 66
   HEADING 2
   FIRST DETAIL 8
   LAST DETAIL 50
   FOOTING 55.

01 TYPE IS REPORT HEADING.
   02 LINE 2.
      03 COLUMN 15		PIC X(18) VALUE "OIL  STOCK  REPORT".
   02 LINE 3.
      03 COLUMN 13		PIC X(22) VALUE ALL "-".
   
01 TYPE IS PAGE HEADING.
   02 LINE 6.
      03 COLUMN 03		PIC X(9)  VALUE "OIL  NAME".
      03 COLUMN 23		PIC X(4)  VALUE "OIL#".
      03 COLUMN 29		PIC X(4)  VALUE "SIZE".
      03 COLUMN 36		PIC X(3)  VALUE "QTY".
      03 COLUMN 44		PIC X(11) VALUE "STOCK VALUE".

01 Stock-Detail-Line TYPE IS DETAIL.
   02 LINE IS PLUS 2.
      03 COLUMN 01		PIC X(20) SOURCE Oil-Name-ODF GROUP INDICATE.
      03 COLUMN 23		PIC 9(4)  SOURCE Oil-Num-ODF.
      03 COLUMN 30		PIC 99    SOURCE Unit-Size-ODF.
      03 COLUMN 35              PIC ZZ,ZZ9 SOURCE Qty-In-Stock-OSF.
      03 COLUMN 44              PIC $$$,$$9.99 SOURCE Stock-Value.

01 TYPE IS CONTROL FOOTING Oil-Name-ODF NEXT GROUP PLUS 1.
   02 LINE IS PLUS 2.
      03 COLUMN 27		PIC X(15) VALUE "TOTAL OIL VALUE".
      03 Oil-Val COLUMN 44      PIC $$$$,$$9.99 SUM Stock-Value.

01 TYPE IS CONTROL FOOTING FINAL.
   02 LINE IS PLUS 3.
      03 COLUMN 27              PIC X(17) VALUE "TOTAL STOCK VALUE".
      03 COLUMN 46              PIC $$,$$$,$$9.99 SUM Oil-Val.
 

PROCEDURE DIVISION.
Begin.
   OPEN I-O Oil-Details-File.
   OPEN I-O Oil-Stock-File.
   OPEN OUTPUT Error-File.
   OPEN INPUT Trans-File.
   READ Trans-File 
      AT END SET End-Of-Trans TO TRUE
   END-READ.
   PERFORM Process-Transactions UNTIL End-Of-Trans.

   CLOSE Error-File.
   CLOSE Trans-File.  
   OPEN OUTPUT Report-File.
   INITIATE Oil-Stock-Report.

   MOVE SPACES TO Oil-Name-ODF.
   START Oil-Details-File 
      KEY IS GREATER THAN Oil-Name-ODF
      INVALID KEY DISPLAY "Start Error FS = " ODF-Status
   END-START.
   READ Oil-Details-File NEXT RECORD
      AT END SET End-Of-ODF TO TRUE
   END-READ.
   PERFORM Print-Stock-Report UNTIL End-Of-ODF.
   TERMINATE Oil-Stock-Report.
   CLOSE Oil-Details-File.
   CLOSE Oil-Stock-File.
   STOP RUN.

Process-Transactions.
   READ Oil-Stock-File
       INVALID KEY DISPLAY "OSF rec not found FS = " OSF-Status
   END-READ.
   IF No-Error-Found 
      EVALUATE TRUE
        WHEN Add-To-Stock ADD Qty TO Qty-In-Stock-OSF
        WHEN Remove-From-Stock SUBTRACT Qty FROM Qty-In-Stock-OSF
        WHEN OTHER DISPLAY "Type code not 1 or 2 Rec = " Trans-Rec
      END-EVALUATE
      REWRITE OSF-Rec
         INVALID KEY DISPLAY "Problem on REWRITE FS= " OSF-Status
      END-REWRITE
    ELSE IF Rec-Not-Found 
                WRITE Error-Rec FROM Trans-Rec
         END-IF
   END-IF.  
   READ Trans-File 
      AT END SET End-Of-Trans TO TRUE
   END-READ. 

Print-Stock-Report.
   MOVE Oil-Num-ODF TO Oil-Num
   READ Oil-Stock-File
      INVALID KEY DISPLAY "Error on reading OSF SF= " OSF-Status
   END-READ.
   COMPUTE Stock-Value = Unit-Cost-ODF * Qty-In-Stock-OSF.
   GENERATE Stock-Detail-Line. 
   READ Oil-Details-File NEXT RECORD
      AT END SET End-Of-ODF TO TRUE
   END-READ.
     


