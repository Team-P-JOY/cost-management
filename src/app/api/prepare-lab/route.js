import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/oracle";

async function getSemester() {
  return await executeQuery(
    `SELECT SCH_ID, ACADYEAR, SEMESTER 
    FROM CST_SCHYEAR 
    WHERE FLAG_DEL = 0
    ORDER BY ACADYEAR DESC, SEMESTER DESC`
  );
}
export async function GET(req) {
  // const schId = req.nextUrl.searchParams.get("schId");
  const userIdlogin = req.nextUrl.searchParams.get("userIdlogin");
  const userlogin = req.nextUrl.searchParams.get("userlogin");
  console.log("userlogin", userlogin);
  console.log("userIdlogin", userIdlogin);
  let sql;
  let sql2;
  let personId1 = "";
  if (userlogin === "หัวหน้าบทปฏิบัติการ") {
    sql = `INNER JOIN CST_LABJOB LB ON L.LAB_ID = LB.LAB_ID`;
    sql2 = `AND LB.PERSON_ID = ${userIdlogin}`;
    personId1 = `,LB.PERSON_ID`;
  } else if (userlogin === "แอดมิน" || userlogin === "หัวหน้าฝ่าย") {
    personId1 = `,L.PERSON_ID`;
    sql = ``;
    sql2 = ``;
  } else if (userlogin === "ผู้ประสานงานรายวิชา") {
    sql = ``;
    sql2 = ``;
    personId1 = `,L.PERSON_ID`;
  }
  try {
    const data = await executeQuery(
      `SELECT 
    L.LAB_ID,
    L.COURSEID,
    MAX(LABGROUP.LABGROUP_NAME) AS LABGROUP_NAME,
    COURSE.COURSEID,
    COURSE.COURSEUNICODE,
    COURSE.COURSEUNIT,
    COURSE.COURSENAME,
    COURSE.COURSENAMEENG,
    SUM(REG.TOTALSEAT) AS TOTALSEAT,
    SUM(REG.ENROLLSEAT) AS ENROLLSEAT,
    MAX(L.USER_CREATED) AS USER_CREATED,    
    L.LABROOM,
    L.SECTION,
    L.HOUR 
    ${personId1}
FROM CST_LABCOURSE L
INNER JOIN PBL_AVSREGCOURSE_V COURSE ON COURSE.COURSEID = L.COURSEID
INNER JOIN CST_SCHYEAR SCH ON SCH.SCH_ID = L.SCH_ID
 LEFT JOIN CST_LABGROUP LABGROUP
            ON L.LABGROUP_ID = LABGROUP.LABGROUP_ID
INNER JOIN PBL_AVSREGCLASS_V REG 
    ON REG.COURSEID = COURSE.COURSEID 
    AND SCH.ACADYEAR = REG.ACADYEAR
    AND SCH.SEMESTER = REG.SEMESTER
    ${sql}
WHERE L.FLAG_DEL = 0
${sql2}
AND L.SCH_ID = :schId 
GROUP BY 
    L.LAB_ID,
    L.COURSEID,
    COURSE.COURSEID,
    COURSE.COURSEUNICODE,
    COURSE.COURSEUNIT,
    COURSE.COURSENAME,
    COURSE.COURSENAMEENG,
    L.LABROOM,
    L.SECTION,
    L.HOUR,
    L.PERSON_ID
    ${personId1}
HAVING SUM(REG.TOTALSEAT) > 0`,
      { schId: req.nextUrl.searchParams.get("schId") } // Correct JSON object structure
    );

    // const faculty = await getFaculty();
    // const avs = await getAvs();
    const term = await getSemester();
    return NextResponse.json({
      success: true,
      data: data,
      term: term,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Database Error", error },
      { status: 500 }
    );
  }
}
