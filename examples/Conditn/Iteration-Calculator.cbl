       >>SOURCE FORMAT IS FREE
IDENTIFICATION DIVISION.
PROGRAM-ID.  Iteration-Calculator.
AUTHOR.  Michael Coughlan.
*> This program accepts two numbers and an operator from the user and
*> depending on the type of the operator either adds the numbers or
*> multiplies them together and displays the result.  It does this three times.
*> No error checking is done.


DATA DIVISION.
WORKING-STORAGE SECTION.
01  Num1           PIC 9  VALUE ZEROS.
01  Num2           PIC 9  VALUE ZEROS.
01  Result         PIC 99 VALUE ZEROS.
01  Operator       PIC X  VALUE SPACE.

PROCEDURE DIVISION.
Calculator.
    PERFORM 3 TIMES
       DISPLAY "Enter First Number      : " WITH NO ADVANCING
       ACCEPT Num1
       DISPLAY "Enter Second Number     : " WITH NO ADVANCING
       ACCEPT Num2
       DISPLAY "Enter operator (+ or *) : " WITH NO ADVANCING
       ACCEPT Operator
       IF Operator = "+" THEN
          COMPUTE Result = Num1 + Num2
       END-IF
       IF Operator = "*" THEN
          COMPUTE Result = Num1 * Num2
       END-IF
       DISPLAY "Result is = ", Result
    END-PERFORM.
    STOP RUN.
