      $ SET SOURCEFORMAT"FREE"
IDENTIFICATION DIVISION.
PROGRAM-ID.  SFbyMail.
AUTHOR.  Michael Coughlan.
ENVIRONMENT DIVISION.
INPUT-OUTPUT SECTION.
FILE-CONTROL.

    SELECT BookStockFile ASSIGN TO "BookStock.DAT"
        ORGANIZATION IS INDEXED
        ACCESS MODE IS DYNAMIC
        RECORD KEY IS Book-Id-BSF
        ALTERNATE RECORD KEY IS Book-Title-BSF
        ALTERNATE RECORD KEY IS Author-Id-BSF
                  WITH DUPLICATES
        FILE STATUS IS BookStatus.

    SELECT ProcessedOrdersFile ASSIGN TO "ProcessedOrders.DAT"
        ORGANIZATION IS LINE SEQUENTIAL.

    SELECT OrdersFile ASSIGN TO "Orders.DAT"
        ORGANIZATION IS LINE SEQUENTIAL.

DATA DIVISION.
FILE SECTION.
FD  BookStockFile.
01  BookStockRec.
    02  Book-Id-BSF             PIC X(5).
    02  Book-Title-BSF          PIC X(30).
    02  Author-Id-BSF           PIC 9(4).
    02  Qty-In-Stock-BSF        PIC 999.
    02  Copy-Price-BSF          PIC 99V99.

FD  ProcessedOrdersFile.
01  ProcessedOrdersRec.
    02  Order-Number-POF        PIC X(7).
    02  Customer-Id-POF         PIC X(5).
    02  Book-Title-POF          PIC X(30).
    02  Qty-Required-POF        PIC 99.
    02  Title-Cost-POF          PIC 999V99.
    02  Title-Postage-POF       PIC 99V99.

FD  OrdersFile.
01  OrdersRec.
    88 EndOfOrders              VALUE HIGH-VALUES.
    02  Order-Number            PIC X(7).
    02  Customer-Id             PIC X(5).
    02  Book-Details OCCURS 10 TIMES.
        03  Book-Id             PIC X(5).
        03  Qty-Required        PIC 99.

WORKING-STORAGE SECTION.
01  BookStatus                  PIC XX.
01  BookNum                     PIC 99.
01  Copy-Postage                PIC 99V99.
01  Cust-Address                PIC X(40).
01  UnstringPtr                 PIC 99.
    88 EndOfAddress             VALUE 41.
01  Country-Code                PIC XX.



PROCEDURE DIVISION.
Begin.
    OPEN INPUT OrdersFile.
    OPEN I-O BookStockFile.
    OPEN OUTPUT ProcessedOrdersFile.

    READ OrdersFile
        AT END SET EndOfOrders TO TRUE
    END-READ.
    PERFORM Process-Orders UNTIL EndOfOrders
    CLOSE   OrdersFile
            BookStockFile
            ProcessedOrdersFile.
    STOP RUN.


Process-Orders.
    PERFORM GetCopyPostage
    PERFORM VARYING BookNum FROM 1 BY 1
        UNTIL BookNum> 10 OR  Book-Id(BookNum) = SPACES
        MOVE Book-Id(BookNum) TO  Book-Id-BSF
        READ BookStockFile
            KEY is Book-Id-BSF
            INVALID KEY
               DISPLAY "Error in ProcessOrders1"
        END-READ
        IF Qty-Required(BookNum) > Qty-In-Stock-BSF
           MOVE ZEROS TO Qty-Required-POF
         ELSE
           SUBTRACT Qty-Required(BookNum)FROM Qty-In-Stock-BSF
           MOVE Qty-Required(BookNum) TO Qty-Required-POF
           REWRITE BookStockRec
              INVALID KEY DISPLAY "Error ProcessOrders2"
           END-REWRITE
        END-IF
        PERFORM CreateProcessedOrder
    END-PERFORM
    READ OrdersFile
        AT END SET EndOfOrders TO TRUE
    END-READ.

CreateProcessedOrder.
    MOVE Order-Number TO Order-Number-POF
    MOVE Customer-Id TO Customer-ID-POF
    MOVE Book-Title-BSF TO Book-Title-POF
    COMPUTE Title-Cost-POF = Qty-Required-POF * Copy-Price-BSF
    COMPUTE Title-Postage-POF = Qty-Required-POF * Copy-Postage
    WRITE ProcessedOrdersRec.

GetCopyPostage.
    CALL "GetCustomerAddress" USING BY CONTENT Customer-Id
                                    BY REFERENCE Cust-Address
    MOVE 1 TO UnstringPtr
    PERFORM UNTIL EndOfAddress
        UNSTRING Cust-Address
                 Delimited BY "," OR ALL SPACES
                 INTO Country-Code
                 WITH POINTER UnstringPtr
        END-UNSTRING
    END-PERFORM

    CALL "GetPostage" USING BY CONTENT Country-Code
                            BY REFERENCE Copy-Postage.



