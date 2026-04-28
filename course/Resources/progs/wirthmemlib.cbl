       >>SOURCE FORMAT IS FREE
IDENTIFICATION DIVISION.
PROGRAM-ID.   WirthMemLib.
AUTHOR.  MICHAEL COUGHLAN.

ENVIRONMENT DIVISION.
INPUT-OUTPUT SECTION.
FILE-CONTROL.
    SELECT BookFile ASSIGN TO "BOOKS.DAT"
        ORGANIZATION IS INDEXED
        ACCESS MODE IS DYNAMIC
        RECORD KEY IS BookNumber
        ALTERNATE RECORD KEY IS AuthorNumber 
                            WITH DUPLICATES    
        FILE STATUS IS BookErrorStatus.

    SELECT AuthorFile ASSIGN TO "AUTHOR.DAT"
        ORGANIZATION IS INDEXED
        
        ACCESS MODE IS DYNAMIC
        RECORD KEY IS AuthorNum
        ALTERNATE RECORD KEY IS AgentName
                          WITH DUPLICATES
        FILE STATUS IS AuthorErrorStatus.

    SELECT PrintFile ASSIGN TO "REPORT.EXM".


DATA DIVISION.
FILE SECTION.    
FD  BookFile.
01  BookRec.
    88 EndOfBookFile     VALUE HIGH-VALUES.
    88 NotEndOfBookFile  VALUE LOW-VALUES.
    02 BookNumber            PIC X(7).
    02 BookName              PIC X(25).
    02 AuthorNumber          PIC 9(7).
    02 RoyaltyRate           PIC V999.
    02 QtrBorrowings         PIC 999.

FD  AuthorFile.
01  AuthorRec.    
    88 EndOfAuthorFile   VALUE HIGH-VALUES.
    02 AuthorNum             PIC X(7).
    02 AuthorName            PIC X(25).
    02 AgentName             PIC X(25).

FD  PrintFile.
01  PrintLine                PIC X(130).


WORKING-STORAGE SECTION.
01  ErrorStates.
    02  BookErrorStatus      PIC X(2).
        88 RecordAlreadyExists   VALUE "22".
        88 RecordDoesNotExist    VALUE "23".
    02  AuthorErrorStatus    PIC X(2).
        88 RecordAlreadyExists    VALUE "22".
        88 RecordDoesNotExist    VALUE "23".

01  IntermediateVariables.
    02 BookRoyalty           PIC 9(3)V99.
    02 QtrAuthorBorrows      PIC 9(4).
    02 AuthorRoyalties       PIC 9(4)V99.
    02 AgentPayment          PIC 9(6)V99.
    02 PrevAuthor            PIC 9(7).
    02 PrevAgent             PIC X(25).

01  ReportLines.
    02 ReportHeader.
       03 FILLER             PIC X(37) VALUE SPACES.
       03 FILLER             PIC X(24) VALUE "ROYALTY  PAYMENT  REPORT".
    02 Under-Line.
       03 FILLER             PIC X(36) VALUE SPACES.
       03 FILLER             PIC X(25) VALUE ALL "-".
    02 FieldHeaders.
       03 FILLER             PIC X(9) VALUE SPACES.
       03 FILLER             PIC X(5) VALUE "AGENT".
       03 FILLER             PIC X(21) VALUE SPACES.
       03 FILLER             PIC X(6) VALUE "AUTHOR".
       03 FILLER             PIC X(20) VALUE SPACES.
       03 FILLER             PIC X(4) VALUE "BOOK".
       03 FILLER             PIC X(16) VALUE SPACES.
       03 FILLER             PIC X(7) VALUE "QTR.BRW".
       03 FILLER             PIC X(9) VALUE "  ROYALTY".
    02 BookLine.
       03 AgentNamePrn       PIC X(25).
       03 AuthorNamePrn      PIC BBX(25).
       03 BookNamePrn        PIC BBX(25).
       03 BookQtrBorrowsPrn  PIC BBBBZZ9.
       03 BookRoyaltyPrn     PIC BBBB$$$9.99.
    02 AuthorLines.
       03 QtrBorrowsLine.
          04 FILLER          PIC X(54) VALUE SPACES.
          04 FILLER          PIC X(36) VALUE "QUARTER BORROWINGS FOR THIS AUTHOR =".
          04 QtrBorrowsPrn   PIC BBBBBZ,ZZ9.
       03 QtrRoyaltiesLine.
          04 FILLER          PIC X(54) VALUE SPACES.
          04 FILLER          PIC X(36) VALUE "ROYALTIES OWED TO THIS AUTHOR      =".
          04 QtrRoyaltiesPrn PIC B$$,$$9.99.
    02 AgentLine.
       03 FILLER             PIC X(55) VALUE SPACES.
       03 FILLER             PIC X(33) VALUE "AMOUNT TO BE PAID TO THIS AGENT =".
       03 AgentRoyaltiesPrn  PIC B$$$$,$$9.99.



PROCEDURE DIVISION.
Begin.
    OPEN  I-O  BookFile.
    OPEN  I-O AuthorFile.
    OPEN OUTPUT PrintFile.

    MOVE SPACES TO PrintLine.
    WRITE PrintLine AFTER ADVANCING PAGE.
    WRITE PrintLine FROM ReportHeader AFTER ADVANCING 1  LINE.
    WRITE PrintLine FROM Under-Line AFTER ADVANCING 1 LINE.
    WRITE PrintLine FROM FieldHeaders AFTER ADVANCING 3 LINES.
    MOVE SPACES TO PrintLine.
    WRITE PrintLine AFTER ADVANCING 1 LINE.

    MOVE SPACES TO AgentName.
    START AuthorFile KEY IS GREATER THAN AgentName
        INVALID KEY DISPLAY "OH DEAR SOMETHING WRONG IN BEGIN PARA"
    END-START.
    READ AuthorFile NEXT RECORD 
        AT END SET EndOfAuthorFile TO TRUE
    END-READ.
    PERFORM ProcessAgents UNTIL EndOfAuthorFile.

    CLOSE BookFile.
    CLOSE AuthorFile.
    CLOSE PrintFile.
    STOP RUN.    

ProcessAgents.
    MOVE AgentName TO AgentNamePrn, PrevAgent.
    MOVE ZEROS TO AgentPayment.

    PERFORM ProcessAuthors 
        UNTIL EndOfAuthorFile
            OR AgentName NOT EQUAL TO PrevAgent.

    MOVE AgentPayment TO AgentRoyaltiesPrn.
    WRITE PrintLine FROM AgentLine AFTER ADVANCING 1 LINE.
    MOVE SPACES TO PrintLine.
    WRITE PrintLine AFTER ADVANCING 2 LINES.

ProcessAuthors.
    MOVE ZEROS TO QtrAuthorBorrows, AuthorRoyalties.
    MOVE AuthorNum TO AuthorNumber, PrevAuthor.
    MOVE AuthorName TO AuthorNamePrn.
    READ BookFile 
        KEY IS AuthorNumber
        INVALID KEY
         DISPLAY "ERROR IN ProcessAgents = " BookErrorStatus
    END-READ.
    PERFORM ProcessBooks 
        UNTIL EndOfBookFile 
            OR AuthorNumber NOT EQUAL TO PrevAuthor.
    SET NotEndOfBookFile TO TRUE.

    MOVE QtrAuthorBorrows TO QtrBorrowsPrn.
    MOVE AuthorRoyalties  TO QtrRoyaltiesPrn.
    WRITE PrintLine FROM QtrBorrowsLine AFTER ADVANCING 2 LINES.
    WRITE PrintLine FROM QtrRoyaltiesLine AFTER ADVANCING 1 LINE.
    MOVE SPACES TO PrintLine.
    WRITE PrintLine AFTER ADVANCING 2 LINES.

    READ AuthorFile NEXT RECORD 
        AT END SET EndOfAuthorFile TO TRUE
    END-READ.


ProcessBooks.
    PERFORM ProcessOneBook.
    READ BookFile NEXT RECORD
        AT END SET EndOfBookFile TO TRUE
    END-READ.
    MOVE SPACES TO AuthorNamePrn, AgentNamePrn.

ProcessOneBook.
    MULTIPLY QtrBorrowings BY RoyaltyRate 
        GIVING BookRoyalty ROUNDED.
    ADD QtrBorrowings  TO QtrAuthorBorrows.
    ADD BookRoyalty  TO AuthorRoyalties, AgentPayment.
    MOVE BookName TO BookNamePrn.
    MOVE QtrBorrowings TO BookQtrBorrowsPrn.
    MOVE BookRoyalty TO BookRoyaltyPrn.
    WRITE PrintLine FROM BookLine
             AFTER ADVANCING 1 LINE.

    MOVE ZEROS TO QtrBorrowings.
    REWRITE BookRec
        INVALID KEY
        DISPLAY "REWRITE ProcessOneBook " BookErrorStatus
    END-REWRITE.
