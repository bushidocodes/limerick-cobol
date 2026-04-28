IDENTIFICATION DIVISION.
PROGRAM-ID.  ReadingIndexedFile.
AUTHOR.  Michael Coughlan.
*> Sequential reading of an indexed file

ENVIRONMENT DIVISION.
INPUT-OUTPUT SECTION.
FILE-CONTROL.
   SELECT VideoFile ASSIGN TO "VIDEO.DAT"
          ORGANIZATION IS INDEXED
          ACCESS MODE IS DYNAMIC
          RECORD KEY IS VideoCode
          ALTERNATE RECORD KEY IS VideoTitle
               WITH DUPLICATES
          FILE STATUS IS VideoStatus.

      

DATA DIVISION.
FILE SECTION.
FD VideoFile.
01 VideoRecord.
   88 EndOfFile VALUE HIGH-VALUE.
   02 VideoCode               PIC 9(5).
   02 VideoTitle              PIC X(40).
   02 SupplierCode            PIC 99.

WORKING-STORAGE SECTION.
01   VideoStatus              PIC X(2).

01   RequiredSequence         PIC 9.
     88 VideoCodeSequence    VALUE 1.
     88 VideoTitleSequence   VALUE 2.
           
01 PrnVideoRecord.
   02 PrnVideoCode           PIC 9(5).
   02 PrnVideoTitle          PIC BBBBX(40).
   02 PrnSupplierCode        PIC BBBB99.
 
PROCEDURE DIVISION.
Begin.
   OPEN INPUT VideoFile.

   DISPLAY "Enter key : 1=VideoCode, 2=VideoTitle ->"
      WITH NO ADVANCING.
   ACCEPT RequiredSequence.

   IF VideoTitleSequence
      MOVE SPACES TO VideoTitle
      START VideoFile KEY IS GREATER THAN VideoTitle
         INVALID KEY  DISPLAY "VIDEO STATUS :- ", VideoStatus
      END-START
   END-IF   

   READ VideoFile NEXT RECORD 
      AT END SET EndOfFile TO TRUE
   END-READ.
   PERFORM UNTIL EndOfFile
      MOVE VideoCode TO PrnVideoCode
      MOVE VideoTitle TO PrnVideoTitle
      MOVE SupplierCode TO PrnSupplierCode
      DISPLAY  PrnVideoRecord
      READ VideoFile NEXT RECORD 
         AT END SET EndOfFile TO TRUE
      END-READ
   END-PERFORM.

   CLOSE VideoFile.
   STOP RUN.


*> RUN OF INDEX-EG2.EXE USING VIDEOCODE KEY
*> Enter key : 1=VideoCode, 2=VideoTitle ->1
*> 00121  FLIGHT OF THE CONDOR, THE     03
*> 00333  PREDATOR                      02
*> 00444  LIVING EARTH, THE             03
*> 01001  COMMANDO                      02
*> 01100  ROBOCOP                       01
*> 02001  LEOPARD HUNTS IN DARKNESS, A  03
*> 02121  DIRTY DANCING                 04
*> 03031  COMPETENT CREW                05
*> 03032  YACHT MASTER                  05
*> 04041  OPEN OCEAN SAILING            05
*> 04042  PRINCESS BRIDE, THE           06
*> 04444  LIFE ON EARTH                 03
*> 05051  OVERBOARD                     01
*> 06061  HOPE AND GLORY                07
*> 07071  AMONG THE WILD CHIMPANZEES    03
*> 08081  WHALE NATION                  03
*> 09091  BESTSELLER                    07
*> 10001  WICKED WALTZING               04
*> 11111  TERMINATOR, THE               02
*> 13301  MASSACRE AT MASAI MARA        03
*> 14032  KNOTTY PROBLEMS FOR SAILORS   05
*> 17001  ALIEN                         07
*> 17002  ALIENS                        07
*> 17041  GARFIELD TAKES A HIKE         06
*> 18001  SURVIVING THE STORM           05
*> 19444  PINOCCIO                      02


*> RUN OF INDEX-EG2 USING VIDEOTITLE KEY
*> Enter key : 1=VideoCode, 2=VideoTitle ->2 
*> 17001  ALIEN                         07
*> 17002  ALIENS                        07
*> 07071  AMONG THE WILD CHIMPANZEES    03
*> 09091  BESTSELLER                    07
*> 01001  COMMANDO                      02
*> 03031  COMPETENT CREW                05
*> 02121  DIRTY DANCING                 04
*> 00121  FLIGHT OF THE CONDOR, THE     03
*> 17041  GARFIELD TAKES A HIKE         06
*> 06061  HOPE AND GLORY                07
*> 14032  KNOTTY PROBLEMS FOR SAILORS   05
*> 02001  LEOPARD HUNTS IN DARKNESS, A  03
*> 04444  LIFE ON EARTH                 03
*> 00444  LIVING EARTH, THE             03
*> 13301  MASSACRE AT MASAI MARA        03
*> 04041  OPEN OCEAN SAILING            05
*> 05051  OVERBOARD                     01
*> 19444  PINOCCIO                      02
*> 00333  PREDATOR                      02
*> 04042  PRINCESS BRIDE, THE           06
*> 01100  ROBOCOP                       01
*> 18001  SURVIVING THE STORM           05
*> 11111  TERMINATOR, THE               02
*> 08081  WHALE NATION                  03
*> 10001  WICKED WALTZING               04
*> 03032  YACHT MASTER                  05

