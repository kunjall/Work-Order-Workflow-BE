const { LocatorStock } = require("../models/wow_locator_stock");
const { MmMaterial } = require("../models/wow_mm_materials");
const { MaterialManagement } = require("../models/wow_material_management");
const { MaterialRecord } = require("../models/wow_cwo_material_record");
const { InventoryStock } = require("../models/wow_inventory_stock.js");
const { sequelize } = require("../utils/db");
const { Op } = require("sequelize");

const findMaterialLocatorStock = async (req, res) => {
  try {
    const { material_id, locator_name } = req.query;
    const foundMaterialStock = await LocatorStock.findAll({
      where: { material_id, locator_name },
    });
    res.json(foundMaterialStock);
  } catch (error) {
    console.error("Error finding Material stock:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const createMM = async (req, res) => {
  const {
    warehouse_id,
    vendor_id,
    tps_pm,
    vendor_name,
    route_name,
    execution_city,
    state,
    internal_external,
    locator_name,
    mm_status,
    customer_name,
    requested_by,
    requested_at,
    cwo_id,
    cwo_number,
    transaction_type,
    mm_approver1_email,
    mm_approver1_name,
    materialItems,
  } = req.body;

  const transaction = await sequelize.transaction();

  try {
    const createdMM = await MaterialManagement.create(
      {
        warehouse_id,
        vendor_id,
        tps_pm,
        vendor_name,
        route_name,
        execution_city,
        state,
        internal_external,
        locator_name,
        mm_status,
        customer_name,
        requested_by,
        requested_at,
        cwo_id,
        cwo_number,
        transaction_type,
        mm_approver1_email,
        mm_approver1_name,
      },
      { transaction }
    );

    if (materialItems && materialItems.length > 0) {
      for (const material of materialItems) {
        await MmMaterial.create(
          {
            record_id: `${createdMM.mm_id}_${material.material_id}`,
            mm_id: createdMM.mm_id,
            material_id: material.material_id,
            material_desc: material.material_desc,
            material_uom: material.material_uom,
            material_req_qty: material.mm_qty,
            material_cwo_bal_qty: material.material_bal_qty,
            vendor_id: material.vendor_id,
            mm_id: createdMM.mm_id,
            cwo_id: cwo_id,
            cwo_number: cwo_number,
            material_unit_price: material.material_rate,
            material_price: material.material_mm_price,
            locator_name: locator_name,
          },
          { transaction }
        );
      }
    }

    await transaction.commit();

    res.status(201).json({
      message: "MM and related data created successfully",
    });
  } catch (error) {
    await transaction.rollback();

    if (error.message.includes("not found")) {
      res.status(404).json({ error: error.message });
    } else if (error.message.includes("Insufficient balance")) {
      res.status(400).json({ error: error.message });
    } else {
      console.error("Transaction failed:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

const findChildMaterialStock = async (req, res) => {
  try {
    const { cwo_id, locator_name } = req.query;
    const foundChildMaterialStock = await MmMaterial.findAll({
      where: { cwo_id, locator_name },
    });
    res.json(foundChildMaterialStock);
  } catch (error) {
    console.error("Error finding Material stock:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getMMActions = async (req, res) => {
  try {
    const { user, mmstatus, role } = req.query;

    if (!user || !mmstatus) {
      return res
        .status(400)
        .json({ message: "User and MM status are required." });
    }

    const isAdmin = role.toLowerCase().includes("admin");
    const isInventory = role.toLowerCase().includes("inv");

    let whereCondition = { mm_status: mmstatus };

    // Admins see all with just mm_status
    if (isAdmin && !isInventory) {
      // no extra filtering
    }

    // Inventory role: show S2W OR requests where user is involved
    else if (isInventory) {
      whereCondition = {
        ...whereCondition,
        [Op.or]: [
          { transaction_type: "S2W" },
          { mm_approver1_name: user },
          { requested_by: user },
          { mm_approver2_name: user },
          { mm_approver3_name: user },
        ],
      };
    }

    // Non-admins and non-inventory roles: only user-based filters
    else {
      whereCondition = {
        ...whereCondition,
        [Op.or]: [
          { mm_approver1_name: user },
          { requested_by: user },
          { mm_approver2_name: user },
          { mm_approver3_name: user },
        ],
      };
    }

    const foundMM = await MaterialManagement.findAll({
      where: whereCondition,
      logging: console.log,
    });

    if (!foundMM || foundMM.length === 0) {
      return res.status(200).json({ message: "No MM found." });
    }

    res.status(200).json(foundMM);
  } catch (error) {
    console.error("Error fetching MM:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const findMaterialMM = async (req, res) => {
  try {
    const { mm_id } = req.query;
    const foundMaterialMM = await MmMaterial.findAll({
      where: { mm_id },
    });
    res.json(foundMaterialMM);
  } catch (error) {
    console.error("Error finding Material stock:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const findMaterialMMforMB = async (req, res) => {
  const { cwo_id } = req.query;

  if (!cwo_id) {
    return res
      .status(400)
      .json({ message: "Missing required parameter: cwo_id" });
  }

  try {
    const materials = await MmMaterial.findAll({
      attributes: [
        "material_desc",
        "material_id",
        "material_uom",
        "material_unit_price",
        [
          sequelize.fn(
            "SUM",
            sequelize.fn(
              "COALESCE",
              sequelize.cast(sequelize.col("material_provided_qty"), "INTEGER"),
              0
            )
          ),
          "total_material_provided_qty",
        ],
      ],
      where: { cwo_id },
      group: [
        "material_desc",
        "material_id",
        "material_uom",
        "material_unit_price",
      ],
    });

    res.status(200).json(materials);
  } catch (error) {
    console.error("Error fetching materials:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch materials", error: error.message });
  }
};

const findAllMmMaterial = async (req, res) => {
  try {
    const foundMaterialMM = await MmMaterial.findAll();
    res.json(foundMaterialMM);
  } catch (error) {
    console.error("Error finding Material stock:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const rejectApprovalMm = async (req, res) => {
  try {
    const { mm_id, mm_status, actioned_at, actioned_by, approver_comments } =
      req.body;

    await MaterialManagement.update(
      {
        mm_status,
        actioned_at,
        actioned_by,
        approver_comments,
      },
      {
        where: { mm_id },
      }
    );
  } catch (err) {}
};

const updateApprovalMm = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      cwo_id,
      mm_id,
      mm_status,
      actioned_at,
      actioned_by,
      approver_comments,
      mmMaterial,
      mm_approver2_email,
      mm_approver2_name,
      mm_approver3_email,
      mm_approver3_name,
      locator_name,
      warehouse_id,
      transaction_type,
    } = req.body;

    await MaterialManagement.update(
      {
        mm_status,
        actioned_at,
        actioned_by,
        approver_comments,
        mm_approver2_email,
        mm_approver2_name,
        mm_approver3_email,
        mm_approver3_name,
        warehouse_id,
      },
      {
        where: { mm_id },
        transaction,
      }
    );

    const isW2S = transaction_type.toLowerCase() === "w2s";
    const isReceived = mm_status.toLowerCase() === "received";

    if (mmMaterial && mmMaterial.length > 0) {
      for (const item of mmMaterial) {
        const issuedQty = parseFloat(item.issued_qty) || 0;
        const providedQty = parseFloat(item.material_provided_qty) || 0;

        // Always update material_provided_qty from issued_qty
        await MmMaterial.update(
          { material_provided_qty: issuedQty },
          {
            where: { material_id: item.material_id, mm_id },
            transaction,
          }
        );

        if (!isReceived) {
          if (isW2S) {
            await MaterialRecord.decrement(
              { material_bal_qty: issuedQty },
              {
                where: { material_id: item.material_id, cwo_id },
                transaction,
              }
            );

            await InventoryStock.decrement(
              { material_stock: issuedQty },
              {
                where: { material_id: item.material_id, warehouse_id },
                transaction,
              }
            );
          } else {
            await MaterialRecord.increment(
              { material_bal_qty: issuedQty },
              {
                where: { material_id: item.material_id, cwo_id },
                transaction,
              }
            );

            await InventoryStock.increment(
              { material_stock: issuedQty },
              {
                where: { material_id: item.material_id, warehouse_id },
                transaction,
              }
            );

            await LocatorStock.decrement(
              { stock_qty: providedQty },
              {
                where: { material_id: item.material_id, locator_name },
                transaction,
              }
            );
          }
        } else {
          if (isW2S) {
            await LocatorStock.increment(
              { stock_qty: providedQty },
              {
                where: { material_id: item.material_id, locator_name },
                transaction,
              }
            );
          } else {
            await InventoryStock.increment(
              { material_stock: issuedQty },
              {
                where: { material_id: item.material_id, warehouse_id },
                transaction,
              }
            );
          }
        }
      }
    }

    await transaction.commit();
    return res.status(200).json({ message: "Status updated successfully" });
  } catch (err) {
    await transaction.rollback();
    console.error("Error in updateApprovalMm:", err);
    return res.status(500).json({ error: "Failed to update status" });
  }
};

module.exports = {
  findMaterialLocatorStock,
  findChildMaterialStock,
  findAllMmMaterial,
  findMaterialMMforMB,
  updateApprovalMm,
  rejectApprovalMm,
  findMaterialMM,
  createMM,
  getMMActions,
};
