      $ SET SOURCEFORMAT"FREE"
IDENTIFICATION DIVISION.
PROGRAM-ID.  GetPostage IS INITIAL.
AUTHOR.  Michael Coughlan.
*This is a stub program.  It is intended only to test the 
*program that calls it.  For a restricted set of 
*inputs it returns restricted outputs.

DATA DIVISION.
LINKAGE SECTION.
01  Copy-Postage  PIC 99V99.
01  Country-Code  PIC XX.



PROCEDURE DIVISION USING Country-Code, Copy-Postage.
Begin.
    EVALUATE Country-Code
       WHEN   "IE" MOVE 05.50 TO Copy-Postage
       WHEN   "NL" MOVE 07.25 TO Copy-Postage
       WHEN   "US" MOVE 01.50 TO Copy-Postage
       WHEN OTHER DISPLAY "Error in Get-Postage"
    END-EVALUATE.
    EXIT PROGRAM.

