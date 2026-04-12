      $ SET SOURCEFORMAT"FREE"
IDENTIFICATION DIVISION.
PROGRAM-ID.  GetCustomerAddress IS INITIAL.
AUTHOR.  Michael Coughlan.
*This is a stub program.  It is intended only to test the 
*program that calls it.  For a restricted set of 
*inputs it returns restricted outputs.

DATA DIVISION.
LINKAGE SECTION.
01  Customer-Id.
    02  FILLER    PIC X.
    02  CustNum   PIC X(4).
01  Cust-Address  PIC X(40).

PROCEDURE DIVISION USING Customer-Id, Cust-Address.
Begin.
    EVALUATE CustNum
      WHEN 1234 MOVE "13 Disk Drive, Castletroy, Limerick, IE"
                 TO Cust-Address
      WHEN 2345 MOVE "13 Link Straat, Amsterdam, NL"
                 TO Cust-Address
      WHEN 3456 MOVE "The Willows, Little Town, Arkansas, US"
                 TO Cust-Address
      WHEN OTHER DISPLAY "Error in GetCustAddress"
    END-EVALUATE.
    EXIT PROGRAM.

