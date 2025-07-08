import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/oracle";

async function getParentClass(data) {
  const acadyear = data.acadyear;
  const semester = data.semester;
  const facultyid = data.facultyid;
  const schId = data.schId;

  return await executeQuery(
    `SELECT COURSE.COURSEID,COURSE.FACULTYID, COURSE.COURSECODE, COURSE.COURSENAME, COURSE.DESCRIPTION1,LAB.LAB_ID
    FROM PBL_AVSREGCOURSE_V COURSE
    INNER JOIN PBL_AVSREGCLASS_V CLASS ON COURSE.COURSEID = CLASS.COURSEID 
        AND CLASS.ACADYEAR = :acadyear AND CLASS.SEMESTER = :semester
    LEFT JOIN CST_LABCOURSE LAB ON COURSE.COURSEID = LAB.COURSEID AND LAB.FLAG_DEL = 0 AND LAB.SCH_ID = :schId
    WHERE COURSE.FACULTYID = :facultyid
        AND LAB.LAB_ID IS NULL
    GROUP BY COURSE.COURSEID, COURSE.FACULTYID, COURSE.COURSECODE, COURSE.COURSENAME, COURSE.DESCRIPTION1,LAB.LAB_ID
    ORDER BY COURSE.COURSECODE`,
    {
      acadyear,
      semester,
      facultyid,
      schId,
    }
  );
}

export async function GET(req) {
  try {
    const parentLabId = req.nextUrl.searchParams.get("parentLabId");

    const data = await executeQuery(
      `SELECT CST_LABCOURSE.*,COURSE.FACULTYID
      FROM CST_LABCOURSE 
      INNER JOIN PBL_AVSREGCOURSE_V COURSE ON CST_LABCOURSE.COURSEID = COURSE.COURSEID
      WHERE CST_LABCOURSE.LAB_ID = :parentLabId`,
      {
        parentLabId,
      }
    );

    if (data.length === 0) {
      return NextResponse.json(
        { success: false, message: "No courses found for this lab" },
        { status: 404 }
      );
    }

    const parent = await getParentClass(data[0]);

    return NextResponse.json({
      success: true,
      data: data,
      parent: parent,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Database Error", error },
      { status: 500 }
    );
  }
}
