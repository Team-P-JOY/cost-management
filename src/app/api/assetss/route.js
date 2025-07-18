import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/oracle";

export async function GET(req, { params }) {
  try {
    //  รับค่าแบบ Dynamic Route (เช่น /assetss/123)
    // const { id } = params || {};

    //  รับค่าแบบ Query String (เช่น /assetss?idType=1)
    const searchParams = new URL(req.nextUrl).searchParams;
    const idType = searchParams.get("idType");
    const id = searchParams.get("id");

    console.log("Fetching asset data - ID:", id, "ID Type:", idType);

    let sql = `SELECT 
                 s.*,
                 u.unit_name, 
                 b.brand_name, 
                 g.INVGROUP_NAME, 
                t.INVTYPE_NAME
               FROM cst_invasset s
               INNER JOIN cst_invunit u ON s.unit_id = u.unit_id
               INNER JOIN cst_invbrand b ON s.brand_id = b.brand_id
               INNER JOIN cst_invgroup g ON s.invgroup_id = g.invgroup_id
               INNER JOIN cst_invtype t ON s.invtype_id = t.invtype_id
               WHERE s.flag_del = 0`;

    let paramsArray = [];

    if (id) {
      sql += ` AND s.ASSET_ID = :id`;
      paramsArray.push(id);
      console.log("SQL:", sql);
    } else if (idType) {
      sql += ` AND s.INVTYPE_ID = :idType`;
      paramsArray.push(idType);
      console.log("SQL:", sql);
    }

    const assets = await executeQuery(sql, paramsArray);
    console.log("assets01", assets);
    if (!assets || assets.length === 0) {
      return NextResponse.json(
        { success: true, data: assets[0] }, // สมมติว่า assets เป็นอาร์เรย์และต้องการค่าแรก
        { status: 200 }
      );
    }

    return NextResponse.json({ success: true, data: assets });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { success: false, message: "Database Error", error },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const {
      assetNameTh,
      assetNameEng,
      amountUnit,
      version,
      brandId,
      catNo,
      grade,
      unitId,
      unitPrice,
      packPrice,
      invgroupId,
      invtypeId,
      status,
    } = await req.json();

    // แปลงค่าที่ควรเป็นตัวเลข
    const parsedBrandId = Number(brandId);
    const parsedUnitId = Number(unitId);
    const parsedUnitPrice = Number(unitPrice);
    const parsedPackPrice = Number(packPrice);
    const parsedInvgroupId = Number(invgroupId);
    const parsedInvtypeId = Number(invtypeId);
    const parsedStatus = String(status); // CHAR(1 BYTE) ต้องใช้ String ('1')

    // ตรวจสอบค่าที่จำเป็น
    if (
      !assetNameTh ||
      isNaN(parsedBrandId) ||
      isNaN(parsedUnitId) || // ต้องเป็นตัวเลข ถ้าไม่ใช่ให้ return 400 Bad Request กลับไป
      isNaN(parsedUnitPrice) ||
      isNaN(parsedPackPrice) ||
      isNaN(parsedInvgroupId) ||
      isNaN(parsedInvtypeId) ||
      !parsedStatus
    ) {
      return NextResponse.json(
        { success: false, message: "Missing or invalid fields" },
        { status: 400 }
      );
    }

    // ดำเนินการเพิ่มข้อมูลลงฐานข้อมูล
    await executeQuery(
      `INSERT INTO cst_invasset 
      (ASSET_NAME_TH, ASSET_NAME_ENG, AMOUNT_UNIT, VERSION, BRAND_ID, CAT_NO, GRADE, UNIT_ID, UNIT_PRICE, PACK_PRICE, INVGROUP_ID, INVTYPE_ID, STATUS, FLAG_DEL) 
      VALUES 
      (:assetNameTh, :assetNameEng, :amountUnit, :version, :brandId, :catNo, :grade, :unitId, :unitPrice, :packPrice, :invgroupId, :invtypeId, :status, '0')`,
      {
        assetNameTh,
        assetNameEng,
        amountUnit,
        version,
        brandId: parsedBrandId,
        catNo,
        grade,
        unitId: parsedUnitId,
        unitPrice: parsedUnitPrice,
        packPrice: parsedPackPrice,
        invgroupId: parsedInvgroupId,
        invtypeId: parsedInvtypeId,
        status: parsedStatus,
      }
    );

    return NextResponse.json(
      { success: true, message: "Asset added successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { success: false, message: "Database Error", error },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const formData = await req.json();
    console.log("Received formData:", formData);

    const {
      assetId, // ต้องมี assetId เพื่อระบุแถวที่ต้องการอัปเดต
      assetNameTh,
      assetNameEng,
      amountUnit,
      version,
      brandId,
      catNo,
      grade,
      unitId,
      unitPrice,
      packPrice,
      invgroupId,
      invtypeId,
      status,
    } = formData;

    // ตรวจสอบว่า assetId มีค่าหรือไม่
    if (!assetId) {
      console.error("Missing assetId:", formData);
      return NextResponse.json(
        { success: false, message: "Missing assetId" },
        { status: 400 }
      );
    }

    // แปลงค่าที่ควรเป็นตัวเลข
    const parsedAssetId = Number(assetId);
    const parsedBrandId = Number(brandId);
    const parsedUnitId = Number(unitId);
    const parsedUnitPrice = Number(unitPrice);
    const parsedPackPrice = Number(packPrice);
    const parsedInvgroupId = Number(invgroupId);
    const parsedInvtypeId = Number(invtypeId);
    const parsedStatus = String(status); // CHAR(1 BYTE) ต้องเป็น String ('1' หรือ '0')

    // ตรวจสอบค่าที่จำเป็น
    if (
      isNaN(parsedAssetId) ||
      !assetNameTh ||
      // !assetNameEng ||
      !amountUnit ||
      // !version ||
      isNaN(parsedBrandId) ||
      isNaN(parsedUnitId) ||
      isNaN(parsedUnitPrice) ||
      isNaN(parsedPackPrice) ||
      isNaN(parsedInvgroupId) ||
      isNaN(parsedInvtypeId) ||
      !parsedStatus
    ) {
      console.error("Missing or invalid fields:", formData);
      return NextResponse.json(
        { success: false, message: "Missing or invalid fields" },
        { status: 400 }
      );
    }

    // คำสั่ง SQL สำหรับอัปเดตข้อมูล
    await executeQuery(
      `UPDATE cst_invasset SET 
        ASSET_NAME_TH = :assetNameTh,
        ASSET_NAME_ENG = :assetNameEng,
        AMOUNT_UNIT = :amountUnit,
        VERSION = :version,
        BRAND_ID = :brandId,
        CAT_NO = :catNo,
        GRADE = :grade,
        UNIT_ID = :unitId,
        UNIT_PRICE = :unitPrice,
        PACK_PRICE = :packPrice,
        INVGROUP_ID = :invgroupId,
        INVTYPE_ID = :invtypeId,
        STATUS = :status
      WHERE ASSET_ID = :assetId`,
      {
        assetId: parsedAssetId,
        assetNameTh,
        assetNameEng,
        amountUnit,
        version,
        brandId: parsedBrandId, // ต้องเป็นตัวเลข ถ้าไม่ใช่ให้ return 400 Bad Request กลับไป
        catNo,
        grade,
        unitId: parsedUnitId,
        unitPrice: parsedUnitPrice,
        packPrice: parsedPackPrice,
        invgroupId: parsedInvgroupId,
        invtypeId: parsedInvtypeId,
        status: parsedStatus,
      }
    );

    return NextResponse.json(
      { success: true, message: "Asset updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { success: false, message: "Database Error", error },
      { status: 500 }
    );
  }
}
export async function DELETE(req) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    await executeQuery(
      `UPDATE cst_invasset SET FLAG_DEL = 1 WHERE ASSET_ID = :id`,
      { id }
    );
    return NextResponse.json({
      success: true,
      message: "Asset deleted successfully",
    });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { success: false, message: "Database Error", error },
      { status: 500 }
    );
  }
}
// Compare this snippet from src/app/api/brand/route.js:
