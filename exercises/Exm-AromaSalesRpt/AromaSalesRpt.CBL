      $ SET SOURCEFORMAT"FREE"
IDENTIFICATION DIVISION.
PROGRAM-ID. CS4321-95-COBOL-EXAM.
AUTHOR. Michael Coughlan.

ENVIRONMENT DIVISION.
INPUT-OUTPUT SECTION.
FILE-CONTROL.
       SELECT Sales-File ASSIGN TO "SALES.DAT"
                 ORGANIZATION IS LINE SEQUENTIAL.

       SELECT Work-File ASSIGN TO "SORT.TMP".

       SELECT Summary-Report ASSIGN TO "AROMASALES.RPT"
                 ORGANIZATION IS LINE SEQUENTIAL.


       SELECT Sorted-File ASSIGN TO "SORTSALE.DAT"
                 ORGANIZATION IS LINE SEQUENTIAL.

DATA DIVISION.
FILE SECTION.
FD Sales-File.
01  Sales-Rec.
    88 End-Of-Sales-File    VALUE HIGH-VALUES.
    02  SF-Cust-Id              PIC X(5).
    02  SF-Cust-Name            PIC X(20).
    02  SF-Oil-Id.
        03  FILLER              PIC X.
            88 Essential-Oil   VALUE "E".
        03  SF-Oil-Name         PIC 99.
    02 SF-Unit-Size             PIC 99.
    02 SF-Units-Sold            PIC 999.


SD Work-File.
01 Work-Rec.
   88 End-Of-Work-File VALUE HIGH-VALUES.
    02  WF-Cust-Id              PIC X(5).
    02  WF-Cust-Name            PIC X(20).
    02  WF-Oil-Id.
        03 FILLER               PIC X.
        03 WF-Oil-Num           PIC 99.
    02 WF-Unit-Size             PIC 99.
    02 WF-Units-Sold            PIC 999.


FD Summary-Report.
01 Print-Line                   PIC X(64).

FD Sorted-File.
01 Sorted-Rec                   PIC X(33).



WORKING-STORAGE SECTION.

01  Oils-Table.
    02  Oil-Cost-Values.
        03 FILLER               PIC X(40) 
                VALUE "0041003200450050002910250055003900650075".
        03 FILLER               PIC X(40) 
                VALUE "0080004400500063006500550085004812500065".
        03 FILLER               PIC X(40) 
                VALUE "0060005500670072006501250085006511150105".
    02  FILLER REDEFINES Oil-Cost-VALUES.
        03 OIL-COST           PIC 99V99 OCCURS 30 TIMES.

01  Report-Heading-Line         PIC X(44)
            VALUE "              AROMAMORA SUMMARY SALES REPORT". 

01  Report-Heading-Underline.
    02  FILLER                  PIC X(13) VALUE SPACES.
    02  FILLER                  PIC X(32) VALUE ALL "-".

01  Topic-Heading-Line.
    02  FILLER                  PIC BX(13) VALUE " CUSTOMER NAME".
    02  FILLER                  PIC X(8) VALUE SPACES.
    02  FILLER                  PIC X(10) VALUE "CUST-ID   ".
    02  FILLER                  PIC X(8) VALUE "SALES   ".
    02  FILLER                  PIC X(11) VALUE "QTY SOLD   ".
    02  FILLER                  PIC X(11) VALUE "SALES VALUE".

01  Cust-Sales-Line.
    02  Prn-Cust-Name           PIC X(20).
    02  Prn-Cust-Id             PIC BBB9(5).
    02  Prn-Cust-Sales          PIC BBBBBZZ9.
    02  Prn-Qty-Sold            PIC BBBBBZZ,ZZ9.
    02  Prn-Sales-Value         PIC BBBB$$$,$$9.99.                 

01  Total-Sales-Line.
    02  FILLER                  PIC X(33) VALUE SPACES.
    02  FILLER                  PIC X(19) VALUE "TOTAL SALES       :".
    02  Prn-Total-Sales         PIC BBBBBBZZ,ZZ9.


01  Total-Qty-Sold-Line.
    02  FILLER                  PIC X(33) VALUE SPACES.
    02  FILLER                  PIC X(19) VALUE "TOTAL QTY SOLD    :".
    02  Prn-Total-Qty-Sold      PIC BBBBBZZZ,ZZ9.

01  Total-Sales-Value-Line.
    02  FILLER                  PIC X(33) VALUE SPACES.
    02  FILLER                  PIC X(19) VALUE "TOTAL SALES VALUE :".
    02  Prn-Total-Sales-Value   PIC B$$$$,$$9.99.

01  Cust-Totals.
    02  Cust-Sales              PIC 999.
    02  Cust-Qty-Sold           PIC 9(5).
    02  Cust-Sales-Value        PIC 9(5)V99.

01  Final-Totals.
    02  Total-Sales             PIC 9(5)    VALUE ZEROS.
    02  Total-Qty-Sold          PIC 9(6)    VALUE ZEROS.
    02  Total-Sales-Value       PIC 9(6)V99 VALUE ZEROS.

01  Temp-Variables.
    02  Sale-Qty-Sold           PIC 99999.
    02  Value-Of-Sale           PIC 999999V99. 
    02  Prev-Cust-Id            PIC X(5).

PROCEDURE DIVISION.
Produce-Summary-Report.
    SORT Work-File ON ASCENDING WF-Cust-Name
         INPUT PROCEDURE IS Select-Essential-Oils
         OUTPUT PROCEDURE IS Print-Summary-Report.

    STOP RUN. 

Select-Essential-Oils.
    OPEN INPUT Sales-File.
    READ Sales-File
        AT END SET End-Of-Sales-File TO TRUE
    END-READ.
    
    PERFORM UNTIL End-Of-Sales-File
        IF Essential-Oil 
            RELEASE Work-Rec FROM Sales-Rec
        END-IF
        READ Sales-File
            AT END SET End-Of-Sales-File TO TRUE
        END-READ
    END-PERFORM.

    CLOSE Sales-File.

Print-Summary-Report.
    OPEN OUTPUT Summary-Report.
    OPEN OUTPUT Sorted-File.
    WRITE Print-Line FROM Report-Heading-Line AFTER ADVANCING 1 LINE.
    WRITE Print-Line FROM Report-Heading-Underline AFTER ADVANCING 1 LINE.
    WRITE Print-Line FROM Topic-Heading-Line AFTER ADVANCING 3 LINES.

    RETURN Work-File
        AT END SET End-Of-Work-File TO TRUE
    END-RETURN.

    PERFORM Print-Customer-Lines UNTIL End-Of-Work-File


    MOVE Total-Sales TO Prn-Total-Sales.
    WRITE Print-Line FROM Total-Sales-Line AFTER ADVANCING 3 LINES.

    MOVE Total-Qty-Sold TO Prn-Total-Qty-Sold.
    WRITE Print-Line FROM Total-Qty-Sold-Line AFTER ADVANCING 2 LINES.

    MOVE Total-Sales-Value TO Prn-Total-Sales-Value.
    WRITE Print-Line FROM Total-Sales-Value-Line AFTER ADVANCING 2 LINES.

    CLOSE Summary-Report, Sorted-File.

Print-Customer-Lines.
    MOVE ZEROS TO Cust-Totals.
    MOVE WF-Cust-Id TO Prn-Cust-Id, Prev-Cust-Id.
    MOVE WF-Cust-Name TO Prn-Cust-Name.

    PERFORM UNTIL WF-Cust-Id NOT = Prev-Cust-Id
        WRITE Sorted-Rec FROM Work-Rec
        ADD 1 TO Cust-Sales, Total-Sales

        COMPUTE Sale-Qty-Sold = WF-Unit-Size * WF-Units-Sold
        ADD Sale-Qty-Sold TO Cust-Qty-Sold, Total-Qty-Sold

        COMPUTE Value-Of-Sale = Sale-Qty-Sold * Oil-Cost(WF-Oil-Num)
        ADD Value-Of-Sale TO Cust-Sales-Value, Total-Sales-Value
        
        RETURN Work-File
            AT END SET End-Of-Work-File TO TRUE
        END-RETURN
    END-PERFORM.

    MOVE Cust-Sales TO Prn-Cust-Sales.
    MOVE Cust-Qty-Sold TO Prn-Qty-Sold.
    MOVE Cust-Sales-Value TO Prn-Sales-Value.

    WRITE Print-Line FROM Cust-Sales-Line AFTER ADVANCING 2 LINES.
 


    
