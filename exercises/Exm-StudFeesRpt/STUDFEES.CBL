      $ SET SOURCEFORMAT"FREE"
IDENTIFICATION DIVISION.
PROGRAM-ID.  DP196-93-Repeat-Exam.
AUTHOR.  Michael Coughlan.


ENVIRONMENT DIVISION.
INPUT-OUTPUT SECTION.
FILE-CONTROL.
    SELECT Student-Payment-File ASSIGN TO "STUDPAY.DAT"
        ORGANIZATION IS LINE SEQUENTIAL.
    SELECT Print-File ASSIGN TO "FEES.RPT".
    SELECT Student-Master-File ASSIGN TO "STUDMAST.DAT"
        ORGANIZATION IS INDEXED
        ACCESS MODE IS DYNAMIC
        RECORD KEY IS SM-Student-Number
        ALTERNATE RECORD KEY IS SM-Student-Name
             WITH DUPLICATES
        FILE STATUS IS SM-File-Status.
        


DATA DIVISION.
FILE SECTION.
FD  Student-Payment-File.
01  SP-Rec.
    88  End-Of-SPF      VALUE HIGH-VALUES.
    02  SP-Student-Number               PIC 9(7).
    02  SP-Payment                      PIC 9(4)V99.

FD  Print-File.
01  Print-Line                          PIC X(76).


FD  Student-Master-File.
01  SM-Rec.
    88  End-Of-SMF      VALUE HIGH-VALUES.
    02  SM-Student-Number               PIC 9(7).
    02  SM-Student-Name                 PIC X(30).
    02  FILLER                          PIC X(5).
    02  SM-Fees-Owed                    PIC 9(4).
    02  SM-Amount-Paid                  PIC 9(4)V99.



WORKING-STORAGE SECTION.
01  Heading1.
    02  FILLER                          PIC X(24)  VALUE SPACES.
    02  FILLER                          PIC X(25)
              VALUE "OUTSTANDING  FEES  REPORT".

01  Heading2.
    02  FILLER                          PIC X(23) VALUE SPACES.
    02  FILLER                          PIC X(27) VALUE ALL "-".

01  Heading3.
    02  FILLER                          PIC X(30) VALUE " STUDENT  NAME".
    02  FILLER                          PIC X(14) VALUE "STUDENT NO.".
    02  FILLER                          PIC X(9)  VALUE "FEES".
    02  FILLER                          PIC X(12) VALUE "AMT PAID".
    02  FILLER                          PIC X(11) VALUE "AMT OUTSTND".

01  Detail-Line.
    02  Prn-Student-Name                PIC X(30).
    02  Prn-Student-Number              PIC BBX(7).
    02  Prn-Fees                        PIC BBBBB$$,$$9.
    02  Prn-Amt-Paid                    PIC BBB$$,$$9.99.
    02  Prn-Amt-Outstnd                 PIC BBB$$,$$9.99.

01  Final-Total-Line.
    02  FILLER                          PIC X(41) VALUE SPACES.
    02  FILLER                          PIC X(20) VALUE "TOTAL OUTSTANDING = ".
    02  Prn-Total-Outstnd               PIC $$,$$$,$$9.99.

01  Miscellaneous-Items.
    02  Total-Outstanding               PIC 9(7)V99 VALUE ZEROS.
    02  SM-File-Status                  PIC XX.
    02  Amount-Outstanding              PIC 9(4)V99.
   
PROCEDURE DIVISION.
Update-And-Report.
    OPEN I-O Student-Master-File.
    OPEN INPUT Student-Payment-File.
    OPEN OUTPUT Print-File. 
    READ Student-Payment-File
        AT END SET End-Of-SPF TO TRUE
    END-READ.
    PERFORM Update-Master-File UNTIL End-OF-SPF.
    MOVE SPACES TO Print-Line.
    WRITE Print-Line AFTER ADVANCING PAGE.
    WRITE Print-Line FROM Heading1 AFTER ADVANCING 1 LINE.
    WRITE Print-Line FROM Heading2 AFTER ADVANCING 1 LINE.
    WRITE Print-Line FROM Heading3 AFTER ADVANCING 3 LINES.
    MOVE SPACES TO Print-Line.
    WRITE Print-Line AFTER ADVANCING 1 LINE.

    MOVE LOW-VALUES TO SM-Student-Name.
    START Student-Master-File
        KEY IS GREATER THAN SM-Student-Name
        INVALID KEY DISPLAY "Start Error FS = " SM-File-Status
    END-START.
    READ Student-Master-File NEXT RECORD
        AT END SET End-Of-SMF TO TRUE
    END-READ.
    PERFORM Print-Outstanding-Fees-Rpt UNTIL End-OF-SMF.
    MOVE Total-Outstanding TO Prn-Total-Outstnd.
    WRITE Print-Line FROM Final-Total-Line AFTER ADVANCING 3 LINES.
    CLOSE Student-Master-File, Print-File, Student-Payment-File.
    STOP RUN.


Update-Master-File.
    MOVE SP-Student-Number TO SM-Student-Number.
    READ Student-Master-File
        KEY IS SM-Student-Number
        INVALID KEY DISPLAY "invalid read FS = " SM-File-Status
    END-READ.
    ADD SP-Payment TO SM-Amount-Paid.
    REWRITE SM-Rec
        INVALID KEY DISPLAY "Rewrite error fs = " SM-File-Status
    END-REWRITE.
    READ Student-Payment-File
        AT END SET End-Of-SPF TO TRUE
    END-READ.
 
  
Print-Outstanding-Fees-Rpt.
    IF SM-Amount-Paid LESS THAN SM-Fees-Owed 
        SUBTRACT SM-Amount-Paid FROM SM-Fees-Owed GIVING Amount-Outstanding
        ADD Amount-Outstanding TO Total-Outstanding
        MOVE SM-Student-Name TO Prn-Student-Name
        MOVE SM-Student-Number TO Prn-Student-Number
        MOVE SM-Fees-Owed TO Prn-Fees
        MOVE SM-Amount-Paid TO Prn-Amt-Paid
        MOVE Amount-Outstanding TO Prn-Amt-Outstnd
        WRITE Print-Line FROM Detail-Line
               AFTER ADVANCING 1 LINE
    END-IF.
    READ Student-Master-File NEXT RECORD
         AT END SET End-Of-SMF TO TRUE
    END-READ.

