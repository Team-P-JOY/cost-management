import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/oracle";

export async function GET(req) {
  try {
    const labjobId = req.nextUrl.searchParams.get("labjobId");
    const labId = req.nextUrl.searchParams.get("labId");
    const sId = req.nextUrl.searchParams.get("sId");
    const divId = req.nextUrl.searchParams.get("divId");
    const userloginId = req.nextUrl.searchParams.get("userloginId");
    const userlogin = req.nextUrl.searchParams.get("userlogin");
    // console.log("🔍 GET API - labjobId:", labjobId);
    // console.log("🔍 GET API - labId:", labId);
    // console.log("🔍 GET API - sId:", sId);
    // console.log("🔍 GET API - sId:", divId);

    let query = `
      SELECT L.*, P.TITLE_NAME || P.FIRST_NAME || ' ' || P.LAST_NAME AS FULLNAME ,P.SUBDIVISION_ID
      FROM CST_LABJOB L
      INNER JOIN PBL_VPER_PERSON P  ON L.PERSON_ID = P.PERSON_ID      
      WHERE L.FLAG_DEL = 0
    `;

    let params = {};

    // ✅ ตรวจสอบว่ามีค่า labjobId หรือไม่
    if (labjobId) {
      query += " AND L.LABJOB_ID = :labjobId";
      params.labjobId = labjobId;
    }

    // ✅ ตรวจสอบว่ามีค่า labId หรือไม่
    if (labId) {
      query += " AND L.LAB_ID = :labId";
      params.labId = labId;
    }
    if (userloginId) {
      query += " AND L.PERSON_ID = :userloginId";
      params.userloginId = userloginId;
    }
    // console.log("SQL Query:", query);
    // console.log("Parameters:", params);
    const data = await executeQuery(query, params);
    // console.log("Data:", data); // Log the data for debugging

    // ดึงข้อมูล labjoblist
    // let labjoblist ;
    let labjoblist2 = `SELECT L.*, P.TITLE_NAME || P.FIRST_NAME || ' ' || P.LAST_NAME AS FULLNAME 
       FROM CST_LABJOB L
       INNER JOIN PBL_VPER_PERSON P 
       ON L.PERSON_ID = P.PERSON_ID
       WHERE L.FLAG_DEL = 0 AND L.LAB_ID = :labId`;
    let params2 = { labId };
    if (userloginId && userlogin === "หัวหน้าบทปฏิบัติการ") {
      labjoblist2 += " AND L.PERSON_ID = :userloginId";
      params2.userloginId = userloginId;
    } else if (userlogin === "แอดมิน") {
      labjoblist2 += " ";
    } else if (userloginId && userlogin === "ผู้ประสานงานรายวิชา") {
      labjoblist2 += " AND L.PERSON_ID = :userloginId";
      params2.userloginId = userloginId;
    }
    const labjoblist = await executeQuery(labjoblist2, params2);
    const listdiv = await executeQuery(
      `SELECT * from PBL_VORG_DIVISION
      WHERE DIVISION_PARENT_ID = 
      (SELECT DIVISION_ID FROM PBL_VPER_PERSON  
       WHERE PERSON_ID = :sId)and DIVISION_STATUS = 1`,
      { sId }
    );
    console.log("labjoblist2", labjoblist2);
    const divperson = await executeQuery(
      `SELECT SUBDIVISION_ID FROM PBL_VPER_PERSON  
       WHERE PERSON_ID = :sId `,
      { sId }
    );
    const listperson = await executeQuery(
      `SELECT PERSON_ID ,TITLE_NAME || FIRST_NAME || ' ' || LAST_NAME AS FULLNAME 
      FROM PBL_VPER_PERSON 
      WHERE SUBDIVISION_ID = :divId
      AND END_DATE IS NULL`,
      { divId }
    );

    // ดึงข้อมูล datacoursa
    const datacourse = await executeQuery(
      `SELECT 
    L.LAB_ID,
    L.COURSEID,
    COURSE.COURSEID AS COURSE_ID,
    REG.COURSEID AS REG_COURSE_ID,
    COURSE.COURSEUNICODE,
    COURSE.COURSEUNIT,
    COURSE.COURSENAME,
    COURSE.COURSENAMEENG,
     SUM(REG.TOTALSEAT) AS TOTALSEAT, 
    SUM(REG.ENROLLSEAT) AS ENROLLSEAT, 
    MAX(SCH.ACADYEAR) AS ACADYEAR,
    MAX(SCH.SEMESTER) AS SEMESTER,
    L.LABROOM,
    L.SECTION AS LAB_SECTION,
    L.HOUR,
    G.LABGROUP_NAME,
    COURSE.DESCRIPTION1
FROM CST_LABCOURSE L
INNER JOIN PBL_AVSREGCOURSE_V COURSE 
    ON COURSE.COURSEID = L.COURSEID      
INNER JOIN CST_SCHYEAR SCH 
    ON SCH.SCH_ID = L.SCH_ID
INNER JOIN CST_LABGROUP G 
    ON G.LABGROUP_ID = L.LABGROUP_ID
INNER JOIN PBL_AVSREGCLASS_V REG 
    ON REG.COURSEID = COURSE.COURSEID 
    AND SCH.ACADYEAR = REG.ACADYEAR
    AND SCH.SEMESTER = REG.SEMESTER
WHERE L.FLAG_DEL = 0 
  AND L.LAB_ID = :labId
GROUP BY 
    L.LAB_ID,
    L.COURSEID,
    COURSE.COURSEID,
    REG.COURSEID,
    COURSE.COURSEUNICODE,
    COURSE.COURSEUNIT,
    COURSE.COURSENAME,
    COURSE.COURSENAMEENG,
    L.LABROOM,
    L.SECTION,
    L.HOUR,
    G.LABGROUP_NAME,
    COURSE.DESCRIPTION1
      `,
      { labId }
    );

    return NextResponse.json(
      {
        success: true,
        data: data,
        listdiv: listdiv,
        listperson: listperson,
        divperson: divperson,
        labjoblist: labjoblist,
        datacourse: datacourse,
      },
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Database Error", error },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { labId, personId, labjobTitle, userCreated } = body;
    if (!labId || !personId || !labjobTitle || !userCreated) {
      return NextResponse.json(
        { success: false, message: "Missing fields" },
        { status: 400 }
      );
    }
    // Fixed the SQL query syntax error
    await executeQuery(
      `INSERT INTO CST_LABJOB (LAB_ID, PERSON_ID, LABJOB_TITLE, USER_CREATED, DATE_CREATED) 
      VALUES (:labId, :personId, :labjobTitle, :userCreated, CURRENT_TIMESTAMP)`, // Removed extra commas
      [labId, personId, labjobTitle, userCreated] // Assuming this is the user creating the record
    );
    return NextResponse.json(
      { success: true, message: "User added successfully" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Database Error", error },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const labjobId = req.nextUrl.searchParams.get("labjobId");
    console.log("labjobIdAPI", labjobId);
    const body = await req.json();
    const { labId, personId, labjobTitle, userCreated } = body; // Use .json() for body parsing in Next.js API routes
    if (!labId || !personId || !labjobTitle || !userCreated) {
      return NextResponse.json(
        { success: false, message: "Missing fields" },
        { status: 400 }
      );
    }
    // Update the labjob record
    const response = await executeQuery(
      `UPDATE CST_LABJOB 
  SET LAB_ID = :labId,PERSON_ID = :personId, LABJOB_TITLE = :labjobTitle, 
  USER_UPDATED = :userCreated, DATE_UPDATED = CURRENT_TIMESTAMP 
  WHERE LABJOB_ID = :labjobId`,
      {
        labjobId,
        labId,
        personId,
        labjobTitle,
        userCreated,
      }
    ).catch((error) => {
      console.error("Database query error:", error.message || error); // Log the error from the database
      throw new Error("Database query failed");
    });

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Database Error", error },
      { status: 500 }
    );
  }
}
export async function DELETE(req) {
  try {
    const labjobId = req.nextUrl.searchParams.get("id");
    const response = await executeQuery(
      `UPDATE CST_LABJOB SET FLAG_DEL = 1 WHERE LABJOB_ID = :labjobId`,
      { labjobId }
    );
    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Database Error", error },
      { status: 500 }
    );
  }
}
// Compare this snippet from src/app/api/user/route.js:
