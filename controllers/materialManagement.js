const { LocatorStock } = require("../models/wow_locator_stock");
const { MmMaterial } = require("../models/wow_mm_materials");
const { MaterialManagement } = require("../models/wow_material_management");
const { sequelize } = require("../utils/db");

const findMaterialStock = async (req, res) => {
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
    // Create the child work order
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

    // Process material items
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
            material_bal_qty: material.mm_qty,
            material_free_qty: material.mm_qty,
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

        //     const materialRecord = await MotherMaterialRecord.findOne({
        //       where: { record_id: material.material_record_id },
        //       transaction,
        //     });

        //     if (!materialRecord) {
        //       throw new Error(
        //         `Material record not found for record ID: ${material.material_record_id}`
        //       );
        //     }

        //     const newMaterialBalQty =
        //       materialRecord.material_bal_qty - material.cwo_qty;

        //     if (newMaterialBalQty < 0) {
        //       throw new Error(
        //         `Insufficient balance for material record ID: ${material.material_record_id}`
        //       );
        //     }

        //     await MotherMaterialRecord.update(
        //       { material_bal_qty: newMaterialBalQty },
        //       { where: { record_id: material.material_record_id }, transaction }
        //     );
      }
    }

    // Process service items
    // if (serviceItems && serviceItems.length > 0) {
    //   for (const service of serviceItems) {
    //     await ServiceRecord.create(
    //       {
    //         record_id: `${cwo_number}_${service.service_id}`,
    //         mwo_number,
    //         mwo_id: mwo_id,
    //         service_id: service.service_id,
    //         service_desc: service.service_desc,
    //         service_uom: service.service_uom,
    //         service_wo_qty: service.cwo_qty,
    //         service_bal_qty: service.cwo_qty,
    //         service_price: service.service_cwo_price,
    //         service_rate: service.service_rate,
    //         vendor_id,
    //         cwo_id: createdWorkOrder.cwo_id,
    //         cwo_number,
    //       },
    //       { transaction }
    //     );

    //     const serviceRecord = await MotherServiceRecord.findOne({
    //       where: { record_id: service.service_record_id },
    //       transaction,
    //     });

    //     if (!serviceRecord) {
    //       throw new Error(
    //         `Service record not found for record ID: ${service.service_record_id}`
    //       );
    //     }

    //     const newServiceBalQty =
    //       serviceRecord.service_bal_qty - service.cwo_qty;

    //     if (newServiceBalQty < 0) {
    //       throw new Error(
    //         `Insufficient balance for service record ID: ${service.service_record_id}`
    //       );
    //     }

    //     await MotherServiceRecord.update(
    //       { service_bal_qty: newServiceBalQty },
    //       { where: { record_id: service.service_record_id }, transaction }
    //     );
    //   }
    // }

    // Commit the transaction
    await transaction.commit();

    res.status(201).json({
      message: "MM and related data created successfully",
    });
  } catch (error) {
    // Rollback the transaction on error
    await transaction.rollback();

    // Determine error type
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

module.exports = {
  findMaterialStock,
  createMM,
};
