       >>SOURCE FORMAT IS FREE
IDENTIFICATION DIVISION.
PROGRAM-ID.  SortIP.
AUTHOR.  Michael Coughlan.
*> Reads the Students File (held in ascending StudentId order) and
*> uses the SORT verb with an INPUT PROCEDURE to produce a file
*> sequenced on ascending CourseCode containing only the CourseCode
*> and Gender of each student.  The sorted file is then read
*> sequentially and the number of males and females taking each
*> course is displayed in ascending CourseCode order.

ENVIRONMENT DIVISION.
INPUT-OUTPUT SECTION.
FILE-CONTROL.
    SELECT StudentFile ASSIGN TO "STUDENTS.DAT"
        ORGANIZATION IS LINE SEQUENTIAL.

    SELECT SortedFile ASSIGN TO "SORTED.DAT"
        ORGANIZATION IS LINE SEQUENTIAL.

    SELECT WorkFile ASSIGN TO "WORK.TMP".


DATA DIVISION.
FILE SECTION.
FD StudentFile.
01 StudentRec.
   88 EndOfStudentFile  VALUE HIGH-VALUES.
   02 FILLER            PIC X(25).
   02 SCourseCode       PIC X(4).
   02 SGender           PIC X.

FD SortedFile.
01 SortedRec.
   88 EndOfSortedFile   VALUE HIGH-VALUES.
   02 SortedCourseCode  PIC X(4).
   02 SortedGender      PIC X.
      88 IsFemale       VALUE "F".

SD WorkFile.
01 WorkRec.
   02 WCourseCode       PIC X(4).
   02 WGender           PIC X.

WORKING-STORAGE SECTION.
01 CurrentCourse        PIC X(4) VALUE SPACES.
01 FemaleCount          PIC 9(3) VALUE 0.
01 MaleCount            PIC 9(3) VALUE 0.

01 ReportLine.
   02 FILLER            PIC XX     VALUE SPACES.
   02 RepCourseCode     PIC X(4).
   02 FILLER            PIC X(7)   VALUE SPACES.
   02 RepFemales        PIC ZZ9.
   02 FILLER            PIC X(4)   VALUE SPACES.
   02 RepMales          PIC ZZ9.


PROCEDURE DIVISION.
Begin.
   SORT WorkFile ON ASCENDING KEY WCourseCode
        INPUT PROCEDURE IS GetCourseAndGender
        GIVING SortedFile.

   DISPLAY "CourseCode Females Males"
   OPEN INPUT SortedFile
   READ SortedFile
      AT END SET EndOfSortedFile TO TRUE
   END-READ
   IF NOT EndOfSortedFile
      MOVE SortedCourseCode TO CurrentCourse
   END-IF
   PERFORM UNTIL EndOfSortedFile
      IF SortedCourseCode NOT = CurrentCourse
         PERFORM DisplayCourseTotals
         MOVE SortedCourseCode TO CurrentCourse
         MOVE 0 TO FemaleCount
         MOVE 0 TO MaleCount
      END-IF
      IF IsFemale
         ADD 1 TO FemaleCount
      ELSE
         ADD 1 TO MaleCount
      END-IF
      READ SortedFile
         AT END SET EndOfSortedFile TO TRUE
      END-READ
   END-PERFORM
   IF CurrentCourse NOT = SPACES
      PERFORM DisplayCourseTotals
   END-IF
   CLOSE SortedFile
   STOP RUN.


GetCourseAndGender.
   OPEN INPUT StudentFile
   READ StudentFile
      AT END SET EndOfStudentFile TO TRUE
   END-READ
   PERFORM UNTIL EndOfStudentFile
      MOVE SCourseCode TO WCourseCode
      MOVE SGender     TO WGender
      RELEASE WorkRec
      READ StudentFile
         AT END SET EndOfStudentFile TO TRUE
      END-READ
   END-PERFORM
   CLOSE StudentFile.


DisplayCourseTotals.
   MOVE CurrentCourse TO RepCourseCode
   MOVE FemaleCount   TO RepFemales
   MOVE MaleCount     TO RepMales
   DISPLAY ReportLine.
