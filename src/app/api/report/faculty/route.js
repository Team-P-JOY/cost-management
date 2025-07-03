import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/oracle";

async function getFacultyData() {
  return await executeQuery(
    `SELECT * FROM PBL_FACULTY_V F WHERE F.FACGROUP NOT IN ('0')`
  );
}

async function getYearData() {
  return await executeQuery(
    `SELECT SCH_ID,SEMESTER,ACADYEAR,STATUS FROM cst_schyear WHERE flag_del = 0`
  );
}

export async function GET(req, { params }) {
  try {
    const searchParams = new URL(req.url).searchParams;
    const schId = searchParams.get("year");
    const facultyId = searchParams.get("facultyId");

    const faculty = await getFacultyData();
    const yearData = await getYearData();
    let dataReport = [];
    if (facultyId) {
      dataReport = await executeQuery(
        `SELECT C.COURSENAME ,C.COURSECODE ,F.FACULTYNAME, C.COURSEID ,
ROUND(SUM(CASE WHEN AST.INVTYPE_ID = 1 THEN (A.HOUR_USED * (A.AMOUNT_USED * A.UNIT_PRICE) / (5 * 365 * 24)) ELSE 0 END), 2) AS pricePer_Term_INVTYPE1,
ROUND(SUM(CASE WHEN AST.INVTYPE_ID = 2 THEN (A.HOUR_USED * (A.AMOUNT_USED * A.UNIT_PRICE) / (5 * 365 * 24)) ELSE 0 END), 2) AS pricePer_Term_INVTYPE2,
SUM(CASE WHEN AST.INVTYPE_ID = 3 THEN A.AMOUNT_USED * A.UNIT_PRICE ELSE 0 END) AS pricePer_Term_INVTYPE3,
ROUND(SUM(CASE WHEN AST.INVTYPE_ID = 4 THEN (A.HOUR_USED * (A.AMOUNT_USED * A.UNIT_PRICE) / (5 * 365 * 24)) ELSE 0 END), 2) AS pricePer_Term_INVTYPE4
FROM CST_LABCOURSE LC
INNER JOIN PBL_AVSREGCOURSE_V C ON LC.COURSEID=C.COURSEID
INNER JOIN PBL_FACULTY_V F ON C.FACULTYID = F.FACULTYID
INNER JOIN cst_labjob LJ ON LC.LAB_ID = LJ.LAB_ID
INNER JOIN cst_labjob_asset A ON LJ.LABJOB_ID = A.LABJOB_ID
INNER JOIN CST_INVASSET AST ON A.ASSET_ID = AST.ASSET_ID
WHERE LC.SCH_ID = :schId
AND C.FACULTYID =:facultyId
GROUP BY C.COURSENAME ,C.COURSECODE ,F.FACULTYNAME, C.COURSEID`,
        { facultyId, schId }
      );
    } else {
      dataReport = await executeQuery(
        `SELECT C.COURSENAME ,C.COURSECODE ,F.FACULTYNAME, C.COURSEID ,
ROUND(SUM(CASE WHEN AST.INVTYPE_ID = 1 THEN (A.HOUR_USED * (A.AMOUNT_USED * A.UNIT_PRICE) / (5 * 365 * 24)) ELSE 0 END), 2) AS pricePer_Term_INVTYPE1,
ROUND(SUM(CASE WHEN AST.INVTYPE_ID = 2 THEN (A.HOUR_USED * (A.AMOUNT_USED * A.UNIT_PRICE) / (5 * 365 * 24)) ELSE 0 END), 2) AS pricePer_Term_INVTYPE2,
SUM(CASE WHEN AST.INVTYPE_ID = 3 THEN A.AMOUNT_USED * A.UNIT_PRICE ELSE 0 END) AS pricePer_Term_INVTYPE3,
ROUND(SUM(CASE WHEN AST.INVTYPE_ID = 4 THEN (A.HOUR_USED * (A.AMOUNT_USED * A.UNIT_PRICE) / (5 * 365 * 24)) ELSE 0 END), 2) AS pricePer_Term_INVTYPE4
FROM CST_LABCOURSE LC
INNER JOIN PBL_AVSREGCOURSE_V C ON LC.COURSEID=C.COURSEID
INNER JOIN PBL_FACULTY_V F ON C.FACULTYID = F.FACULTYID
INNER JOIN cst_labjob LJ ON LC.LAB_ID = LJ.LAB_ID
INNER JOIN cst_labjob_asset A ON LJ.LABJOB_ID = A.LABJOB_ID
INNER JOIN CST_INVASSET AST ON A.ASSET_ID = AST.ASSET_ID
WHERE LC.SCH_ID = :schId
GROUP BY C.COURSENAME ,C.COURSECODE ,F.FACULTYNAME, C.COURSEID`,
        { schId }
      );
    }
    return NextResponse.json(
      { success: true, data: faculty, year: yearData, report: dataReport },
      { status: 200 }
    );
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
