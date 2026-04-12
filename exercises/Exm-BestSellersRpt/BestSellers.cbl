      $ SET SOURCEFORMAT"FREE"
IDENTIFICATION DIVISION.
PROGRAM-ID.  BestSellers.
AUTHOR.  MICHAEL COUGHLAN.
ENVIRONMENT DIVISION.
INPUT-OUTPUT SECTION.
FILE-CONTROL.
    SELECT BookMasterFile ASSIGN TO "BOOKMF.DAT"
              ORGANIZATION IS LINE SEQUENTIAL.

    SELECT BookSalesFile ASSIGN TO "BOOKSALES.DAT"
               ORGANIZATION IS LINE SEQUENTIAL.

    SELECT WorkFile ASSIGN TO "TEMP.DAT".

    SELECT ReportFile ASSIGN TO "BSLIST.RPT"
               ORGANIZATION IS LINE SEQUENTIAL.

DATA DIVISION.
FILE SECTION.
FD  BookMasterFile.
01  BMF-Record.
    02 BMF-BookNum        PIC X(5).
    02 BMF-BookTitle      PIC X(25).
    02 BMF-AuthorName     PIC X(25).

FD  BookSalesFile.
01  BSF-Record.
    88 EndOfBSF VALUE HIGH-VALUES.
    02 BSF-BookNum        PIC X(5).
    02 BSF-Copies         PIC 99.
    02 BSF-SaleStatus     PIC X.
       88    NormalSale VALUE "N".

FD ReportFile.
01  PrintLine             PIC X(75).

                
SD WorkFile.
01  WorkRec.
    88 EndOfWorkFile VALUE HIGH-VALUES.
    02 W-BookNum          PIC X(5).
    02 W-Copies           PIC 99.
    02 FILLER             PIC X.


WORKING-STORAGE SECTION.
01  Heading1.
    02 FILLER             PIC X(20) VALUE SPACES.
    02 FILLER             PIC X(31)
       VALUE "FOLIO SOCIETY BEST SELLERS LIST".

01  Heading2.
    02 FILLER             PIC X(19) VALUE SPACES.
    02 FILLER             PIC X(33) VALUE ALL "-".

01  Heading3.
    02 FILLER             PIC X(7) VALUE " RANK".
    02 FILLER             PIC X(17) VALUE "BOOK NO.".
    02 FILLER             PIC X(26) VALUE "BOOK TITLE".
    02 FILLER             PIC X(20) VALUE "AUTHOR NAME".
    02 FILLER             PIC X(5)  VALUE "SALES".

01  Footing-Line.
    02 FILLER             PIC X(25) VALUE SPACES.
    02 FILLER             PIC X(21) VALUE "*** END OF REPORT ***".

01  Book-Rank-Line.
    02 PrnRank            PIC ZZ9.
    02 FILLER             PIC X VALUE ".".
    02 FILLER             PIC X(4) VALUE SPACES. 
    02 PrnBookNum         PIC 9(5).
    02 PrnBookTitle       PIC BBBX(25).
    02 PrnAuthorName      PIC BBX(25).
    02 PrnSales           PIC BBZ,ZZ9.

01  Book-Rank-TABLE.
    02 BookDetails OCCURS 11 TIMES.
       03 BookNum         PIC 9(5).
       03 BookTitle       PIC X(25).
       03 AuthorName      PIC X(25).
       03 BookSales       PIC 9(4) VALUE ZEROS.

01  Rank                  PIC 99.
01  PrevBookNum           PIC X(5).
01  BookSalesTotal        PIC 9(4).


PROCEDURE DIVISION.
BEGIN.
    SORT WorkFile ON ASCENDING KEY W-BookNum
        INPUT PROCEDURE IS Select-NormalSales
        OUTPUT PROCEDURE IS PrintBestSellersList.
    STOP RUN.

Select-NormalSales.    
    OPEN INPUT BookSalesFile.
    READ BookSalesFile
        AT END SET EndOfBSF TO TRUE
    END-READ
    PERFORM UNTIL EndOfBSF
       IF NormalSale 
        RELEASE WorkRec FROM BSF-Record
       END-IF     
       READ BookSalesFile
        AT END SET EndOfBSF TO TRUE
       END-READ
    END-PERFORM
    CLOSE BookSalesFile.
        

PrintBestSellersList.
    OPEN INPUT BookMasterFile
    OPEN OUTPUT ReportFile

    WRITE PrintLine FROM Heading1 AFTER ADVANCING PAGE.
    WRITE PrintLine FROM Heading2 AFTER ADVANCING 1 LINE.
    WRITE PrintLine FROM Heading3 AFTER ADVANCING 3 LINES.

    RETURN WorkFile
        AT END SET EndOfWorkfile TO TRUE
    END-RETURN

    PERFORM GetBookRankings UNTIL EndOfWorkfile

    PERFORM PrintBookRankings
        VARYING Rank FROM 1 BY 1 UNTIL Rank > 10

    WRITE PrintLine FROM Footing-Line AFTER ADVANCING 3 LINES.

    CLOSE ReportFile, 
          BookMasterFile.

    
PrintBookRankings.
    MOVE Rank TO PrnRank
    MOVE BookNum(Rank) TO PrnBookNum
    MOVE BookTitle(Rank) TO PrnBookTitle
    MOVE AuthorName(Rank) TO PrnAuthorName
    MOVE BookSales(Rank) TO PrnSales
    WRITE PrintLine FROM Book-Rank-Line 
        AFTER ADVANCING 2 LINES. 

GetBookRankings.
    MOVE W-BookNum TO PrevBookNum
    MOVE ZEROS TO BookSalesTotal
    PERFORM UNTIL W-BookNum NOT EQUAL TO PrevBookNum
            OR EndOfWorkfile
       ADD W-Copies TO BookSalesTotal
       RETURN WorkFile
        AT END SET EndOfWorkfile TO TRUE
        END-RETURN
     END-PERFORM

    PERFORM WITH TEST AFTER UNTIL BMF-BookNum = PrevBookNum
       READ BookMasterFile
        AT END DISPLAY "IN C-B-R END-OF-BMF ENCOUNTERED"
       END-READ
    END-PERFORM

    PERFORM CheckBookRank
         VARYING Rank FROM 10 BY -1 UNTIL Rank < 1.
 

CheckBookRank.
    IF BookSalesTotal >= BookSales(Rank) 
        MOVE BookDetails(Rank) TO BookDetails(Rank + 1)
        MOVE BMF-BookNum TO BookNum(Rank)
        MOVE BMF-BookTitle TO BookTitle(Rank)
        MOVE BMF-AuthorName TO AuthorName(Rank)
        MOVE BookSalesTotal TO BookSales(Rank)
    END-IF.
                      
