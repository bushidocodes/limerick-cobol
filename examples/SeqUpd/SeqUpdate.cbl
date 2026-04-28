       >>SOURCE FORMAT IS FREE
IDENTIFICATION DIVISION.
PROGRAM-ID. SeqUpdate.
AUTHOR. Michael Coughlan.
*> This program updates the Students.Dat file using the
*> course-transfer transactions in Transfer.Dat to create
*> a new file - Students.New - which contains the updated
*> records.
*>
*> Both the master file and the transaction file are
*> sequential files held in ascending StudentId order, and
*> there is at most one transaction per student.
*>
*> The program detects two error conditions:
*>    1) A transaction StudentId with no matching record in
*>       the student file.
*>    2) A transaction whose OldCourseCode does not match the
*>       CourseCode currently held in the student record.

ENVIRONMENT DIVISION.
INPUT-OUTPUT SECTION.
FILE-CONTROL.
    SELECT StudentFile ASSIGN TO "STUDENTS.DAT"
        ORGANIZATION IS LINE SEQUENTIAL.

    SELECT TransferFile ASSIGN TO "Transfer.dat"
        ORGANIZATION IS LINE SEQUENTIAL.

    SELECT NewStudentFile ASSIGN TO "Students.New"
        ORGANIZATION IS LINE SEQUENTIAL.


DATA DIVISION.
FILE SECTION.
FD StudentFile.
01 StudentDetails.
   88 EndOfStudentFile     VALUE HIGH-VALUES.
   02 StudentId            PIC 9(7).
   02 StudentName.
      03 Surname           PIC X(8).
      03 Initials          PIC XX.
   02 DateOfBirth.
      03 YOBirth           PIC 9(4).
      03 MOBirth           PIC 9(2).
      03 DOBirth           PIC 9(2).
   02 CourseCode           PIC X(4).
   02 Gender               PIC X.

FD TransferFile.
01 TransferDetails.
   88 EndOfTransferFile    VALUE HIGH-VALUES.
   02 TransStudentId       PIC 9(7).
   02 OldCourseCode        PIC X(4).
   02 NewCourseCode        PIC X(4).

FD NewStudentFile.
01 NewStudentDetails       PIC X(30).


PROCEDURE DIVISION.
Begin.
    OPEN INPUT  StudentFile
                TransferFile
         OUTPUT NewStudentFile

    READ StudentFile
       AT END SET EndOfStudentFile TO TRUE
    END-READ

    READ TransferFile
       AT END SET EndOfTransferFile TO TRUE
    END-READ

    PERFORM UNTIL EndOfStudentFile AND EndOfTransferFile
       EVALUATE TRUE
          WHEN TransStudentId < StudentId
             DISPLAY "Error - Transaction " TransStudentId
                     " has no matching student record"
             READ TransferFile
                AT END SET EndOfTransferFile TO TRUE
             END-READ

          WHEN TransStudentId = StudentId
             IF OldCourseCode = CourseCode
                MOVE NewCourseCode TO CourseCode
             ELSE
                DISPLAY "Error - Transaction " TransStudentId
                        " OldCourseCode " OldCourseCode
                        " does not match student CourseCode "
                        CourseCode
             END-IF
             WRITE NewStudentDetails FROM StudentDetails
             READ StudentFile
                AT END SET EndOfStudentFile TO TRUE
             END-READ
             READ TransferFile
                AT END SET EndOfTransferFile TO TRUE
             END-READ

          WHEN TransStudentId > StudentId
             WRITE NewStudentDetails FROM StudentDetails
             READ StudentFile
                AT END SET EndOfStudentFile TO TRUE
             END-READ
       END-EVALUATE
    END-PERFORM

    CLOSE StudentFile
          TransferFile
          NewStudentFile
    STOP RUN.
