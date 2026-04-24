      $ SET SOURCEFORMAT"FREE"
IDENTIFICATION DIVISION.
PROGRAM-ID.  setup-Repeat-Exam.
AUTHOR.  Michael Coughlan.


ENVIRONMENT DIVISION.
INPUT-OUTPUT SECTION.
FILE-CONTROL.
    SELECT Studs-In-File ASSIGN TO "STUDIN.DAT"
        ORGANIZATION IS LINE SEQUENTIAL.

    SELECT Student-Master-File ASSIGN TO "STUDMAST.DAT"
        ORGANIZATION IS INDEXED
        ACCESS MODE IS DYNAMIC
        RECORD KEY IS SM-Student-Number
        ALTERNATE RECORD KEY IS SM-Student-Name
             WITH DUPLICATES
        FILE STATUS IS SM-File-Status.
        


DATA DIVISION.
FILE SECTION.
FD  Studs-In-File.
01  SP-Rec.
    88  End-Of-SPF      VALUE HIGH-VALUES.
    02  SP-Student-Number               PIC 9(7).
    02  FILLER                          PIC X(45).


FD  Student-Master-File.
01  SM-Rec.
    88  End-Of-SMF      VALUE HIGH-VALUES.
    02  SM-Student-Number               PIC 9(7).
    02  SM-Student-Name                 PIC X(30).
    02  FILLER                          PIC X(5).
    02  SM-Fees-Owed                    PIC 9(4).
    02  SM-Amount-Paid                  PIC 9(4)V99.



WORKING-STORAGE SECTION.
01  Miscellaneous-Items.
    02  Total-Outstanding               PIC 9(7)V99 VALUE ZEROS.
    02  SM-File-Status                  PIC XX.
    02  Amount-Outstanding              PIC 9(4)V99.
   
PROCEDURE DIVISION.
Update-And-Report.
    OPEN OUTPUT Student-Master-File.
    OPEN INPUT Studs-In-File.
    READ Studs-In-File
        AT END SET End-Of-SPF TO TRUE
    END-READ.
    PERFORM Update-Master-File UNTIL End-OF-SPF.

    CLOSE Student-Master-File, Studs-In-File.
    STOP RUN.


Update-Master-File.
    MOVE SP-Student-Number TO SM-Student-Number.
    WRITE SM-Rec FROM SP-Rec
          INVALID KEY DISPLAY "invalid read FS = " SM-File-Status
    END-WRITE.
    READ Studs-In-File
        AT END SET End-Of-SPF TO TRUE
    END-READ.
 

