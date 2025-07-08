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

async function getCourse(courseId) {
  return await executeQuery(
    `SELECT COURSE.COURSEID,COURSE.FACULTYID, FAC.FACULTYNAME, COURSE.COURSECODE, COURSE.COURSENAME, COURSE.DESCRIPTION1
    FROM PBL_AVSREGCOURSE_V COURSE 
    INNER JOIN PBL_FACULTY_V FAC ON COURSE.FACULTYID = FAC.FACULTYID
    WHERE COURSE.COURSEID = :courseId`,
    {
      courseId,
    }
  );
}

async function getLabgroup() {
  return await executeQuery(
    `SELECT LABGROUP_ID, LABGROUP_NAME
    FROM CST_LABGROUP 
    WHERE FLAG_DEL = 0
    ORDER BY LABGROUP_NAME ASC`
  );
}

async function courseUser(id) {
  return await executeQuery(
    `SELECT USR.PERSON_ID,ROLE_ID,
    PERSON.TITLE_NAME || PERSON.FIRST_NAME || ' ' || PERSON.LAST_NAME AS FULLNAME
    FROM CST_LABCOURSE_USER USR
    INNER JOIN PBL_VPER_PERSON PERSON
      ON USR.PERSON_ID = PERSON.PERSON_ID
    WHERE USR.FLAG_DEL = 0
    AND USR.LAB_ID = :id
    ORDER BY USR.ROLE_ID ASC`,
    { id }
  );
}

async function getUser() {
  return await executeQuery(
    `SELECT ADMIN.PERSON_ID, 
      PERSON.TITLE_NAME || PERSON.FIRST_NAME || ' ' || PERSON.LAST_NAME AS FULLNAME,
      ROLE.ROLE_NAME
    FROM CST_USER ADMIN
    INNER JOIN PBL_VPER_PERSON PERSON 
      ON ADMIN.PERSON_ID = PERSON.PERSON_ID
    INNER JOIN CST_ROLE ROLE 
      ON ADMIN.ROLE = ROLE.ROLE_ID
    WHERE ADMIN.FLAG_DEL = 0
    ORDER BY PERSON.FIRST_NAME ASC`
  );
}

async function getClass(courseId, schId) {
  return await executeQuery(
    `SELECT CLASS.CLASSID, CLASS.ACADYEAR, CLASS.SEMESTER, CLASS.SECTION, CLASS.TOTALSEAT, CLASS.CLASSNOTE
    FROM PBL_AVSREGCLASS_V CLASS 
    INNER JOIN CST_SCHYEAR SCH ON SCH.SCH_ID = :schId
      AND SCH.FLAG_DEL = 0
      AND CLASS.ACADYEAR = SCH.ACADYEAR
      AND CLASS.SEMESTER = SCH.SEMESTER
    WHERE CLASS.COURSEID = :courseId
    ORDER BY CLASS.SECTION ASC`,
    {
      courseId,
      schId,
    }
  );
}
async function getLabjob(labjobId) {
  return await executeQuery(
    `SELECT LABJOB.LABJOB_TITLE
    FROM CST_LABJOB LABJOB
    WHERE LABJOB.LABJOB_ID = :labjobId
    AND LABJOB.FLAG_DEL = 0`,
    {
      labjobId,
    }
  );
}

export async function GET(req) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    const labjobId = req.nextUrl.searchParams.get("labjobId");
    const courseId = req.nextUrl.searchParams.get("courseId");
    const schId = req.nextUrl.searchParams.get("schId");
    const labgroupId = req.nextUrl.searchParams.get("labgroupId");

    const users = await getUser();
    const labgroup = await getLabgroup();

    if (id) {
      const data = await executeQuery(
        `SELECT * FROM CST_LABCOURSE WHERE LAB_ID = :id`,
        { id }
      );

      const labasset = await executeQuery(
        `SELECT ASSET.LABASSET_ID,ASSET.ASSET_ID, ASSET.AMOUNT, ASSET.ASSET_REMARK, 
        INV.ASSET_NAME_TH,
        BRAND.BRAND_NAME,
        INV.AMOUNT_UNIT,
        UNIT.UNIT_NAME,
        GRP.INVGROUP_NAME,
        INV.INVTYPE_ID AS TYPE
        FROM CST_LABCOURSE_ASSET ASSET
        INNER JOIN CST_INVASSET INV
          ON ASSET.ASSET_ID = INV.ASSET_ID
        INNER JOIN CST_INVGROUP GRP 
          ON INV.INVGROUP_ID = GRP.INVGROUP_ID
        INNER JOIN CST_INVUNIT UNIT 
          ON INV.UNIT_ID = UNIT.UNIT_ID
        INNER JOIN CST_INVBRAND BRAND
          ON INV.BRAND_ID = BRAND.BRAND_ID
        WHERE ASSET.LAB_ID = :id`,
        { id }
      );
      const uselabasset = await executeQuery(
        `SELECT ASSET.LABJOB_ASSET_ID,ASSET.ASSET_ID,
         ASSET.AMOUNT_USED, 
         ASSET.HOUR_USED,
         ASSET.UNIT_PRICE,          
         ASSET.ASSET_USED_REMARK, 
        INV.ASSET_NAME_TH,
        BRAND.BRAND_NAME,
        INV.AMOUNT_UNIT,
        UNIT.UNIT_NAME,
        GRP.INVGROUP_NAME,
        ASSET.ASSETEXTRA_FLAG,
        INV.INVTYPE_ID AS TYPE
        FROM CST_LABJOB_ASSET ASSET
        INNER JOIN CST_INVASSET INV
          ON ASSET.ASSET_ID = INV.ASSET_ID
        INNER JOIN CST_INVGROUP GRP 
          ON INV.INVGROUP_ID = GRP.INVGROUP_ID
        INNER JOIN CST_INVUNIT UNIT 
          ON INV.UNIT_ID = UNIT.UNIT_ID
        INNER JOIN CST_INVBRAND BRAND
          ON INV.BRAND_ID = BRAND.BRAND_ID
        WHERE ASSET.FLAG_DEL = 0
        AND ASSET.LABJOB_ID = :labjobId 
        ORDER BY LABJOB_ASSET_ID DESC
        `,
        { labjobId }
      );
      const assetbroken = await executeQuery(
        `SELECT ASSET.ASSET_BROKEN_ID,
         ASSET.LABJOB_ID,
         ASSET.BROKEN_AMOUNT,
        INV.ASSET_NAME_TH,
        BRAND.BRAND_NAME,
        INV.AMOUNT_UNIT,
        UNIT.UNIT_NAME,
        GRP.INVGROUP_NAME,       
        INV.INVTYPE_ID AS TYPE
        FROM CST_ASSET_BROKEN ASSET
        INNER JOIN CST_INVASSET INV
          ON ASSET.ASSET_ID = INV.ASSET_ID
        INNER JOIN CST_INVGROUP GRP 
          ON INV.INVGROUP_ID = GRP.INVGROUP_ID
        INNER JOIN CST_INVUNIT UNIT 
          ON INV.UNIT_ID = UNIT.UNIT_ID
        INNER JOIN CST_INVBRAND BRAND
          ON INV.BRAND_ID = BRAND.BRAND_ID
        WHERE ASSET.FLAG_DEL = 0
        AND ASSET.LABJOB_ID = :labjobId 
        ORDER BY ASSET_BROKEN_ID DESC`,
        { labjobId }
      );
      const course = await getCourse(data[0].courseid);
      const classData = await getClass(data[0].courseid, data[0].schId);
      const labjob = await getLabjob(labjobId);

      return NextResponse.json({
        success: true,
        data: data[0],
        course: course?.[0],
        class: classData,
        labjob: labjob?.[0],
        users: users,
        labgroup: labgroup,
        labasset: labasset,
        uselabasset: uselabasset,
        assetbroken: assetbroken,
        courseUser: await courseUser(id),
      });
    } else if (!courseId) {
      if (!schId) {
        const data = await executeQuery(
          `SELECT LAB.LAB_ID, 
          MAX(FAC.FACULTYNAME) AS FACULTYNAME, 
          MAX(LAB.ACADYEAR) AS ACADYEAR,
          MAX(LABGROUP.LABGROUP_NAME) AS LABGROUP_NAME,
          MAX(LAB.SEMESTER) AS SEMESTER, 
          MAX(COURSE.COURSECODE) AS COURSECODE, 
          MAX(COURSE.COURSENAME) AS COURSENAME, 
          MAX(LAB.PERSON_ID) AS PERSON_ID, 
          MAX(PERSON.TITLE_NAME || PERSON.FIRST_NAME || ' ' || PERSON.LAST_NAME) AS FULLNAME, 
          MAX(LAB.LABROOM) AS LABROOM,
          COUNT(REG.CLASSID) AS SECTION,
          SUM(REG.TOTALSEAT) AS TOTALSEAT,
          SUM(REG.ENROLLSEAT) AS ENROLLSEAT
        FROM CST_LABCOURSE LAB 
        INNER JOIN PBL_AVSREGCOURSE_V COURSE
            ON COURSE.COURSEID = LAB.COURSEID
        INNER JOIN PBL_AVSREGCLASS_V REG
            ON REG.COURSEID = LAB.COURSEID
        INNER JOIN CST_LABGROUP LABGROUP
            ON LAB.LABGROUP_ID = LABGROUP.LABGROUP_ID
        INNER JOIN PBL_VPER_PERSON PERSON 
            ON LAB.PERSON_ID = PERSON.PERSON_ID
        INNER JOIN PBL_FACULTY_V FAC 
            ON COURSE.FACULTYID = FAC.FACULTYID
        WHERE LAB.FLAG_DEL = 0
        GROUP BY LAB.LAB_ID
        ORDER BY MAX(LAB.ACADYEAR) DESC, MAX(LAB.SEMESTER) DESC`
        );
        const semester = await getSemester();
        const labgroup = await getLabgroup();
        return NextResponse.json({
          success: true,
          data: data,
          semester: semester,
          labgroup: labgroup,
        });
      } else {
        let data;
        if (labgroupId) {
          data = await executeQuery(
            `SELECT LAB.LAB_ID, 
          MAX(FAC.FACULTYNAME) AS FACULTYNAME, 
          MAX(LAB.ACADYEAR) AS ACADYEAR,
          MAX(LABGROUP.LABGROUP_NAME) AS LABGROUP_NAME,
          MAX(LAB.SEMESTER) AS SEMESTER, 
          MAX(COURSE.COURSECODE) AS COURSECODE, 
          MAX(COURSE.COURSENAME) AS COURSENAME, 
          MAX(LAB.PERSON_ID) AS PERSON_ID, 
          MAX(PERSON.TITLE_NAME || PERSON.FIRST_NAME || ' ' || PERSON.LAST_NAME) AS FULLNAME, 
          MAX(LAB.LABROOM) AS LABROOM,
          COUNT(REG.CLASSID) AS SECTION,
          SUM(REG.TOTALSEAT) AS TOTALSEAT,
          SUM(REG.ENROLLSEAT) AS ENROLLSEAT
        FROM CST_LABCOURSE LAB 
        INNER JOIN PBL_AVSREGCOURSE_V COURSE
            ON COURSE.COURSEID = LAB.COURSEID
        INNER JOIN PBL_AVSREGCLASS_V REG
            ON REG.COURSEID = LAB.COURSEID
        INNER JOIN CST_LABGROUP LABGROUP
            ON LAB.LABGROUP_ID = LABGROUP.LABGROUP_ID
        INNER JOIN PBL_VPER_PERSON PERSON 
            ON LAB.PERSON_ID = PERSON.PERSON_ID
        INNER JOIN PBL_FACULTY_V FAC 
            ON COURSE.FACULTYID = FAC.FACULTYID
        INNER JOIN CST_SCHYEAR SCH 
            ON SCH.SCH_ID = :schId
            AND SCH.SEMESTER = LAB.SEMESTER
            AND SCH.ACADYEAR = LAB.ACADYEAR
        WHERE LAB.FLAG_DEL = 0 AND LAB.LABGROUP_ID = :labgroupId
        GROUP BY LAB.LAB_ID
        ORDER BY MAX(LAB.ACADYEAR) DESC, MAX(LAB.SEMESTER) DESC`,
            {
              schId,
              labgroupId,
            }
          );
        } else {
          data = await executeQuery(
            `SELECT LAB.LAB_ID, 
          MAX(FAC.FACULTYNAME) AS FACULTYNAME, 
          MAX(LAB.ACADYEAR) AS ACADYEAR,
          MAX(LABGROUP.LABGROUP_NAME) AS LABGROUP_NAME,
          MAX(LAB.SEMESTER) AS SEMESTER, 
          MAX(COURSE.COURSECODE) AS COURSECODE, 
          MAX(COURSE.COURSENAME) AS COURSENAME, 
          MAX(LAB.PERSON_ID) AS PERSON_ID, 
          MAX(PERSON.TITLE_NAME || PERSON.FIRST_NAME || ' ' || PERSON.LAST_NAME) AS FULLNAME, 
          MAX(LAB.LABROOM) AS LABROOM,
          COUNT(REG.CLASSID) AS SECTION,
          SUM(REG.TOTALSEAT) AS TOTALSEAT,
          SUM(REG.ENROLLSEAT) AS ENROLLSEAT
        FROM CST_LABCOURSE LAB 
        INNER JOIN PBL_AVSREGCOURSE_V COURSE
            ON COURSE.COURSEID = LAB.COURSEID
        INNER JOIN PBL_AVSREGCLASS_V REG
            ON REG.COURSEID = LAB.COURSEID
        INNER JOIN CST_LABGROUP LABGROUP
            ON LAB.LABGROUP_ID = LABGROUP.LABGROUP_ID
        INNER JOIN PBL_VPER_PERSON PERSON 
            ON LAB.PERSON_ID = PERSON.PERSON_ID
        INNER JOIN PBL_FACULTY_V FAC 
            ON COURSE.FACULTYID = FAC.FACULTYID
        INNER JOIN CST_SCHYEAR SCH 
            ON SCH.SCH_ID = :schId
            AND SCH.SEMESTER = LAB.SEMESTER
            AND SCH.ACADYEAR = LAB.ACADYEAR
        WHERE LAB.FLAG_DEL = 0
        GROUP BY LAB.LAB_ID
        ORDER BY MAX(LAB.ACADYEAR) DESC, MAX(LAB.SEMESTER) DESC`,
            {
              schId,
            }
          );
        }

        const semester = await getSemester();
        const labgroup = await getLabgroup();
        return NextResponse.json({
          success: true,
          data: data,
          semester: semester,
          labgroup: labgroup,
        });
      }
    } else {
      const course = await getCourse(courseId);
      const classData = await getClass(courseId, schId);
      const labjob = await getLabjob(labjobId);

      return NextResponse.json({
        success: true,
        data: [],
        course: course?.[0],
        class: classData,
        labjob: labjob?.[0],
        users: users,
        labgroup: labgroup,
      });
    }
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
    const {
      labjobId,
      assetId,
      amountUsed,
      hourUsed,
      assetUsedRemark,
      userId,
      assetextraFlag,
      assetNameTh,
      brandName,
      amountUnit,
      unitPrice,
      unitName,
    } = body.uselabasset;

    // แปลงค่า labjobId, userId, amountUnit เป็นตัวเลข
    const labjobIdNumber = parseInt(labjobId, 10);
    const userIdNumber = parseInt(userId, 10);
    const amountUnitNumber = Number(amountUnit);

    // ตรวจสอบว่าค่าที่แปลงเป็นตัวเลขถูกต้องหรือไม่
    if (isNaN(labjobIdNumber) || isNaN(userIdNumber)) {
      throw new Error("One or more values are not valid numbers.");
    }

    console.log(
      "Executing query:",
      `INSERT INTO CST_LABJOB_ASSET 
    (LABJOB_ASSET_ID, LABJOB_ID, ASSET_ID, AMOUNT_USED,HOUR_USED, ASSET_USED_REMARK, DATE_CREATED, USER_CREATED, ASSETEXTRA_FLAG, ASSET_NAME_TH, BRAND_NAME, AMOUNT_UNIT, UNIT_NAME, UNIT_PRICE) 
    VALUES 
    (CST_LABJOB_ASSET_SEQ.NEXTVAL, :labjobId, :assetId, :amountUsed, :hourUsed,:assetUsedRemark, SYSDATE, :userId, :assetextraFlag, :assetNameTh, :brandName, :amountUnit, :unitName, :unitPrice)`
    );

    // Execute the query
    // แปลงค่าให้เป็นรูปแบบที่ถูกต้องก่อนส่งไปยัง database
    const amountUsedNumber = Number(amountUsed);
    const hourUsedNumber =
      hourUsed !== null && hourUsed !== undefined ? Number(hourUsed) : 0;

    // ตรวจสอบความถูกต้องของ unitPrice - ต้องเป็น string สำหรับ VARCHAR2
    let unitPriceStr;
    if (unitPrice !== null && unitPrice !== undefined) {
      // แปลงให้เป็นตัวเลขก่อนเพื่อตรวจสอบความถูกต้อง
      const unitPriceNum = Number(unitPrice);
      if (isNaN(unitPriceNum)) {
        console.error("Invalid unit price:", unitPrice);
        throw new Error("Unit price is not a valid number.");
      }
      // แปลงกลับเป็น string (VARCHAR2 ในฐานข้อมูล)
      unitPriceStr = String(unitPrice).trim();
    } else {
      unitPriceStr = "0";
    }

    // ตรวจสอบว่าค่าที่แปลงเป็นตัวเลขถูกต้องหรือไม่
    if (isNaN(amountUsedNumber) || isNaN(hourUsedNumber)) {
      console.error("Invalid numeric values:", {
        amountUsed,
        hourUsed,
      });
      throw new Error("One or more numeric values are invalid.");
    }

    console.log("Parameters:", {
      labjobId: labjobIdNumber,
      assetId: assetId,
      amountUsed: amountUsedNumber,
      hourUsed: hourUsedNumber,
      unitPrice: unitPriceStr,
    });

    console.log("Final parameters before executing query:", {
      labjobId: labjobIdNumber,
      assetId: assetId || null,
      amountUsed: amountUsedNumber,
      hourUsed: hourUsedNumber,
      assetUsedRemark: assetUsedRemark || "",
      flagDel: 0,
      userId: userIdNumber,
      assetextraFlag: assetextraFlag || 0,
      unitPrice: unitPriceStr,
    });

    // Query แบบเดิมมีฟิลด์บางตัวที่อาจไม่จำเป็น หรือทำให้เกิดปัญหา
    // ลองใช้ query ที่เฉพาะเจาะจงมากขึ้น
    await executeQuery(
      `INSERT INTO CST_LABJOB_ASSET 
  (LABJOB_ASSET_ID, LABJOB_ID, ASSET_ID, AMOUNT_USED, HOUR_USED, ASSET_USED_REMARK, FLAG_DEL, USER_CREATED, DATE_CREATED, ASSETEXTRA_FLAG, UNIT_PRICE)
  VALUES 
  (CST_LABJOB_ASSET_SEQ.NEXTVAL, :labjobId, :assetId, :amountUsed, :hourUsed, :assetUsedRemark, :flagDel, :userId, SYSDATE, :assetextraFlag, :unitPrice)`,
      {
        labjobId: labjobIdNumber.toString(), // แปลงเป็น string เพื่อความคงที่ในการ bind
        assetId: assetId ? String(assetId) : null, // ถ้ามีค่า แปลงเป็น string ถ้าไม่มีส่ง null
        amountUsed: amountUsedNumber.toString(), // แปลงเป็น string เพื่อหลีกเลี่ยงปัญหา type mismatch
        hourUsed: hourUsedNumber.toString(), // แปลงเป็น string
        assetUsedRemark: assetUsedRemark || "",
        flagDel: "0", // แปลงเป็น string
        userId: userIdNumber.toString(), // แปลงเป็น string
        assetextraFlag: assetextraFlag ? "1" : "0", // แปลงเป็น string "0" หรือ "1"
        unitPrice: unitPriceStr, // ส่งเป็น string
      }
    );

    return NextResponse.json(
      { success: true, message: "Asset created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error during POST:", error);
    return NextResponse.json(
      { success: false, message: "Database Error", error },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    console.log("Incoming PUT body:", body); // <--- DEBUG ตรงนี้

    const {
      labjobAssetId,
      labjobId,
      assetId,
      amountUsed,
      hourUsed,
      assetUsedRemark,
      userId,
      assetextraFlag,
      unitPrice,
    } = body.uselabasset;

    const labjobAssetIdNumber = parseInt(labjobAssetId, 10);
    const labjobIdNumber = parseInt(labjobId, 10);
    const userIdNumber = parseInt(userId, 10);
    const amountUsedNumber = Number(amountUsed);

    // ตรวจสอบความถูกต้องของ unitPrice - ต้องเป็น string สำหรับ VARCHAR2
    let unitPriceStr;
    if (unitPrice !== null && unitPrice !== undefined) {
      // แปลงให้เป็นตัวเลขก่อนเพื่อตรวจสอบความถูกต้อง
      const unitPriceNum = Number(unitPrice);
      if (isNaN(unitPriceNum)) {
        console.error("Invalid unit price:", unitPrice);
        throw new Error("Unit price is not a valid number.");
      }
      // แปลงกลับเป็น string (VARCHAR2 ในฐานข้อมูล)
      unitPriceStr = String(unitPrice).trim();
    } else {
      unitPriceStr = "0";
    }

    if (
      isNaN(labjobAssetIdNumber) ||
      isNaN(labjobIdNumber) ||
      isNaN(userIdNumber) ||
      isNaN(amountUsedNumber)
    ) {
      console.log("Validation failed:", {
        labjobAssetIdNumber,
        labjobIdNumber,
        userIdNumber,
        amountUsedNumber,
      }); // Log invalid data to debug
      throw new Error("One or more values are not valid numbers.");
    }

    console.log("PUT Parameters:", {
      labjobId: labjobIdNumber,
      assetId: assetId,
      amountUsed: amountUsedNumber,
      unitPrice: unitPriceStr,
    });

    // แปลงค่า hourUsed เป็น string หรือ 0 ถ้าไม่มีค่า
    const hourUsedStr =
      hourUsed !== null && hourUsed !== undefined ? String(hourUsed) : "0";

    console.log("Final PUT parameters before executing query:", {
      labjobId: labjobIdNumber.toString(),
      assetId: assetId ? String(assetId) : null, // แปลงเป็น string หรือ null
      amountUsed: amountUsedNumber.toString(),
      hourUsed: hourUsedStr,
      assetUsedRemark: assetUsedRemark || "",
      flagDel: "0",
      userId: userIdNumber.toString(),
      assetextraFlag: (assetextraFlag || 0).toString(),
      labjobAssetId: labjobAssetIdNumber.toString(),
      unitPrice: unitPriceStr,
    });

    await executeQuery(
      `UPDATE CST_LABJOB_ASSET SET 
        LABJOB_ID = :labjobId,
        ASSET_ID = :assetId,
        AMOUNT_USED = :amountUsed,
        HOUR_USED = :hourUsed,
        ASSET_USED_REMARK = :assetUsedRemark,
        FLAG_DEL = :flagDel,
        USER_UPDATED = :userId,
        DATE_UPDATED = SYSDATE,
        ASSETEXTRA_FLAG = :assetextraFlag
        , UNIT_PRICE = :unitPrice
      WHERE LABJOB_ASSET_ID = :labjobAssetId`,
      {
        labjobId: labjobIdNumber.toString(), // แปลงเป็น string
        assetId: assetId ? String(assetId) : null, // แปลงเป็น string หรือ null
        amountUsed: amountUsedNumber.toString(), // แปลงเป็น string
        hourUsed: hourUsedStr, // ใช้ string
        assetUsedRemark: assetUsedRemark || "",
        flagDel: "0", // แปลงเป็น string
        userId: userIdNumber.toString(), // แปลงเป็น string
        assetextraFlag: (assetextraFlag || 0).toString(), // แปลงเป็น string
        labjobAssetId: labjobAssetIdNumber.toString(), // แปลงเป็น string
        unitPrice: unitPriceStr, // ส่งเป็น string
      }
    );

    return NextResponse.json(
      { success: true, message: "Asset updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during PUT:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Database Error",
        error: {
          message: error?.message,
          stack: error?.stack,
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    const userId = req.nextUrl.searchParams.get("userId");

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { success: false, message: "Invalid or missing ID" },
        { status: 400 }
      );
    }

    await executeQuery(
      `UPDATE CST_LABJOB_ASSET SET FLAG_DEL = '1', USER_UPDATED = :userId WHERE LABJOB_ASSET_ID = :id`,
      { id: String(id), userId: userId ? String(userId) : null }
    );

    return NextResponse.json({
      success: true,
      message: "Lab job asset deleted successfully",
    });
  } catch (error) {
    console.error("❌ Database Error:", error);
    return NextResponse.json(
      { success: false, message: "Database Error", error },
      { status: 500 }
    );
  }
}
