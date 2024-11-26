const { MotherWorkorder } = require("../models/wow_mother_workorder");
const { MaterialRecord } = require("../models/wow_material_record");
const { ServiceRecord } = require("../models/wow_service_record");
const { ChildWorkorder } = require("../models/wow_child_workorder");

const create = async (req, res) => {
  try {
    const {
      workorder_id,
      workorder_type,
      workorder_number,
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
    } = req.body;

    if (
      !workorder_type ||
      !workorder_number ||
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
      workorder_id,
      workorder_type,
      workorder_number,
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
    });
    res.status(201).json({
      message: "Work order created successfully",
      data: newWorkorder,
    });
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
    const { workorder_id } = req.query; // Extract workorder_id from the query
    console.log(workorder_id);
    const foundChildServices = await ServiceRecord.findAll({
      where: { workorder_id: workorder_id },
      // Filter based on workorder_id
      logging: console.log,
    });
    res.json(foundChildServices);
    console.log(foundChildServices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const findChildMaterials = async (req, res) => {
  try {
    const { workorder_id } = req.query; // Extract workorder_id from the query
    const foundChildMaterials = await MaterialRecord.findAll({
      where: { workorder_id: workorder_id }, // Filter based on workorder_id
      logging: console.log,
    });
    res.json(foundChildMaterials);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const enterMaterial = async (req, res) => {
  const {
    record_id,
    workorder_id,
    material_id,
    material_desc,
    material_uom,
    material_wo_qty,
    vendor_id,
  } = req.body;

  try {
    // Create a new material record
    await MaterialRecord.create({
      record_id,
      workorder_id,
      material_id,
      material_desc,
      material_uom,
      material_wo_qty,
      vendor_id,
    });

    res.status(201).json("Success");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const enterServices = async (req, res) => {
  const {
    record_id,
    workorder_id,
    service_id,
    service_desc,
    service_uom,
    service_wo_qty,
    service_price,
    vendor_id,
  } = req.body;

  try {
    // Create a new material record
    await ServiceRecord.create({
      record_id,
      workorder_id,
      service_id,
      service_desc,
      service_uom,
      service_wo_qty,
      service_price,
      vendor_id,
    });

    res.status(201).json("Success");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const createChildWorkorder = async (req, res) => {
  const {
    workorder_id,
    vendor_id,
    vendor_route_allocation,
    total_service_cost,
    internal_manager,
  } = req.body;

  try {
    await ChildWorkorder.create({
      workorder_id,
      vendor_id,
      vendor_route_allocation,
      total_service_cost,
      internal_manager,
    });
    res.status(201).json("Success");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  create,
  findWorkorder,
  findChildMaterials,
  findChildServices,
  findChildWorkorder,
  enterMaterial,
  enterServices,
  createChildWorkorder,
};
