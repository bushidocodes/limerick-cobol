      $ SET SOURCEFORMAT"FREE"
IDENTIFICATION DIVISION.
PROGRAM-ID.  GettingStarted.
AUTHOR.  Michael Coughlan.
* This program should accept two numbers from the user, multiply them together
* and then display the result.  Unfortunately it does not work correctly.
* Re-write the program so that it prompts the user for input and displays
* the correct result.


DATA DIVISION.

WORKING-STORAGE SECTION.
01  Num1                                PIC 9  VALUE ZEROS.
01  Num2                                PIC 9  VALUE ZEROS.
01  Result                              PIC 99 VALUE ZEROS.

PROCEDURE DIVISION.
Calc-Result.
    ACCEPT Num1.
    MULTIPLY Num1 BY Num2 GIVING Result.
    ACCEPT Num2.
    DISPLAY "Result is = ", Result.
    STOP RUN.
