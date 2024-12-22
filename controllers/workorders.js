const { MotherWorkorder } = require("../models/wow_mother_workorder");
const { MaterialRecord } = require("../models/wow_cwo_material_record");
const { ServiceRecord } = require("../models/wow_cwo_service_record");
const { ChildWorkorder } = require("../models/wow_child_workorder");
const { MotherMaterialRecord } = require("../models/wow_mwo_material_record");
const { MotherServiceRecord } = require("../models/wow_mwo_service_record");
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    logging: false,
  }
);

const create = async (req, res) => {
  try {
    const {
      mwo_number,
      workorder_type,
      workorder_status,
      gis_code,
      route_name,
      route_length,
      homepass_count,
      activity,
      type,
      customer_id,
      execution_city,
      customer_project_manager,
      customer_name,
      customer_state,
      customer_approval_date,
      created_by,
      created_at,
      total_service_cost,
      total_material_cost,
    } = req.body;

    if (
      !mwo_number ||
      !workorder_type ||
      !workorder_status ||
      !gis_code ||
      !route_name ||
      !route_length ||
      !homepass_count ||
      !activity ||
      !type ||
      !customer_id ||
      !customer_project_manager ||
      !customer_name ||
      !customer_state ||
      !execution_city ||
      !customer_approval_date
    ) {
      console.log("yes");
      return res.status(400).json({ message: "All fields are required" });
    }
    const newWorkorder = await MotherWorkorder.create({
      mwo_number,
      workorder_type,
      workorder_status,
      gis_code,
      route_name,
      route_length,
      homepass_count,
      activity,
      type,
      customer_id,
      execution_city,
      customer_project_manager,
      customer_name,
      customer_state,
      customer_approval_date,
      created_by,
      created_at,
      total_service_cost,
      total_material_cost,
    });
    res.status(201).json(newWorkorder.mwo_id);
  } catch (error) {
    console.error("Error creating work order:", error);
    res
      .status(500)
      .json({ message: "Failed to create work order", error: error.message });
  }
};

const findWorkorder = async (req, res) => {
  try {
    const foundWorkorder = await MotherWorkorder.findAll();
    res.json(foundWorkorder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const findChildWorkorder = async (req, res) => {
  try {
    const foundChildWorkorder = await ChildWorkorder.findAll();
    res.json(foundChildWorkorder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const findChildServices = async (req, res) => {
  try {
    const { cwo_id } = req.query; // Extract mwo_number from the query
    const foundChildServices = await ServiceRecord.findAll({
      where: { cwo_id: cwo_id },
      // Filter based on mwo_number
    });
    res.json(foundChildServices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const findChildMaterials = async (req, res) => {
  try {
    const { cwo_id } = req.query;
    const foundChildMaterials = await MaterialRecord.findAll({
      where: { cwo_id: cwo_id }, // Filter based on mwo_number
    });
    res.json(foundChildMaterials);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const findMotherServices = async (req, res) => {
  try {
    const { mwo_id } = req.query; // Extract mwo_number from the query
    const foundChildServices = await MotherServiceRecord.findAll({
      where: { mwo_id: mwo_id },
      // Filter based on mwo_number
    });
    res.json(foundChildServices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const findMotherMaterials = async (req, res) => {
  try {
    const { mwo_id } = req.query;
    const foundChildMaterials = await MotherMaterialRecord.findAll({
      where: { mwo_id: mwo_id }, // Filter based on mwo_number
    });
    res.json(foundChildMaterials);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const motherEnterMaterial = async (req, res) => {
  const {
    record_id,
    mwo_number,
    material_id,
    material_desc,
    material_uom,
    material_wo_qty,
    material_bal_qty,
    mwo_id,
    material_rate,
    material_price,
  } = req.body;

  try {
    // Create a new material record
    await MotherMaterialRecord.create({
      record_id,
      mwo_number,
      material_id,
      material_desc,
      material_uom,
      material_wo_qty,
      material_bal_qty,
      mwo_id,
      material_rate,
      material_price,
    });

    res.status(201).json("Success");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const motherEnterServices = async (req, res) => {
  const {
    record_id,
    mwo_number,
    service_id,
    service_desc,
    service_uom,
    service_wo_qty,
    service_bal_qty,
    service_rate,
    service_price,
    mwo_id,
  } = req.body;

  try {
    // Create a new material record
    await MotherServiceRecord.create({
      record_id,
      mwo_number,
      service_id,
      service_desc,
      service_uom,
      service_rate,
      service_wo_qty,
      service_bal_qty,
      service_price,
      mwo_id,
    });

    res.status(201).json("Success");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const createChildWorkorder = async (req, res) => {
  const {
    mwo_number,
    vendor_id,
    vendor_route_allocation,
    total_service_cost,
    internal_manager,
    execution_city,
    workorder_type,
    cwo_number,
    total_material_cost,
    materialItems,
    serviceItems,
  } = req.body;

  const transaction = await sequelize.transaction();

  try {
    // Step 1: Create the Child Work Order
    const createdWorkOrder = await ChildWorkorder.create(
      {
        mwo_number,
        vendor_id,
        vendor_route_allocation,
        total_service_cost,
        internal_manager,
        execution_city,
        workorder_type,
        cwo_number,
        total_material_cost,
      },
      { transaction }
    );

    // Step 2: Create Material Records
    if (materialItems && materialItems.length > 0) {
      for (const material of materialItems) {
        await MaterialRecord.create(
          {
            record_id: `${cwo_number}_${material.material_id}`,
            mwo_number,
            material_id: material.material_id,
            material_desc: material.material_desc,
            material_uom: material.material_uom,
            material_wo_qty: material.material_wo_qty,
            material_bal_qty: material.material_bal_qty,
            vendor_id,
            cwo_id: createdWorkOrder.cwo_id,
            cwo_number,
            material_rate: material.material_rate,
            material_price: material.material_cwo_price,
          },
          { transaction }
        );

        // Update Material Balance
        const materialRecord = await MotherMaterialRecord.findOne({
          where: { record_id: material.material_record_id },
          transaction,
        });

        if (!materialRecord) {
          throw new Error(
            `Material record not found for ID: ${material.material_record_id}`
          );
        }

        const newMaterialBalQty =
          materialRecord.material_bal_qty - material.cwo_qty;

        await MotherMaterialRecord.update(
          { material_bal_qty: newMaterialBalQty },
          { where: { record_id: material.material_record_id }, transaction }
        );
      }
    }

    // Step 3: Create Service Records
    if (serviceItems && serviceItems.length > 0) {
      for (const service of serviceItems) {
        await ServiceRecord.create(
          {
            record_id: `${cwo_number}_${service.service_id}`,
            mwo_number,
            service_id: service.service_id,
            service_desc: service.service_desc,
            service_uom: service.service_uom,
            service_wo_qty: service.service_wo_qty,
            service_bal_qty: service.service_bal_qty,
            service_price: service.service_cwo_price,
            service_rate: service.service_rate,
            vendor_id,
            cwo_id: createdWorkOrder.cwo_id,
            cwo_number,
          },
          { transaction }
        );

        // Update Service Balance
        const serviceRecord = await MotherServiceRecord.findOne({
          where: { record_id: service.service_record_id },
          transaction,
        });

        if (!serviceRecord) {
          throw new Error(
            `Service record not found for ID: ${service.service_record_id}`
          );
        }

        const newServiceBalQty =
          serviceRecord.service_bal_qty - service.cwo_qty;

        await MotherServiceRecord.update(
          { service_bal_qty: newServiceBalQty },
          { where: { record_id: service.service_record_id }, transaction }
        );
      }
    }

    // Commit the transaction
    await transaction.commit();

    res.status(201).json({
      message: "Work Order and related data created successfully",
    });
  } catch (error) {
    // Rollback the transaction in case of any error
    await transaction.rollback();

    console.error("Transaction failed:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  create,
  findWorkorder,
  findChildMaterials,
  findChildServices,
  findChildWorkorder,
  createChildWorkorder,
  motherEnterServices,
  motherEnterMaterial,
  findMotherServices,
  findMotherMaterials,
};
